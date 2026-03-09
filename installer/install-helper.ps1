# install-helper.ps1
# Llamado por el instalador Inno Setup con privilegios de admin.
# 1. Extrae e instala el certificado del MSIX en TrustedPeople (LocalMachine)
# 2. Instala dependencias (VCLibs, WindowsAppRuntime)
# 3. Instala el MSIX principal

param(
    [Parameter(Mandatory)][string]$TmpDir
)

$ErrorActionPreference = "Stop"

$msix    = Join-Path $TmpDir "MiApp.Package_1.0.0.0_x64.msix"
$depVCx  = Join-Path $TmpDir "Microsoft.VCLibs.x64.14.00.appx"
$depVCdx = Join-Path $TmpDir "Microsoft.VCLibs.x64.14.00.Desktop.appx"
$depWAR  = Join-Path $TmpDir "Microsoft.WindowsAppRuntime.1.7.msix"

# ---------------------------------------------------------------------------
# 1. Instalar certificado
# ---------------------------------------------------------------------------
try {
    $sig  = Get-AuthenticodeSignature -FilePath $msix
    $cert = $sig.SignerCertificate

    if ($null -ne $cert) {
        # TrustedPeople — necesario para que Add-AppxPackage acepte el MSIX
        $store = [System.Security.Cryptography.X509Certificates.X509Store]::new(
            [System.Security.Cryptography.X509Certificates.StoreName]::TrustedPeople,
            [System.Security.Cryptography.X509Certificates.StoreLocation]::LocalMachine
        )
        $store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
        $store.Add($cert)
        $store.Close()
    }
} catch {
    # Ignorar: puede ya estar instalado o ser un certificado público
}

# ---------------------------------------------------------------------------
# 2. Dependencias (silencioso si ya están)
# ---------------------------------------------------------------------------
function Install-DepIfPresent {
    param([string]$Path)
    if (Test-Path $Path) {
        try {
            Add-AppxPackage -Path $Path -ForceApplicationShutdown -ErrorAction SilentlyContinue
        } catch {
            # Ignorar error "ya instalado"
        }
    }
}

Install-DepIfPresent $depVCx
Install-DepIfPresent $depVCdx
Install-DepIfPresent $depWAR

# ---------------------------------------------------------------------------
# 3. Instalar MSIX principal
# ---------------------------------------------------------------------------
Add-AppxPackage -Path $msix -ForceApplicationShutdown
