; =============================================================================
; MiApp - Inno Setup Script
; Genera: dist\MiApp-Setup.exe
;
; Requisito previo: compilar Release MSIX con
;   $env:VisualStudioVersion="18.0"
;   npx react-native run-windows --msbuildprops PlatformToolset=v145 --release --no-launch
; =============================================================================

#define AppName        "MiApp"
#define AppVersion     "1.0.0"
#define AppPublisher   "Mi Empresa"
#define PkgDir         "..\windows\MiApp.Package\AppPackages\MiApp.Package_1.0.0.0_x64_Test"
#define DepDir         PkgDir + "\Dependencies\x64"

[Setup]
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}

; No instala en Program Files — las UWP se autoregistran por MSIX
DefaultDirName={autopf}\{#AppName}
DisableDirPage=yes
DisableProgramGroupPage=yes

; Requiere admin para instalar cert y MSIX en LocalMachine
PrivilegesRequired=admin

; Salida
OutputDir=..\dist
OutputBaseFilename=MiApp-Setup
SetupIconFile=

; Compresión
Compression=lzma2/ultra64
SolidCompression=yes

; UI
WizardStyle=modern
WizardSmallImageFile=
ShowLanguageDialog=no

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Messages]
spanish.BeveledLabel=MiApp {#AppVersion}

[Files]
; MSIX principal
Source: "{#PkgDir}\MiApp.Package_1.0.0.0_x64.msix"; \
    DestDir: "{tmp}"; Flags: deleteafterinstall

; Dependencias x64
Source: "{#DepDir}\Microsoft.VCLibs.x64.14.00.appx"; \
    DestDir: "{tmp}"; Flags: deleteafterinstall
Source: "{#DepDir}\Microsoft.VCLibs.x64.14.00.Desktop.appx"; \
    DestDir: "{tmp}"; Flags: deleteafterinstall
Source: "{#DepDir}\Microsoft.WindowsAppRuntime.1.7.msix"; \
    DestDir: "{tmp}"; Flags: deleteafterinstall

; Script de instalación
Source: "install-helper.ps1"; DestDir: "{tmp}"; Flags: deleteafterinstall

; Certificado de firma (necesario para que Windows confíe en el MSIX)
Source: "..\windows\MiApp.Package\MiApp.Package_Sign.cer"; DestDir: "{tmp}"; Flags: deleteafterinstall

[Run]
Filename: "powershell.exe"; \
    Parameters: "-ExecutionPolicy Bypass -NonInteractive -WindowStyle Hidden -File ""{tmp}\install-helper.ps1"" -TmpDir ""{tmp}"""; \
    StatusMsg: "Instalando MiApp (puede tardar unos segundos)..."; \
    Flags: runhidden waituntilterminated

[Code]
// Verificar que el resultado de PowerShell no fue un error grave
// (errores silenciosos de dependencias ya instaladas se ignoran)
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then begin
    MsgBox('MiApp se instaló correctamente.' + #13#10 +
           'Podés abrirla desde el menú Inicio.', mbInformation, MB_OK);
  end;
end;
