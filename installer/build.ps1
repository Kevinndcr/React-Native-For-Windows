# build.ps1
# Compila el instalador .exe para distribucion.
#
# Uso:
#   cd installer
#   .\build.ps1
#
# Requiere: Inno Setup 6 (https://jrsoftware.org/isdl.php)
# Salida:   ..\dist\MiApp-Setup.exe

# Inno Setup puede instalarse en Program Files (x86) o en AppData\Local según el instalador
$iscc = if (Test-Path "C:\Program Files (x86)\Inno Setup 6\ISCC.exe") {
    "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
} elseif (Test-Path "$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe") {
    "$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe"
} else { "" }

if (-not $iscc -or -not (Test-Path $iscc)) {
    Write-Host ""
    Write-Host "ERROR: Inno Setup no encontrado en:" -ForegroundColor Red
    Write-Host "  $iscc" -ForegroundColor Red
    Write-Host ""
    Write-Host "Descargalo en https://jrsoftware.org/isdl.php e instala." -ForegroundColor Yellow
    exit 1
}

# Verificar que el Release MSIX existe
$msixPath = "..\windows\MiApp.Package\AppPackages\MiApp.Package_1.0.0.0_x64_Test\MiApp.Package_1.0.0.0_x64.msix"
if (-not (Test-Path $msixPath)) {
    Write-Host ""
    Write-Host "ERROR: MSIX Release no encontrado." -ForegroundColor Red
    Write-Host "Primero compila con:" -ForegroundColor Yellow
    Write-Host '  $env:VisualStudioVersion = "18.0"' -ForegroundColor Cyan
    Write-Host "  npx react-native run-windows --msbuildprops PlatformToolset=v145 --release --no-launch" -ForegroundColor Cyan
    exit 1
}

# Crear dist/ si no existe
New-Item -ItemType Directory -Path "..\dist" -Force | Out-Null

Write-Host "Compilando instalador..." -ForegroundColor Cyan
& $iscc "setup.iss"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Listo! Instalador generado en:" -ForegroundColor Green
    Write-Host "  $(Resolve-Path '..\dist\MiApp-Setup.exe')" -ForegroundColor Green
} else {
    Write-Host "Error al compilar el instalador." -ForegroundColor Red
    exit 1
}
