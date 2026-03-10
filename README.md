# MiApp — React Native for Windows + SQLite

App de escritorio Windows con base de datos SQLite. Permite agregar, editar, eliminar e importar/exportar registros.

## Requisitos

- Windows 10/11
- [Node.js 18+](https://nodejs.org/en/download)
- [Git](https://git-scm.com/downloads)
- [Visual Studio 2022 o 2026 Community](https://visualstudio.microsoft.com/vs/community/) con los workloads:
  - **Desktop development with C++**
  - **Universal Windows Platform development**

## Instalación

**1. Clonar el repositorio:**

```powershell
git clone https://github.com/Kevinndcr/React-Native-For-Windows.git
cd React-Native-For-Windows/
```

**2. Instalar dependencias de RNW (solo la primera vez, como Administrador):**

Abrir PowerShell como Administrador:

```powershell
Start-Process powershell -Verb RunAs
```

En la ventana nueva que se abre, ejecutar:

```powershell
Set-ExecutionPolicy Unrestricted -Scope Process -Force
iex (New-Object System.Net.WebClient).DownloadString('https://aka.ms/rnw-vs2022-deps.ps1')
```

El script verifica el entorno y si detecta que faltan workloads de Visual Studio pregunta:

```
Checking Visual Studio 2022 (>= 17.11.0) & req. components      Failed
Do you want to install? [y/N]:
```

Escribir `y` y presionar Enter. El script instala automáticamente los componentes faltantes. Hacer eso en todos los casos que falten dependencias.

**3. Instalar dependencias de Node:**

```powershell
yarn install
```

## Desarrollo

```powershell
$env:VisualStudioVersion = "18.0"
npx react-native run-windows --msbuildprops PlatformToolset=v145
```

> La primera compilación tarda 10-20 minutos. Las siguientes 2-3 minutos.

## Compilar instalador

Instalar [Inno Setup 6](https://jrsoftware.org/isdl.php) (solo la primera vez).

**Paso 1** — compilar en Release:

```powershell
$env:VisualStudioVersion = "18.0"
npx react-native run-windows --msbuildprops PlatformToolset=v145 --release --no-launch
```

> Esperar a que termine completamente antes de continuar con el Paso 2.

**Paso 2** — generar el `.exe` (desde la raíz del repositorio):

```powershell
cd installer
.\build.ps1
```

El instalador se genera en `dist\MiApp-Setup.exe`.

## Base de datos

La base de datos activa está en:

```
%APPDATA%\MiApp\greetings.db
```

**Exportar:** botón "Exportar base de datos..." dentro de la app → elige dónde guardar el `.db`.

**Importar:** botón "Importar base de datos..." → selecciona un `.db` → la tabla se recarga automáticamente.

> Al importar se reemplaza la base de datos actual. Los datos anteriores se pierden.

## Instalar en otra PC

El usuario final solo necesita Windows 10/11. Sin Node.js ni Visual Studio.

1. Ejecutar `MiApp-Setup.exe`
2. Siguiente → Instalar
3. La app aparece en el menú de Inicio

Para desinstalar: **Configuración → Aplicaciones → MiApp → Desinstalar**.
