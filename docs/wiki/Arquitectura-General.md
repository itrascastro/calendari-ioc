# Arquitectura General

El Calendari IOC implementa una arquitectura híbrida que combina patrons funcionals i orientats a objectes, optimitzada per aplicacions web de mida mitjana amb necessitats intensives de serialització i persistència.

## ️ Visió General de l'Arquitectura

### Paradigma Arquitectònic
L'aplicació segueix un **patró MVC modificat** que anomenem **Manager-State-View (MSV)**:

- **Managers**: Lògica de negoci i control
- **State**: Estat centralitzat i persistència
- **Views**: Renderització i presentació

### Principis de Disseny

**1. Separació de Responsabilitats**
- Cada capa té responsabilitats ben definides
- Acoblament mínim entre components
- Cohesió alta dins de cada mòdul

**2. Estat Centralitzat**
- Un únic punt de veritat per l'estat global
- Fluxe de dades unidireccional
- Persistència automàtica

**3. Renderització per Demanda**
- No s'utilitza virtual DOM
- Renderització directa quan cal
- Optimització per aplicacions de calendari

## Diagrama d'Arquitectura de Capes

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
├─────────────────────┬─────────────────────┬─────────────────┤
│   UI Components     │     Renderers       │      Modals     │
│                     │                     │                 │
│ • Event Delegation  │ • PanelsRenderer    │ • ModalRenderer │
│ • DOM Interaction   │ • CalendarRenderer  │ • Dynamic Forms │
│ • User Input        │ • ViewRenderers     │ • Validation    │
└─────────────────────┴─────────────────────┴─────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                      │
├─────────────────────┬─────────────────────┬─────────────────┤
│     Managers        │      Services       │     Helpers     │
│                     │                     │                 │
│ • CalendarManager   │ • ReplicaService    │ • DateHelper    │
│ • EventManager      │ • ValidationService │ • UIHelper      │
│ • CategoryManager   │                     │ • ThemeHelper   │
│ • ReplicaManager    │                     │ • TextHelper    │
│ • ViewManager       │                     │                 │
└─────────────────────┴─────────────────────┴─────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                             │
├─────────────────────┬─────────────────────┬─────────────────┤
│   State Management  │     Persistence     │   Configuration │
│                     │                     │                 │
│ • AppStateManager   │ • StorageManager    │ • SemesterConfig│
│ • Global State      │ • localStorage      │ • JSON Configs  │
│ • Reactivity        │ • Import/Export     │ • Migrations    │
└─────────────────────┴─────────────────────┴─────────────────┘
```

## Flux de Dades

### Flux Principal (User Action → State Update → UI Render)

```
1. USER INTERACTION
   │
   ├─ DOM Event (click, drag, input)
   │
   ▼
2. EVENT DELEGATION
   │
   ├─ Bootstrap.handleClick()
   │
   ▼
3. MANAGER ROUTING
   │
   ├─ CalendarManager.method()
   ├─ EventManager.method()
   ├─ CategoryManager.method()
   │
   ▼
4. BUSINESS LOGIC
   │
   ├─ Validation
   ├─ Data Transformation
   ├─ Service Calls
   │
   ▼
5. STATE UPDATE
   │
   ├─ AppStateManager update
   ├─ StorageManager.saveToStorage()
   │
   ▼
6. UI RE-RENDER
   │
   ├─ ViewManager.renderCurrentView()
   ├─ PanelsRenderer.renderAll()
   │
   ▼
7. DOM UPDATE
```

### Exemple de Flux: Crear Esdeveniment

```javascript
// 1. User clicks on calendar day
DOM Event: click on .day-cell

// 2. Event delegation
Bootstrap.handleClick() → action: 'add-event'

// 3. Manager routing
EventManager.saveEvent()

// 4. Business logic
├─ Validation: title, date, category
├─ Category auto-addition to calendar
├─ Event creation with unique ID

// 5. State update
├─ calendar.events.push(newEvent)
├─ AppStateManager state change
├─ StorageManager.saveToStorage()

// 6. UI re-render
├─ ViewManager.renderCurrentView()
├─ PanelsRenderer.renderCategories()

// 7. DOM update
New event appears in calendar
```

## Components Principals

### 1. Bootstrap (Application Controller)
**Responsabilitat**: Punt d'entrada i coordinació global
- Inicialització de l'aplicació
- Event delegation centralitzat
- Routing d'accions a managers
- Gestió del cicle de vida

### 2. AppStateManager (Singleton State)
**Responsabilitat**: Estat global centralitzat
- Conté tot l'estat de l'aplicació
- Getters/setters per accés controlat
- Validació d'integritat de dades
- Gestió de variables auxiliars (drag&drop, seleccions)

### 3. Managers (Business Logic Controllers)
**Responsabilitat**: Lògica de negoci específica
- **CalendarManager**: CRUD calendaris, tipus FP/BTX/Altre
- **EventManager**: CRUD esdeveniments, drag&drop, validacions
- **CategoryManager**: Catàleg global, sincronització
- **ReplicaManager**: Sistema de replicació entre calendaris
- **ViewManager**: Control de vistes i navegació

### 4. Renderers (View Layer)
**Responsabilitat**: Generació de DOM i presentació
- **CalendarRenderer**: Renderització base de calendaris
- **PanelsRenderer**: Panells laterals dinàmics
- **ModalRenderer**: Modals i formularis
- **ViewRenderers**: Vistes específiques (Month, Week, Day, etc.)

### 5. Services (Shared Business Logic)
**Responsabilitat**: Lògica reutilitzable entre managers
- **ReplicaService**: Lògica de replicació i transformacions
- **DateValidationService**: Validacions de dates centralitzades

### 6. Helpers (Utility Functions)
**Responsabilitat**: Funcions d'utilitat i suport
- **DateHelper**: Manipulació de dates UTC
- **UIHelper**: Missatges, modals, utilitats UI
- **ThemeHelper**: Gestió de temes clar/fosc
- **TextHelper**: Formatejat de text i URLs

## Decisions d'Arquitectura Clau

### 1. Graph of Objects in Memory (v1.1+)
**Decisió**: Arquitectura basada en ES6 classes amb referències directes
**Justificació**:
- Models de domini rics amb mètodes específics
- Referències directes entre objectes (no IDs)
- Eliminació de capes de lookup intermèdies
- Millor rendiment i consistència de dades
- Manteniment més senzill del codi

### 2. Manager Pattern vs Frameworks
**Decisió**: Implementar Manager Pattern personalitzat
**Justificació**:
- Control total sobre el comportament
- Menys dependencies externes
- Optimitzat per aplicacions de calendari
- Fàcil de mantenir i entendre

### 3. Event Delegation vs Event Listeners
**Decisió**: Event delegation centralitzat
**Justificació**:
- Millor rendiment amb molts elements
- Gestió centralitzada d'accions
- Facilita el debugging
- Funciona amb contingut dinàmic

### 4. Estat Centralitzat vs Component State
**Decisió**: Estat completament centralitzat
**Justificació**:
- Única font de veritat
- Facilita la persistència
- Simplifica la sincronització
- Millor per aplicacions de dades

## Avantatges de l'Arquitectura

### Mantenibilitat
- Responsabilitats clares per cada component
- Baixa càrrega cognitiva per desenvolupadors
- Patrons consistents arreu de l'aplicació

### Extensibilitat
- Fàcil afegir nous tipus de calendaris
- Sistema de plugins per noves funcionalitats
- Arquitectura preparada per escalar

### Rendiment
- Renderització per demanda
- Persistència optimitzada
- Gestió eficient d'esdeveniments DOM

### Robustesa
- Validacions centralitzades
- Gestió d'errors consistent
- Recuperació automàtica d'estat

## Patrons Específics Implementats

### 1. **Singleton Pattern**
- `AppStateManager`: Instància única per estat global
- `StorageManager`: Gestió unificada de persistència

### 2. **Factory Pattern**
- Creació d'objectes calendari segons tipus (FP/BTX/Altre)
- Generació d'IDs únics per entitats

### 3. **Observer Pattern**
- Re-renderització automàtica quan canvia l'estat
- Notificacions de canvis entre components

### 4. **Strategy Pattern**
- Diferents estratègies per tipus de calendaris
- Múltiples formats d'exportació

### 5. **Command Pattern**
- Accions de usuari encapsulades
- Fàcil extensió de noves accions

---
**Següent**: [Patrons Arquitectònics Detallats](Patrons-Arquitectònics-Detallats) per aprofundir en cada patró implementat.

[← Inici](Home) | [Patrons detallats →](Patrons-Arquitectònics-Detallats)