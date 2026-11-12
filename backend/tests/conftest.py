"""Configuración común de las pruebas automatizadas del backend."""

import sys
from pathlib import Path

import pytest


BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))


ITERATION_CASES = {
    "test_cp_i1_01": ("CP-I1-01", "Administrador autenticado accede a su operacion"),
    "test_cp_i1_02": ("CP-I1-02", "Cliente recibe 403 al crear un producto"),
    "test_cp_i1_05": ("CP-I1-05", "Producto e insumo conservan la cantidad requerida"),
}
_iteration_results: dict[str, tuple[str, str, float]] = {}


def _case_for(nodeid: str) -> tuple[str, str] | None:
    return next((value for key, value in ITERATION_CASES.items() if key in nodeid), None)


@pytest.hookimpl(tryfirst=True)
def pytest_sessionstart():
    _iteration_results.clear()


@pytest.hookimpl(tryfirst=True)
def pytest_runtest_logreport(report):
    case = _case_for(report.nodeid)
    if not case:
        return
    code, description = case
    if report.when == "call":
        status = "APROBADO" if report.passed else "FALLIDO"
        _iteration_results[code] = (description, status, report.duration)
    elif report.when == "setup" and report.skipped:
        _iteration_results[code] = (description, "OMITIDO", report.duration)


@pytest.hookimpl(trylast=True)
def pytest_terminal_summary(terminalreporter):
    if not _iteration_results:
        return
    writer = terminalreporter
    writer.write_sep("=", "RESUMEN VISUAL - PRUEBAS ITERACION 1")
    writer.write_line(f"{'CASO':<11} {'RESULTADO':<11} {'TIEMPO':>9}  COMPROBACION")
    writer.write_line("-" * 82)
    for code in sorted(_iteration_results):
        description, status, duration = _iteration_results[code]
        line = f"{code:<11} {status:<11} {duration:>8.2f}s  {description}"
        writer.write_line(
            line,
            green=status == "APROBADO",
            red=status == "FALLIDO",
            yellow=status == "OMITIDO",
        )
    approved = sum(status == "APROBADO" for _, status, _ in _iteration_results.values())
    failed = sum(status == "FALLIDO" for _, status, _ in _iteration_results.values())
    skipped = sum(status == "OMITIDO" for _, status, _ in _iteration_results.values())
    writer.write_line("-" * 82)
    writer.write_line(
        f"TOTAL: {approved} aprobado(s) | {failed} fallido(s) | {skipped} omitido(s)",
        green=failed == 0,
        red=failed > 0,
        bold=True,
    )


