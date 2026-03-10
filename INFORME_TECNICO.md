# Informe Técnico — MiApp: App de Escritorio Windows con React Native

**Propuesta de Desarrollo — App Desktop con tecnologías web-nativas**

---

## Índice

1. [Descripción general del proyecto](#1-descripción-general-del-proyecto)
2. [Por qué React Native for Windows](#2-por-qué-react-native-for-windows)
3. [Stack tecnológico completo](#3-stack-tecnológico-completo)
4. [Arquitectura de la aplicación](#4-arquitectura-de-la-aplicación)
5. [Configuración del entorno de desarrollo](#5-configuración-del-entorno-de-desarrollo)
6. [Módulos nativos en C++](#6-módulos-nativos-en-c)
7. [Integración de SQLite](#7-integración-de-sqlite)
8. [Capa JavaScript — servicios, hooks y UI](#8-capa-javascript--servicios-hooks-y-ui)
9. [Problemas encontrados y soluciones](#9-problemas-encontrados-y-soluciones)
10. [Firma digital del paquete](#10-firma-digital-del-paquete)
11. [Distribución — instalador .exe con Inno Setup](#11-distribución--instalador-exe-con-inno-setup)
12. [Estructura final del proyecto](#12-estructura-final-del-proyecto)
13. [Flujo completo de build y distribución](#13-flujo-completo-de-build-y-distribución)
14. [Consideraciones para escalar el proyecto](#14-consideraciones-para-escalar-el-proyecto)

---

## 1. Descripción general del proyecto

**MiApp** es una aplicación de escritorio para Windows que permite gestionar datos almacenados en una base de datos SQLite local. El usuario puede importar una BD existente desde cualquier carpeta del sistema, visualizar sus registros en una tabla, agregar nuevos registros, editarlos y eliminarlos, y exportar la BD modificada.

La aplicación se distribuye como un instalador `.exe` estándar: el usuario hace doble clic, acepta el asistente de instalación, y la app queda disponible en el menú Inicio como cualquier programa del sistema — sin necesidad de tener instalado Node.js, Visual Studio ni ninguna herramienta de desarrollo.

### Funcionalidades implementadas

| Funcionalidad | Descripción |
|---|---|
| Importar BD | Abre un diálogo del sistema para seleccionar un `.db` y lo copia al almacenamiento interno |
| Exportar BD | Abre un diálogo "Guardar como" para copiar la BD interna a cualquier carpeta |
| Listar registros | Muestra todos los registros de la tabla `greetings` en una tabla con scroll |
| Crear registro | Formulario con campos nombre, mensaje y fecha |
| Editar registro | El mismo formulario pre-cargado con los datos existentes |
| Eliminar registro | Botón por fila con eliminación inmediata |

### Esquema de la BD esperada

```sql
CREATE TABLE greetings (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    name    TEXT,
    message TEXT,
    fecha   TEXT
);
```

---

## 2. Por qué React Native for Windows

### El problema de las apps de escritorio modernas

**React Native for Windows (RNW)** permite escribir la lógica y la UI en React/JavaScript mientras la app se ejecuta como una aplicación UWP/WinUI nativa real. No hay Chromium, no hay servidor web — el render lo hace el motor nativo de Windows.

### Ventajas de RNW para este proyecto

| Aspecto | React Native for Windows |
|---|---|
| Lenguaje UI | JavaScript / React (familiar para developers web) |
| Rendimiento | Render nativo WinUI, no browser |
| Peso del instalador | ~35-40 MB |
| Acceso a APIs de Windows | Via Native Modules en C++ |
| Distribución | MSIX (formato oficial Microsoft) |
| Código compartible | La lógica JS puede reutilizarse en apps móviles RN |

### Limitaciones conocidas

- Las apps RNW son **UWP (Universal Windows Platform)** — no pueden ejecutarse como un `.exe` portable. Deben estar registradas en el sistema mediante su paquete MSIX.
- El bridge JS↔C++ agrega una pequeña latencia en llamadas síncronas, aunque en este proyecto todos los accesos a SQLite son lo suficientemente rápidos como para no ser perceptibles.
- No existe soporte para C# en RNW 0.81 — los módulos nativos deben escribirse en C++/WinRT.

---

## 3. Stack tecnológico completo

### Runtime y herramientas

| Herramienta | Versión | Rol |
|---|---|---|
| React Native | 0.81.0 | Framework base |
| react-native-windows | 0.81.0 | Capa Windows para RN |
| Node.js | 24.x LTS | Entorno JS de desarrollo |
| Yarn | 1.x | Gestor de dependencias JS |
| Visual Studio 2026 Community | 18.3.2 | Compilador C++ / MSBuild |
| Windows SDK | 10.0.19041+ | APIs de Windows |
| Inno Setup | 6.7.1 | Compilador de instaladores |

### Dependencias C++ del sistema (instaladas automáticamente con el MSIX)

| Paquete | Propósito |
|---|---|
| Microsoft.VCLibs.x64.14.00 | Runtime de Visual C++ |
| Microsoft.VCLibs.x64.14.00.Desktop | Runtime VC++ para apps desktop |
| Microsoft.WindowsAppRuntime.1.7 | WinUI / Windows App SDK runtime |

### Librerías embebidas en el proyecto

| Librería | Versión | Integración |
|---|---|---|
| SQLite | 3.52.0 | Amalgamation — `sqlite3.h` + `sqlite3.c` directamente en el proyecto C++ |

> **Por qué amalgamation y no un paquete NuGet:** la amalgamation permite control total sobre la compilación, evita conflictos de versiones con otros paquetes, y es el método recomendado por el propio equipo de SQLite para proyectos embebidos.

---

## 4. Arquitectura de la aplicación

La app tiene tres capas bien separadas:

```
┌─────────────────────────────────────────────────────┐
│                  UI — React (JS)                    │
│   HomePage → GreetingsTable / GreetingForm          │
│         ImportButton / ExportButton                 │
└──────────────────────┬──────────────────────────────┘
                       │ NativeModules bridge
┌──────────────────────▼──────────────────────────────┐
│               Servicios JS (db.js)                  │
│  getGreetings / insert / update / delete / export   │
└──────────────────────┬──────────────────────────────┘
                       │ C++ JSI bridge
┌──────────────────────▼──────────────────────────────┐
│           Native Modules C++/WinRT                  │
│   SQLiteModule.h          FilePickerModule.h        │
│   ├── GetAll()            ├── PickAndImportDb()     │
│   ├── DbExists()          └── ExportDb()            │
│   ├── Insert()                                      │
│   ├── Update()                                      │
│   └── DeleteRow()                                   │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              SQLite 3.52.0 (C puro)                 │
│       AppData\Roaming\MiApp\greetings.db            │
└─────────────────────────────────────────────────────┘
```

### El bridge JS ↔ C++

React Native for Windows expone dos tipos de métodos nativos:

- **`REACT_SYNC_METHOD`** — se ejecuta sincrónicamente en el hilo JS. Usado para operaciones rápidas de BD (leer, insertar, actualizar, eliminar). Retorna valores directamente.
- **`REACT_METHOD`** — asíncrono con `Promise`. Usado para operaciones que bloquean el hilo (diálogos del sistema, operaciones de archivo). Retorna a través de `resolve/reject`.

Desde JavaScript, ambos tipos se acceden igual:

```js
const { SQLiteModule, FilePickerModule } = NativeModules;
const rows = SQLiteModule.getAll();          // sync — retorna array
const ok   = await FilePickerModule.exportDb(); // async — retorna Promise<bool>
```

---

## 5. Configuración del entorno de desarrollo

### Requisitos de Visual Studio

La compilación requiere dos workloads específicos instalados en Visual Studio:

1. **Desktop development with C++** — provee el compilador MSVC, el linker, y las CRT.
2. **WinUI application development** (o "Universal Windows Platform development") — provee el SDK de Windows, las APIs WinRT, y las herramientas de empaquetado MSIX.

Sin ambos workloads el build falla con errores como `cannot find winrt/base.h` o `missing platform toolset`.

### Verificación de dependencias RNW (única vez, como Administrador)

React Native for Windows tiene un script oficial que verifica e instala las herramientas adicionales necesarias:

```powershell
Set-ExecutionPolicy Unrestricted -Scope Process -Force
iex (New-Object System.Net.WebClient).DownloadString('https://aka.ms/rnw-vs2022-deps.ps1')
```

Este script instala/verifica: Windows 10 SDK, Node.js, Yarn, y configuraciones de Windows para desarrollo (modo desarrollador, loopback exemptions).

### Inicialización del proyecto

```bash
# Crear proyecto React Native base
npx @react-native-community/cli@latest init MiApp --version 0.81.0

# Agregar soporte Windows
yarn add react-native-windows@^0.81.0

# Generar proyecto C++ para Windows
npx react-native init-windows --overwrite
```

El último comando genera la carpeta `windows/` con toda la solución C++/WinRT lista para compilar.

---

## 6. Módulos nativos en C++

### Por qué C++ y no C#

Hasta RNW 0.77 existía soporte para escribir módulos nativos en C#. En RNW 0.81 **solo existe soporte para C++/WinRT**. Esto implica que cualquier funcionalidad que requiera acceder a APIs del sistema (archivos, base de datos, diálogos) debe implementarse en C++.

### SQLiteModule.h

Módulo que encapsula todas las operaciones sobre la base de datos SQLite. Implementa 5 métodos:

```cpp
REACT_MODULE(SQLiteModule, L"SQLiteModule");
struct SQLiteModule {

    // Lee todos los registros — retorna array de objetos JS
    REACT_SYNC_METHOD(GetAll, L"getAll")
    JSValue GetAll() noexcept { ... }

    // Verifica si el archivo .db existe
    REACT_SYNC_METHOD(DbExists, L"dbExists")
    bool DbExists() noexcept { ... }

    // Inserta un registro nuevo
    REACT_SYNC_METHOD(Insert, L"insert")
    bool Insert(std::string name, std::string message, std::string fecha) noexcept { ... }

    // Actualiza un registro existente por ID
    REACT_SYNC_METHOD(Update, L"update")
    bool Update(int id, std::string name, std::string message, std::string fecha) noexcept { ... }

    // Elimina un registro por ID
    REACT_SYNC_METHOD(DeleteRow, L"deleteRow")
    bool DeleteRow(int id) noexcept { ... }
};
```

**Ruta de la base de datos:** todos los métodos construyen la ruta dinámicamente usando `ApplicationData::Current().RoamingFolder()`, que apunta a `C:\Users\<usuario>\AppData\Roaming\MiApp\`. Esto es una práctica recomendada en UWP — la app tiene garantizado acceso de lectura/escritura a esa carpeta sin requerir permisos adicionales.

**Uso de `sqlite3_open16`:** se usa la versión wide-char de sqlite_open para aceptar la ruta como `std::wstring` sin necesidad de conversión.

### FilePickerModule.h

Módulo para las operaciones de archivo (importar y exportar la BD). Usa `REACT_METHOD` (asíncrono) porque los diálogos del sistema bloquean el hilo y no pueden ejecutarse en el hilo JS.

```cpp
REACT_MODULE(FilePickerModule, L"FilePickerModule");
struct FilePickerModule {

    // Abre "Abrir archivo" y copia el .db seleccionado al almacenamiento interno
    REACT_METHOD(PickAndImportDb, L"pickAndImportDb")
    void PickAndImportDb(ReactPromise<bool> promise) noexcept {
        std::thread([...] {
            CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
            OPENFILENAMEW ofn = { ... };  // Win32 GetOpenFileNameW
            GetOpenFileNameW(&ofn);
            std::filesystem::copy_file(src, dest, overwrite_existing);
            promise.Resolve(result);
        }).detach();
    }

    // Abre "Guardar como" y copia la BD interna a la ruta elegida
    REACT_METHOD(ExportDb, L"exportDb")
    void ExportDb(ReactPromise<bool> promise) noexcept {
        std::thread([...] {
            CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
            OPENFILENAMEW ofn = { ... };  // Win32 GetSaveFileNameW
            GetSaveFileNameW(&ofn);
            std::filesystem::copy_file(src, dest, overwrite_existing);
            promise.Resolve(result);
        }).detach();
    }
};
```

**Por qué `std::thread` en vez de `co_await`:** los diálogos Win32 (`COMDLG32`) requieren `COINIT_APARTMENTTHREADED` que no es compatible con los coroutine awaiter de WinRT. La solución estándar es crear un thread separado, inicializar COM manualmente, ejecutar el diálogo, y resolver la Promise desde ese thread.

### Registro de los módulos

Ambos módulos se registran en `MiApp.cpp`:

```cpp
#include "SQLiteModule.h"
#include "FilePickerModule.h"
```

Y se declaran en `pch.h` con los headers necesarios:

```cpp
#include <winrt/Windows.Storage.h>
#include <filesystem>
#include <thread>
```

---

## 7. Integración de SQLite

### Amalgamation vs paquete externo

SQLite se distribuye como una "amalgamation" — dos archivos (`sqlite3.h` y `sqlite3.c`) que contienen toda la implementación de la librería en un único par de archivos C. Se descargaron de la web oficial de SQLite (versión 3.52.0) y se colocaron directamente en `windows/MiApp/`.

En el proyecto `.vcxproj` se marca `sqlite3.c` con `<PrecompiledHeader>NotUsing</PrecompiledHeader>` para que no intente usar el PCH (precompiled header) del proyecto, ya que es un archivo C puro:

```xml
<ClCompile Include="sqlite3.c">
    <PrecompiledHeader>NotUsing</PrecompiledHeader>
</ClCompile>
```

### Patrón de uso

Todos los métodos siguen el mismo patrón:

```cpp
sqlite3* db = nullptr;
sqlite3_open16(dbPathW.c_str(), &db);   // abrir
sqlite3_stmt* stmt = nullptr;
sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr);  // preparar query
sqlite3_bind_text(stmt, 1, value.c_str(), -1, SQLITE_TRANSIENT);  // bind params
sqlite3_step(stmt);    // ejecutar
sqlite3_finalize(stmt); // liberar statement
sqlite3_close(db);      // cerrar conexión
```

Cada método abre y cierra la conexión. Esto es intencional para una app de escritorio de uso intermitente — evita mantener una conexión abierta que podría quedar en estado inválido si el archivo se modifica externamente.

---

## 8. Capa JavaScript — servicios, hooks y UI

### src/services/db.js

Único punto de contacto entre React y los módulos nativos:

```js
import { NativeModules } from 'react-native';
const { SQLiteModule, FilePickerModule } = NativeModules;

export const getGreetings   = () => SQLiteModule.getAll();
export const dbExists       = () => SQLiteModule.dbExists();
export const pickAndImport  = () => FilePickerModule.pickAndImportDb();
export const exportDb       = () => FilePickerModule.exportDb();
export const insertGreeting = (name, message, fecha) => SQLiteModule.insert(name, message, fecha);
export const updateGreeting = (id, name, message, fecha) => SQLiteModule.update(id, name, message, fecha);
export const deleteGreeting = (id) => SQLiteModule.deleteRow(id);
```

### src/hooks/useGreetings.js

Hook personalizado que encapsula todo el estado de la app:

```js
export function useGreetings() {
  const [greetings, setGreetings] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const load = () => { /* llama dbExists() + getGreetings() */ };
  useEffect(() => { load(); }, []);

  const importDatabase = async () => { await pickAndImport(); load(); };
  const exportDatabase = async () => { await exportDb(); };
  const addGreeting    = (name, message, fecha) => { insertGreeting(...); load(); };
  const editGreeting   = (id, name, message, fecha) => { updateGreeting(...); load(); };
  const removeGreeting = (id) => { deleteGreeting(id); load(); };

  return { greetings, loading, error,
           importDatabase, exportDatabase,
           addGreeting, editGreeting, removeGreeting };
}
```

### Componentes UI

| Componente | Descripción |
|---|---|
| `HomePage.jsx` | Pantalla principal. Maneja el estado del formulario (`formMode`). Header con botones de acción. |
| `GreetingsTable.jsx` | Tabla con encabezados fijos, filas alternadas y hover effect. Botones Editar/Eliminar por fila. |
| `GreetingForm.jsx` | Formulario de alta/edición. Barra lateral de color (azul=nuevo, amarillo=editar). Nombre y Fecha en la misma fila. |
| `ImportButton.jsx` | Botón reutilizable con props `label` y `color`. |

### Paleta de colores (dark blue)

```js
const C = {
  bg:      '#0a0f1e',  // fondo general — azul noche
  surface: '#111827',  // header / superficies
  card:    '#1a2236',  // tarjetas / filas pares
  border:  '#1e3a5f',  // bordes — azul acero
  accent:  '#2563eb',  // azul eléctrico — acción principal
  green:   '#059669',  // acción secundaria (agregar)
  text:    '#e2e8f0',  // texto principal — blanco suave
  muted:   '#64748b',  // texto secundario — gris azulado
  danger:  '#dc2626',  // eliminar
};
```

---

## 9. Problemas encontrados y soluciones

### Problema 1: Visual Studio 2026 no reconocido por RNW 0.81

**Error:**
```
Could not find MSBuild with VCTools for Visual Studio 17.11.0 or later
```

**Causa:** RNW 0.81 busca Visual Studio en el rango de versiones `[17.11.0, 18.0)`. Visual Studio 2026 es versión `18.3.2`, fuera del rango superior.

**Solución:** forzar la detección definiendo la variable de entorno antes de ejecutar el build:
```powershell
$env:VisualStudioVersion = "18.0"
npx react-native run-windows ...
```

Esto hace que RNW busque en el rango `[18.0, 19.0)`, donde sí encuentra VS 2026.

---

### Problema 2: Platform Toolset v143 no encontrado en VS 2026

**Error:**
```
The build tools for Visual Studio 2022 (Platform Toolset = 'v143') cannot be found.
```

**Causa:** RNW genera el `.vcxproj` con `<PlatformToolset>v143</PlatformToolset>` (toolset de VS 2022). VS 2026 solo tiene `v145`.

**Solución:** pasar el toolset como propiedad de MSBuild:
```powershell
npx react-native run-windows --msbuildprops PlatformToolset=v145
```

**Comando final de desarrollo:**
```powershell
$env:VisualStudioVersion = "18.0"
npx react-native run-windows --msbuildprops PlatformToolset=v145
```

---

### Problema 3: Conflicto de namespace `React` en C++

**Error:**
```
error C2386: 'React': a symbol with this name already exists in the current scope
```

**Causa:** el código inicial usaba `namespace React = winrt::Microsoft::ReactNative;` pero dentro del namespace `MiApp` ya existía un símbolo con ese nombre.

**Solución:** cambiar el alias de namespace por un `using namespace` directo:
```cpp
// ❌ causaba conflicto
namespace React = winrt::Microsoft::ReactNative;

// ✅ correcto
using namespace winrt::Microsoft::ReactNative;
```

---

### Problema 4: `TouchableOpacity` crash en RNW 0.81

**Error en runtime:**
```
Cannot read property 'default' of undefined in RendererImplementation.js
```

**Causa:** `TouchableOpacity` tiene un bug conocido en la versión 0.81 de RNW al compilar en modo Debug con ciertas configuraciones del renderer.

**Solución:** reemplazar todos los `TouchableOpacity` por `Pressable`, que es el componente de presión recomendado desde React Native 0.64+:
```jsx
// ❌
<TouchableOpacity onPress={fn}>

// ✅
<Pressable onPress={fn} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
```

---

### Problema 5: MSIX no firmado — instalación silenciosa fallida

**Síntoma:** el instalador `.exe` terminaba sin errores visibles pero la app no aparecía en el sistema.

**Diagnóstico:**
```powershell
Get-AppxPackage *MiApp*  # no devolvía nada

# Intentar instalar manualmente mostró el error real:
Add-AppxPackage -Path $msix
# → error 0x800B0100: The app package must be digitally signed
```

**Causa:** RNW en modo Release genera el MSIX pero **no lo firma automáticamente** a menos que el proyecto tenga un certificado configurado. El método anterior de `install-helper.ps1` intentaba extraer el certificado del propio MSIX con `Get-AuthenticodeSignature`, pero si no hay firma, ese objeto es `null`.

**Solución completa — ver sección 10.**

---

### Problema 6: Diálogos Win32 en threads COM

**Error al usar `co_await` con diálogos de archivo:**
Los diálogos `GetOpenFileNameW` y `GetSaveFileNameW` requieren que el thread tenga el modelo COM `COINIT_APARTMENTTHREADED`. Los coroutines WinRT usan `COINIT_MULTITHREADED`, lo que hace que los diálogos fallen o no aparezcan.

**Solución:** ejecutar cada diálogo en un `std::thread` separado, inicializando COM manualmente:
```cpp
std::thread([promise = std::move(promise)]() mutable noexcept {
    CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
    // ... diálogo Win32 ...
    CoUninitialize();
    promise.Resolve(result);
}).detach();
```

---

## 10. Firma digital del paquete

### Por qué las apps MSIX necesitan firma

Windows no permite instalar paquetes MSIX sin firma digital. Esta es una medida de seguridad del modelo UWP — garantiza que el paquete no fue modificado después de ser creado por el desarrollador.

Las apps de la **Microsoft Store** usan un certificado emitido por Microsoft, confiado automáticamente en todos los Windows. Las apps de **sideloading** (distribución directa, sin Store) deben usar un certificado propio, y ese certificado debe agregarse manualmente al almacén de confianza de cada PC destino.

### Solución implementada: certificado autofirmado

Se creó un certificado autofirmado con `New-SelfSignedCertificate`, que es la práctica estándar para distribución interna/privada:

```powershell
# 1. Crear certificado (subject = Publisher del Package.appxmanifest)
$cert = New-SelfSignedCertificate `
    -Subject "CN=cordo" `
    -KeyUsage DigitalSignature `
    -KeyAlgorithm RSA -KeyLength 2048 `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -Type CodeSigningCert `
    -NotAfter (Get-Date).AddYears(10)

# 2. Exportar PFX (clave privada — solo para el developer)
Export-PfxCertificate -Cert $cert -FilePath "MiApp.Package_Sign.pfx" -Password $pw

# 3. Exportar CER (clave pública — se incluye en el instalador)
Export-Certificate -Cert $cert -FilePath "MiApp.Package_Sign.cer"
```

**Requisito crítico:** el campo `Subject` del certificado (`CN=cordo`) debe coincidir exactamente con el atributo `Publisher` en `Package.appxmanifest`:

```xml
<Identity Publisher="CN=cordo" ... />
```

Si no coinciden, `signtool` rechaza firmar el paquete con error `0x8007000D`.

### Firma del MSIX con signtool

```powershell
& "C:\Program Files (x86)\Windows Kits\10\bin\10.0.19041.0\x64\signtool.exe" `
    sign /fd SHA256 /f "MiApp.Package_Sign.pfx" /p "miapp2026" `
    "MiApp.Package_1.0.0.0_x64.msix"
```

### Configuración del proyecto para firma automática

El archivo `MiApp.Package.wapproj` se actualizó para firmar automáticamente en cada build:

```xml
<PropertyGroup>
    <PackageCertificateKeyFile>MiApp.Package_Sign.pfx</PackageCertificateKeyFile>
    <PackageCertificatePassword>miapp2026</PackageCertificatePassword>
    <PackageCertificateThumbprint>FB649B27772177F03F4C837F7ED60D80080E03F1</PackageCertificateThumbprint>
    <AppxPackageSigningEnabled>True</AppxPackageSigningEnabled>
</PropertyGroup>
```

### Cómo el instalador maneja la confianza en la PC destino

El instalador incluye el archivo `.cer` (clave pública) y lo instala con `Import-Certificate` durante la instalación, antes de ejecutar `Add-AppxPackage`:

```powershell
Import-Certificate -FilePath $cer -CertStoreLocation Cert:\LocalMachine\TrustedPeople
```

El almacén `LocalMachine\TrustedPeople` requiere privilegios de administrador — por eso el instalador Inno Setup está configurado con `PrivilegesRequired=admin`, lo que hace que Windows muestre el diálogo UAC al usuario antes de ejecutarlo.

---

## 11. Distribución — instalador .exe con Inno Setup

### Por qué no se puede distribuir como `.exe` portable

Las apps UWP/MSIX **no pueden ejecutarse como ejecutables portables**. Son aplicaciones registradas: Windows las gestiona en un contenedor virtual, el manifiesto describe sus capacidades, y el sistema controla su instalación y desinstalación. No existe un equivalente a "copiar la carpeta y ejecutar".

Las opciones de distribución son:
1. **Microsoft Store** — distribución pública, requiere cuenta de desarrollador ($19 USD pago único)
2. **MSIX + certificado manual** — el usuario instala el cert y luego el MSIX (múltiples pasos)
3. **Instalador .exe wrapper** ← opción elegida — un `.exe` que automatiza todo el proceso

### Inno Setup

Inno Setup es un compilador de instaladores gratuito y de código abierto, usado por proyectos como VS Code, Git para Windows, Python, 7-Zip. Genera un único `.exe` que empaqueta archivos y ejecuta lógica de instalación.

Se instaló via winget:
```powershell
winget install --id JRSoftware.InnoSetup --silent
```

### Archivos del instalador (`installer/`)

```
installer/
├── setup.iss           ← script fuente de Inno Setup
├── install-helper.ps1  ← lógica de instalación ejecutada por el .exe
└── build.ps1           ← script para generar el .exe
```

### Flujo del instalador generado

Cuando el usuario ejecuta `MiApp-Setup.exe`:

```
1. Windows detecta que requiere admin → muestra diálogo UAC
2. El wizard Inno Setup se abre (pantalla de bienvenida → Instalar)
3. Se extrae a %TEMP% el contenido comprimido:
   ├── MiApp.Package_1.0.0.0_x64.msix
   ├── MiApp.Package_Sign.cer
   ├── Microsoft.VCLibs.x64.14.00.appx
   ├── Microsoft.VCLibs.x64.14.00.Desktop.appx
   ├── Microsoft.WindowsAppRuntime.1.7.msix
   └── install-helper.ps1
4. Se ejecuta install-helper.ps1 con PowerShell como admin:
   a. Import-Certificate ← instala el .cer en LocalMachine\TrustedPeople
   b. Add-AppxPackage VCLibs + WindowsAppRuntime (si no están)
   c. Add-AppxPackage MiApp.msix ← instala la app
5. Los archivos temporales se eliminan
6. Aparece mensaje "MiApp se instaló correctamente"
7. La app queda disponible en el menú Inicio
```

### Script de generación del instalador (`build.ps1`)

```powershell
# Firma el MSIX automáticamente antes de empaquetar
signtool sign /fd SHA256 /f MiApp.Package_Sign.pfx /p "miapp2026" MiApp.msix

# Compila el instalador
ISCC.exe setup.iss

# Salida: dist\MiApp-Setup.exe
```

### Resultado

| Archivo | Tamaño | Contenido |
|---|---|---|
| `dist\MiApp-Setup.exe` | ~38 MB | MSIX (6.5 MB) + WindowsAppRuntime (22 MB) + VCLibs (6 MB) + scripts |

---

## 12. Estructura final del proyecto

```
MiApp/
│
├── windows/                          ← Solución C++/WinRT (generada por RNW)
│   ├── MiApp/
│   │   ├── SQLiteModule.h            ← Native Module: CRUD SQLite
│   │   ├── FilePickerModule.h        ← Native Module: importar/exportar BD
│   │   ├── sqlite3.h / sqlite3.c     ← SQLite 3.52.0 amalgamation
│   │   ├── pch.h                     ← Precompiled header
│   │   ├── MiApp.cpp                 ← Entry point C++ — registra módulos
│   │   └── MiApp.vcxproj             ← Proyecto C++ de Visual Studio
│   └── MiApp.Package/
│       ├── MiApp.Package.wapproj     ← Proyecto de packaging (genera MSIX)
│       ├── MiApp.Package_Sign.pfx    ← Certificado privado (no subir a git)
│       ├── MiApp.Package_Sign.cer    ← Certificado público
│       ├── Package.appxmanifest      ← Manifiesto de la app (nombre, Publisher, ícono)
│       └── AppPackages/              ← Output de builds
│           └── MiApp.Package_1.0.0.0_x64_Test/
│               ├── MiApp.Package_1.0.0.0_x64.msix
│               └── Dependencies/x64/
│                   ├── Microsoft.VCLibs.x64.14.00.appx
│                   ├── Microsoft.VCLibs.x64.14.00.Desktop.appx
│                   └── Microsoft.WindowsAppRuntime.1.7.msix
│
├── src/                              ← Código JavaScript / React
│   ├── services/
│   │   └── db.js                     ← Bridge JS → Native Modules
│   ├── hooks/
│   │   └── useGreetings.js           ← State management hook
│   ├── components/
│   │   ├── GreetingsTable.jsx        ← Tabla de registros con CRUD
│   │   ├── GreetingForm.jsx          ← Formulario alta/edición
│   │   └── ImportButton.jsx          ← Botón reutilizable
│   └── pages/
│       └── HomePage.jsx              ← Pantalla principal + paleta de colores
│
├── installer/                        ← Sistema de distribución
│   ├── setup.iss                     ← Script Inno Setup
│   ├── install-helper.ps1            ← Lógica de instalación (cert + MSIX)
│   └── build.ps1                     ← Genera dist\MiApp-Setup.exe
│
├── dist/
│   └── MiApp-Setup.exe               ← Instalador final para distribuir
│
├── App.tsx                           ← Entry point React — renderiza HomePage
├── package.json
└── README.md
```

> **Nota de seguridad:** `MiApp.Package_Sign.pfx` contiene la clave privada del certificado. No debe subirse a repositorios públicos. Está en `.gitignore` del proyecto.

---

## 13. Flujo completo de build y distribución

### Desarrollo diario

```powershell
cd MiApp
$env:VisualStudioVersion = "18.0"
npx react-native run-windows --msbuildprops PlatformToolset=v145
# La app se abre con Metro bundler activo (hot reload disponible)
```

> Los cambios en archivos `.js`/`.jsx` se reflejan en la app con `Ctrl+R` (reload) sin necesidad de recompilar C++.
> Solo se necesita recompilar si se modifican archivos en `windows/`.

### Generar nueva distribución

```powershell
# Paso 1 — compilar Release MSIX (JS bundleado dentro del paquete)
$env:VisualStudioVersion = "18.0"
npx react-native run-windows --msbuildprops PlatformToolset=v145 --release --no-launch

# Paso 2 — generar instalador .exe
cd installer
.\build.ps1
# → dist\MiApp-Setup.exe listo para enviar
```

### Instalación en PC del usuario final

```
1. Recibir MiApp-Setup.exe
2. Doble clic
3. Aceptar UAC (administrador)
4. Clic en "Instalar"
5. Buscar "MiApp" en el menú Inicio
```

---

## 14. Consideraciones para escalar el proyecto

### Otras tablas o esquemas de BD

Actualmente la app asume una tabla llamada `greetings` con columnas `(id, name, message, fecha)`. Para soportar BDs con estructura arbitraria habría que:

1. En C++: modificar `GetAll()` para detectar columnas dinámicamente (ya lo hace — usa `sqlite3_column_name` en un loop).
2. En JS: enviar al componente tabla las columnas como metadatos y renderizarlas dinámicamente.
3. Agregar en el hook un método para listar las tablas disponibles (`SELECT name FROM sqlite_master WHERE type='table'`).

### Firma con certificado de autoridad reconocida

El certificado autofirmado funciona bien para distribución interna (empresa, universidad, grupo de trabajo), pero Windows SmartScreen puede mostrar una advertencia "Editor desconocido" la primera vez. Para eliminarlo completamente existen dos opciones:

- **Certificado de Code Signing comercial** (~80-200 USD/año, de DigiCert, Sectigo, etc.) — confiado automáticamente por Windows.
- **Publicación en la Microsoft Store** — Microsoft firma el paquete con su propia cadena de confianza.

### CI/CD

El proceso de build es completamente scriptable. Se podría configurar un pipeline en GitHub Actions con runners Windows para generar automáticamente el instalador en cada push a `main`.

### Múltiples usuarios / sincronización

La BD actualmente vive en `AppData\Roaming\<usuario>`. Para compartir datos entre usuarios o equipos habría que mover la BD a una carpeta compartida en red, o reemplazar SQLite por una BD con servidor (PostgreSQL, SQL Server). El cambio afectaría únicamente al módulo C++ `SQLiteModule.h` y al hook `useGreetings.js`.

---

*Documento generado el 9 de marzo de 2026.*
*Proyecto: MiApp — React Native 0.81 + react-native-windows 0.81 + SQLite 3.52.0*
