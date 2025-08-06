# Patrons Arquitectònics Detallats

Aquest document detalla tots els patrons de disseny implementats al Calendari IOC, explicant com s'utilitzen, per què es van escollir i com es poden estendre.

## 1. Manager Pattern (Principal)

### Descripció
El Manager Pattern és el patró central de l'aplicació. Cada manager és responsable d'un aspecte específic de la lògica de negoci.

### Implementació

```javascript
class CalendarManager {
    // Responsabilitat: Gestió completa de calendaris
    
    async addCalendar() {
        // 1. Validació d'entrada
        // 2. Processament segons tipus (FP/BTX/Altre)
        // 3. Creació d'estructura de dades
        // 4. Actualització d'estat
        // 5. Persistència
        // 6. Re-renderització
    }
    
    deleteCalendar(calendarId) {
        // Gestió segura d'eliminació amb confirmació
    }
    
    switchCalendar(calendarId) {
        // Canvi d'estat i sincronització UI
    }
}
```

### Managers Implementats

**CalendarManager**
- **Responsabilitat**: CRUD calendaris, configuració automàtica
- **Mètodes clau**: `addCalendar()`, `deleteCalendar()`, `switchCalendar()`
- **Interaccions**: SemesterConfig, AppStateManager, StorageManager

**EventManager**
- **Responsabilitat**: CRUD esdeveniments, drag&drop, validacions
- **Mètodes clau**: `saveEvent()`, `deleteEvent()`, `moveEvent()`
- **Interaccions**: DateValidationService, CategoryManager

**CategoryManager**
- **Responsabilitat**: Catàleg global, sincronització entre calendaris
- **Mètodes clau**: `addCategory()`, `deleteCategory()`, `saveEditCategory()`
- **Interaccions**: AppStateManager per catàleg global

**ReplicaManager**
- **Responsabilitat**: Orquestració de replicació d'esdeveniments entre calendaris
- **Mètodes clau**: `executeReplication()`, `placeUnplacedEvent()`
- **Interaccions**: ReplicaServiceFactory (per selecció automàtica), DateValidationService
- **Arquitectura**: Utilitza Factory Pattern per algoritmes especialitzats

### Avantatges del Pattern
- **Separació clara**: Cada manager té una responsabilitat específica
- **Testabilitat**: Fàcil de testejar de forma aïllada
- **Mantenibilitat**: Canvis localitzats en un sol manager
- **Extensibilitat**: Fàcil afegir nous managers

## 2. Singleton Pattern

### Descripció
Utilitzat per components que necessiten una única instància global amb estat persistent.

### Implementació

```javascript
class AppStateManager {
    constructor() {
        // Estat global centralitzat
        this.appState = {
            calendars: {},
            currentCalendarId: null,
            currentDate: new Date(),
            categoryTemplates: [],
            unplacedEvents: []
        };
    }
    
    // Getters i setters per accés controlat
    get currentCalendar() {
        return this.calendars[this.currentCalendarId];
    }
}

// Instància global única
const appStateManager = new AppStateManager();
```

### Singletons Implementats

**AppStateManager**
- **Estat global**: Calendaris, configuració, variables temporals
- **Accés controlat**: Getters/setters amb validació
- **Persistència**: Integració amb StorageManager

**StorageManager**
- **Persistència**: localStorage, import/export
- **Gestió d'errors**: Recovery automàtic de dades corruptes
- **Migracions**: Compatibilitat amb versions anteriors

### Justificació
- **Únic punt de veritat**: Evita inconsistències d'estat
- **Compartició simple**: Accés des de qualsevol component
- **Inicialització controlada**: Configuració única al començament

## 3. Factory Pattern

### Descripció
Creació d'objectes segons paràmetres, especialment per diferents tipus de calendaris i algoritmes de replicació.

### Implementació

```javascript
// Factory per calendaris
class CalendarManager {
    async processFPCalendar() {
        const fpConfig = new SemesterConfig('FP');
        await fpConfig.initialize();
        
        return {
            id: calendarId,
            name: calendarName,
            type: 'FP',
            categories: fpConfig.getDefaultCategories(),
            events: this.generateSystemEvents(startDate, endDate, 'FP', fpConfig)
        };
    }
    
    async processBTXCalendar() {
        // Lògica específica per BTX
    }
    
    processAltreCalendar() {
        // Calendaris personalitzats sense configuració automàtica
    }
}

// Factory per IDs únics
class IdHelper {
    static generateNextEventId(calendarId) {
        const calendar = appStateManager.calendars[calendarId];
        calendar.eventCounter = (calendar.eventCounter || 0) + 1;
        return `${calendarId}_E${calendar.eventCounter}`;
    }
}

// Factory per Services de Replicació (Implementació avançada)
class ReplicaServiceFactory {
    static getService(sourceCalendar, targetCalendar) {
        const sourceType = sourceCalendar.type || 'Altre';
        const targetType = targetCalendar.type || 'Altre';
        
        console.log(`[REPLICA_FACTORY] Seleccionant servei per: ${sourceType} → ${targetType}`);
        
        // Factory logic per seleccionar algoritme adequat
        if (sourceType === 'Altre' || targetType === 'Altre') {
            console.log(`[REPLICA_FACTORY] Calendari "Altre" detectat: usant GenericReplicaService`);
            return new GenericReplicaService();
        } 
        
        // Si ambdós són calendaris d'estudi (FP, BTX), usar EstudiReplicaService
        console.log(`[REPLICA_FACTORY] Calendaris d'estudi detectats: usant EstudiReplicaService`);
        return new EstudiReplicaService();
    }
    
    static getServiceInfo(sourceCalendar, targetCalendar) {
        // Retorna informació sobre el servei que es seleccionaria
        const sourceType = sourceCalendar?.type || 'Altre';
        const targetType = targetCalendar?.type || 'Altre';
        
        if (sourceType === 'Altre' || targetType === 'Altre') {
            return {
                serviceType: 'GenericReplicaService',
                description: 'Servei optimitzat per calendaris genèrics amb preservació d\'agrupacions',
                features: ['Tots els dies de la setmana', 'Múltiples esdeveniments per dia']
            };
        } else {
            return {
                serviceType: 'EstudiReplicaService',
                description: 'Servei per calendaris d\'estudi amb restriccions acadèmiques',
                features: ['Només dies laborables', 'Un esdeveniment per dia màxim']
            };
        }
    }
    
    static validateCompatibility(sourceCalendar, targetCalendar) {
        // Validació de compatibilitat per tipus de calendaris
        const validation = { isCompatible: true, warnings: [], recommendations: [] };
        
        const sourceType = sourceCalendar?.type || 'Altre';
        const targetType = targetCalendar?.type || 'Altre';
        
        if (sourceType === 'Altre' && targetType !== 'Altre') {
            validation.recommendations.push('Replicació d\'Altre a estudi pot generar esdeveniments no ubicats en caps de setmana');
        }
        
        return validation;
    }
}
```

### Factories Implementats

**Calendar Factory** (dins CalendarManager)
- Crea calendaris segons tipus (FP/BTX/Altre)
- Configuració automàtica per tipus institucionals
- Flexibilitat total per tipus personalitzats

**ID Factory** (IdHelper)
- Generació d'IDs únics per calendaris, esdeveniments, categories
- Format consistent: `{parentId}_{type}{counter}`
- Garanteix unicitat dins l'aplicació

**Event Factory** (dins EventManager)
- Creació d'esdeveniments amb validació
- Assignació automàtica de categoria si cal
- Integració amb sistema de replicació

**Replica Service Factory** (ReplicaServiceFactory) ⭐ **NOVA IMPLEMENTACIÓ**
- **Selecció automàtica d'algoritmes**: Escull entre EstudiReplicaService i GenericReplicaService
- **Lògica de compatibilitat**: Analitza tipus de calendaris per optimitzar replicació
- **Arquitectura jeràrquica**: Utilitza herència de ReplicaService com a base
- **Extensibilitat**: Facilita afegir nous algoritmes de replicació
- **Patró Template Method**: Mètodes comuns a la classe base, especialització a subclasses

#### Arquitectura de Services de Replicació

```javascript
// Jerarquia d'herència
ReplicaService (classe base)
    ├── EstudiReplicaService (per calendaris FP/BTX)
    ├── GenericReplicaService (per calendaris "Altre")
    └── [FutureCustomReplicaService] (extensible)

// Factory per selecció
ReplicaServiceFactory.getService(source, target) → ReplicaService instance
```

**Avantatges del Replica Service Factory:**
- **Selecció intel·ligent**: Automàtica segons tipus de calendaris
- **Compatibilitat 100%**: EstudiReplicaService manté comportament exacte per FP/BTX
- **Optimització per "Altre"**: GenericReplicaService preserva agrupacions i redueix storage
- **Transparència per ReplicaManager**: Interfície unificada regardless del servei seleccionat

### Avantatges del Factory Pattern
- **Consistència**: Objectes creats sempre segueixen les mateixes regles
- **Configuració automàtica**: Menys errors d'usuari
- **Extensibilitat**: Fàcil afegir nous tipus i algoritmes
- **Encapsulació de lògica complexa**: Factory oculta detalls de selecció d'algoritmes
- **Testabilitat**: Cada factory es pot testejar de manera aïllada

## 4. Observer Pattern

### Descripció
Components s'actualitzen automàticament quan canvia l'estat, sense acoblament directe.

### Implementació

```javascript
// Pseudo-observació via re-renderització
class CalendarManager {
    completeCalendarSave() {
        // 1. Actualitzar estat
        storageManager.saveToStorage();
        
        // 2. Notificar canvis (pseudo-observer)
        this.updateUI();
    }
    
    updateUI() {
        // Re-renderitzar tots els components afectats
        panelsRenderer.renderSavedCalendars();
        panelsRenderer.renderCategories();
        viewManager.renderCurrentView();
    }
}

// Re-renderització automàtica després de canvis d'estat
class EventManager {
    completeEventSave() {
        storageManager.saveToStorage();           // Persistir canvis
        viewManager.renderCurrentView();          // Actualitzar vista principal
        panelsRenderer.renderCategories();       // Actualitzar categories si cal
        modalRenderer.closeModal('eventModal');  // Tancar modal
    }
}
```

### Patró Observer Implementat

**State Changes → UI Updates**
- Cada canvi d'estat desencadena re-renderització
- Components específics s'actualitzen segons el tipus de canvi
- No hi ha subscripcions explícites, però sí comunicació reactiva

**Event Flow Observer**
- Bootstrap escolta tots els events DOM
- Delega a managers segons l'acció
- Managers notifiquen canvis via re-renderització

### Beneficis
- **Reactivitat**: UI sempre sincronitzada amb estat
- **Desacoblament**: Components no es coneixen directament
- **Consistència**: Actualitzacions automàtiques garantides

## 5. Strategy Pattern

### Descripció
Diferents algoritmes per a la mateixa tasca, especialment per tipus de calendaris i formats d'exportació.

### Implementació

```javascript
// Estratègies per tipus de calendaris
class CalendarManager {
    async addCalendar() {
        const selectedType = document.getElementById('studyType').value;
        
        // Strategy selection
        let calendarData;
        if (selectedType === 'FP') {
            calendarData = await this.processFPCalendar();     // Strategy A
        } else if (selectedType === 'BTX') {
            calendarData = await this.processBTXCalendar();    // Strategy B
        } else if (selectedType === 'Altre') {
            calendarData = this.processAltreCalendar();        // Strategy C
        }
        
        // Common processing
        this.createCalendarData(/* ... */);
    }
}

// Estratègies d'exportació
class JsonExporter {
    exportCalendar(calendarId) {
        const jsonContent = this.generateJsonContent(calendar);
        this.downloadJsonFile(jsonContent, calendar.name);
    }
}

class IcsExporter {
    exportCalendar(calendarId) {
        const icsContent = this.generateIcsContent(calendar);
        this.downloadIcsFile(icsContent, calendar.name);
    }
}
```

### Estratègies Implementades

**Calendar Type Strategies**
- **FP Strategy**: Configuració automàtica des de `fp-semestre.json`
- **BTX Strategy**: Configuració des de `btx-semestre.json`
- **Altre Strategy**: Configuració manual completa

**Export Strategies**
- **JSON Strategy**: Format nadiu de l'aplicació
- **ICS Strategy**: Format estàndard iCalendar
- **HTML Strategy**: Visualització web estàtica

**Validation Strategies**
- **Date Validation**: Diferents regles segons context
- **Event Validation**: Validacions específiques per tipus d'event
- **Calendar Range Validation**: Restriccions per tipus de calendari

### Extensibilitat
```javascript
// Fàcil afegir noves estratègies
class NewCalendarTypeManager extends CalendarManager {
    processCustomTypeCalendar() {
        // Nova estratègia per tipus personalitzat
        return {
            type: 'CUSTOM',
            // ... configuració específica
        };
    }
}
```

## 6. Command Pattern

### Descripció
Encapsulació d'accions d'usuari com a objectes, facilitant l'extensió i el debugging.

### Implementació

```javascript
class Bootstrap {
    handleClick(event) {
        const target = event.target.closest('[data-action]');
        if (!target) return;
        
        const action = target.dataset.action;
        
        // Command dispatch
        switch (action) {
            case 'add-calendar': 
                this.executeCommand(new AddCalendarCommand());
                break;
            case 'delete-event': 
                this.executeCommand(new DeleteEventCommand(target.dataset));
                break;
            case 'toggle-theme': 
                this.executeCommand(new ToggleThemeCommand());
                break;
        }
    }
    
    executeCommand(command) {
        try {
            command.execute();
        } catch (error) {
            console.error('[Command Error]', error);
            uiHelper.showMessage('Error executant acció', 'error');
        }
    }
}
```

### Commands Implementats

**Calendar Commands**
- `AddCalendarCommand`: Crear nou calendari
- `DeleteCalendarCommand`: Eliminar calendari amb confirmació
- `SwitchCalendarCommand`: Canviar calendari actiu

**Event Commands**
- `AddEventCommand`: Crear esdeveniment
- `EditEventCommand`: Modificar esdeveniment existent
- `DeleteEventCommand`: Eliminar esdeveniment
- `MoveEventCommand`: Drag & drop d'esdeveniments

**UI Commands**
- `ToggleThemeCommand`: Canviar tema clar/fosc
- `OpenModalCommand`: Obrir modals específics
- `CloseModalCommand`: Tancar modals

### Avantatges
- **Extensibilitat**: Fàcil afegir noves accions
- **Debugging**: Totes les accions passes per un punt central
- **Consistència**: Gestió d'errors unificada
- **Testabilitat**: Commands aïllats i testejables

## 7. Delegation Pattern (Event Handling)

### Descripció
Un sol listener per tots els events DOM, delegant segons l'element i acció.

### Implementació

```javascript
class Bootstrap {
    initializeEventListeners() {
        // Un sol listener per tota l'aplicació
        document.addEventListener('click', (e) => this.handleClick(e));
        document.addEventListener('change', (e) => this.handleChange(e));
        document.addEventListener('input', (e) => this.handleInput(e));
    }
    
    handleClick(event) {
        const target = event.target.closest('[data-action]');
        if (!target) return;
        
        // Delegation basada en data-action
        const action = target.dataset.action;
        
        switch (action) {
            case 'add-event':
                modalRenderer.openEventModal(null, target.dataset.date);
                break;
            case 'edit-event':
                const eventId = target.closest('.event').dataset.eventId;
                modalRenderer.openEventModal(eventId);
                break;
            // ... més accions
        }
    }
}
```

### Beneficis del Delegation
- **Rendiment**: Un sol listener vs centenars
- **Contingut dinàmic**: Funciona amb elements creats posteriorment
- **Mantenibilitat**: Gestió centralitzada d'events
- **Debugging**: Punt únic per interceptar events

## 8. Module Pattern

### Descripció
Organització del codi en mòduls independents amb responsabilitats específiques.

### Estructura de Mòduls

```
js/
├── managers/           # Business Logic Modules
│   ├── CalendarManager.js
│   ├── EventManager.js
│   └── CategoryManager.js
├── state/             # State Management Modules
│   ├── AppStateManager.js
│   └── StorageManager.js
├── ui/                # Presentation Modules
│   ├── ModalRenderer.js
│   └── PanelsRenderer.js
├── helpers/           # Utility Modules
│   ├── DateHelper.js
│   └── UIHelper.js
└── services/          # Shared Logic Modules
    ├── CategoryService.js
    ├── DateValidationService.js
    └── replica/           # Replica Services with Factory Pattern
        ├── ReplicaService.js
        ├── EstudiReplicaService.js
        ├── GenericReplicaService.js
        └── ReplicaServiceFactory.js
```

### Beneficis de Modularització
- **Separació de concerns**: Cada fitxer té una responsabilitat
- **Reutilització**: Modules compartits entre components
- **Testing**: Mòduls aïllats fàcils de testejar
- **Mantenibilitat**: Canvis localitzats

## Integració de Patrons

### Flux Complet d'Interacció

```
User Action (DOM Event)
          ↓
Event Delegation (Bootstrap)
          ↓
Command Pattern (Action Routing)
          ↓
Manager Pattern (Business Logic)
          ↓
Factory Pattern (Object/Algorithm Creation)
          ↓
Singleton Pattern (State Update)
          ↓
Observer Pattern (UI Notification)
          ↓
Strategy Pattern (Rendering)
          ↓
DOM Update
```

### Exemple: Crear Nou Esdeveniment

1. **User click** → Event Delegation captura
2. **Command dispatch** → AddEventCommand
3. **Manager execution** → EventManager.saveEvent()
4. **Factory creation** → Nou objecte event
5. **Singleton update** → AppStateManager.calendars
6. **Observer notification** → Re-renderització automàtica
7. **Strategy execution** → Renderització segons vista actual

### Exemple: Executar Replicació entre Calendaris ⭐ **NOU**

1. **User click "Replicar"** → Event Delegation captura
2. **Command dispatch** → ExecuteReplicationCommand
3. **Manager execution** → ReplicaManager.executeReplication()
4. **Factory selection** → ReplicaServiceFactory.getService(source, target)
   - Analitza tipus de calendaris (FP/BTX vs "Altre")
   - Retorna EstudiReplicaService o GenericReplicaService
5. **Algorithm execution** → service.replicate(sourceCalendar, targetCalendar)
   - EstudiReplicaService: Proporcional amb restriccions acadèmiques
   - GenericReplicaService: Preservació d'agrupacions per calendaris flexibles
6. **Singleton update** → AppStateManager.calendars[targetId].events += result.placed
7. **Observer notification** → Re-renderització vista, panells i esdeveniments no ubicats
8. **Strategy execution** → Actualització específica per vista activa

Aquest flux demostra com el nou **Factory Pattern avançat** per services de replicació s'integra perfectament amb l'arquitectura existent, proporcionant selecció automàtica d'algoritmes optimitzats sense trencar la consistència del sistema.

Aquesta integració de patrons proporciona una arquitectura robusta, mantenible i extensible per l'aplicació Calendari IOC, amb especial èmfasi en l'escalabilitat dels algoritmes de replicació.

---
[← Arquitectura General](Arquitectura-General) | [Flux de Dades →](Flux-de-Dades-i-Control)