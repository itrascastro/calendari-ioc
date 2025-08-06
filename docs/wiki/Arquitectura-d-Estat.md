# Arquitectura d'Estat

L'arquitectura d'estat del Calendari IOC està dissenyada com un sistema centralitzat que proporciona un únic punt de veritat per a totes les dades de l'aplicació, amb persistència automàtica i recuperació robusta d'errors.

## Principis de l'Arquitectura d'Estat

### Single Source of Truth
**Principi**: Totes les dades de l'aplicació resideixen en un únic lloc centralitzat
- **AppStateManager**: Conté tot l'estat de l'aplicació
- **No Duplicate State**: Evita duplicació de dades entre components
- **Consistent Access**: Accés unificat a través de getters/setters

### Immutability Controlled
**Principi**: L'estat es modifica de manera controlada i predictible
- **Managed Mutations**: Només a través de mètodes específics
- **Validation**: Validació automàtica en actualitzacions
- **Change Tracking**: Seguiment de canvis per debugging

### Persistence Transparency
**Principi**: La persistència és automàtica i transparent
- **Auto-Save**: Guardat automàtic després de canvis significatius
- **Recovery**: Recuperació automàtica en cas d'errors
- **Migration**: Migracions automàtiques per compatibilitat

## Estructura de l'Estat Global

### Estat Principal (AppStateManager.appState)

```javascript
this.appState = {
    // === DADES PRINCIPALS ===
    calendars: {},                    // Objecte amb tots els calendaris
    currentCalendarId: null,          // ID del calendari actualment actiu
    currentDate: new Date(),          // Data actualment visualitzada
    currentView: 'month',             // Vista actual ('month', 'week', 'day', etc.)
    
    // === SISTEMA DE CATEGORIES ===
    categoryTemplates: [],            // Catàleg global de categories reutilitzables
    
    // === SISTEMA DE REPLICACIÓ ===
    unplacedEvents: [],              // Esdeveniments no ubicats de replicació
    
    // === SISTEMA DE PERSISTÈNCIA DE NAVEGACIÓ ===
    lastVisitedMonths: {},           // Últim mes visitat per cada calendari (sessió)
    
    // === ESTATS D'EDICIÓ ===
    editingCalendarId: null,         // ID del calendari en edició (si n'hi ha)
    editingEventId: null             // ID de l'esdeveniment en edició (si n'hi ha)
};
```

### Variables Auxiliars (No Persistides)

```javascript
// Variables de sessió que no es guarden a localStorage
this.draggedEvent = null;            // Esdeveniment actualment arrossegat (drag & drop)
this.draggedFromDate = null;         // Data d'origen del drag
this.selectedCalendarId = null;     // Calendari seleccionat per replicació
this.selectedCategoryId = null;     // Categoria seleccionada per operacions

// Variables específiques de ViewManager per gestió de listeners
this.semesterScrollListener = null;  // Listener actiu de scroll per vista semestral
```

**Gestió de Listeners Específics per Vista:**

Les variables auxiliars també inclouen el tracking de listeners específics per vista per evitar interferències:

```javascript
// En ViewManager
semesterScrollListener: null         // Referència al listener de scroll actiu
```

**Principis de neteja:**
- **Neteja automàtica**: Els listeners es netegen en canvis de vista
- **Un sol listener actiu**: Només un scroll listener pot estar actiu alhora
- **Prevenció d'interferències**: Evita que listeners de vista semestral afectin altres vistes

## Gestió d'Estat Detallada

### Estructura de Calendaris

**Format de l'objecte calendars:**
```javascript
calendars: {
    "FP_DAM_M07B0_25S1": {
        // === METADADES BÀSIQUES ===
        id: "FP_DAM_M07B0_25S1",
        name: "FP DAM M07B0 25S1",
        type: "FP",                   // "FP", "BTX", "Altre"
        code: "25S1",                 // Codi del semestre
        
        // === RANG TEMPORAL ===
        startDate: "2024-09-16",      // Data d'inici (YYYY-MM-DD)
        endDate: "2025-01-24",        // Data de fi (YYYY-MM-DD)
        paf1Date: "2024-12-16",       // Data PAF1 (opcional, només FP)
        
        // === COMPTADORS PER GENERACIÓ D'IDS ===
        eventCounter: 5,              // Contador per IDs d'esdeveniments
        categoryCounter: 3,           // Contador per IDs de categories
        
        // === CATEGORIES DEL CALENDARI ===
        categories: [
            {
                id: "IOC_GENERIC",           // ID únic de la categoria
                name: "IOC",                 // Nom visible
                color: "#3182ce",            // Color hexadecimal
                isSystem: true               // true=sistema, false=usuari
            },
            {
                id: "FESTIU_GENERIC",
                name: "FESTIU",
                color: "#e53e3e",
                isSystem: true
            },
            {
                id: "FP_DAM_M07B0_25S1_C1",
                name: "Lliuraments",
                color: "#d69e2e",
                isSystem: false
            }
        ],
        
        // === ESDEVENIMENTS DEL CALENDARI ===
        events: [
            {
                id: "FP_DAM_M07B0_25S1_E1",     // ID únic de l'esdeveniment
                title: "Lliurament Pràctica 1",  // Títol de l'esdeveniment
                date: "2024-10-15",              // Data (YYYY-MM-DD)
                categoryId: "FP_DAM_M07B0_25S1_C1", // ID de la categoria
                description: "Primera pràctica del mòdul", // Descripció opcional
                isSystemEvent: false             // true=sistema, false=usuari
            }
        ]
    }
}
```

### Catàleg Global de Categories

```javascript
categoryTemplates: [
    {
        id: "FP_DAM_M07B0_25S1_C1",      // ID de la categoria original
        name: "Lliuraments",              // Nom de la categoria
        color: "#e53e3e",                 // Color assignat
        isSystem: false,                  // Sempre false (només categories d'usuari)
        createdAt: "2024-09-20T10:30:00.000Z", // Data de creació
        usageCount: 3                     // Nombre de calendaris que l'usen (opcional)
    },
    {
        id: "FP_DAM_M07B0_25S1_C2",
        name: "Tutories",
        color: "#3182ce",
        isSystem: false,
        createdAt: "2024-09-21T15:45:00.000Z",
        usageCount: 1
    }
]
```

**Característiques del catàleg:**
- **Global**: Accessible des de qualsevol calendari
- **Només usuari**: Les categories del sistema no s'hi inclouen
- **Auto-sync**: S'actualitza automàticament quan es carreguen calendaris
- **Reutilització**: Facilita la reutilització de categories entre calendaris

### Sistema de Persistència de Navegació

```javascript
lastVisitedMonths: {
    "FP_DAM_M07B0_25S1": "2024-11-01T00:00:00.000Z",     // Calendari FP
    "BTX_MAT_25S2": "2025-03-01T00:00:00.000Z",           // Calendari BTX  
    "ALTRE_PROJECTE_123": "2024-12-01T00:00:00.000Z"     // Calendari personalitzat
}
```

**Arquitectura del sistema:**

#### Propòsit i Funcionament
- **Objectiu**: Cada calendari recorda l'últim mes visitat en vista mensual
- **Persistència**: Durant la sessió (es reseteja amb F5)
- **Àmbit**: Només vista mensual (altres vistes no afecten aquest sistema)

#### Cicle de Vida
1. **Creació**: S'inicialitza com a objecte buit `{}`
2. **Primer accés**: Primera visita usa el primer mes del calendari
3. **Navegació**: S'actualitza automàticament en navegar per mesos
4. **Canvi de calendari**: Es guarda l'actual i es recupera el del nou calendari
5. **Canvi de vista**: Es guarda quan es surt de vista mensual
6. **Validació**: Sempre es verifica que la data estigui dins del rang del calendari

#### Gestió d'Errors i Fallbacks
```javascript
// Validació automàtica de rang
if (targetDate < calendarStart || targetDate > calendarEnd) {
    // Fallback segur: usar primer mes del calendari
    targetDate = dateHelper.createUTC(
        calendarStart.getUTCFullYear(), 
        calendarStart.getUTCMonth(), 
        1
    );
}
```

#### Integració amb Components
- **CalendarManager**: Gestiona persistència en `switchCalendar()`
- **ViewManager**: Gestiona persistència en `changeView()` i `navigateMonth()`
- **ReplicaManager**: Aplica mateixa lògica després de replicació
- **StorageManager**: No es persisteix a localStorage (només sessió)

### Esdeveniments No Ubicats

```javascript
unplacedEvents: [
    {
        event: {
            id: "TARGET_CAL_E123",           // ID generat per al calendari destí
            title: "Lliurament copiat",      // Títol de l'esdeveniment original
            date: "2024-10-15",              // Data original (problemàtica)
            categoryId: "CATEGORY_ID",       // ID de categoria (adaptada)
            description: "Esdeveniment replicat des de...",
            isSystemEvent: false,
            replicationConfidence: 0.75      // Confiança de la replicació (0-1)
        },
        sourceCalendar: {
            id: "SOURCE_CAL_ID",             // ID del calendari origen
            name: "Calendari Origen",        // Nom del calendari origen
            type: "FP"                       // Tipus del calendari origen
        },
        reason: "Data fora del rang del calendari destí" // Motiu de no ubicació
    }
]
```

## Operacions d'Estat

### Accessors Centralitzats

#### getCurrentCalendar()
```javascript
getCurrentCalendar() {
    // Auto-selecció si no hi ha calendari actiu
    if (!this.appState.currentCalendarId || 
        !this.appState.calendars[this.appState.currentCalendarId]) {
        // Seleccionar el primer calendari disponible
        const availableIds = Object.keys(this.appState.calendars);
        this.appState.currentCalendarId = availableIds[0] || null;
    }
    
    return this.appState.currentCalendarId ? 
           this.appState.calendars[this.appState.currentCalendarId] : null;
}
```

**Funcionalitat:**
- **Fallback automàtic**: Si no hi ha calendari seleccionat, agafa el primer
- **Validation**: Verifica que el calendari seleccionat existeix
- **Null handling**: Retorna null si no hi ha calendaris

#### Getters i Setters Controlats

```javascript
// Accés controlat a propietats de l'estat
get calendars() { return this.appState.calendars; }
set calendars(value) { 
    this.appState.calendars = value;
    this.validateAppState(); // Validació automàtica
}

get currentDate() { return this.appState.currentDate; }
set currentDate(value) { 
    if (value instanceof Date) {
        this.appState.currentDate = value;
    } else {
        console.warn('[AppStateManager] Invalid date provided');
    }
}
```

### Operacions de Manteniment

#### resetAppState()
```javascript
resetAppState() {
    console.log('[AppStateManager] Reiniciant estat de l\'aplicació...');
    
    // Reiniciar estat principal
    this.appState = {
        calendars: {},
        currentCalendarId: null,
        editingCalendarId: null,
        editingEventId: null,
        currentDate: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)),
        currentView: 'month',
        categoryTemplates: [],
        unplacedEvents: []
    };
    
    // Reiniciar variables auxiliars
    this.draggedEvent = null;
    this.draggedFromDate = null;
    this.selectedCalendarId = null;
    this.selectedCategoryId = null;
    
    console.log('[AppStateManager] Estat reiniciat correctament');
}
```

#### validateAppState()  
```javascript
validateAppState() {
    // Validacions estructurals bàsiques
    if (!this.appState || typeof this.appState !== 'object') {
        console.error('[AppStateManager] Estat no vàlid: no és un objecte');
        return false;
    }
    
    if (!this.appState.calendars || typeof this.appState.calendars !== 'object') {
        console.error('[AppStateManager] Calendaris no vàlids');
        return false;
    }
    
    if (!Array.isArray(this.appState.categoryTemplates)) {
        console.error('[AppStateManager] CategoryTemplates no és un array');
        return false;
    }
    
    // Validacions de consistència
    if (this.appState.currentCalendarId && 
        !this.appState.calendars[this.appState.currentCalendarId]) {
        console.warn('[AppStateManager] Calendari actiu no existeix, corregint...');
        this.appState.currentCalendarId = null;
    }
    
    return true;
}
```

## Sistema de Persistència

### StorageManager Integration

**Automatització completa:**
```javascript
// En qualsevol Manager que modifica l'estat
completeCalendarSave() {
    // 1. Lògica de negoci
    this.processCalendarData();
    
    // 2. Actualització d'estat
    appStateManager.calendars[calendarId] = newCalendar;
    
    // 3. Persistència automàtica
    storageManager.saveToStorage();
    
    // 4. Actualització UI
    this.updateUI();
}
```

### Estratègies de Persistència

#### Selective Persistence
```javascript
// Només persisteix l'estat principal, no variables auxiliars
saveToStorage() {
    const stateToSave = {
        ...appStateManager.appState,
        // Conversió de dates per serialització
        currentDate: dateHelper.toUTCString(appStateManager.currentDate)
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToSave));
}
```

#### Recovery Mechanisms
```javascript
loadFromStorage() {
    try {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (!data) return false;
        
        const loadedState = JSON.parse(data);
        
        // Restauració amb validació
        appStateManager.appState = {
            ...loadedState,
            currentDate: dateHelper.parseUTC(loadedState.currentDate.split('T')[0])
        };
        
        // Migracions automàtiques
        this.runMigrations();
        
        return true;
        
    } catch (error) {
        console.error('[Storage] Error carregant estat:', error);
        
        // Recuperació automàtica
        if (error instanceof SyntaxError) {
            console.warn('[Storage] Dades corruptes, netejant...');
            this.clearStorage();
        }
        
        return false;
    }
}
```

## Migracions Automàtiques

### System de Migracions

```javascript
migrateCategoryTemplates() {
    console.log('[Migració] Sincronitzant catàleg de categories...');
    
    // Recorre tots els calendaris per trobar categories d'usuari
    Object.values(this.appState.calendars).forEach(calendar => {
        if (!calendar.categories) return;
        
        calendar.categories
            .filter(cat => !cat.isSystem)  // Només categories d'usuari
            .forEach(category => {
                const existingTemplate = this.appState.categoryTemplates.find(
                    t => t.id === category.id
                );
                
                if (!existingTemplate) {
                    // Afegir nova plantilla al catàleg
                    this.appState.categoryTemplates.push({
                        id: category.id,
                        name: category.name,
                        color: category.color,
                        isSystem: false,
                        createdAt: new Date().toISOString(),
                        usageCount: 1
                    });
                } else {
                    // Actualitzar plantilla existent
                    existingTemplate.name = category.name;
                    existingTemplate.color = category.color;
                    existingTemplate.usageCount = (existingTemplate.usageCount || 0) + 1;
                }
            });
    });
    
    console.log(`[Migració] ${this.appState.categoryTemplates.length} categories al catàleg`);
}
```

### Version Compatibility

```javascript
checkStateVersion() {
    // Detecció de versions antigues
    if (!this.appState.categoryTemplates) {
        console.log('[Migration] Adding categoryTemplates support...');
        this.appState.categoryTemplates = [];
        this.migrateCategoryTemplates();
    }
    
    if (!this.appState.unplacedEvents) {
        console.log('[Migration] Adding unplacedEvents support...');
        this.appState.unplacedEvents = [];
    }
    
    // Futures migracions es poden afegir aquí
}
```

## Gestió d'Estats Temporals

### Drag & Drop State

```javascript
// Iniciació de drag
startDrag(event) {
    this.draggedEvent = event;
    this.draggedFromDate = event.date;
    // Visual feedback en UI
}

// Finalització de drag
completeDrag(targetDate) {
    if (this.draggedEvent && targetDate !== this.draggedFromDate) {
        // Actualitzar esdeveniment
        this.draggedEvent.date = targetDate;
        // Persistir canvis
        storageManager.saveToStorage();
    }
    
    // Netejar estat temporal
    this.cleanupDragState();
}

cleanupDragState() {
    this.draggedEvent = null;
    this.draggedFromDate = null;
    
    // Netejar efectes visuals
    document.querySelectorAll('.drop-target, .drop-invalid').forEach(el => {
        el.classList.remove('drop-target', 'drop-invalid');
    });
}
```

### Modal Editing State

```javascript
// Estat d'edició per modals
startCalendarEdit(calendarId) {
    this.appState.editingCalendarId = calendarId;
    // No persistir - només per sessió
}

cancelCalendarEdit() {
    this.appState.editingCalendarId = null;
    // Revertir canvis si cal
}

completeCalendarEdit() {
    // Aplicar canvis
    this.appState.editingCalendarId = null;
    // Persistir automàticament
    storageManager.saveToStorage();
}
```

## Debugging i Introspection

### State Information

```javascript
getStateInfo() {
    return {
        // Informació bàsica
        calendarsCount: Object.keys(this.appState.calendars).length,
        currentCalendarId: this.appState.currentCalendarId,
        currentDate: this.appState.currentDate,
        currentView: this.appState.currentView,
        
        // Catàleg de categories
        categoryTemplatesCount: this.appState.categoryTemplates.length,
        
        // Sistema de replicació
        unplacedEventsCount: this.appState.unplacedEvents.length,
        
        // Estats temporals
        hasDraggedEvent: !!this.draggedEvent,
        isEditingCalendar: !!this.appState.editingCalendarId,
        isEditingEvent: !!this.appState.editingEventId,
        
        // Seleccions temporals
        selectedCalendarId: this.selectedCalendarId,
        selectedCategoryId: this.selectedCategoryId
    };
}
```

### Development Tools

```javascript
// Només en mode desenvolupament
if (window.location.hostname === 'localhost') {
    window.debugState = {
        getState: () => appStateManager.getStateInfo(),
        resetState: () => appStateManager.resetAppState(),
        exportState: () => storageManager.exportState(),
        importState: (data) => storageManager.importState(data)
    };
}
```

Aquesta arquitectura d'estat proporciona una base sòlida i robusta per a l'aplicació, garantint consistència, persistència fiable i facilitat de debugging i manteniment.

---
[← Capes del Sistema](Capes-del-Sistema) | [Decisions de Disseny →](Decisions-de-Disseny-i-Justificacions)