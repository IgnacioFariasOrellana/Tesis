import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";

const color = {
  reset: "\u001b[0m",
  bold: "\u001b[1m",
  green: "\u001b[32m",
  red: "\u001b[31m",
  yellow: "\u001b[33m",
  cyan: "\u001b[36m",
};

const descriptions: Record<string, string> = {
  "CP-I1-03": "Producto disponible visible en el catalogo",
  "CP-I1-04": "Producto administrativo registrado en la base de prueba",
  "CP-I1-06": "Carrito y resumen actualizados al agregar un producto",
};

function paint(value: string, tone: keyof typeof color) {
  return process.stdout.isTTY ? `${color[tone]}${value}${color.reset}` : value;
}

class IterationConsoleReporter implements Reporter {
  private results: Array<{ code: string; status: string; duration: number; description: string }> = [];

  onBegin(_config: FullConfig, suite: Suite) {
    const total = suite.allTests().filter((item) => /CP-I1-\d+/.test(item.title)).length;
    console.log(`\n${paint("==========================================================================", "cyan")}`);
    console.log(paint("             PRUEBAS VISUALES - ITERACION 1 ALLICAM", "bold"));
    console.log(paint("==========================================================================", "cyan"));
    console.log(`Casos Playwright preparados: ${total}\n`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const code = test.title.match(/CP-I1-\d+/)?.[0];
    if (!code) return;
    const status = result.status === "passed" ? "APROBADO" : result.status === "skipped" ? "OMITIDO" : "FALLIDO";
    this.results.push({
      code,
      status,
      duration: result.duration,
      description: descriptions[code] || test.title.replace(`${code}:`, "").trim(),
    });
    const tone = status === "APROBADO" ? "green" : status === "OMITIDO" ? "yellow" : "red";
    console.log(`${paint(status.padEnd(9), tone)}  ${code}  ${(result.duration / 1000).toFixed(2).padStart(6)}s  ${descriptions[code]}`);
    if (status === "FALLIDO" && result.error) {
      const message = result.error.message || result.error.value || "Error sin detalle";
      const conciseMessage = message.split("\n").slice(0, 8).join("\n");
      console.log(paint(`  CAUSA:\n${conciseMessage}\n`, "red"));
    }
  }

  onEnd(result: FullResult) {
    const approved = this.results.filter((item) => item.status === "APROBADO").length;
    const failed = this.results.filter((item) => item.status === "FALLIDO").length;
    const skipped = this.results.filter((item) => item.status === "OMITIDO").length;
    console.log(paint("--------------------------------------------------------------------------", "cyan"));
    console.log(
      paint(
        `TOTAL: ${approved} aprobado(s) | ${failed} fallido(s) | ${skipped} omitido(s)`,
        failed === 0 ? "green" : "red",
      ),
    );
    console.log(`Resultado de Playwright: ${result.status.toUpperCase()}`);
    console.log(paint("==========================================================================\n", "cyan"));
  }
}

export default IterationConsoleReporter;

