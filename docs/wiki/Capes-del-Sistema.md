# Capes del Sistema

El Calendari IOC està organitzat en una arquitectura de capes ben definida que separa les responsabilitats i facilita el manteniment, testing i extensibilitat del sistema. Aquest document detalla cada capa i les seves interaccions.

## Visió General de l'Arquitectura per Capes

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓ                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   UI Controls   │  │     Modals      │  │   Renderers     │ │
│  │  (Bootstrap)    │  │ (ModalRenderer) │  │ (PanelsRenderer)│ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 ↕
┌─────────────────────────────────────────────────────────────────┐
│                     CAPA DE VISTES                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  ViewManager    │  │ Calendar Views  │  │  View Helpers   │ │
│  │ (Coordinator)   │  │ (Month/Week/Day)│  │ (CalendarRender)│ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 ↕
┌─────────────────────────────────────────────────────────────────┐
│                   CAPA DE LÒGICA DE NEGOCI                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │    Managers     │  │    Services     │  │   Validators    │ │
│  │(Calendar,Event, │  │(Category,Replica│  │ (DateValidation)│ │
│  │Category,Replica)│  │ ReplicaService) │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 ↕
┌─────────────────────────────────────────────────────────────────┐
│                   CAPA DE GESTIÓ D'ESTAT                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ AppStateManager │  │ StorageManager  │  │   Migrations    │ │
│  │  (Singleton)    │  │ (Persistence)   │  │  (Compatibility)│ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 ↕
┌─────────────────────────────────────────────────────────────────┐
│                     CAPA DE DADES                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   localStorage  │  │ Semester Config │  │  Import/Export  │ │
│  │  (Client Side)  │  │ (JSON Files)    │  │ (ICS/JSON/HTML) │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 ↕
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA D'UTILITATS                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │     Helpers     │  │   Extensions    │  │   Libraries     │ │
│  │(Date,UI,Text,   │  │ (ColorContrast, │  │   (Browser      │ │
│  │Theme,DragDrop)  │  │  IdGeneration)  │  │    Native)      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Capa de Presentació

**Responsabilitat**: Gestió directa de la interfície d'usuari i interaccions

### Components Principals

#### Bootstrap (js/Bootstrap.js)
**Rol**: Controlador principal i punt d'entrada de l'aplicació
- **Event Delegation**: Un sol punt per tots els events DOM
- **Application Lifecycle**: Inicialització i configuració
- **Command Dispatch**: Routing d'accions a components apropriats

```javascript
class Bootstrap {
    initializeEventListeners() {
        document.addEventListener('click', (e) => this.handleClick(e));
        document.addEventListener('change', (e) => this.handleChange(e));
        document.addEventListener('input', (e) => this.handleInput(e));
    }
    
    handleClick(event) {
        const target = event.target.closest('[data-action]');
        if (!target) return;
        
        const action = target.dataset.action;
        // Dispatch a capa apropiada
        this.routeAction(action, target.dataset);
    }
}
```

#### ModalRenderer (js/ui/ModalRenderer.js)
**Rol**: Gestió centralitzada de tots els modals
- **Modal Lifecycle**: Obertura, configuració, tancament
- **Form Management**: Validació i enviament de formularis
- **Dynamic Content**: Generació de contingut dinàmic per tipus

#### PanelsRenderer (js/ui/PanelsRenderer.js)
**Rol**: Renderitzat dels panells laterals
- **Calendar List**: Llista de calendaris guardats
- **Categories**: Categories disponibles i catàleg global
- **Unplaced Events**: Esdeveniments de replicació no ubicats

### Característiques de la Capa

**Separation of Concerns**: Cada component UI té una responsabilitat específica
**No Business Logic**: La capa de presentació no conté lògica de negoci
**Event-Driven**: Comunicació basada en events i callbacks
**Responsive**: Adaptació a diferents mides de pantalla

## Capa de Vistes

**Responsabilitat**: Renderitzat especialitzat del calendari segons diferents perspectives

### Components Principals

#### ViewManager (js/managers/ViewManager.js)
**Rol**: Coordinador central de totes les vistes
- **View Strategy**: Selecció del renderitzador apropiat
- **Navigation**: Gestió de navegació temporal
- **State Sync**: Sincronització amb l'estat global

#### Calendar Renderers (js/ui/views/)
**Rol**: Renderitzadors especialitzats per cada vista
- **MonthViewRenderer**: Vista mensual (per defecte)
- **WeekViewRenderer**: Vista setmanal detallada
- **DayViewRenderer**: Vista diària amb màxim detall
- **SemesterViewRenderer**: Vista panoràmica del semestre
- **GlobalViewRenderer**: Vista de tots els calendaris

### Patró d'Herència

```javascript
class CalendarRenderer {
    // Classe base amb funcionalitat compartida
    generateDayData(date, calendar) { /* ... */ }
    generateEventHTML(event, calendar) { /* ... */ }
}

class MonthViewRenderer extends CalendarRenderer {
    // Especialització per vista mensual
    render(calendar, currentDate) {
        // Implementació específica
    }
}
```

### Responsabilitats de la Capa

**View-Specific Logic**: Lògica específica per cada tipus de vista
**Data Transformation**: Transformació de dades per presentació
**Template Generation**: Generació de HTML/DOM per renderitzat
**Export Support**: Suport per diferents formats d'exportació

## Capa de Lògica de Negoci

**Responsabilitat**: Implementació de totes les regles i processos de negoci

### Managers (js/managers/)

#### CalendarManager
**Responsabilitats**:
- CRUD de calendaris
- Configuració automàtica per tipus (FP/BTX)
- Integració amb configuració semestral
- Gestió del cicle de vida del calendari

#### EventManager
**Responsabilitats**:
- CRUD d'esdeveniments
- Validació de dates i camps
- Gestió de drag & drop
- Integració amb categories

#### CategoryManager
**Responsabilitats**:
- Gestió del catàleg global de categories
- Sincronització entre calendaris
- Gestió de categories del sistema

#### ReplicaManager
**Responsabilitats**:
- Orquestració del procés de replicació
- Gestió d'esdeveniments no ubicats
- Interfície entre UI i ReplicaService

### Services (js/services/)

#### CategoryService
**Rol**: Servei centralitzat per lògica de categories
- **Catalog Management**: Gestió del catàleg global
- **Cross-Calendar Sync**: Sincronització entre calendaris
- **Template Management**: Gestió de plantilles de categories

#### ReplicaService
**Rol**: Implementació de l'algoritme de replicació
- **Proportional Algorithm**: Algoritme proporcional intel·ligent
- **Conflict Resolution**: Resolució de conflictes de dates
- **Space Analysis**: Anàlisi d'espai útil en calendaris

### Validation Services (js/services/)

#### DateValidationService
**Rol**: Validació de dates i rangs
- **Range Validation**: Validació de rangs de calendari
- **Business Rules**: Regles específiques per dates acadèmiques
- **Cross-Calendar Validation**: Validacions entre calendaris

### Característiques de la Capa

**Business Rules Enforcement**: Implementació de totes les regles de negoci
**Domain Logic**: Lògica específica del domini acadèmic
**Validation**: Validació completa de dades i operacions
**Service Integration**: Integració amb serveis externs i configuracions

## Capa de Gestió d'Estat

**Responsabilitat**: Gestió centralitzada de l'estat global de l'aplicació

### Components Principals

#### AppStateManager (js/state/AppStateManager.js)
**Rol**: Singleton per gestió d'estat global
- **Centralized State**: Únic punt de veritat per l'estat
- **State Access**: Getters i setters controlats
- **State Validation**: Validació d'integritat d'estat
- **Migration Support**: Suport per migracions d'estat

```javascript
class AppStateManager {
    constructor() {
        this.appState = {
            calendars: {},
            currentCalendarId: null,
            currentDate: new Date(),
            categoryTemplates: [],
            unplacedEvents: []
        };
    }
    
    getCurrentCalendar() {
        return this.calendars[this.currentCalendarId];
    }
}
```

#### StorageManager (js/state/StorageManager.js)
**Rol**: Persistència i gestió de localStorage
- **Persistence**: Guardar i carregar estat
- **Data Migration**: Migracions automàtiques
- **Error Recovery**: Recuperació de dades corruptes
- **Import/Export**: Funcionalitat d'import/export avançada

### Responsabilitats de la Capa

**State Consistency**: Garantir coherència de l'estat
**Persistence**: Persistència fiable de dades
**Recovery**: Recuperació automàtica d'errors
**Migration**: Compatibilitat amb versions anteriors

## Capa de Dades

**Responsabilitat**: Accés i gestió de dades persistents

### Emmagatzematge Local

#### localStorage
**Ús**: Persistència principal de l'estat de l'aplicació
- **Estructura**: JSON serialitzat de l'estat complet
- **Backup**: Gestió automàtica de còpies de seguretat
- **Cleanup**: Neteja automàtica de dades antigues

### Configuracions Externes

#### Semester Configuration (config/)
**Fitxers**:
- `common-semestre.json`: Configuració base compartida
- `fp-semestre.json`: Configuració específica FP
- `btx-semestre.json`: Configuració específica BTX

```javascript
class SemesterConfig {
    async initialize() {
        this.commonConfig = await this.loadConfig('common-semestre.json');
        this.specificConfig = await this.loadConfig(`${this.type}-semestre.json`);
        this.mergedConfig = { ...this.commonConfig, ...this.specificConfig };
    }
}
```

### Import/Export (js/import/, js/export/)

#### Formats Suportats
- **JSON**: Format nadiu complet
- **ICS**: Format estàndard iCalendar
- **HTML**: Exportació web estàtica

### Responsabilitats de la Capa

**Data Access**: Accés unificat a diferents fonts de dades
**Format Support**: Suport per múltiples formats
**External Integration**: Integració amb fitxers de configuració
**Data Integrity**: Garantir integritat de dades

## Capa d'Utilitats

**Responsabilitat**: Funcionalitats transversals i utilitats reutilitzables

### Helpers (js/helpers/)

#### DateHelper
**Funcions**: Manipulació i formatatge de dates
- **UTC Management**: Gestió consistent de dates UTC
- **Calendar Math**: Càlculs específics de calendari acadèmic
- **Localization**: Formatatge localitzat

#### UIHelper
**Funcions**: Utilitats d'interfície d'usuari
- **Messages**: Sistema de missatges toast
- **Confirmations**: Diàlegs de confirmació
- **DOM Utilities**: Manipulació de DOM

#### ColorContrastHelper
**Funcions**: Càlcul de contrast per accessibilitat
- **WCAG Compliance**: Compliment d'estàndards d'accessibilitat
- **Automatic Contrast**: Càlcul automàtic de colors de text

### Extensions

#### IdHelper
**Funcions**: Generació d'identificadors únics
- **Sequential IDs**: IDs seqüencials per entitats
- **Unique IDs**: IDs únics globals
- **Validation**: Validació de formats d'ID

### Responsabilitats de la Capa

**Cross-Cutting Concerns**: Funcionalitats transversals
**Reusability**: Codi reutilitzable entre components
**Standards Compliance**: Compliment d'estàndards
**Performance**: Optimitzacions comunes

## Comunicació entre Capes

### Principis de Comunicació

**Downward Dependencies**: Les capes superiors depenen de les inferiors
**Interface Contracts**: Contractes ben definits entre capes
**No Skip Layers**: No saltar capes en les comunicacions
**Event Bubbling**: Els events pugen des de capes inferiors

### Flux Típic

```
1. User Action (Presentació)
      ↓
2. Command Routing (Presentació → Lògica de Negoci)
      ↓
3. Business Processing (Lògica de Negoci → Estat)
      ↓
4. State Update (Estat → Dades)
      ↓
5. Persistence (Dades)
      ↓
6. UI Update (Estat → Vistes → Presentació)
```

### Gestió d'Errors

**Error Propagation**: Els errors es propaguen cap amunt
**Error Handling**: Cada capa gestiona els seus errors específics
**User Feedback**: La capa de presentació mostra errors a l'usuari
**Recovery**: Mecanismes de recuperació a cada capa

Aquesta arquitectura per capes proporciona una estructura clara i mantenible que facilita el desenvolupament, testing i extensió del Calendari IOC, assegurant que cada component tingui responsabilitats ben definides i relacions clares amb altres components.

---
[← Flux de Dades i Control](Flux-de-Dades-i-Control) | [Arquitectura d'Estat →](Arquitectura-d-Estat)