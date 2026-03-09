# MiApp — React Native for Windows + SQLite

App de escritorio para Windows que muestra datos de una base de datos SQLite y permite importar un archivo `.db` desde el explorador de archivos.

---

## Requisitos previos

| Herramienta | Versión mínima |
|-------------|---------------|
| Windows 10/11 | build 19041+ |
| Node.js | 18 LTS o superior |
| Yarn | cualquier versión reciente |
| Git | cualquier versión reciente |
| Visual Studio 2022 o 2026 | Community (gratis) |

### Workloads requeridos en Visual Studio

Abrir el **Visual Studio Installer** → Modify y marcar:

- ✅ **Desktop development with C++**
- ✅ **WinUI application development**

### Verificar dependencias RNW (una sola vez, como Administrador)

```powershell
Set-ExecutionPolicy Unrestricted -Scope Process -Force
iex (New-Object System.Net.WebClient).DownloadString('https://aka.ms/rnw-vs2022-deps.ps1')
```

---

## Instalación

```bash
git clone <URL-del-repo>
cd MiApp
yarn install
```

---

## Ejecutar en modo desarrollo

```powershell
$env:VisualStudioVersion = "18.0"
npx react-native run-windows --msbuildprops PlatformToolset=v145

```

> La primera compilación tarda 10-20 minutos. Las siguientes son mucho más rápidas.

> Si tenés **Visual Studio 2022** (no 2026), usá este comando en su lugar:
> ```bash
> npx react-native run-windows
> ```

---

## Uso de la app

1. Al abrir la app verás el mensaje "No hay base de datos" si es la primera vez
2. Hacé clic en **"Importar base de datos..."**
3. Seleccioná un archivo `.db`, `.sqlite` o `.sqlite3` desde el explorador de archivos
4. La tabla se recarga automáticamente con los datos del archivo importado

La base de datos se guarda internamente en:
```
C:\Users\<usuario>\AppData\Roaming\MiApp\greetings.db
```

---

## Estructura del proyecto

```
MiApp/
├── windows/MiApp/
│   ├── SQLiteModule.h      ← Native Module C++: lee la BD
│   ├── FilePickerModule.h  ← Native Module C++: abre el file picker
│   ├── sqlite3.h / .c      ← SQLite amalgamation 3.52.0
│   └── MiApp.vcxproj
├── src/
│   ├── services/db.js      ← puente JS ↔ Native Modules
│   ├── hooks/useGreetings.js
│   ├── components/
│   │   ├── ImportButton.jsx
│   │   └── GreetingsTable.jsx
│   └── pages/HomePage.jsx
└── App.tsx
```

---

## Generar el instalador `.exe`

El proyecto incluye scripts en `installer/` para producir un instalador estilo wizard (`dist/MiApp-Setup.exe`) que el usuario final solo tiene que ejecutar con doble clic — sin pasos manuales de certificado ni comandos de PowerShell.

### Requisito: Inno Setup 6

Solo se instala una vez en la máquina de desarrollo:

```powershell
winget install --id JRSoftware.InnoSetup --silent --accept-package-agreements --accept-source-agreements
```

### Proceso completo (dos pasos)

**Paso 1 — Compilar el MSIX en modo Release:**

```powershell
cd MiApp
$env:VisualStudioVersion = "18.0"
npx react-native run-windows --msbuildprops PlatformToolset=v145 --release --no-launch
```

**Paso 2 — Compilar el instalador `.exe`:**

```powershell
cd installer
.\build.ps1
```

Salida: `dist\MiApp-Setup.exe` (~38 MB, listo para distribuir).

---

## Instalar en la PC del usuario final

> El usuario solo necesita Windows 10/11. No necesita Node.js, Visual Studio ni ninguna herramienta de desarrollo.

1. Descargar `MiApp-Setup.exe`
2. Doble clic → clic en **Siguiente** → clic en **Instalar**
3. La app aparece en el menú de Inicio ✅

El instalador se encarga automáticamente de:
- Instalar el certificado de firma en el almacén de confianza
- Instalar las dependencias del sistema (VCLibs, Windows App Runtime)
- Instalar el MSIX de la app

### Actualizaciones futuras

Generar un nuevo `MiApp-Setup.exe` y enviárselo al usuario. Basta con ejecutarlo — el instalador detecta que la app ya existe y la actualiza.

### Desinstalar

Menú Inicio → **Configuración** → **Aplicaciones** → buscar "MiApp" → **Desinstalar**.
