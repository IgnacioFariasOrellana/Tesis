$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $repo "backend"
$frontend = Join-Path $repo "frontend"
$python = Join-Path $backend ".venv\Scripts\python.exe"
$failed = $false

function Show-Section([string]$number, [string]$title) {
  Write-Host ""
  Write-Host "============================================================================" -ForegroundColor DarkCyan
  Write-Host "  $number  $title" -ForegroundColor Cyan
  Write-Host "============================================================================" -ForegroundColor DarkCyan
}

function Check-ExitCode {
  if ($LASTEXITCODE -ne 0) {
    $script:failed = $true
    Write-Host "BLOQUE FINALIZADO CON ERRORES" -ForegroundColor Red
  }
}

if (-not (Test-Path -LiteralPath $python)) {
  throw "No existe backend/.venv. Ejecuta: python -m venv backend/.venv"
}

Write-Host ""
Write-Host "+--------------------------------------------------------------------------+" -ForegroundColor Magenta
Write-Host "|        ALLICAM - VALIDACION AUTOMATIZADA DE LA ITERACION 1              |" -ForegroundColor Magenta
Write-Host "+--------------------------------------------------------------------------+" -ForegroundColor Magenta
Write-Host "Fecha: $(Get-Date -Format 'dd-MM-yyyy HH:mm')" -ForegroundColor DarkGray

Show-Section "1/3" "SEGURIDAD Y CONTROL DE ROLES - FASTAPI"
Push-Location $backend
try {
  & $python -m pytest tests/test_iteration1_auth.py -q
  Check-ExitCode
} finally {
  Pop-Location
}

Show-Section "2/3" "PERSISTENCIA PRODUCTO-INSUMO - POSTGRESQL DESECHABLE"
Push-Location $backend
try {
  $previousDbValue = $env:RUN_DB_TESTS
  $env:RUN_DB_TESTS = "1"
  & $python -m pytest tests/test_iteration1_database.py -q -s
  Check-ExitCode
  if ($null -eq $previousDbValue) { Remove-Item Env:RUN_DB_TESTS -ErrorAction SilentlyContinue }
  else { $env:RUN_DB_TESTS = $previousDbValue }
} finally {
  Pop-Location
}

Show-Section "3/3" "CATALOGO, CREACION Y CARRITO - PLAYWRIGHT"
Push-Location $frontend
try {
  if (-not $env:PLAYWRIGHT_EXECUTABLE_PATH) {
    $edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    if (Test-Path -LiteralPath $edge) { $env:PLAYWRIGHT_EXECUTABLE_PATH = $edge }
  }
  & npx playwright test
  Check-ExitCode
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor DarkCyan
if ($failed) {
  Write-Host " RESULTADO GENERAL: SE DETECTARON ERRORES" -ForegroundColor Red
  Write-Host "============================================================================" -ForegroundColor DarkCyan
  exit 1
}
Write-Host " RESULTADO GENERAL: CASOS EJECUTADOS CORRECTAMENTE" -ForegroundColor Green
Write-Host " CASOS INCLUIDOS EN EL PANEL: 6" -ForegroundColor Green
Write-Host " Evidencias: frontend/playwright-report y frontend/test-results" -ForegroundColor DarkGray
Write-Host "============================================================================" -ForegroundColor DarkCyan

