# MiApp — React Native for Windows + SQLite

App de escritorio para Windows que muestra y gestiona registros de una base de datos SQLite. Permite importar un archivo `.db` externo desde el explorador de archivos y exportar la base de datos activa a cualquier carpeta.

---

## Tabla de contenidos

1. [Requisitos previos](#1-requisitos-previos)
2. [Clonar el repositorio e instalar dependencias](#2-clonar-el-repositorio-e-instalar-dependencias)
3. [Ejecutar en modo desarrollo](#3-ejecutar-en-modo-desarrollo)
4. [Compilar para producción (instalador .exe)](#4-compilar-para-producción-instalador-exe)
5. [Compartir e importar la base de datos](#5-compartir-e-importar-la-base-de-datos)
6. [Instalar en la PC del usuario final](#6-instalar-en-la-pc-del-usuario-final)
7. [Estructura del proyecto](#7-estructura-del-proyecto)

---

## 1. Requisitos previos

Estas herramientas deben estar instaladas **en la máquina de desarrollo** antes de cualquier otro paso.

| Herramienta | Versión mínima | Notas |
|---|---|---|
| Windows 10/11 | build 19041+ | |
| Node.js | 18 LTS o superior | [nodejs.org/en/download](https://nodejs.org/en/download) |
| Yarn | cualquier versión reciente | `npm install -g yarn` |
| Git | cualquier versión reciente | [git-scm.com/downloads](https://git-scm.com/downloads) |
| Visual Studio 2022 o 2026 | Community (gratis) | [visualstudio.microsoft.com](https://visualstudio.microsoft.com/vs/community/) — ver workloads abajo |

### Workloads de Visual Studio

Abrir el **Visual Studio Installer** → **Modify** y marcar:

- ✅ **Desktop development with C++**
- ✅ **Universal Windows Platform development** (o **WinUI application development**)

### Dependencias de React Native for Windows (una sola vez, como Administrador)

Abrir PowerShell **como Administrador** y ejecutar:

```powershell
Set-ExecutionPolicy Unrestricted -Scope Process -Force
iex (New-Object System.Net.WebClient).DownloadString('https://aka.ms/rnw-vs2022-deps.ps1')
```

> Esto instala las dependencias del sistema necesarias para RNW (Windows App SDK, VCLibs, etc.).

---

## 2. Clonar el repositorio e instalar dependencias

```powershell
# 1. Clonar
git clone https://github.com/Kevinndcr/React-Native-For-Windows.git

# 2. Entrar a la carpeta del repo
cd React-Native-For-Windows

# 3. Entrar a la carpeta de la app
cd MiApp

# 4. Instalar dependencias de Node
yarn install
```

> `yarn install` descarga todos los paquetes de `package.json` (incluyendo `react-native-windows`) y los coloca en `node_modules/`. No modifica ningún archivo del proyecto.

### Verificar el entorno

Antes de compilar por primera vez, ejecutar:

```powershell
npx react-native doctor
```

Este comando analiza el entorno y lista qué dependencias están correctamente instaladas y cuáles faltan. Resolver todos los ítems marcados con ❌ antes de continuar.

---

## 3. Ejecutar en modo desarrollo

El modo desarrollo compila la app, la instala localmente y la abre con el Metro bundler activo (recarga en caliente).

### Con Visual Studio 2026

```powershell
# Desde la carpeta MiApp/
$env:VisualStudioVersion = "18.0"
npx react-native run-windows --msbuildprops PlatformToolset=v145
```

### Con Visual Studio 2022

```powershell
# Desde la carpeta MiApp/
npx react-native run-windows
```

> **Primera compilación:** tarda entre 10 y 20 minutos porque descarga y compila todas las dependencias nativas de C++. Las compilaciones siguientes son mucho más rápidas (2-3 minutos).

Una vez que la app esté corriendo, cualquier cambio guardado en los archivos `.jsx` / `.tsx` / `.js` se refleja automáticamente sin necesidad de recompilar.

---

## 4. Compilar para producción (instalador .exe)

Este proceso genera `dist\MiApp-Setup.exe`, un instalador de doble clic listo para distribuir.

### Paso 0 — Instalar Inno Setup 6 (una sola vez)

```powershell
winget install --id JRSoftware.InnoSetup --silent --accept-package-agreements --accept-source-agreements
```

### Paso 1 — Compilar el MSIX en modo Release

```powershell
# Desde la carpeta MiApp/
$env:VisualStudioVersion = "18.0"
npx react-native run-windows --msbuildprops PlatformToolset=v145 --release --no-launch
```

> Con **Visual Studio 2022** omitir `$env:VisualStudioVersion` y `--msbuildprops PlatformToolset=v145`.

El MSIX compilado queda en:
```
windows\MiApp.Package\AppPackages\MiApp.Package_1.0.0.0_x64_Test\
```

### Paso 2 — Generar el instalador `.exe`

```powershell
# Desde la carpeta MiApp/
cd installer
.\build.ps1
```

Salida: `dist\MiApp-Setup.exe` (~38 MB).

El script `build.ps1` firma automáticamente el MSIX y empaqueta todo en un instalador wizard con Inno Setup.

---

## 5. Compartir e importar la base de datos

### Dónde vive la base de datos activa

La app almacena su base de datos en la carpeta de datos de la aplicación del usuario:

```
C:\Users\<usuario>\AppData\Roaming\MiApp\greetings.db
```

> `AppData\Roaming` está oculta por defecto. En el Explorador de archivos escribir `%APPDATA%\MiApp` en la barra de dirección para llegar directamente.

### Exportar la base de datos (desde la app)

Dentro de la app, usar el botón **"Exportar base de datos..."**. Esto abre un diálogo de guardado y escribe una copia del `.db` activo en la ubicación que elijas.

### Importar una base de datos externa (desde la app)

1. Iniciar la app.
2. Hacer clic en **"Importar base de datos..."**.
3. Seleccionar un archivo `.db`, `.sqlite` o `.sqlite3` desde el explorador.
4. La tabla se recarga automáticamente con los datos del archivo importado.

> Al importar, la app **reemplaza** su copia interna (`greetings.db`) con el archivo seleccionado. Los datos anteriores se sobreescriben.

### Compartir el archivo entre equipos o personas

```
Flujo recomendado:

  Equipo A                         Equipo B
  ─────────                        ─────────
  Exportar .db         →  enviar   →  Importar .db
  (botón en la app)       (mail,       (botón en la app)
                           USB, etc.)
```

El archivo `.db` es portátil: un SQLite estándar que se puede inspeccionar con cualquier herramienta compatible (DB Browser for SQLite, DBeaver, etc.).

### Respaldar la base de datos manualmente

Copiar el archivo directamente desde la ruta de AppData:

```powershell
# Hacer una copia de seguridad con fecha
$fecha = Get-Date -Format "yyyyMMdd"
Copy-Item "$env:APPDATA\MiApp\greetings.db" "$HOME\Desktop\greetings_backup_$fecha.db"
```

---

## 6. Instalar en la PC del usuario final

> El usuario final **solo necesita Windows 10/11**. No necesita Node.js, Visual Studio ni ninguna herramienta de desarrollo.

1. Descargar `MiApp-Setup.exe` (generado en el paso 4).
2. Doble clic → **Siguiente** → **Instalar**.
3. La app aparece en el menú de Inicio ✅

El instalador instala automáticamente:
- El certificado de firma en el almacén de confianza del sistema
- VCLibs y Windows App Runtime (dependencias del sistema)
- El MSIX de la app

### Actualizar a una nueva versión

Compilar un nuevo `MiApp-Setup.exe` y enviárselo al usuario. Al ejecutarlo, el instalador detecta la versión existente y la actualiza.

### Desinstalar

**Inicio** → **Configuración** → **Aplicaciones** → buscar "MiApp" → **Desinstalar**.

---

## 7. Estructura del proyecto

```
MiApp/
├── src/
│   ├── services/db.js          ← puente JS ↔ Native Modules
│   ├── hooks/useGreetings.js
│   ├── components/
│   │   ├── GreetingForm.jsx
│   │   ├── GreetingsTable.jsx
│   │   └── ImportButton.jsx
│   └── pages/HomePage.jsx
├── windows/MiApp/
│   ├── SQLiteModule.h          ← Native Module C++: lee/escribe la BD
│   ├── FilePickerModule.h      ← Native Module C++: abre file picker
│   ├── sqlite3.h / sqlite3.c   ← SQLite amalgamation 3.52.0
│   └── MiApp.vcxproj
├── installer/
│   ├── build.ps1               ← genera dist/MiApp-Setup.exe
│   └── setup.iss               ← script de Inno Setup
├── App.tsx
└── package.json
```
