# Diagrames d'Arquitectura

Aquesta pàgina conté diagrames visuals que il·lustren l'arquitectura del Calendari IOC, facilitant la comprensió de les relacions entre components, el flux de dades i l'organització general del sistema.

## Diagrama d'Arquitectura General

```mermaid
graph TB
    subgraph "Capa de Presentació"
        UI[UI Components]
        Views[View Renderers]
        Modals[Modal System]
    end
    
    subgraph "Capa de Lògica de Negoci"
        CM[CalendarManager]
        EM[EventManager]
        CAM[CategoryManager]
        RM[ReplicaManager]
        VM[ViewManager]
    end
    
    subgraph "Capa de Serveis"
        CS[CategoryService]
        RS[ReplicaService]
        DVS[DateValidationService]
    end
    
    subgraph "Capa d'Estat"
        ASM[AppStateManager]
        SM[StorageManager]
    end
    
    subgraph "Capa d'Utilitats"
        DH[DateHelper]
        UH[UIHelper]
        TH[ThemeHelper]
        ICH[IdHelper]
    end
    
    subgraph "Capa de Configuració"
        SC[SemesterConfig]
        CONFIG[Config Files]
    end
    
    subgraph "Capa d'Import/Export"
        JE[JsonExporter]
        IE[IcsExporter]
        HE[HtmlExporter]
        II[IcsImporter]
    end
    
    UI --> CM
    Views --> EM
    Modals --> CAM
    
    CM --> CS
    EM --> DVS
    CAM --> CS
    RM --> RS
    
    CM --> ASM
    EM --> ASM
    CAM --> ASM
    
    ASM --> SM
    
    CM --> DH
    Views --> UH
    UI --> TH
    
    CM --> SC
    SC --> CONFIG
    
    CM --> JE
    CM --> IE
    CM --> HE
    CM --> II
```

## Diagrama de Flux de Dades

```mermaid
sequenceDiagram
    participant User as Usuari
    participant UI as Interfície
    participant Manager as Manager
    participant State as AppState
    participant Storage as localStorage
    participant Config as Configuració
    
    User->>UI: Acció (crear calendari)
    UI->>Manager: Cridar mètode
    Manager->>Config: Carregar configuració
    Config-->>Manager: Dades de configuració
    Manager->>State: Actualitzar estat
    State->>Storage: Persistir dades
    State-->>Manager: Confirmació
    Manager-->>UI: Resultat
    UI-->>User: Actualització visual
```

## Diagrama de Components UI

```mermaid
graph TB
    subgraph "Bootstrap.js - Punt d'entrada"
        BOOT[Bootstrap]
    end
    
    subgraph "Gestors Principals"
        BOOT --> CM[CalendarManager]
        BOOT --> EM[EventManager]
        BOOT --> CAM[CategoryManager]
        BOOT --> RM[ReplicaManager]
        BOOT --> VM[ViewManager]
    end
    
    subgraph "Renderitzadors de Vista"
        VM --> MVR[MonthViewRenderer]
        VM --> WVR[WeekViewRenderer]
        VM --> DVR[DayViewRenderer]
        VM --> SVR[SemesterViewRenderer]
        VM --> GVR[GlobalViewRenderer]
    end
    
    subgraph "Components UI"
        MVR --> MR[ModalRenderer]
        WVR --> PR[PanelsRenderer]
        DVR --> MR
        SVR --> PR
    end
    
    subgraph "Estat Global"
        CM --> ASM[AppStateManager]
        EM --> ASM
        CAM --> ASM
        ASM --> SM[StorageManager]
    end
```

## Diagrama de Jerarquia de Classes

```mermaid
classDiagram
    class CalendarRenderer {
        +render(container, calendar, events)
        +getEventsForDate(date)
        +attachEventListeners()
        #generateHTML()
        #processEvents()
    }
    
    class MonthViewRenderer {
        +generateMonthGrid()
        +renderDayCell()
        +handleDayClick()
    }
    
    class WeekViewRenderer {
        +generateWeekGrid()
        +renderTimeSlots()
        +handleTimeSlotClick()
    }
    
    class DayViewRenderer {
        +generateDayView()
        +renderHourlySlots()
        +handleEventDrop()
    }
    
    CalendarRenderer <|-- MonthViewRenderer
    CalendarRenderer <|-- WeekViewRenderer
    CalendarRenderer <|-- DayViewRenderer
    CalendarRenderer <|-- SemesterViewRenderer
    CalendarRenderer <|-- GlobalViewRenderer
    
    class AppStateManager {
        -state: Object
        +getState()
        +updateState()
        +getCurrentCalendar()
        +setCurrentCalendar()
    }
    
    class StorageManager {
        +saveToStorage()
        +loadFromStorage()
        +clearStorage()
        +getStorageSize()
    }
    
    AppStateManager --> StorageManager
```

## Diagrama de Patrons de Disseny

```mermaid
graph LR
    subgraph "Singleton Pattern"
        ASM1[AppStateManager Instance]
    end
    
    subgraph "Manager Pattern"
        CM1[CalendarManager]
        EM1[EventManager]
        CAM1[CategoryManager]
    end
    
    subgraph "Factory Pattern"
        IF[IdFactory]
        CF[CategoryFactory]
        EF[EventFactory]
    end
    
    subgraph "Strategy Pattern"
        EXP[Export Strategies]
        JE1[JsonExporter]
        IE1[IcsExporter]
        HE1[HtmlExporter]
    end
    
    subgraph "Observer Pattern"
        ED[Event Delegation]
        SL[State Listeners]
    end
    
    EXP --> JE1
    EXP --> IE1
    EXP --> HE1
    
    CM1 --> IF
    EM1 --> EF
    CAM1 --> CF
```

## Diagrama de Sistema de Configuració

```mermaid
graph TB
    subgraph "Fitxers de Configuració"
        CC[common-semestre.json]
        FC[fp-semestre.json]
        BC[btx-semestre.json]
    end
    
    subgraph "Carregador de Configuració"
        SC[SemesterConfig]
    end
    
    subgraph "Processament"
        MERGE[Merge Configs]
        VALIDATE[Validate Structure]
        PROCESS[Post Process]
    end
    
    subgraph "Resultat"
        EVENTS[System Events]
        CATS[System Categories]
        SETTINGS[Settings]
    end
    
    CC --> SC
    FC --> SC
    BC --> SC
    
    SC --> MERGE
    MERGE --> VALIDATE
    VALIDATE --> PROCESS
    
    PROCESS --> EVENTS
    PROCESS --> CATS
    PROCESS --> SETTINGS
```

## Diagrama de Flux de Replicació

```mermaid
sequenceDiagram
    participant User as Usuari
    participant UI as Panell Replicació
    participant RM as ReplicaManager
    participant RS as ReplicaService
    participant ASM as AppStateManager
    
    User->>UI: Seleccionar esdeveniments
    User->>UI: Triar calendaris destí
    UI->>RM: replicateEvents()
    RM->>RS: calculateProportions()
    RS-->>RM: Proporcions calculades
    RM->>RS: distributeEvents()
    RS-->>RM: Distribució resultats
    RM->>ASM: Actualitzar calendaris
    RM->>UI: Mostrar esdeveniments no ubicats
    UI-->>User: Feedback visual
```

## Diagrama de Gestió d'Esdeveniments

```mermaid
stateDiagram-v2
    [*] --> EventCreation
    EventCreation --> Validation
    Validation --> Valid: Dades correctes
    Validation --> Invalid: Errors trobats
    Invalid --> EventCreation: Corregir errors
    Valid --> StateUpdate
    StateUpdate --> Persistence
    Persistence --> UIUpdate
    UIUpdate --> [*]
    
    Valid --> CategoryCheck
    CategoryCheck --> ExistingCategory: Categoria existeix
    CategoryCheck --> NewCategory: Categoria nova
    NewCategory --> CreateCategory
    CreateCategory --> StateUpdate
    ExistingCategory --> StateUpdate
```

## Diagrama de Sistema de Temes

```mermaid
graph TB
    subgraph "Detecció de Tema"
        DETECT[Theme Detection]
        SYS[System Preference]
        STORED[Stored Preference]
        DEFAULT[Default Theme]
    end
    
    subgraph "Aplicació de Tema"
        TH[ThemeHelper]
        CSS[CSS Variables]
        DOM[DOM Classes]
    end
    
    subgraph "Persistència"
        LS[localStorage]
    end
    
    SYS --> DETECT
    STORED --> DETECT
    DEFAULT --> DETECT
    
    DETECT --> TH
    TH --> CSS
    TH --> DOM
    TH --> LS
```

## Diagrama de Flux d'Import ICS

```mermaid
flowchart TD
    START([Seleccionar fitxer ICS]) --> UPLOAD[Carregar fitxer]
    UPLOAD --> PARSE[Parsejar contingut ICS]
    PARSE --> VALIDATE{Validar estructura}
    VALIDATE -->|Invàlid| ERROR[Mostrar errors]
    VALIDATE -->|Vàlid| EXTRACT[Extreure esdeveniments]
    EXTRACT --> CONVERT[Convertir a format nadiu]
    CONVERT --> CATEGORIES[Crear categories si cal]
    CATEGORIES --> CONFLICTS{Detectar conflictes}
    CONFLICTS -->|Sí| RESOLVE[Resoldre conflictes]
    CONFLICTS -->|No| IMPORT[Importar esdeveniments]
    RESOLVE --> IMPORT
    IMPORT --> UPDATE[Actualitzar estat]
    UPDATE --> RENDER[Renderitzar canvis]
    RENDER --> END([Importació completa])
    ERROR --> END
```

## Diagrama de Arquitectura de Dades

```mermaid
erDiagram
    CALENDAR {
        string id PK
        string name
        string type
        array events FK
        array categories FK
        object settings
        string created
        string modified
    }
    
    EVENT {
        string id PK
        string title
        string date
        string startTime
        string endTime
        string description
        string categoryId FK
        boolean isSystemEvent
        object metadata
    }
    
    CATEGORY {
        string id PK
        string name
        string color
        boolean isSystem
        string description
    }
    
    GLOBAL_CATALOG {
        string categoryId FK
        number usageCount
        string lastUsed
    }
    
    CALENDAR ||--o{ EVENT : contains
    CALENDAR ||--o{ CATEGORY : uses
    CATEGORY ||--o{ GLOBAL_CATALOG : tracked
```

## Diagrama de Rendiment i Optimització

```mermaid
graph TB
    subgraph "Entrada de Dades"
        INPUT[User Input]
        BATCH[Batch Updates]
    end
    
    subgraph "Optimització de Renderitzat"
        RAF[requestAnimationFrame]
        DEBOUNCE[Debounced Rendering]
        CACHE[Component Cache]
    end
    
    subgraph "Gestió de Memòria"
        GC[Garbage Collection]
        WEAK[WeakMap References]
        CLEANUP[Event Cleanup]
    end
    
    subgraph "Persistència Optimitzada"
        LS[localStorage]
        COMPRESS[Data Compression]
        LAZY[Lazy Loading]
    end
    
    INPUT --> BATCH
    BATCH --> RAF
    RAF --> DEBOUNCE
    DEBOUNCE --> CACHE
    
    CACHE --> GC
    GC --> WEAK
    WEAK --> CLEANUP
    
    CLEANUP --> LS
    LS --> COMPRESS
    COMPRESS --> LAZY
```

Aquests diagrames proporcionen una comprensió visual completa de l'arquitectura del Calendari IOC, mostrant les relacions entre components, el flux de dades i els patrons de disseny implementats per facilitar el desenvolupament i manteniment del sistema.

---
[← Decisions de Disseny i Justificacions](Decisions-de-Disseny-i-Justificacions) | [Managers Referència →](managers-Referència)