# Guía de instalación desde cero (git clone)

> Esta guía documenta el proceso completo y los problemas reales encontrados al configurar el entorno por primera vez.

---

## Requisitos previos

Instalar todo esto **antes** de clonar el repositorio.

### 1. Node.js 18+

Descargar desde [nodejs.org](https://nodejs.org/en/download) e instalar normalmente.

Verificar:
```powershell
node -v
```

### 2. Git

Descargar desde [git-scm.com](https://git-scm.com/downloads) e instalar normalmente.

### 3. Yarn

```powershell
npm install -g yarn
```

### 4. Visual Studio 2026 Community

Descargar desde [visualstudio.microsoft.com](https://visualstudio.microsoft.com/vs/community/).

Durante la instalación (o desde **Visual Studio Installer → Modify**) marcar:

- ✅ **Desktop development with C++**
- ✅ **Universal Windows Platform development**

> ⚠️ **SDK específico requerido:** dentro de *Universal Windows Platform development*, asegurarse de marcar también:
> - ✅ **Windows 11 SDK (10.0.22621.0)**
>
> Si este SDK no está instalado, el build fallará con:
> ```
> MSB8036: No se encontró la versión de Windows SDK 10.0.22621.0
> ```
> Se puede instalar después desde **Visual Studio Installer → Modify → Individual components** → buscar `10.0.22621`.

### 5. Inno Setup 6

Necesario para compilar el instalador `.exe`.

**Opción A — automática (recomendada):**
```powershell
winget install JRSoftware.InnoSetup
```
Luego verificar que quedó en PATH:
```powershell
where.exe iscc
```
Si no aparece, usar la Opción B.

**Opción B — manual:**
1. Descargar desde [jrsoftware.org/isdl.php](https://jrsoftware.org/isdl.php)
2. Instalar con todas las opciones por defecto
3. Agregar manualmente al PATH del sistema:
   - Buscar **"Variables de entorno"** en el menú inicio
   - Editar la variable `Path` del sistema
   - Agregar: `C:\Program Files (x86)\Inno Setup 6`
4. Cerrar y volver a abrir la terminal, luego verificar:
   ```powershell
   where.exe iscc
   ```

---

## Instalación

### Paso 1 — Clonar el repositorio

Abrir PowerShell normal (no hace falta como Administrador para esto):

```powershell
git clone https://github.com/Kevinndcr/React-Native-For-Windows.git
cd React-Native-For-Windows
```

### Paso 2 — Instalar dependencias de React Native for Windows

> ⚠️ Este paso requiere PowerShell **como Administrador**.

Abrir PowerShell como Administrador:
```powershell
Start-Process powershell -Verb RunAs
```

En la ventana nueva, navegar al proyecto y ejecutar:

```powershell
cd C:\ruta\al\proyecto\React-Native-For-Windows
Set-ExecutionPolicy Unrestricted -Scope Process -Force
iex (New-Object System.Net.WebClient).DownloadString('https://aka.ms/rnw-vs2022-deps.ps1')
```

El script verifica dependencias. Si pregunta `Do you want to install? [y/N]`, escribir `y` y Enter. Repetir para cada dependencia faltante.

### Paso 3 — Instalar dependencias de Node

De vuelta en PowerShell normal (no como Admin), desde la raíz del proyecto:

```powershell
yarn install
```

---

## Ejecutar en modo desarrollo

> ⚠️ **Los siguientes comandos deben ejecutarse desde *Developer PowerShell for Visual Studio 2026*, NO desde PowerShell normal.**
>
> Si se usa PowerShell normal, aparece este error:
> ```
> msbuild : El término 'msbuild' no se reconoce...
> MSBuild tools not found for version 18.0
> ```
>
> **Cómo abrir Developer PowerShell for Visual Studio 2026:**
> - Buscar en el menú inicio: `Developer PowerShell for VS 2026`
> - O desde Visual Studio: menú `Tools → Command Line → Developer PowerShell`

Desde **Developer PowerShell for VS 2026**, navegar al proyecto y ejecutar:

```powershell
cd C:\ruta\al\proyecto\React-Native-For-Windows
$env:VisualStudioVersion = "18.0"
npx react-native run-windows --msbuildprops PlatformToolset=v145
```

> La primera compilación tarda **10-20 minutos**. Las siguientes 2-3 minutos.

La app se abre automáticamente al terminar.

---

## Compilar el instalador `.exe`

### Paso 1 — Compilar en Release

Desde **Developer PowerShell for VS 2026**:

```powershell
$env:VisualStudioVersion = "18.0"
npx react-native run-windows --msbuildprops PlatformToolset=v145 --release --no-launch
```

> Esperar a que termine completamente antes de continuar.

### Paso 2 — Generar el instalador

Desde PowerShell normal, en la raíz del proyecto:

```powershell
cd installer
.\build.ps1
```

El instalador se genera en `dist\MiApp-Setup.exe`.

> Si aparece `ERROR: Inno Setup no encontrado`, revisar el Paso 5 de los Requisitos previos.

---

## Base de datos

La base de datos activa se guarda en:

```
%LOCALAPPDATA%\Packages\MiApp_<id>\RoamingState\greetings.db
```

> El `<id>` varía por instalación. Para encontrarla, abrir el Explorador de archivos y pegar en la barra de direcciones:
> ```
> %LOCALAPPDATA%\Packages
> ```
> Buscar la carpeta que empiece con `MiApp_` y entrar a `RoamingState`.

**Exportar:** botón "Exportar base de datos..." dentro de la app → elegir dónde guardar (por ejemplo, `greetings.db`).

**Importar:** botón "Importar base de datos..." → seleccionar un `.db` (por ejemplo, `greetings.db`) → la tabla se recarga automáticamente.

> ⚠️ Al importar se reemplaza la base de datos actual. Los datos anteriores se pierden.

---

## Instalar en otra PC

El usuario final solo necesita Windows 10/11. Sin Node.js ni Visual Studio.

1. Ejecutar `MiApp-Setup.exe`
2. Siguiente → Instalar
3. La app aparece en el menú de Inicio

Para desinstalar: **Configuración → Aplicaciones → MiApp → Desinstalar**.

---

## Resumen de errores frecuentes

| Error | Causa | Solución |
|---|---|---|
| `msbuild : El término 'msbuild' no se reconoce` | Se usó PowerShell normal en lugar de Developer PowerShell for VS | Abrir **Developer PowerShell for VS 2026** |
| `MSBuild tools not found for version 18.0` | Mismo motivo | Mismo |
| `MSB8036: No se encontró la versión de Windows SDK 10.0.22621.0` | SDK no instalado | Instalar desde VS Installer → Individual components |
| `ERROR: Inno Setup no encontrado` | Inno Setup no instalado o no está en PATH | Ver Paso 5 de requisitos |
