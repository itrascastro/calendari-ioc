# Testing i Debugging

Aquesta guia proporciona estratègies, eines i metodologies per provar i depurar el Calendari IOC de manera efectiva, cobrint des de proves manuals fins tècniques avançades de debugging.

## Visió General

El **testing i debugging** del Calendari IOC requereix un enfocament multicapa que cobreixi funcionalitat, rendiment, compatibilitat i experiència d'usuari, adaptant-se a l'arquitectura basada en JavaScript vanilla i localStorage.

### Nivells de Testing

**Funcional**: Verificació que les funcionalitats funcionen segons especificacions
**Integració**: Comprovació que components treballin correctament junts
**Rendiment**: Mesura de temps de resposta i ús de recursos
**Compatibilitat**: Assegurar funcionament en diferents navegadors
**Usabilitat**: Validació de l'experiència d'usuari

## Testing Manual

### Casos de Prova Bàsics

#### Gestió de Calendaris

**CP001: Creació de calendari FP**
1. Clicar "Nou calendari"
2. Seleccionar tipus "FP"
3. Introduir nom "Test FP"
4. Verificar creació amb esdeveniments del sistema
5. Comprovar categories per defecte (IOC, FESTIU, PAF)

**Resultat esperat**: Calendari creat amb configuració FP completa

**CP002: Creació de calendari BTX**
1. Clicar "Nou calendari"
2. Seleccionar tipus "BTX"
3. Introduir nom "Test BTX"
4. Verificar esdeveniments del sistema
5. Comprovar categories (IOC, FESTIU, EXAMENS)

**Resultat esperat**: Calendari creat amb configuració BTX completa

**CP003: Eliminació de calendari**
1. Seleccionar calendari existent
2. Clicar icona d'eliminació
3. Confirmar eliminació al modal
4. Verificar que desapareix de la llista
5. Comprovar que dades no persisteixen

**Resultat esperat**: Calendari eliminat completament

#### Gestió d'Esdeveniments

**CP004: Creació d'esdeveniment**
1. Obrir modal "Nou esdeveniment"
2. Introduir títol, data, categoria
3. Guardar esdeveniment
4. Verificar aparició al calendari
5. Comprovar persistència (reload pàgina)

**Resultat esperat**: Esdeveniment creat i visible

**CP005: Edició d'esdeveniment**
1. Clicar esdeveniment existent
2. Modificar títol i categoria
3. Guardar canvis
4. Verificar actualització visual
5. Comprovar persistència

**Resultat esperat**: Canvis guardats correctament

**CP006: Drag & Drop d'esdeveniment**
1. Seleccionar esdeveniment
2. Arrossegar a nova data
3. Soltar esdeveniment
4. Verificar canvi de data
5. Comprovar persistència

**Resultat esperat**: Esdeveniment mogut a nova data

#### Sistema de Categories

**CP007: Creació de categoria**
1. Afegir nova categoria
2. Introduir nom i seleccionar color
3. Verificar aparició al panell
4. Crear esdeveniment amb nova categoria
5. Comprovar sincronització amb catàleg global

**Resultat esperat**: Categoria creada i funcional

**CP008: Eliminació de categoria**
1. Intentar eliminar categoria del sistema
2. Verificar que no es pot eliminar
3. Eliminar categoria d'usuari
4. Confirmar eliminació
5. Verificar que esdeveniments associats canvien a categoria per defecte

**Resultat esperat**: Categories protegides i eliminació controlada

#### Replicació entre Calendaris

**CP009: Replicació d'esdeveniments**
1. Tenir múltiples calendaris
2. Seleccionar esdeveniments per replicar
3. Triar calendaris destí
4. Executar replicació
5. Verificar distribució proporcional

**Resultat esperat**: Esdeveniments replicats correctament

**CP010: Gestió d'esdeveniments no ubicats**
1. Replicar esdeveniments
2. Verificar panell d'esdeveniments no ubicats
3. Arrossegar esdeveniments al calendari
4. Comprovar eliminació del panell
5. Verificar persistència

**Resultat esperat**: Flux de no ubicats funcional

### Casos de Prova d'Integració

#### Import/Export

**CP011: Exportació JSON**
1. Crear calendari amb esdeveniments
2. Exportar a JSON
3. Verificar format del fitxer
4. Comprovar integritat de dades
5. Validar estructura JSON

**Resultat esperat**: Export JSON correcte

**CP012: Exportació ICS**
1. Exportar calendari a ICS
2. Importar fitxer en altra aplicació (Outlook, Google Calendar)
3. Verificar que esdeveniments apareixen correctament
4. Comprovar dates i categories

**Resultat esperat**: Fitxer ICS compatible

**CP013: Importació ICS**
1. Crear fitxer ICS extern
2. Importar al Calendari IOC
3. Verificar conversió d'esdeveniments
4. Comprovar creació de categories
5. Validar persistència

**Resultat esperat**: Import ICS funcional

#### Temes i Personalització

**CP014: Canvi de tema**
1. Canviar a tema fosc
2. Verificar que tots els components canvien
3. Tornar a tema clar
4. Comprovar persistència de preferència
5. Verificar contrast de colors

**Resultat esperat**: Canvi de tema complet i persistent

### Casos de Prova de Rendiment

#### Gestió de Grans Volums

**CP015: Calendari amb molts esdeveniments**
1. Crear 500+ esdeveniments
2. Verificar temps de càrrega
3. Provar navegació entre mesos
4. Comprovar responsivitat de la UI
5. Verificar límits de localStorage

**Resultat esperat**: Rendiment acceptable amb moltes dades

**CP016: Múltiples calendaris**
1. Crear 20+ calendaris
2. Verificar càrrega de la llista
3. Provar canvi entre calendaris
4. Comprovar gestió de memòria
5. Verificar persistència

**Resultat esperat**: Gestió eficient de múltiples calendaris

### Casos de Prova de Compatibilitat

#### Navegadors Diferents

**CP017: Chrome/Chromium**
- Funcionalitat completa
- localStorage disponible
- Drag & drop funcional
- Renderització correcta

**CP018: Firefox**
- Compatibilitat CSS
- APIs JavaScript
- Gestió d'esdeveniments
- Persistència de dades

**CP019: Safari**
- Limitacions de localStorage
- Compatibilitat de dates
- Renderització webkit
- APIs específiques

**CP020: Edge**
- Funcionalitat modern
- Compatibilitat CSS
- APIs estàndard
- Integració sistema

## Testing Automatitzat

### Framework de Testing

#### Configuració de Jest (Opcional)

```javascript
// jest.config.js
module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    collectCoverageFrom: [
        'js/**/*.js',
        '!js/Bootstrap.js'
    ]
};
```

#### Tests Unitaris

```javascript
// tests/helpers/DateHelper.test.js
describe('DateHelper', () => {
    let dateHelper;
    
    beforeEach(() => {
        dateHelper = new DateHelper();
    });
    
    test('formatDate formats dates correctly', () => {
        const date = new Date('2025-01-15');
        const formatted = dateHelper.formatDate(date, 'DD/MM/YYYY');
        expect(formatted).toBe('15/01/2025');
    });
    
    test('isWorkingDay identifies working days', () => {
        const monday = new Date('2025-01-13'); // Monday
        const saturday = new Date('2025-01-18'); // Saturday
        
        expect(dateHelper.isWorkingDay(monday)).toBe(true);
        expect(dateHelper.isWorkingDay(saturday)).toBe(false);
    });
    
    test('getDaysInMonth returns correct count', () => {
        expect(dateHelper.getDaysInMonth(2025, 1)).toBe(31); // January
        expect(dateHelper.getDaysInMonth(2025, 2)).toBe(28); // February (non-leap)
    });
});
```

```javascript
// tests/managers/CalendarManager.test.js
describe('CalendarManager', () => {
    let calendarManager;
    let mockStateManager;
    
    beforeEach(() => {
        mockStateManager = {
            calendars: {},
            updateState: jest.fn()
        };
        calendarManager = new CalendarManager();
        calendarManager.appStateManager = mockStateManager;
    });
    
    test('addCalendar creates calendar with correct structure', () => {
        const calendar = calendarManager.addCalendar('FP', 'Test Calendar');
        
        expect(calendar).toHaveProperty('id');
        expect(calendar.name).toBe('Test Calendar');
        expect(calendar.type).toBe('FP');
        expect(calendar.events).toBeInstanceOf(Array);
        expect(calendar.categories).toBeInstanceOf(Array);
    });
    
    test('deleteCalendar removes calendar from state', () => {
        const calendar = calendarManager.addCalendar('FP', 'Test');
        calendarManager.deleteCalendar(calendar.id);
        
        expect(mockStateManager.updateState).toHaveBeenCalledWith(
            `calendars.${calendar.id}`, 
            undefined
        );
    });
});
```

#### Tests d'Integració

```javascript
// tests/integration/EventManagement.test.js
describe('Event Management Integration', () => {
    let calendarManager;
    let eventManager;
    let categoryManager;
    
    beforeEach(() => {
        // Setup integrat dels managers
        calendarManager = new CalendarManager();
        eventManager = new EventManager();
        categoryManager = new CategoryManager();
        
        // Mock localStorage
        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage()
        });
    });
    
    test('complete event workflow', () => {
        // 1. Crear calendari
        const calendar = calendarManager.addCalendar('FP', 'Test Calendar');
        
        // 2. Crear categoria
        const category = categoryManager.addCategory('Test Category', '#ff0000');
        
        // 3. Crear esdeveniment
        const event = eventManager.addEvent({
            title: 'Test Event',
            date: '2025-01-15',
            categoryId: category.id,
            calendarId: calendar.id
        });
        
        // 4. Verificar integració
        expect(calendar.events).toContain(event.id);
        expect(event.categoryId).toBe(category.id);
        
        // 5. Actualitzar esdeveniment
        const updatedEvent = eventManager.updateEvent(event.id, {
            title: 'Updated Event'
        });
        
        expect(updatedEvent.title).toBe('Updated Event');
    });
});
```

### Testing de localStorage

```javascript
// tests/utils/mockLocalStorage.js
function mockLocalStorage() {
    let store = {};
    
    return {
        getItem: function(key) {
            return store[key] || null;
        },
        setItem: function(key, value) {
            store[key] = value.toString();
        },
        removeItem: function(key) {
            delete store[key];
        },
        clear: function() {
            store = {};
        },
        key: function(index) {
            return Object.keys(store)[index];
        },
        get length() {
            return Object.keys(store).length;
        }
    };
}
```

## Debugging Techniques

### Console Debugging

#### Logging Estratègic

```javascript
// Exemple de logging estructurat
class DebugLogger {
    constructor(component) {
        this.component = component;
        this.enabled = window.debugMode || false;
    }
    
    log(message, data = null) {
        if (!this.enabled) return;
        
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${this.component}]`;
        
        if (data) {
            console.log(`${prefix} ${message}`, data);
        } else {
            console.log(`${prefix} ${message}`);
        }
    }
    
    warn(message, data = null) {
        if (!this.enabled) return;
        console.warn(`[${this.component}] ${message}`, data);
    }
    
    error(message, error = null) {
        // Errors sempre es mostren
        console.error(`[${this.component}] ${message}`, error);
    }
}

// Ús en components
class CalendarManager {
    constructor() {
        this.logger = new DebugLogger('CalendarManager');
    }
    
    addCalendar(type, name) {
        this.logger.log('Adding calendar', { type, name });
        
        try {
            const calendar = this.createCalendar(type, name);
            this.logger.log('Calendar created successfully', calendar);
            return calendar;
        } catch (error) {
            this.logger.error('Failed to create calendar', error);
            throw error;
        }
    }
}
```

#### Debugging Commands

```javascript
// Funcions globals per debugging
window.debugCalendari = {
    // Mostrar estat actual
    getState: () => {
        return {
            calendars: appStateManager.calendars,
            currentCalendar: appStateManager.currentCalendar,
            categories: categoryManager.getGlobalCatalog(),
            storage: localStorage.getItem('calendari-ioc-data')
        };
    },
    
    // Exportar estat per anàlisi
    exportState: () => {
        const state = window.debugCalendari.getState();
        const blob = new Blob([JSON.stringify(state, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `debug-state-${Date.now()}.json`;
        a.click();
    },
    
    // Reiniciar estat
    resetState: () => {
        if (confirm('Eliminar totes les dades? Aquesta acció no es pot desfer.')) {
            localStorage.clear();
            location.reload();
        }
    },
    
    // Carregar estat des de fitxer
    loadState: (jsonData) => {
        try {
            const state = JSON.parse(jsonData);
            localStorage.setItem('calendari-ioc-data', JSON.stringify(state));
            location.reload();
        } catch (error) {
            console.error('Error loading state:', error);
        }
    },
    
    // Estadístiques d'ús
    getStats: () => {
        const calendars = Object.values(appStateManager.calendars);
        return {
            totalCalendars: calendars.length,
            totalEvents: calendars.reduce((sum, cal) => sum + cal.events.length, 0),
            calendarsByType: calendars.reduce((acc, cal) => {
                acc[cal.type] = (acc[cal.type] || 0) + 1;
                return acc;
            }, {}),
            storageUsage: localStorage.getItem('calendari-ioc-data')?.length || 0
        };
    }
};
```

### Browser Developer Tools

#### Breakpoints Estratègics

**Event handling**:
```javascript
// Afegir breakpoint en gestió d'esdeveniments
document.addEventListener('click', (e) => {
    debugger; // Només si debugging actiu
    this.handleClick(e);
});
```

**State changes**:
```javascript
// Afegir breakpoint en canvis d'estat
updateState(path, value) {
    if (window.debugBreakpoints) debugger;
    this.setState(path, value);
}
```

#### Performance Profiling

```javascript
// Wrapper per mesurar rendiment
function measurePerformance(fn, name) {
    return function(...args) {
        const start = performance.now();
        const result = fn.apply(this, args);
        const end = performance.now();
        
        console.log(`${name} took ${(end - start).toFixed(2)}ms`);
        return result;
    };
}

// Aplicar a funcions crítiques
CalendarManager.prototype.addCalendar = measurePerformance(
    CalendarManager.prototype.addCalendar,
    'CalendarManager.addCalendar'
);
```

### Memory Debugging

#### Detecció de Memory Leaks

```javascript
class MemoryTracker {
    constructor() {
        this.objects = new WeakMap();
        this.counters = {};
    }
    
    track(obj, type) {
        this.objects.set(obj, { type, created: Date.now() });
        this.counters[type] = (this.counters[type] || 0) + 1;
    }
    
    getStats() {
        return { ...this.counters };
    }
    
    // Detectar possibles leaks
    detectLeaks() {
        const stats = this.getStats();
        const warnings = [];
        
        Object.entries(stats).forEach(([type, count]) => {
            if (count > 1000) {
                warnings.push(`Possible leak: ${type} has ${count} instances`);
            }
        });
        
        return warnings;
    }
}

const memoryTracker = new MemoryTracker();
```

### Error Handling

#### Global Error Handler

```javascript
// Capturar errors globals
window.addEventListener('error', (event) => {
    console.error('Global error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
    
    // Enviar a sistema de monitoring si està disponible
    if (window.errorReporting) {
        window.errorReporting.report(event);
    }
});

// Capturar promises rebutjades
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    if (window.errorReporting) {
        window.errorReporting.report({
            type: 'unhandled-promise',
            reason: event.reason
        });
    }
});
```

#### Error Boundaries per Components

```javascript
// Wrapper per capturar errors en components
function withErrorBoundary(component, componentName) {
    const originalMethods = {};
    
    Object.getOwnPropertyNames(component.prototype).forEach(methodName => {
        if (typeof component.prototype[methodName] === 'function') {
            originalMethods[methodName] = component.prototype[methodName];
            
            component.prototype[methodName] = function(...args) {
                try {
                    return originalMethods[methodName].apply(this, args);
                } catch (error) {
                    console.error(`Error in ${componentName}.${methodName}:`, error);
                    
                    // Fallback behavior si cal
                    if (this.onError) {
                        return this.onError(error, methodName, args);
                    }
                    
                    throw error;
                }
            };
        }
    });
    
    return component;
}

// Aplicar a components crítics
withErrorBoundary(CalendarManager, 'CalendarManager');
withErrorBoundary(EventManager, 'EventManager');
```

## Resolució de Problemes Comuns

### Problemes de localStorage

#### Diagnòstic

```javascript
function diagnoseBrowserStorage() {
    const results = {
        available: false,
        quota: null,
        used: null,
        remaining: null,
        errors: []
    };
    
    try {
        // Test disponibilitat
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        results.available = true;
        
        // Estimar quota
        if (navigator.storage && navigator.storage.estimate) {
            navigator.storage.estimate().then(estimate => {
                results.quota = estimate.quota;
                results.used = estimate.usage;
                results.remaining = estimate.quota - estimate.usage;
            });
        }
        
        // Mesurar ús actual
        const currentData = localStorage.getItem('calendari-ioc-data');
        if (currentData) {
            results.currentAppUsage = currentData.length;
        }
        
    } catch (error) {
        results.errors.push(error.message);
    }
    
    return results;
}
```

#### Solucions

```javascript
// Gestió d'errors de localStorage
class StorageManager {
    saveToStorage() {
        try {
            const data = this.serializeState();
            localStorage.setItem('calendari-ioc-data', data);
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                this.handleQuotaExceeded();
            } else {
                this.handleStorageError(error);
            }
        }
    }
    
    handleQuotaExceeded() {
        // Intentar netejar dades antigues
        this.cleanupOldData();
        
        // Intentar comprimir dades
        const compressedData = this.compressData();
        
        try {
            localStorage.setItem('calendari-ioc-data', compressedData);
        } catch (error) {
            // Mostrar avís a l'usuari
            this.showStorageFullWarning();
        }
    }
    
    cleanupOldData() {
        // Eliminar esdeveniments més antics de 2 anys
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 2);
        
        Object.values(this.state.calendars).forEach(calendar => {
            calendar.events = calendar.events.filter(event => 
                new Date(event.date) > cutoffDate
            );
        });
    }
}
```

### Problemes de Rendiment

#### Optimització de Renderització

```javascript
// Debouncing per renderització
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Aplicar a operacions costoses
const debouncedRender = debounce(function() {
    this.renderCalendar();
}, 100);
```

#### Virtual Scrolling per Llargues Llistes

```javascript
class VirtualList {
    constructor(container, items, itemHeight) {
        this.container = container;
        this.items = items;
        this.itemHeight = itemHeight;
        this.visibleItems = Math.ceil(container.clientHeight / itemHeight) + 2;
        this.startIndex = 0;
        
        this.render();
        this.container.addEventListener('scroll', this.onScroll.bind(this));
    }
    
    onScroll() {
        const scrollTop = this.container.scrollTop;
        this.startIndex = Math.floor(scrollTop / this.itemHeight);
        this.render();
    }
    
    render() {
        const endIndex = Math.min(this.startIndex + this.visibleItems, this.items.length);
        const visibleItems = this.items.slice(this.startIndex, endIndex);
        
        // Renderitzar només elements visibles
        this.container.innerHTML = visibleItems.map((item, index) => 
            this.renderItem(item, this.startIndex + index)
        ).join('');
    }
}
```

### Problemes de Compatibilitat

#### Detecció de Funcionalitats

```javascript
const BrowserSupport = {
    localStorage: (() => {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            return false;
        }
    })(),
    
    dragAndDrop: 'draggable' in document.createElement('span'),
    
    modernCSS: CSS.supports('display', 'grid'),
    
    es6: (() => {
        try {
            eval('class Test {}');
            return true;
        } catch (e) {
            return false;
        }
    })(),
    
    checkAll() {
        const issues = [];
        
        if (!this.localStorage) issues.push('localStorage not supported');
        if (!this.dragAndDrop) issues.push('Drag and drop not supported');
        if (!this.modernCSS) issues.push('Modern CSS not supported');
        if (!this.es6) issues.push('ES6 not supported');
        
        return issues;
    }
};
```

## Eines Externes

### Monitoring i Analytics

```javascript
// Integració amb Google Analytics (opcional)
class AnalyticsHelper {
    static trackEvent(action, category = 'Calendar', label = null) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label
            });
        }
    }
    
    static trackError(error, context) {
        this.trackEvent('error', 'Application', `${context}: ${error.message}`);
    }
    
    static trackPerformance(name, duration) {
        this.trackEvent('performance', 'Timing', `${name}: ${duration}ms`);
    }
}
```

### Error Reporting

```javascript
// Integració amb Sentry (opcional)
class ErrorReporting {
    static init() {
        if (typeof Sentry !== 'undefined') {
            Sentry.init({
                dsn: 'YOUR_SENTRY_DSN',
                environment: 'production'
            });
        }
    }
    
    static reportError(error, context = {}) {
        if (typeof Sentry !== 'undefined') {
            Sentry.captureException(error, {
                extra: context
            });
        }
    }
    
    static reportMessage(message, level = 'info') {
        if (typeof Sentry !== 'undefined') {
            Sentry.captureMessage(message, level);
        }
    }
}
```

Aquesta guia proporciona un marc complet per al testing i debugging del Calendari IOC, facilitant la identificació i resolució ràpida de problemes així com l'assegurament de la qualitat del software.

---
[← Punts d'Extensió Crítics](Punts-d-Extensió-Crítics) | [Services Referència →](Services-Referència)