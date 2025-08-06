# Punts d'Extensió Crítics

Aquesta guia identifica els punts clau del sistema on els desenvolupadors poden afegir noves funcionalitats o modificar comportaments existents, proporcionant una roadmap per a l'extensió segura i eficient del Calendari IOC.

## Visió General

Els **punts d'extensió crítics** són llocs específics del codi on es pot afegir nova funcionalitat sense trencar l'arquitectura existent. Aquesta guia organitza aquests punts per tipus de funcionalitat i proporciona exemples pràctics.

### Principis d'Extensió

**Compatibilitat**: Mantenir retrocompatibilitat amb funcionalitat existent
**Escalabilitat**: Assegurar que les extensions no degradin el rendiment
**Consistència**: Seguir patrons arquitectònics existents
**Testabilitat**: Facilitar la verificació de noves funcionalitats

## Extensions de Managers

### CalendarManager Extensions

#### Punt d'Extensió: Nous Tipus de Calendari

**Ubicació**: `js/managers/CalendarManager.js:initializeCalendar()`

```javascript
// Extensió actual
initializeCalendar(type, name) {
    switch(type) {
        case 'FP':
            return this.initializeFPCalendar(name);
        case 'BTX':
            return this.initializeBTXCalendar(name);
        case 'ALTRO':
            return this.initializeOtherCalendar(name);
        // PUNT D'EXTENSIÓ: Afegir nous tipus aquí
        case 'CUSTOM_TYPE':
            return this.initializeCustomTypeCalendar(name);
        default:
            return this.initializeOtherCalendar(name);
    }
}

// Exemple d'extensió
initializeCustomTypeCalendar(name) {
    const calendar = {
        id: idHelper.generateNextCalendarId(),
        name: name,
        type: 'CUSTOM_TYPE',
        events: [],
        categories: this.loadCustomCategories(),
        // Configuració específica del tipus personalitzat
        customConfig: {
            specialFeatures: true,
            customValidation: true
        }
    };
    
    return calendar;
}
```

#### Punt d'Extensió: Validació Personalitzada

**Ubicació**: `js/managers/CalendarManager.js:validateCalendar()`

```javascript
// Extensió de validació
validateCalendar(calendar) {
    // Validacions base existents
    if (!this.baseValidation(calendar)) return false;
    
    // PUNT D'EXTENSIÓ: Validacions específiques per tipus
    return this.typeSpecificValidation(calendar);
}

typeSpecificValidation(calendar) {
    switch(calendar.type) {
        case 'CUSTOM_TYPE':
            return this.validateCustomType(calendar);
        default:
            return true;
    }
}
```

### EventManager Extensions

#### Punt d'Extensió: Nous Tipus d'Esdeveniments

**Ubicació**: `js/managers/EventManager.js:createEvent()`

```javascript
// PUNT D'EXTENSIÓ: Afegir nous tipus d'esdeveniments
createEvent(eventData) {
    const event = {
        ...this.createBaseEvent(eventData),
        // Extensió per tipus específics
        ...this.createTypeSpecificProperties(eventData)
    };
    
    return this.applyEventValidation(event);
}

createTypeSpecificProperties(eventData) {
    switch(eventData.type) {
        case 'RECURRING':
            return this.createRecurringProperties(eventData);
        case 'TIMED':
            return this.createTimedProperties(eventData);
        case 'TASK':
            return this.createTaskProperties(eventData);
        default:
            return {};
    }
}
```

#### Punt d'Extensió: Algoritmes de Validació

**Ubicació**: `js/managers/EventManager.js:validateEvent()`

```javascript
// PUNT D'EXTENSIÓ: Validators personalitzats
validateEvent(event) {
    const validators = [
        this.validateBasicFields,
        this.validateDates,
        this.validateCategory,
        // Afegir nous validators aquí
        this.validateCustomFields,
        this.validateBusinessRules
    ];
    
    return validators.every(validator => validator(event));
}
```

### CategoryManager Extensions

#### Punt d'Extensió: Catàleg de Categories Personalitzat

**Ubicació**: `js/managers/CategoryManager.js:loadGlobalCatalog()`

```javascript
// PUNT D'EXTENSIÓ: Categories dinàmiques o externes
loadGlobalCatalog() {
    const catalog = {
        ...this.loadDefaultCatalog(),
        ...this.loadUserCategories(),
        // Extensió per fonts externes
        ...this.loadExternalCategories(),
        ...this.loadDynamicCategories()
    };
    
    return this.deduplicateCategories(catalog);
}

loadExternalCategories() {
    // Exemple: carregar categories des d'API externa
    // return await this.fetchFromAPI('/categories');
    return {};
}
```

## Extensions d'UI

### ModalRenderer Extensions

#### Punt d'Extensió: Nous Tipus de Modals

**Ubicació**: `js/ui/ModalRenderer.js:showModal()`

```javascript
// PUNT D'EXTENSIÓ: Nous modals personalitzats
showModal(type, data = {}) {
    switch(type) {
        case 'event':
            return this.showEventModal(data);
        case 'calendar':
            return this.showCalendarModal(data);
        case 'category':
            return this.showCategoryModal(data);
        // Afegir nous tipus de modals
        case 'custom-form':
            return this.showCustomFormModal(data);
        case 'advanced-settings':
            return this.showAdvancedSettingsModal(data);
        default:
            throw new Error(`Modal type ${type} not supported`);
    }
}
```

#### Punt d'Extensió: Validació de Formularis

**Ubicació**: `js/ui/ModalRenderer.js:validateForm()`

```javascript
// PUNT D'EXTENSIÓ: Validators de camp personalitzats
validateForm(formType, formData) {
    const validators = this.getValidatorsForForm(formType);
    
    return validators.every(validator => {
        try {
            return validator(formData);
        } catch (error) {
            console.error(`Validation error: ${error.message}`);
            return false;
        }
    });
}

getValidatorsForForm(formType) {
    const baseValidators = this.getBaseValidators();
    const customValidators = this.getCustomValidators(formType);
    
    return [...baseValidators, ...customValidators];
}
```

### ViewRenderer Extensions

#### Punt d'Extensió: Noves Vistes de Calendari

**Ubicació**: `js/ui/views/` (nou fitxer)

```javascript
// Exemple: CustomViewRenderer.js
class CustomViewRenderer extends CalendarRenderer {
    constructor() {
        super();
        this.viewType = 'custom';
        this.supportedFeatures = ['drag-drop', 'multi-select'];
    }
    
    // PUNT D'EXTENSIÓ: Implementar mètodes base
    render(container, calendar, events) {
        // Implementació específica de la vista
        const customHTML = this.generateCustomHTML(calendar, events);
        container.innerHTML = customHTML;
        this.attachCustomEventListeners(container);
    }
    
    generateCustomHTML(calendar, events) {
        // Lògica de renderització personalitzada
        return `<div class="custom-view">...</div>`;
    }
}

// Registrar nova vista
viewManager.registerView('custom', new CustomViewRenderer());
```

#### Punt d'Extensió: Renderització Condicional

**Ubicació**: `js/ui/views/CalendarRenderer.js:renderEvent()`

```javascript
// PUNT D'EXTENSIÓ: Renderització personalitzada per tipus d'esdeveniment
renderEvent(event, context) {
    const renderer = this.getEventRenderer(event.type || 'default');
    return renderer(event, context);
}

getEventRenderer(eventType) {
    const renderers = {
        'default': this.renderDefaultEvent,
        'recurring': this.renderRecurringEvent,
        'timed': this.renderTimedEvent,
        // Afegir nous renderers
        'custom': this.renderCustomEvent,
        'highlighted': this.renderHighlightedEvent
    };
    
    return renderers[eventType] || renderers['default'];
}
```

## Extensions de Services

### CategoryService Extensions

#### Punt d'Extensió: Algoritmes de Sincronització

**Ubicació**: `js/services/CategoryService.js:synchronizeWithGlobal()`

```javascript
// PUNT D'EXTENSIÓ: Estratègies de sincronització personalitzades
synchronizeWithGlobal(localCategories) {
    const strategy = this.getSyncStrategy();
    return strategy.synchronize(localCategories, this.globalCatalog);
}

getSyncStrategy() {
    const strategies = {
        'merge': new MergeSyncStrategy(),
        'overwrite': new OverwriteSyncStrategy(),
        'smart': new SmartSyncStrategy(),
        // Afegir noves estratègies
        'custom': new CustomSyncStrategy()
    };
    
    const selectedStrategy = this.config.syncStrategy || 'smart';
    return strategies[selectedStrategy];
}
```

### Services de Replicació Extensions

#### Punt d'Extensió: Nous Algoritmes de Replicació

**Ubicació**: `js/services/replica/` (nou fitxer)

```javascript
// PUNT D'EXTENSIÓ: Crear nou algoritme heretant de ReplicaService
class CustomReplicaService extends ReplicaService {
    constructor() {
        super();
        this.algorithmName = 'custom';
        this.supportedCalendarTypes = ['CUSTOM_TYPE'];
    }
    
    // Implementar mètode abstracte de replicació
    replicate(sourceCalendar, targetCalendar) {
        // Usar mètodes heretats de la classe base
        const espaiUtilOrigen = this.analyzeWorkableSpace(sourceCalendar);
        const espaiUtilDesti = this.analyzeWorkableSpace(targetCalendar);
        
        // Implementar lògica personalitzada
        const result = this.executeCustomAlgorithm(
            sourceCalendar.events,
            espaiUtilOrigen,
            espaiUtilDesti
        );
        
        return {
            placed: result.placedEvents.map(item => ({
                event: {
                    ...item.event,
                    replicationConfidence: this.calculateProportionalConfidence(
                        item.originalIndex,
                        item.idealIndex, 
                        item.finalIndex,
                        item.factor
                    )
                },
                newDate: item.newDate,
                sourceCalendar: sourceCalendar
            })),
            unplaced: result.unplacedEvents.map(event => ({
                event: { ...event, replicationConfidence: 0 },
                sourceCalendar,
                reason: "Algoritme personalitzat no pot ubicar esdeveniment"
            }))
        };
    }
    
    executeCustomAlgorithm(events, espaiOrigen, espaiDesti) {
        // Implementació de l'algoritme personalitzat
        const placedEvents = [];
        const unplacedEvents = [];
        
        // Lògica específica del nou algoritme
        events.forEach((event, index) => {
            if (this.customPlacementLogic(event, espaiDesti)) {
                placedEvents.push({
                    event: event,
                    newDate: this.calculateCustomPosition(event, espaiDesti),
                    originalIndex: index,
                    idealIndex: index,
                    finalIndex: index,
                    factor: 1.0
                });
            } else {
                unplacedEvents.push(event);
            }
        });
        
        return { placedEvents, unplacedEvents };
    }
    
    customPlacementLogic(event, espaiDesti) {
        // Lògica personalitzada per decidir si es pot col·locar l'esdeveniment
        return true; // Exemple simplificat
    }
    
    calculateCustomPosition(event, espaiDesti) {
        // Lògica personalitzada per calcular nova posició
        return espaiDesti[0]; // Exemple simplificat
    }
}
```

#### Punt d'Extensió: Registre al Factory Pattern

**Ubicació**: `js/services/replica/ReplicaServiceFactory.js:getService()`

```javascript
// PUNT D'EXTENSIÓ: Modificar factory per suportar nous serveis
static getService(sourceCalendar, targetCalendar) {
    const sourceType = sourceCalendar.type || 'Altre';
    const targetType = targetCalendar.type || 'Altre';
    
    // Afegir nova condició per nou tipus de servei
    if (sourceType === 'CUSTOM_TYPE' || targetType === 'CUSTOM_TYPE') {
        console.log(`[REPLICA_FACTORY] Calendari personalitzat detectat: usant CustomReplicaService`);
        return new CustomReplicaService();
    }
    
    // Si qualsevol dels calendaris és "Altre", usar GenericReplicaService
    if (sourceType === 'Altre' || targetType === 'Altre') {
        console.log(`[REPLICA_FACTORY] Calendari "Altre" detectat: usant GenericReplicaService`);
        return new GenericReplicaService();
    } 
    
    // Si ambdós són calendaris d'estudi (FP, BTX), usar EstudiReplicaService
    console.log(`[REPLICA_FACTORY] Calendaris d'estudi detectats: usant EstudiReplicaService`);
    return new EstudiReplicaService();
}
```

#### Punt d'Extensió: Extensió de Funcionalitats Base

**Ubicació**: `js/services/replica/ReplicaService.js` (classe base)

```javascript
// PUNT D'EXTENSIÓ: Afegir nous mètodes comuns a la classe base
class ReplicaService {
    // Mètodes existents...
    
    // Nou mètode comú per anàlisi avançat d'espai
    analyzeAdvancedWorkableSpace(calendar, options = {}) {
        const basicSpace = this.analyzeWorkableSpace(calendar);
        
        if (options.includeHolidays) {
            return this.includeHolidaysInSpace(basicSpace, calendar);
        }
        
        if (options.customFilter) {
            return basicSpace.filter(date => options.customFilter(date, calendar));
        }
        
        return basicSpace;
    }
    
    // Nou mètode per validació avançada de compatibilitat
    validateAdvancedCompatibility(sourceCalendar, targetCalendar) {
        const basicValidation = this.validateBasicCompatibility(sourceCalendar, targetCalendar);
        
        // Validacions adicionals
        const hasConflictingCategories = this.checkCategoryConflicts(sourceCalendar, targetCalendar);
        const hasTemporalOverlap = this.checkTemporalOverlap(sourceCalendar, targetCalendar);
        
        return {
            isCompatible: basicValidation && !hasConflictingCategories && hasTemporalOverlap,
            warnings: [
                ...(hasConflictingCategories ? ['Categories conflictives detectades'] : []),
                ...(hasTemporalOverlap ? [] : ['Sense superposició temporal'])
            ]
        };
    }
    
    // Nou mètode per mètriques de replicació
    calculateReplicationMetrics(result) {
        const totalEvents = result.placed.length + result.unplaced.length;
        const successRate = totalEvents > 0 ? (result.placed.length / totalEvents) * 100 : 0;
        const averageConfidence = result.placed.length > 0 
            ? result.placed.reduce((sum, item) => sum + item.event.replicationConfidence, 0) / result.placed.length
            : 0;
            
        return {
            totalEvents,
            placedEvents: result.placed.length,
            unplacedEvents: result.unplaced.length,
            successRate: Math.round(successRate * 100) / 100,
            averageConfidence: Math.round(averageConfidence * 100) / 100,
            qualityScore: (successRate * 0.7) + (averageConfidence * 0.3)
        };
    }
}
```

#### Punt d'Extensió: Configuració Personalitzada per Algoritmes

**Ubicació**: `js/services/replica/` (nou fitxer ConfigurableReplicaService.js)

```javascript
// PUNT D'EXTENSIÓ: Servei configurable per algoritmes personalitzats
class ConfigurableReplicaService extends ReplicaService {
    constructor(config = {}) {
        super();
        this.config = {
            preserveGroupings: true,
            allowWeekends: false,
            maxEventsPerDay: 1,
            confidenceThreshold: 70,
            distributionStrategy: 'proportional',
            ...config
        };
    }
    
    replicate(sourceCalendar, targetCalendar) {
        // Aplicar configuració a l'algoritme
        if (this.config.preserveGroupings) {
            return this.replicateWithGroupings(sourceCalendar, targetCalendar);
        } else {
            return this.replicateIndividually(sourceCalendar, targetCalendar);
        }
    }
    
    replicateWithGroupings(sourceCalendar, targetCalendar) {
        // Implementació que preserva agrupacions com GenericReplicaService
        const genericService = new GenericReplicaService();
        return genericService.replicate(sourceCalendar, targetCalendar);
    }
    
    replicateIndividually(sourceCalendar, targetCalendar) {
        // Implementació individual com EstudiReplicaService
        const estudiService = new EstudiReplicaService();
        return estudiService.replicate(sourceCalendar, targetCalendar);
    }
}

// Registre al Factory amb configuració personalitzada
// ReplicaServiceFactory.registerCustomService('configurable', ConfigurableReplicaService);
```

## Extensions d'Export/Import

### Exporters Extensions

#### Punt d'Extensió: Nous Formats d'Exportació

**Ubicació**: `js/export/` (nous fitxers)

```javascript
// Exemple: PdfExporter.js
class PdfExporter {
    constructor() {
        this.format = 'pdf';
        this.mimeType = 'application/pdf';
    }
    
    // PUNT D'EXTENSIÓ: Implementar interfície estàndard
    async export(calendar, options = {}) {
        const pdfData = await this.generatePDF(calendar, options);
        return this.createDownloadBlob(pdfData);
    }
    
    async generatePDF(calendar, options) {
        // Implementació de generació PDF
        // Utilitzar llibreria com jsPDF o similar
    }
}

// Registrar nou exporter
exportManager.registerExporter('pdf', new PdfExporter());
```

#### Punt d'Extensió: Configuració d'Exportació

**Ubicació**: `js/export/JsonExporter.js:export()`

```javascript
// PUNT D'EXTENSIÓ: Filtres i transformacions personalitzades
export(calendar, options = {}) {
    let data = this.prepareBaseData(calendar);
    
    // Aplicar filtres personalitzats
    data = this.applyFilters(data, options.filters || []);
    
    // Aplicar transformacions
    data = this.applyTransformations(data, options.transformations || []);
    
    return this.formatForExport(data, options.format || 'standard');
}

applyFilters(data, filters) {
    return filters.reduce((filteredData, filter) => {
        return filter.apply(filteredData);
    }, data);
}
```

### Importers Extensions

#### Punt d'Extensió: Nous Formats d'Importació

**Ubicació**: `js/import/` (nous fitxers)

```javascript
// Exemple: CsvImporter.js
class CsvImporter {
    constructor() {
        this.supportedFormat = 'csv';
        this.requiredFields = ['title', 'date'];
    }
    
    // PUNT D'EXTENSIÓ: Implementar interfície d'importació
    async import(fileContent, options = {}) {
        const parsedData = this.parseCSV(fileContent);
        const validatedData = this.validateData(parsedData);
        return this.convertToEvents(validatedData, options);
    }
    
    parseCSV(content) {
        // Implementació de parsing CSV
    }
    
    convertToEvents(data, options) {
        return data.map(row => this.createEventFromRow(row, options));
    }
}
```

## Extensions de Configuration

### SemesterConfig Extensions

#### Punt d'Extensió: Configuració Dinàmica

**Ubicació**: `js/config/SemesterConfig.js:loadConfig()`

```javascript
// PUNT D'EXTENSIÓ: Fonts de configuració múltiples
async loadConfig(calendarType) {
    const configs = await Promise.all([
        this.loadStaticConfig(calendarType),
        this.loadDynamicConfig(calendarType),
        this.loadUserConfig(calendarType),
        // Afegir noves fonts
        this.loadRemoteConfig(calendarType),
        this.loadCachedConfig(calendarType)
    ]);
    
    return this.mergeConfigs(configs);
}

async loadRemoteConfig(calendarType) {
    try {
        // Exemple: carregar configuració des de servidor
        const response = await fetch(`/api/config/${calendarType}`);
        return await response.json();
    } catch (error) {
        console.warn('Remote config not available', error);
        return {};
    }
}
```

#### Punt d'Extensió: Validació de Configuració

**Ubicació**: `js/config/SemesterConfig.js:validateConfig()`

```javascript
// PUNT D'EXTENSIÓ: Validators de configuració personalitzats
validateConfig(config) {
    const validators = [
        this.validateBasicStructure,
        this.validateDates,
        this.validateCategories,
        this.validateEvents,
        // Afegir nous validators
        this.validateCustomFields,
        this.validateBusinessRules,
        this.validateIntegrations
    ];
    
    return validators.every(validator => {
        try {
            return validator(config);
        } catch (error) {
            console.error(`Config validation error: ${error.message}`);
            return false;
        }
    });
}
```

## Extensions de State Management

### AppStateManager Extensions

#### Punt d'Extensió: Nous Tipus d'Estat

**Ubicació**: `js/state/AppStateManager.js:constructor()`

```javascript
// PUNT D'EXTENSIÓ: Ampliació de l'estat global
constructor() {
    this.state = {
        // Estat existent
        calendars: {},
        currentCalendar: null,
        currentView: 'month',
        categories: {},
        // Nou estat personalitzat
        customFeatures: {},
        userPreferences: {},
        integrations: {},
        analytics: {
            usage: {},
            performance: {}
        }
    };
}
```

#### Punt d'Extensió: Middleware d'Estat

**Ubicació**: `js/state/AppStateManager.js:updateState()`

```javascript
// PUNT D'EXTENSIÓ: Middleware per a canvis d'estat
updateState(path, value) {
    const oldState = this.getState(path);
    
    // Aplicar middleware abans del canvi
    const processedValue = this.applyMiddleware('beforeUpdate', {
        path,
        oldValue: oldState,
        newValue: value
    });
    
    // Actualitzar estat
    this.setState(path, processedValue);
    
    // Aplicar middleware després del canvi
    this.applyMiddleware('afterUpdate', {
        path,
        oldValue: oldState,
        newValue: processedValue
    });
}

applyMiddleware(hook, data) {
    return this.middleware[hook].reduce((result, middleware) => {
        return middleware(result);
    }, data.newValue);
}
```

## Extensions de Helpers

### Nous Helpers Personalitzats

#### Punt d'Extensió: Helper Factory

**Ubicació**: `js/helpers/` (nou fitxer HelperFactory.js)

```javascript
// PUNT D'EXTENSIÓ: Sistema de registre de helpers
class HelperFactory {
    constructor() {
        this.helpers = new Map();
        this.registerDefaultHelpers();
    }
    
    registerHelper(name, helperClass) {
        this.helpers.set(name, helperClass);
    }
    
    getHelper(name) {
        const HelperClass = this.helpers.get(name);
        if (!HelperClass) {
            throw new Error(`Helper ${name} not found`);
        }
        return new HelperClass();
    }
    
    // Exemple d'ús
    static create(type, ...args) {
        const factory = new HelperFactory();
        return factory.getHelper(type, ...args);
    }
}

// Registrar helpers personalitzats
const helperFactory = new HelperFactory();
helperFactory.registerHelper('analytics', AnalyticsHelper);
helperFactory.registerHelper('integration', IntegrationHelper);
```

## Extensions de Testing

### Test Framework Integration

#### Punt d'Extensió: Test Utilities

**Ubicació**: `js/testing/` (nova carpeta)

```javascript
// Exemple: TestHelpers.js
class TestHelpers {
    // PUNT D'EXTENSIÓ: Utilities per testing
    static createMockCalendar(options = {}) {
        return {
            id: 'test-calendar-1',
            name: 'Test Calendar',
            type: 'ALTRO',
            events: [],
            categories: [],
            ...options
        };
    }
    
    static createMockEvent(options = {}) {
        return {
            id: 'test-event-1',
            title: 'Test Event',
            date: '2025-01-01',
            categoryId: 'test-category',
            ...options
        };
    }
    
    static mockLocalStorage() {
        const storage = {};
        return {
            getItem: key => storage[key] || null,
            setItem: (key, value) => storage[key] = value,
            removeItem: key => delete storage[key],
            clear: () => Object.keys(storage).forEach(key => delete storage[key])
        };
    }
}
```

## Patterns per Extensions Segures

### 1. Plugin Pattern

```javascript
// Sistema de plugins per extensió modular
class PluginManager {
    constructor() {
        this.plugins = new Map();
        this.hooks = new Map();
    }
    
    registerPlugin(name, plugin) {
        this.plugins.set(name, plugin);
        this.registerHooks(plugin.hooks || {});
    }
    
    executeHook(hookName, data) {
        const handlers = this.hooks.get(hookName) || [];
        return handlers.reduce((result, handler) => handler(result), data);
    }
}
```

### 2. Observer Pattern

```javascript
// Sistema d'esdeveniments per comunicació entre components
class EventBus {
    constructor() {
        this.events = new Map();
    }
    
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
    }
    
    emit(event, data) {
        const callbacks = this.events.get(event) || [];
        callbacks.forEach(callback => callback(data));
    }
}
```

### 3. Strategy Pattern

```javascript
// Estratègies intercanviables per funcionalitat variable
class StrategyManager {
    constructor() {
        this.strategies = new Map();
        this.defaultStrategy = null;
    }
    
    registerStrategy(name, strategy) {
        this.strategies.set(name, strategy);
    }
    
    execute(strategyName, ...args) {
        const strategy = this.strategies.get(strategyName) || this.defaultStrategy;
        if (!strategy) {
            throw new Error(`Strategy ${strategyName} not found`);
        }
        return strategy.execute(...args);
    }
}
```

## Bones Pràctiques per Extensions

### Compatibilitat Backward

```javascript
// Mantenir compatibilitat amb versions anteriors
class BackwardCompatibility {
    static wrapDeprecatedMethod(oldMethod, newMethod, deprecationMessage) {
        return function(...args) {
            console.warn(`DEPRECATED: ${deprecationMessage}`);
            return newMethod.apply(this, args);
        };
    }
    
    static migrateData(oldData, migrationRules) {
        return migrationRules.reduce((data, rule) => rule(data), oldData);
    }
}
```

### Validació d'Extensions

```javascript
// Validar extensions abans d'aplicar-les
class ExtensionValidator {
    static validateInterface(extension, requiredMethods) {
        return requiredMethods.every(method => 
            typeof extension[method] === 'function'
        );
    }
    
    static validateDependencies(extension, availableDependencies) {
        const required = extension.dependencies || [];
        return required.every(dep => availableDependencies.includes(dep));
    }
}
```

### Performance Monitoring

```javascript
// Monitorització de rendiment per extensions
class PerformanceMonitor {
    static wrapWithTiming(fn, name) {
        return function(...args) {
            const start = performance.now();
            const result = fn.apply(this, args);
            const end = performance.now();
            console.log(`${name} took ${end - start} milliseconds`);
            return result;
        };
    }
}
```

Aquests punts d'extensió proporcionen una base sòlida per ampliar el Calendari IOC de manera segura i escalable, mantenint la coherència arquitectònica i facilitant el manteniment futur del sistema.

---
[← Estructura del Codi](Estructura-del-Codi) | [Testing i Debugging →](Testing-i-Debugging)