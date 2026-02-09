# Calendari IOC - Contexto rapido para empezar a programar

Este documento resume lo que necesitaba saber para entrar en contexto rapido, con los puntos clave del codigo, arquitectura, flujo de datos, y riesgos. Esta basado en una lectura completa del repositorio.

## TL;DR
- SPA sin framework: todo es JS vanilla con clases globales y scripts cargados en orden desde `index.html`.
- La app vive en `appStateManager` y persiste en `localStorage` con rehidratacion a clases ricas (`CalendariIOC_*`).
- El arranque lo coordina `Bootstrap` y toda accion de UI se enruta via `data-action`.
- Configuracion academica viene de `config/*.json` y se carga via `fetch`, por lo que necesitas servir la app por HTTP (no abrir `index.html` directo).
- La vista se renderiza en JS a mano (no hay template engine). Cambios de UI suelen requerir tocar `Renderers`, `PanelsRenderer` y `ModalRenderer`.

## Como ejecutar
- Servir estatico (necesario para `fetch` de `config/`):
  - `npm run serve` (usa `python3 -m http.server 8000`)
- Tests E2E:
  - `npm run test:open` (modo interactivo)
  - `npm run test:headless` (CI local)

## Mapa del repositorio
- `index.html`: entrada, DOM base, modales y orden de carga de scripts.
- `css/`: estilos por capas (`variables`, `base`, `layout`, `components`, `calendar`, `themes`).
- `js/`:
  - `Bootstrap.js`: arranque, listeners globales, enrutador de acciones.
  - `helpers/`: utilidades de fecha, UI, IDs, drag & drop, temas, etc.
  - `config/SemesterConfig.js`: fusiona config comun + especifica + categorias de sistema.
  - `models/`: clases de dominio (`CalendariIOC_Calendar`, `CalendariIOC_Event`, `CalendariIOC_Category`) y rehidratador.
  - `state/`: estado global (`AppStateManager`) y persistencia (`StorageManager`).
  - `services/`: discovery de estudios, validaciones, replicas.
  - `managers/`: coordinadores de negocio (calendarios, eventos, categorias, vistas, replicas).
  - `ui/`: renderers de vistas y modales.
  - `export/` + `import/`: exportacion HTML/ICS/JSON e importacion ICS.
- `config/`: JSON de estudios y sistema (se consume via `fetch`).
- `cypress/`: suite E2E.
- `docs/`: wiki y referencia (`docs/ai-reference.md`).

## Flujo de arranque (runtime)
1. `DOMContentLoaded` crea `new Bootstrap()` (`js/Bootstrap.js`).
2. `Bootstrap.initializeAsync()`:
   - Descubre tipos de estudio (`StudyTypeDiscoveryService`).
   - Inicializa renderers, carga `localStorage`, aplica tema, selecciona calendario.
   - Enruta acciones con `document.addEventListener('click', ... handleAction)`.
3. Cada `data-action` dispara un metodo en un manager y luego refresca UI + persiste.

## Arquitectura y flujo de datos
- **Entrada**: botones con `data-action`, formularios en modales, drag & drop.
- **Coordinacion**: managers (`CalendarManager`, `EventManager`, `ViewManager`, `CategoryManager`, `ReplicaManager`).
- **Estado**: `AppStateManager` mantiene `appState` + variables auxiliares (drag, seleccion, edicion).
- **Persistencia**: `StorageManager` serializa y guarda en `localStorage` (`calendari-ioc-data`), con rehidratacion via `CalendariIOC_DataRehydrator`.
- **UI**: renderers generan HTML strings y los insertan en el DOM.

## Modelo de dominio
- `CalendariIOC_Calendar`: calendario con categorias y eventos, metadatos (id, nombre, fechas, tipo).
- `CalendariIOC_Category`: categoria con `id`, `name`, `color`, `isSystem`.
- `CalendariIOC_Event`: evento con `id`, `title`, `date`, `category` (referencia a instancia), `description`, `isSystemEvent`.
- `CalendariIOC_DataRehydrator`: reconstruye instancias desde JSON plano y valida integridad.

## Estado global (`AppStateManager`)
- `appState` incluye:
  - `calendars` (diccionario de instancias `CalendariIOC_Calendar`)
  - `currentCalendarId`, `currentDate` (UTC)
  - `categoryTemplates` (catalogo global de categorias de usuario)
  - `systemCategoryColors` (colores persistidos de categorias de sistema)
  - `unplacedEvents` (replicacion)
  - `compactZoom`
  - `lastVisitedMonths` por calendario
- Variables auxiliares: `draggedEvent`, `selectedCalendarId`, `editingEventId`, `copiedEvent`.

## Configuracion academica y discovery
- `StudyTypeDiscoveryService` carga:
  - `config/available-studies.json`: lista de tipos (por id de fichero, ejemplo `fp`).
  - `config/<study>.json`: metadata + eventos/fechas por estudio.
  - `config/sys/common.json` y `config/sys/categories.json`.
- **Importante**: requiere servir via HTTP (no `file://`) o `fetch` falla.
- `SemesterConfig` fusiona config comun + especifica + categorias de sistema y genera IDs de eventos.

## Creacion y gestion de calendarios
- `CalendarManager.addCalendar()`:
  - Si es `ALTRE`: calendario generico con nombre + rango.
  - Si es tipo estudio: usa `SemesterConfig` y crea `id` `{TYPE}_{IDENTIFICADOR}_{SEMESTRE}`.
- `switchCalendar()` guarda `lastVisitedMonths` y ajusta la fecha actual.
- `editCalendar()` permite editar nombre (si estudio) o fechas (si generico).
- `importIcsToCalendar()` solo permite `ALTRE`.

## Eventos y categorias
- `EventManager.saveEvent()` valida, asegura categoria, crea/edita instancia y persiste.
- Drag & drop usa `DragDropHelper` + listeners en cada celda.
- Categorias de usuario viven en `categoryTemplates` y se sincronizan con cada calendario cuando se usan.

## Renderizado y vistas
- `ViewManager` controla vistas: `global`, `compact`, `semester`, `month`, `week`, `day`.
- Renderers:
  - Base: `CalendarRenderer`.
  - Vistas: `MonthViewRenderer`, `WeekViewRenderer`, `DayViewRenderer`, `SemesterViewRenderer`, `GlobalViewRenderer`, `CompactViewRenderer`.
- `PanelsRenderer` actualiza sidebar (calendarios, categorias, eventos pendientes).
- `ModalRenderer` abre/cierra y rellena formularios.

## Importacion / exportacion
- Export:
  - `JsonExporter`: serializa un calendario.
  - `IcsExporter`: genera iCalendar (detecta horas si vienen en el titulo con `[HH:MM]`).
  - `HtmlExporter` y `CompactHtmlExporter`: generan HTML imprimible.
- Import:
  - `IcsImporter`: parsea ficheros ICS para calendarios `ALTRE`.

## Replicacion
- `ReplicaManager` coordina el flujo y usa `ReplicaServiceFactory`.
- Soporta replicacion auto y manual.
- Eventos no ubicados se guardan en `appStateManager.unplacedEvents` y se gestionan en panel lateral (drag & drop o descartar).

## Tema y CSS
- Tema claro/oscuro gestionado por `ThemeHelper`.
- El tema NO se persiste: en cada carga se usa el tema del sistema.
- Colores de categorias de sistema se guardan en `systemCategoryColors`.

## Tests y debugging
- Cypress E2E en `cypress/e2e/`.
- La app expone `window.app` cuando detecta Cypress para inspeccion.
- No hay linting ni pruebas unitarias.

## Parametros de URL utiles
- `?view=month|week|day|semester|global|compact` fuerza vista inicial.
- `?popup=1` activa modo compacto sin sidebar (tambien hay CSS inline en `index.html`).

## Hallazgos y gotchas
- **Orden de scripts critico**: todo depende de carga secuencial en `index.html`.
- **Discovery depende de HTTP**: si abres `index.html` con `file://`, `fetch` falla y no hay estudios.
- **`available-studies.json` limita tipos**: solo los IDs listados aparecen en el dropdown. Ahora solo incluye `fp`, aunque existe `config/btx.json`.
- **Calendario generico**: `CalendarManager` usa `ALTRE` y el dropdown lo genera `ModalRenderer`. No tocar el `select` manual en HTML para evitar inconsistencias.
- **Persistencia compartida**: cambios en estructura de `appState` requieren migracion en `StorageManager`.
- **Tema**: toggle no persiste; se recalcula por sistema en cada recarga.

## Puntos de extension recomendados
- Nuevos tipos de estudio: agregar JSON en `config/`, actualizar `config/available-studies.json` y validar `SemesterConfig`.
- Nuevas vistas: implementar renderer y registrar en `ViewManager.initializeRenderers()` + botones en `index.html`.
- Nuevas acciones UI: definir `data-action` y handler en `Bootstrap.handleAction()`.
- Reglas de validacion: centralizar en `DateValidationService` y reutilizar en managers.

## Documentacion adicional
- `docs/ai-reference.md`: auditoria mas extensa.
- `docs/wiki/`: arquitectura, servicios, modelos y flujos (entradas de wiki). `docs/wiki/Home.md` es buen punto de inicio.

## Si tuviera que empezar hoy
1. Levantar servidor con `npm run serve`.
2. Crear un calendario `ALTRE` y recorrer eventos, categorias, exportacion e importacion.
3. Leer `js/Bootstrap.js`, `js/managers/*`, `js/state/*` y `js/ui/*` en ese orden.
4. Revisar `config/` y validar que `available-studies.json` refleja los tipos reales.

