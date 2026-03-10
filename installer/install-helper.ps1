# install-helper.ps1
# Llamado por el instalador Inno Setup con privilegios de admin.
# 1. Instala el certificado de firma en TrustedPeople (LocalMachine)
# 2. Instala dependencias (VCLibs, WindowsAppRuntime)
# 3. Instala el MSIX principal

param(
    [Parameter(Mandatory)][string]$TmpDir
)

$ErrorActionPreference = "Stop"

$msix    = Join-Path $TmpDir "MiApp.Package_1.0.0.0_x64.msix"
$cer     = Join-Path $TmpDir "MiApp.Package_Sign.cer"
$depVCx  = Join-Path $TmpDir "Microsoft.VCLibs.x64.14.00.appx"
$depVCdx = Join-Path $TmpDir "Microsoft.VCLibs.x64.14.00.Desktop.appx"
$depWAR  = Join-Path $TmpDir "Microsoft.WindowsAppRuntime.1.7.msix"

# ---------------------------------------------------------------------------
# 1. Instalar certificado de firma en LocalMachine\TrustedPeople
# ---------------------------------------------------------------------------
try {
    Import-Certificate -FilePath $cer -CertStoreLocation Cert:\LocalMachine\TrustedPeople | Out-Null
} catch {
    # Ignorar si ya está instalado
}

# ---------------------------------------------------------------------------
# 2. Dependencias (silencioso si ya están)
# ---------------------------------------------------------------------------
function Install-DepIfPresent {
    param([string]$Path)
    if (Test-Path $Path) {
        try {
            Add-AppxPackage -Path $Path -ForceApplicationShutdown -ErrorAction SilentlyContinue
        } catch { }
    }
}

Install-DepIfPresent $depVCx
Install-DepIfPresent $depVCdx
Install-DepIfPresent $depWAR

# ---------------------------------------------------------------------------
# 3. Instalar MSIX principal
# ---------------------------------------------------------------------------
Add-AppxPackage -Path $msix -ForceApplicationShutdown
