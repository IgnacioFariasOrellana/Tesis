"""CP-I1-05: relación producto-insumo en una base PostgreSQL desechable."""

import os
import shutil
import subprocess
import time
from pathlib import Path
from uuid import uuid4

import pytest


BACKEND_ROOT = Path(__file__).resolve().parents[1]
DB_SOURCE = BACKEND_ROOT / "app" / "db"
SQL_TEST = Path(__file__).with_name("producto_insumo.sql")


def _docker(*args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["docker", *args],
        check=check,
        capture_output=True,
        text=True,
        timeout=120,
    )


@pytest.mark.database
def test_cp_i1_05_guarda_producto_insumo_y_cantidad_requerida():
    """Ejecuta el esquema y las aserciones SQL en un PostgreSQL aislado."""
    if os.getenv("RUN_DB_TESTS") != "1":
        pytest.skip("Usa RUN_DB_TESTS=1 para habilitar la base desechable")
    if not shutil.which("docker"):
        pytest.skip("Docker no está disponible")

    container = f"allicam-test-{uuid4().hex[:10]}"
    try:
        _docker(
            "run", "--detach", "--name", container,
            "--env", "POSTGRES_PASSWORD=allicam_test",
            "postgres:16-alpine",
        )
        for _ in range(30):
            ready = _docker("exec", container, "pg_isready", "-U", "postgres", check=False)
            if ready.returncode == 0:
                break
            time.sleep(1)
        else:
            pytest.fail("La base PostgreSQL de prueba no quedó disponible")

        _docker("cp", str(DB_SOURCE), f"{container}:/tmp/allicam-db")
        _docker("cp", str(SQL_TEST), f"{container}:/tmp/producto_insumo.sql")
        result = _docker(
            "exec", container, "psql", "-U", "postgres",
            "-v", "ON_ERROR_STOP=1", "-q", "-f", "/tmp/producto_insumo.sql",
        )
        assert "Pruebas de producto_insumo correctas" in result.stdout
        print(result.stdout.strip())
    finally:
        _docker("rm", "--force", container, check=False)

