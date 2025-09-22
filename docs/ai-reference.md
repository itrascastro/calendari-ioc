# Referencia de Auditoría y Mantenimiento - Calendari IOC

## Índice
1. [Resumen ejecutivo](#resumen-ejecutivo)
2. [Puesta en marcha y scripts](#puesta-en-marcha-y-scripts)
3. [Estructura del repositorio](#estructura-del-repositorio)
4. [Flujo de arranque y ciclo de vida](#flujo-de-arranque-y-ciclo-de-vida)
5. [Estado de la aplicación](#estado-de-la-aplicación)
6. [Modelos de dominio](#modelos-de-dominio)
7. [Configuración y descubrimiento de estudios](#configuración-y-descubrimiento-de-estudios)
8. [Gestión de calendarios](#gestión-de-calendarios)
9. [Gestión de eventos y categorías](#gestión-de-eventos-y-categorías)
10. [Renderizado y UI](#renderizado-y-ui)
11. [Persistencia y rehidratación de datos](#persistencia-y-rehidratación-de-datos)
12. [Importación, exportación y replicación](#importación-exportación-y-replicación)
13. [Manejo de errores y mensajes](#manejo-de-errores-y-mensajes)
14. [Estilos, temas y accesibilidad](#estilos-temas-y-accesibilidad)
15. [Pruebas y calidad](#pruebas-y-calidad)
16. [Riesgos y hallazgos clave](#riesgos-y-hallazgos-clave)
17. [Recomendaciones priorizadas](#recomendaciones-priorizadas)
18. [Próximos pasos sugeridos](#próximos-pasos-sugeridos)

---

## Resumen ejecutivo
- Aplicación SPA sin framework que se apoya en clases ES6 globales y carga secuencial de scripts desde `index.html`.
- Persistencia en `localStorage` con rehidratación a objetos ricos (`CalendariIOC_*`) respaldada por `CalendariIOC_DataRehydrator`.
- La experiencia gira en torno a `CalendarManager`, `EventManager`, `ViewManager` y `ReplicaManager`, coordinados por `Bootstrap`.
- Configuración académica externa (JSON en `config/`) cargada vía `StudyTypeDiscoveryService` con `fetch`, lo que exige servir la app sobre HTTP.
- El proyecto dispone de un set amplio de pruebas end-to-end en Cypress, pero carece de linting y de pruebas unitarias.

## Puesta en marcha y scripts
- Requisitos: Node ≥18 para Cypress y un runtime de Python 3 (o cualquier servidor estático) para servir `index.html`.
- Scripts definidos en `package.json`:
  - `npm run serve`: levanta un servidor estático en `http://localhost:8000` usando `python3 -m http.server` (necesario para que `fetch` funcione con ruta relativa).
  - `npm run test / test:headless / test:open`: ejecutan la batería de pruebas Cypress.
- No hay proceso de build: todos los activos están listos para ser servidos tal cual.

## Estructura del repositorio
- `index.html`: punto de entrada y orquestador de la carga de scripts y estilos.
- `css/`: hojas de estilo modulares (`variables`, `base`, `layout`, `components`, `calendar`, `themes`).
- `js/`: código modular organizado por responsabilidad.
  - `helpers/`: funciones de soporte (fechas, temas, IDs, UI, drag & drop, etc.).
  - `config/`: `SemesterConfig` y constantes compartidas.
  - `models/`: clases ricas de dominio (`CalendariIOC_Calendar`, `CalendariIOC_Event`, `CalendariIOC_Category`, rehidratador).
  - `state/`: gestión de estado global y persistencia (`AppStateManager`, `StorageManager`).
  - `managers/`: capa de coordinadores (calendarios, eventos, categorías, vistas, réplicas, errores).
  - `services/`: lógica transversal (validación de fechas, descubrimiento de estudios, servicios de réplica, import/export).
  - `ui/`: renderizadores de vistas y modales.
  - `export/` e `import/`: transformaciones a HTML, JSON, ICS y lectura de ICS.
- `config/`: JSON con metadatos de estudios (`available-studies.json`, `fp.json`, etc.) y configuración de sistema (`sys/`).
- `cypress/`: pruebas end-to-end, fixtures de descargas y capturas.
- `docs/`: documentación de soporte (incluye este documento y una wiki auxiliar).

## Flujo de arranque y ciclo de vida
1. `DOMContentLoaded` crea una instancia de `Bootstrap` (`js/Bootstrap.js`).
2. `Bootstrap.initializeAsync()`:
   - Invoca `StudyTypeDiscoveryService` para cargar configuraciones desde `config/`.
   - Inicializa servicios: renderers, carga de `localStorage`, aplicación de tema, selección de calendario y render inicial (`viewManager`, `storageManager`, `calendarManager`).
   - Registra un manejador centralizado de acciones basado en el atributo `data-action`.
3. Los managers globales interactúan entre sí mediante referencias compartidas (pattern singleton) y actualizan DOM directamente.
4. La vista activa se renderiza a través de `ViewManager`, que delega en los renderizadores especializados (`MonthViewRenderer`, `WeekViewRenderer`, etc.).

## Estado de la aplicación
- `AppStateManager` almacena un árbol plano dentro de `appState` con:
  - `calendars`: diccionario de `CalendariIOC_Calendar`.
  - `currentCalendarId`, `currentDate` (UTC), `categoryTemplates`, `systemCategoryColors`.
  - `unplacedEvents`, `compactZoom`, `lastVisitedMonths` por calendario.
- Variables auxiliares (drag & drop, selección, edición) se mantienen como propiedades sueltas del manager.
- Utiliza getters/setters para exponer propiedades clave y métodos para limpiar, migrar y resetear estado.
- Migraciones ligeras previenen datos nulos tras cargas antiguas.

## Modelos de dominio
- `CalendariIOC_Calendar`: agrupa categorías y eventos, garantiza integridad (IDs únicos, rangos válidos).
- `CalendariIOC_Category`: describe nombre, color, tipo (sistema o usuario) y metadatos asociados.
- `CalendariIOC_Event`: contiene título, fecha, categoría (referencia directa), descripción y flags (`isSystemEvent`).
- `CalendariIOC_DataRehydrator`: reconstruye instancias desde JSON plano; esencial tras leer `localStorage` o importar ficheros.
- Cada modelo implementa `toJSON()` para serialización controlada.

## Configuración y descubrimiento de estudios
- `StudyTypeDiscoveryService` usa `fetch` para cargar `config/available-studies.json` y cada `<study>.json`.
- Implementa reintentos, control de caché y mapeo a metadatos (`displayName`, `placeholder`).
- Opcionalmente carga configuraciones comunes (`sys/common.json`) y categorías del sistema (`sys/categories.json`).
- El objeto resultante alimenta el modal de creación de calendarios y `SemesterConfig` (responsable de derivar fechas clave).
- Implicación operativa: las nuevas configuraciones se añaden como JSON sin redeploy; basta con actualizar `available-studies.json`.

## Gestión de calendarios
- `CalendarManager` controla el CRUD de calendarios y coordina la UI.
  - `addCalendar()` valida formulario, crea calendario desde configuración de estudio o en modo genérico.
  - Evita duplicados (`id` y `name`) y persiste el nuevo calendario en `appStateManager`.
  - `switchCalendar()` guarda el último mes visitado y reposiciona la vista; restaura zoom compacto.
  - `deleteCalendar()` confirma la acción y limpia estado/persistencia.
  - Importación de JSON/ICS y edición de metadatos se manejan aquí.
- Mantiene compatibilidad con calendarios fallback cuando la configuración externa falla, aunque actualmente el fallback no se ejecuta automáticamente.

## Gestión de eventos y categorías
- `EventManager` crea, edita, elimina y mueve eventos; exige categorías válidas y fechas dentro del rango académico.
- Reutiliza el catálogo global para autoañadir categorías faltantes a un calendario.
- Lógica de drag & drop delegada en `DragDropHelper`, con sincronización manual del DOM.
- `CategoryManager` permite alta/edición/eliminación de categorías de usuario y resetea selecciones.
- Sistema de selección persistente mediante `AppStateManager` facilita interacciones posteriores (por ejemplo, color picker).

## Renderizado y UI
- `ViewManager` orquesta las vistas (`global`, `compact`, `month`, `week`, `day`, `semester`) y mantiene scroll listeners limpios entre cambios.
- Cada vista se implementa como renderer especializado que hereda de `CalendarRenderer` para compartir utilidades (renderizado de celdas, eventos, badges de semana).
- `PanelsRenderer` actualiza la barra lateral (calendarios, categorías, eventos pendientes) con plantillas HTML generadas a mano.
- `ModalRenderer` gestiona diálogos (nuevo calendario, evento, replicación, color picker, confirmaciones) y expone métodos para abrir/cerrar y rellenar formularios.
- Tema claro/oscuro gestionado por `ThemeHelper`, almacenando preferencia en `localStorage` y aplicando clases CSS en `<body>`.

## Persistencia y rehidratación de datos
- `StorageManager` guarda el `appState` completo en `localStorage` (`calendari-ioc-data`).
- La carga rehidrata instancias ricas, valida integridad y ejecuta migraciones (
  - inicialización de `systemCategoryColors`,
  - relleno de `compactZoom`,
  - normalización de estructuras vacías).
- Exportaciones JSON encapsulan metadatos (`version`, `exportedAt`) para compatibilidad hacia delante.
- Los errores de formato o versión antigua generan `CalendariIOCException` con códigos dedicados.

## Importación, exportación y replicación
- Exportadores:
  - `HtmlExporter`: genera HTML imprimible apoyándose en plantillas y renderers existentes.
  - `CompactHtmlExporter`: versión optimizada para vista compacta.
  - `IcsExporter`: produce archivos iCalendar; detecta horas en títulos con formato `[HH:MM]`.
  - `JsonExporter`: serializa todo el estado del calendario.
- Importación:
  - `IcsImporter`: parsea ficheros ICS para calendaris tipo "Altre" y convierte eventos a instancias de dominio.
- Replicación:
  - `ReplicaManager` abre modales, selecciona calendarios origen/destino y llama a `ReplicaServiceFactory`.
  - `ReplicaService`, `EstudiReplicaService`, `GenericReplicaService` calculan espacios disponibles y generan eventos replicados.
  - Los eventos no ubicados se acumulan en `AppStateManager.unplacedEvents` y se muestran en panel lateral con acciones manuales.
  - Respeto de días de semana está preparado pero desactivado (`respectWeekdays = false`).

## Manejo de errores y mensajes
- `CalendariIOCException` centraliza códigos y mensajes localizados. Permite distinguir errores de validación, técnicos o de sistema.
- `ErrorManager` decide si loguear en consola y muestra mensajes mediante `UIHelper`.
- Mensajes emergentes (`UIHelper.showMessage`) se renderizan con estilos inline y se autodestruyen a los 3s.
- Confirmaciones críticas usan un modal dedicado (`confirmModal`).

## Estilos, temas y accesibilidad
- CSS organizado por capas: variables de color/tipografía, layout general, componentes, vista de calendario y temas.
- Temas claro/oscuro alternan logos (`img/logo_IOC_dark.png`, `img/logo_IOC_light.jpg`).
- Diseño responsive basado en Flexbox y CSS Grid.
- Consideraciones de accesibilidad:
  - Se emplean etiquetas y textos alternativos, pero falta gestión de foco al abrir modales y roles ARIA detallados.
  - Contraste de colores: `ColorContrastHelper` asegura que los eventos tengan contraste mínimo.

## Pruebas y calidad
- Pruebas E2E en Cypress (`cypress/e2e/`) cubren:
  - Creación, edición y eliminación de calendarios, eventos y categorías.
  - Exportaciones (JSON, ICS, HTML) e importación de ICS.
  - Replicación y panel de eventos pendientes.
  - Temas y funcionalidades de UI (modales, color picker, navegación).
- No existen pruebas unitarias ni herramientas de linting/format (ESLint/Prettier) configuradas.
- No hay integración continua definida en el repositorio.

## Riesgos y hallazgos clave
- **Capa global sin bundler**: todos los módulos dependen de orden de carga en `index.html`; cualquier cambio en scripts debe conservar la secuencia para evitar `ReferenceError`.
- **Fallo silencioso en descubrimiento de estudios**: si `fetch` no puede acceder a `config/` (p.ej. al abrir `index.html` desde el sistema de archivos), la app no inicializa calendarios y solo muestra modo genérico.
- **Persistencia compartida**: cambios de estructura en `appState` requieren migraciones manuales para no corromper datos antiguos.
- **Replicación en progreso**: la opción "Respetar días de la semana" está desactivada; la experiencia de réplica depende de lógica que todavía se está ajustando.
- **Accesibilidad**: falta gestión explícita del foco y de roles ARIA en modales y botones generados dinámicamente.
- **Sin control de versiones del esquema**: la exportación/importación JSON confía en compatibilidad implícita; cualquier cambio en modelos debe acompañarse de versión y migrador.

## Recomendaciones priorizadas
1. **Automatizar estilo y calidad**: añadir ESLint/Prettier y una configuración mínima de CI que ejecute lint + Cypress en cada push.
2. **Modularizar carga de scripts**: evaluar Vite/Rollup o al menos agrupar dependencias críticas para detectar errores en build y habilitar imports locales.
3. **Versión de esquema de datos**: incluir un campo `schemaVersion` en `appState` y gestionar migraciones centralizadas en `AppStateManager`.
4. **Mejorar resiliencia de `StudyTypeDiscoveryService`**: mostrar fallback UI explícito cuando no se pueda cargar configuración, y permitir reintentos manuales desde la interfaz.
5. **Accesibilidad de modales**: mover foco al primer elemento interactivo, capturar `Esc`, y devolver foco al disparador.
6. **Cobertura adicional**: añadir pruebas unitarias para `DateHelper`, `SemesterConfig`, `ReplicaService` y validaciones de managers.
7. **Documentar procesos operativos**: crear guía rápida para añadir nuevos estudios (actualizar JSON + pruebas mínimas) y para exportar/inportar datos entre versiones.

## Próximos pasos sugeridos
- Decidir si se migrará a un bundler ligero para facilitar imports y empaquetado.
- Priorizar mejoras de accesibilidad y mensajes de error de descubrimiento antes de añadir nuevas funcionalidades.
- Definir un proceso de publicación (por ejemplo, GitHub Pages + script de deploy existente) alineado con la nueva documentación.
- Mantener este documento actualizado cada vez que se introduzcan managers o servicios adicionales.
