# Referència de State Management

El sistema d'estat del Calendari IOC està centralitzat i gestionat per dues classes principals: `AppStateManager` i `StorageManager`. Aquest document proporciona una referència completa d'ambdós components.

## Estructura del State Management

```
js/state/
├── AppStateManager.js    # Estat global centralitzat
└── StorageManager.js     # Persistència i storage
```

---

## ️ AppStateManager

**Responsabilitat**: Gestió centralitzada de tot l'estat global de l'aplicació

### Arquitectura Singleton

```javascript
class AppStateManager {
    constructor() {
        // Única instància global
    }
}

// Instància global única
const appStateManager = new AppStateManager();
```

### Estructura de l'Estat

```javascript
this.appState = {
    // Dades principals
    calendars: {},                    // Objecte amb tots els calendaris
    currentCalendarId: null,          // ID del calendari actiu
    currentDate: new Date(),          // Data actualment visualitzada
    
    // Sistema de categories
    categoryTemplates: [],            // Catàleg global de categories
    systemCategoryColors: {},         // Colors assignats a categories del sistema
    
    // Sistema de replicació
    unplacedEvents: [],              // Esdeveniments no ubicats de replicació
    
    // Sistema de persistència de navegació
    lastVisitedMonths: {},           // Últim mes visitat per cada calendari
    
    // Estats d'edició (NO persistits)
    editingCalendarId: null,         // Calendari en edició (auxiliar)
    editingEventId: null             // Esdeveniment en edició (auxiliar)
};

// Variables auxiliars (no persistides)
this.draggedEvent = null;            // Esdeveniment actualment arrossegat
this.draggedFromDate = null;         // Data d'origen del drag
this.selectedCalendarId = null;     // Calendari seleccionat per replicació
this.selectedCategoryId = null;     // Categoria seleccionada
```

### Propietats Principals

#### Calendaris (`calendars`)
**Estructura**: Objecte amb clau-valor on la clau és l'ID del calendari.

```javascript
calendars: {
    "FP_DAM_M07B0_2024-25_S1": {
        id: "FP_DAM_M07B0_2024-25_S1",
        name: "FP_DAM_M07B0_2024-25_S1",
        startDate: "2024-09-16",
        endDate: "2025-01-24", 
        type: "FP",
        code: "2024-25_S1",
        paf1Date: "2024-12-16",
        eventCounter: 5,
        categoryCounter: 3,
        categories: [
            {
                id: "IOC_GENERIC",
                name: "IOC", 
                color: "#3182ce",
                isSystem: true
            }
        ],
        events: [
            {
                id: "FP_DAM_M07B0_2024-25_S1_E1",
                title: "Lliurament Pràctica 1",
                date: "2024-10-15",
                categoryId: "IOC_GENERIC", 
                description: "Primera pràctica del mòdul",
                isSystemEvent: false
            }
        ]
    }
}
```

#### Catàleg Global de Categories (`categoryTemplates`)
**Estructura**: Array de categories reutilitzables entre calendaris.

```javascript
categoryTemplates: [
    {
        id: "FP_DAM_M07B0_2024-25_S1_C1",
        name: "Lliuraments",
        color: "#e53e3e",
        isSystem: false,
        createdAt: "2024-09-20T10:30:00.000Z",
        usageCount: 3
    }
]
```

**Característiques del catàleg:**
- **Global**: Compartit entre tots els calendaris
- **Només categories d'usuari**: Les categories del sistema no s'afegeixen
- **Auto-sincronització**: S'actualitza quan es carreguen calendaris
- **Comptador d'ús**: Opcional, per estadístiques

#### Colors de Categories del Sistema (`systemCategoryColors`)
**Estructura**: Objecte que mapeja IDs de categories del sistema amb colors assignats automàticament.

```javascript
systemCategoryColors: {
    "SYS_CAT_1": "#FF6B6B",  // IOC_GENERIC
    "SYS_CAT_2": "#4ECDC4",  // FESTIU
    "SYS_CAT_3": "#45B7D1"   // PAF
}
```

**Característiques:**
- **Assignació automàtica**: Colors assignats per `ColorCategoryHelper`
- **Persistits**: Es desen entre sessions
- **Evita duplicats**: Sistema intel·ligent que evita conflictes de colors
- **Centralitzat**: Una sola font de veritat per colors de sistema

#### Esdeveniments No Ubicats (`unplacedEvents`)
**Estructura**: Array d'esdeveniments que no es van poder col·locar durant la replicació.

```javascript
unplacedEvents: [
    {
        event: {
            id: "TARGET_CAL_E123",
            title: "Lliurament copiat",
            date: "2024-10-15",
            categoryId: "CATEGORY_ID",
            description: "Esdeveniment replicat",
            isSystemEvent: false
        },
        sourceCalendar: {
            id: "SOURCE_CAL_ID",
            name: "Calendari Origen",
            // ... altres propietats del calendari origen
        }
    }
]
```

#### Sistema de Persistència de Navegació (`lastVisitedMonths`)
**Estructura**: Objecte que mapeja cada calendari amb l'últim mes visitat en vista mensual.

```javascript
lastVisitedMonths: {
    "FP_DAM_M07B0_2024-25_S1": "2024-11-01T00:00:00.000Z",
    "BTX_MAT_2024-25_S2": "2025-03-01T00:00:00.000Z",
    "ALTRE_PROJECTE_123": "2024-12-01T00:00:00.000Z"
}
```

**Característiques del sistema:**
- **Per calendari**: Cada calendari manté el seu propi últim mes visitat
- **Persistència de sessió**: Es manté durant la sessió però es reseteja amb F5
- **Validació automàtica**: Les dates es validen contra el rang del calendari
- **Fallback segur**: Si una data és invàlida, usa el primer mes del calendari
- **Format ISO**: Les dates es guarden en format UTC string per consistència

**Funcionament:**
1. **Navegació mensual**: Quan l'usuari navega amb les fletxes, s'actualitza automàticament
2. **Canvi de calendaris**: Es guarda el mes actual abans de canviar i es restaura el mes del nou calendari
3. **Canvi de vistes**: Es guarda el mes actual quan es surt de vista mensual
4. **Validació**: Sempre verifica que el mes estigui dins del rang startDate-endDate del calendari

### Mètodes Principals

#### `getCurrentCalendar()`
Retorna el calendari actualment actiu.

```javascript
getCurrentCalendar() {
    if (!this.appState.currentCalendarId || 
        !this.appState.calendars[this.appState.currentCalendarId]) {
        // Auto-selecciona el primer calendari disponible
        this.appState.currentCalendarId = Object.keys(this.appState.calendars)[0] || null;
    }
    return this.appState.currentCalendarId ? 
           this.appState.calendars[this.appState.currentCalendarId] : null;
}
```

**Funcionalitat:**
- Retorna el calendari actiu
- Auto-selecciona un calendari si no n'hi ha cap seleccionat
- Retorna `null` si no hi ha calendaris

#### `resetAppState()`
Reinicia completament l'estat de l'aplicació.

```javascript
resetAppState() {
    // Reinicia estat principal
    this.appState = {
        calendars: {},
        currentCalendarId: null,
        editingCalendarId: null,
        editingEventId: null,
        currentDate: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)),
        categoryTemplates: [],
        unplacedEvents: []
    };
    
    // Reinicia variables auxiliars
    this.draggedEvent = null;
    this.draggedFromDate = null;
    this.selectedCalendarId = null;
    this.selectedCategoryId = null;
}
```

#### `validateAppState()`
Valida la integritat de l'estat actual.

```javascript
validateAppState() {
    // Validacions bàsiques d'estructura
    if (!this.appState || typeof this.appState !== 'object') return false;
    if (!this.appState.calendars || typeof this.appState.calendars !== 'object') return false;
    if (!Array.isArray(this.appState.categoryTemplates)) return false;
    if (!Array.isArray(this.appState.unplacedEvents)) return false;
    
    // Validació específica del sistema de navegació per calendari
    if (!this.appState.lastVisitedMonths || typeof this.appState.lastVisitedMonths !== 'object') {
        console.error('[AppState] Sistema lastVisitedMonths no vàlid');
        return false;
    }
    
    return true;
}
```

#### `cleanupDragState()`
Neteja l'estat de drag & drop.

```javascript
cleanupDragState() {
    this.draggedEvent = null;
    this.draggedFromDate = null;
    
    // Neteja classes CSS de drag & drop
    document.querySelectorAll('.drop-target, .drop-invalid').forEach(el => {
        el.classList.remove('drop-target', 'drop-invalid');
    });
}
```

### Getters i Setters

Per facilitar l'accés controlat a l'estat, AppStateManager proporciona getters i setters:

```javascript
// Calendaris
get calendars() { return this.appState.calendars; }
set calendars(value) { this.appState.calendars = value; }

// ID del calendari actual
get currentCalendarId() { return this.appState.currentCalendarId; }
set currentCalendarId(value) { this.appState.currentCalendarId = value; }

// Data actual
get currentDate() { return this.appState.currentDate; }
set currentDate(value) { this.appState.currentDate = value; }

// Vista actual
get currentView() { return this.appState.currentView; }
set currentView(value) { this.appState.currentView = value; }

// Catàleg de categories
get categoryTemplates() { return this.appState.categoryTemplates; }
set categoryTemplates(value) { this.appState.categoryTemplates = value; }

// Esdeveniments no ubicats
get unplacedEvents() { return this.appState.unplacedEvents; }
set unplacedEvents(value) { this.appState.unplacedEvents = value; }

// Sistema de persistència de navegació
get lastVisitedMonths() { return this.appState.lastVisitedMonths; }
set lastVisitedMonths(value) { this.appState.lastVisitedMonths = value; }

// Estats d'edició
get editingCalendarId() { return this.appState.editingCalendarId; }
set editingCalendarId(value) { this.appState.editingCalendarId = value; }

get editingEventId() { return this.appState.editingEventId; }
set editingEventId(value) { this.appState.editingEventId = value; }
```

### Sistema de Migracions

#### `migrateCategoryTemplates()`
Sincronitza el catàleg global amb categories dels calendaris existents.

```javascript
migrateCategoryTemplates() {
    console.log('[Migració] Sincronitzant catàleg de categories...');
    
    Object.values(this.appState.calendars).forEach(calendar => {
        if (calendar.categories) {
            calendar.categories
                .filter(cat => !cat.isSystem) // Només categories d'usuari
                .forEach(category => {
                    const existingTemplate = this.appState.categoryTemplates.find(
                        t => t.id === category.id
                    );
                    
                    if (!existingTemplate) {
                        // Afegir nova plantilla
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
        }
    });
}
```

### Utilitats de Debugging

#### `getStateInfo()`
Retorna informació resumida de l'estat per debugging.

```javascript
getStateInfo() {
    return {
        calendarsCount: Object.keys(this.appState.calendars).length,
        currentCalendarId: this.appState.currentCalendarId,
        currentDate: this.appState.currentDate,
        categoryTemplatesCount: this.appState.categoryTemplates.length,
        unplacedEventsCount: this.appState.unplacedEvents.length,
        hasDraggedEvent: !!this.draggedEvent,
        selectedCalendarId: this.selectedCalendarId,
        selectedCategoryId: this.selectedCategoryId
    };
}
```

---

## StorageManager

**Responsabilitat**: Persistència de dades i gestió de localStorage

### Constructor i Configuració

```javascript
class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'calendari-ioc-data';
    }
}
```

### Mètodes de Persistència

#### `saveToStorage()`
Guarda l'estat actual a localStorage.

```javascript
saveToStorage() {
    try {
        // Preparar estat per guardar (convertir dates a strings)
        const stateToSave = { 
            ...appStateManager.appState, 
            currentDate: dateHelper.toUTCString(appStateManager.currentDate) 
        };
        
        // Guardar a localStorage
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToSave));
        
        console.log('[Storage] Estat guardat correctament');
        return true;
        
    } catch (error) {
        console.error('[Storage] Error guardant estat:', error);
        
        // Gestió d'errors de quota
        if (error.name === 'QuotaExceededError') {
            console.warn('[Storage] Quota exhaurida, intentant netejar...');
            this.clearOldData();
            
            // Reintent automàtic
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToSave));
                return true;
            } catch (retryError) {
                console.error('[Storage] Error persistent després de netejar:', retryError);
                return false;
            }
        }
        
        return false;
    }
}
```

**Gestió d'errors:**
- **QuotaExceededError**: Neteja automàtica de dades antigues i reintent
- **Altres errors**: Log i retorn de false
- **Retry automàtic**: Un intent de recuperació

#### `loadFromStorage()`
Carrega l'estat des de localStorage.

```javascript
loadFromStorage() {
    try {
        const data = localStorage.getItem(this.STORAGE_KEY);
    
        if (!data) {
            console.log('[Storage] No hi ha dades guardades');
            return false;
        }
    
        const loadedState = JSON.parse(data);
    
        // Restaurar estat (convertir strings a dates)
        appStateManager.appState = { 
            ...loadedState, 
            currentDate: dateHelper.parseUTC(loadedState.currentDate.split('T')[0]) 
        };
    
        // Migracions automàtiques per compatibilitat
        if (!appStateManager.categoryTemplates) {
            appStateManager.categoryTemplates = [];
        }
        
        if (!appStateManager.unplacedEvents) {
            appStateManager.unplacedEvents = [];
        }
    
        // Executar migracions
        appStateManager.migrateCategoryTemplates();
    
        console.log('[Storage] Estat carregat correctament');
        return true;
    
    } catch (error) {
        console.error('[Storage] Error carregant estat:', error);
        
        // Recuperació automàtica de dades corruptes
        if (error instanceof SyntaxError) {
            console.warn('[Storage] Dades corruptes, netejant localStorage...');
            this.clearStorage();
        }
        
        return false;
    }
}
```

**Funcionalitats:**
- **Conversió de dates**: Automàtica de strings UTC a objectes Date
- **Migracions automàtiques**: Compatibilitat amb versions anteriors
- **Recuperació d'errors**: Neteja automàtica si les dades estan corruptes

#### `clearStorage()`
Neteja completament les dades de l'aplicació.

```javascript
clearStorage() {
    try {
        localStorage.removeItem(this.STORAGE_KEY);
        console.log('[Storage] localStorage netejat');
        return true;
    } catch (error) {
        console.error('[Storage] Error netejant localStorage:', error);
        return false;
    }
}
```

### Gestió d'Espai i Optimització

#### `clearOldData()`
Neteja dades antigues per alliberar espai.

```javascript
clearOldData() {
    try {
        // Claus antigues que poden existir
        const keysToCheck = [
            'calendarioIOC',        // Clau antiga
            'calendari-ioc-backup',
            'calendari-ioc-temp'
        ];
        
        keysToCheck.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log(`[Storage] Netejat clau antiga: ${key}`);
            }
        });
        
        return true;
    } catch (error) {
        console.error('[Storage] Error netejant dades antigues:', error);
        return false;
    }
}
```

#### `getStorageInfo()`
Retorna informació sobre l'ús d'emmagatzematge.

```javascript
getStorageInfo() {
    try {
        const data = localStorage.getItem(this.STORAGE_KEY);
    
        if (!data) {
            return {
                exists: false,
                size: 0,
                sizeFormatted: '0 B'
            };
        }
    
        const sizeInBytes = new Blob([data]).size;
        const sizeFormatted = this.formatBytes(sizeInBytes);
    
        return {
            exists: true,
            size: sizeInBytes,
            sizeFormatted: sizeFormatted,
            lastModified: new Date().toISOString()
        };
    
    } catch (error) {
        console.error('[Storage] Error obtenint informació:', error);
        return {
            exists: false,
            size: 0,
            sizeFormatted: '0 B',
            error: error.message
        };
    }
}
```

### Import/Export Avançat

#### `exportState()`
Exporta l'estat actual com a JSON formatejat.

```javascript
exportState() {
    try {
        const exportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            data: {
                ...appStateManager.appState,
                currentDate: dateHelper.toUTCString(appStateManager.currentDate)
            }
        };
    
        return JSON.stringify(exportData, null, 2);
    
    } catch (error) {
        console.error('[Storage] Error exportant estat:', error);
        return null;
    }
}
```

#### `importState(jsonData)`
Importa estat des de JSON extern.

```javascript
importState(jsonData) {
    try {
        const importData = JSON.parse(jsonData);
    
        if (!importData.data || !importData.version) {
            throw new Error('Format de dades no vàlid');
        }
    
        // Restaurar estat
        appStateManager.appState = {
            ...importData.data,
            currentDate: dateHelper.parseUTC(importData.data.currentDate.split('T')[0])
        };
    
        // Guardar estat importat
        this.saveToStorage();
    
        console.log('[Storage] Estat importat correctament');
        return true;
    
    } catch (error) {
        console.error('[Storage] Error important estat:', error);
        return false;
    }
}
```

### Verificacions i Inicialització

#### `isStorageAvailable()`
Comprova si localStorage està disponible.

```javascript
isStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (error) {
        console.warn('[Storage] localStorage no disponible:', error);
        return false;
    }
}
```

#### `initializeStorage()`
Inicialitza el sistema de persistència.

```javascript
initializeStorage() {
    if (!this.isStorageAvailable()) {
        console.error('[Storage] localStorage no disponible');
        return false;
    }
    
    console.log('[Storage] Sistema de persistència inicialitzat');
    return true;
}
```

### Utilitats

#### `formatBytes(bytes, decimals = 2)`
Formata bytes en format llegible.

```javascript
formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
```

---

## Integració AppStateManager ↔ StorageManager

### Flux d'Interacció Típic

```
User Action → Manager → AppStateManager.update() → StorageManager.saveToStorage()
                                ↓
App Startup → StorageManager.loadFromStorage() → AppStateManager.restore()
```

### Automatització de Persistència

**Cada manager que modifica l'estat:**
```javascript
// Exemple en CalendarManager
completeCalendarSave() {
    storageManager.saveToStorage();  // Persistència automàtica
    this.updateUI();                 // Actualització UI
}
```

### Gestió d'Errors Coordinada

**Recuperació automàtica:**
1. StorageManager detecta dades corruptes
2. Neteja localStorage automàticament  
3. AppStateManager es reinicia amb estat buit
4. UI es re-renderitza amb estat inicial

### Cicle de Desenvolupament

**Per desenvolupadors:**
```javascript
// Debug de l'estat actual
console.log(appStateManager.getStateInfo());

// Backup manual
const backup = storageManager.exportState();

// Neteja per testing
storageManager.clearStorage();
appStateManager.resetAppState();

// Restauració
storageManager.importState(backup);
```

Aquest sistema d'estat proporciona una base sòlida i extensible per a l'aplicació, amb persistència automàtica i recuperació d'errors robusta.

---
[← Managers](managers-Referència) | [UI Components →](ui-Referència)