# Models - Referència Tècnica (v1.1+)

Aquesta referència documenta els models de domini del Calendari IOC implementats amb ES6 classes i arquitectura "Graph of Objects in Memory". Els models substitueixen l'antiga gestió basada en objectes literals i services de lookup.

## Visió General dels Models

### Arquitectura "Graph of Objects in Memory"

A partir de la versió 1.1, el Calendari IOC utilitza una arquitectura on:

- **Referències directes**: Els objectes mantenen referències directes entre ells, no IDs
- **Mètodes de domini**: Cada model encapsula la seva lògica de negoci específica
- **Serialització integrada**: Gestió automàtica de toJSON() i hidratació
- **Eliminació de lookup**: No cal cercar objectes per ID, tot està interconnectat

**Ubicació**: `js/models/`

### Beneficis de la Nova Arquitectura

- **Rendiment millorat**: Eliminació de capes de lookup intermèdies
- **Codi més net**: Lògica de negoci encapsulada als models
- **Manteniment senzill**: Menys complexitat en la gestió de relacions
- **Consistència de dades**: Referències directes eviten inconsistències

## CalendariIOC_Calendar

### Propòsit i Responsabilitats

El model **CalendariIOC_Calendar** representa un calendari complet amb els seus esdeveniments, categories i configuració. Gestiona la lògica específica de calendaris com validacions, replicació i exportació.

### Estructura de Classe

```javascript
/**
 * Model de calendari amb mètodes de domini específics
 */
class CalendariIOC_Calendar {
    constructor(data = {}) {
        // Propietats bàsiques
        this.id = data.id || '';
        this.name = data.name || '';
        this.type = data.type || 'Altre'; // 'FP', 'BTX', 'Altre'
        this.startDate = data.startDate || '';
        this.endDate = data.endDate || '';
        this.paf1Date = data.paf1Date || null;
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        
        // Col·leccions d'objectes relacionats
        this.events = []; // Array d'instàncies CalendariIOC_Event
        this.categories = []; // Array d'instàncies CalendariIOC_Category
        
        // Metadades
        this.createdAt = data.createdAt || new Date().toISOString();
        this.lastModified = data.lastModified || new Date().toISOString();
    }
}
```

### Mètodes Principals

#### `addEvent(eventData)`

Afegeix un nou esdeveniment al calendari, creant instància CalendariIOC_Event.

```javascript
/**
 * Afegeix esdeveniment al calendari
 * @param {Object} eventData - Dades de l'esdeveniment
 * @returns {CalendariIOC_Event} Instància de l'esdeveniment creat
 */
addEvent(eventData) {
    const event = new CalendariIOC_Event({
        ...eventData,
        calendar: this // Referència directa al calendari
    });
    
    this.events.push(event);
    this.updateLastModified();
    
    return event;
}
```

#### `removeEvent(event)`

Elimina un esdeveniment del calendari i neteja referències.

```javascript
/**
 * Elimina esdeveniment del calendari
 * @param {CalendariIOC_Event} event - Instància de l'esdeveniment
 * @returns {boolean} True si s'ha eliminat correctament
 */
removeEvent(event) {
    const index = this.events.indexOf(event);
    
    if (index === -1) {
        return false;
    }
    
    // Eliminar referències bidireccionals
    event.calendar = null;
    this.events.splice(index, 1);
    this.updateLastModified();
    
    return true;
}
```

#### `addCategory(categoryData)`

Afegeix una nova categoria al calendari, evitant duplicats.

```javascript
/**
 * Afegeix categoria al calendari
 * @param {Object} categoryData - Dades de la categoria
 * @returns {CalendariIOC_Category} Instància de la categoria
 */
addCategory(categoryData) {
    // Verificar si ja existeix una categoria amb el mateix nom i color
    const existing = this.categories.find(cat => 
        cat.name === categoryData.name && cat.color === categoryData.color
    );
    
    if (existing) {
        return existing;
    }
    
    const category = new CalendariIOC_Category({
        ...categoryData,
        calendar: this
    });
    
    this.categories.push(category);
    this.updateLastModified();
    
    return category;
}
```

#### `getEventsByCategory(category)`

Obté tots els esdeveniments d'una categoria específica.

```javascript
/**
 * Obté esdeveniments per categoria
 * @param {CalendariIOC_Category} category - Instància de la categoria
 * @returns {Array<CalendariIOC_Event>} Eventi de la categoria
 */
getEventsByCategory(category) {
    return this.events.filter(event => event.category === category);
}
```

#### `getEventsByDateRange(startDate, endDate)`

Obté esdeveniments dins d'un rang de dates.

```javascript
/**
 * Obté esdeveniments en rang de dates
 * @param {string} startDate - Data d'inici (ISO string)
 * @param {string} endDate - Data de fi (ISO string)
 * @returns {Array<CalendariIOC_Event>} Wydarzenia en el rang
 */
getEventsByDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= start && eventDate <= end;
    });
}
```

#### `toJSON()`

Serialitza el calendari per emmagatzematge, convertint referències a IDs.

```javascript
/**
 * Serialitza calendari per emmagatzematge
 * @returns {Object} Objecte serialitzable
 */
toJSON() {
    return {
        id: this.id,
        name: this.name,
        type: this.type,
        startDate: this.startDate,
        endDate: this.endDate,
        paf1Date: this.paf1Date,
        isActive: this.isActive,
        createdAt: this.createdAt,
        lastModified: this.lastModified,
        
        // Serialitzar objectes relacionats
        events: this.events.map(event => event.toJSON()),
        categories: this.categories.map(category => category.toJSON())
    };
}
```

## CalendariIOC_Category

### Propòsit i Responsabilitats

El model **CalendariIOC_Category** representa una categoria d'esdeveniments amb validacions específiques, gestió de colors i tipus (sistema vs usuari).

### Estructura de Classe

```javascript
/**
 * Model de categoria amb validacions i mètodes específics
 */
class CalendariIOC_Category {
    constructor(data = {}) {
        // Propietats bàsiques
        this.id = data.id || '';
        this.name = data.name || '';
        this.color = data.color || '#3498db';
        this.isSystem = data.isSystem || false;
        this.description = data.description || '';
        
        // Referència al calendari contenidor
        this.calendar = data.calendar || null;
        
        // Metadades d'ús
        this.usageCount = data.usageCount || 0;
        this.lastUsed = data.lastUsed || null;
        this.createdAt = data.createdAt || new Date().toISOString();
    }
}
```

### Mètodes Principals

#### `validate()`

Valida la categoria segons regles de negoci.

```javascript
/**
 * Valida la categoria
 * @returns {Object} Resultat de validació
 */
validate() {
    const validation = {
        isValid: true,
        errors: [],
        warnings: []
    };
    
    // Validar nom
    if (!this.name || this.name.trim().length === 0) {
        validation.isValid = false;
        validation.errors.push('El nom de la categoria és obligatori');
    }
    
    if (this.name.length > 50) {
        validation.warnings.push('El nom és massa llarg (màxim 50 caràcters)');
    }
    
    // Validar color
    if (!this.isValidColor(this.color)) {
        validation.isValid = false;
        validation.errors.push('Color invàlid');
    }
    
    return validation;
}
```

#### `isValidColor(color)`

Valida format de color (hex).

```javascript
/**
 * Valida format de color
 * @param {string} color - Color en format hex
 * @returns {boolean} True si és vàlid
 */
isValidColor(color) {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(color);
}
```

#### `incrementUsage()`

Incrementa comptador d'ús i actualitza data d'últim ús.

```javascript
/**
 * Incrementa comptador d'ús
 */
incrementUsage() {
    this.usageCount++;
    this.lastUsed = new Date().toISOString();
}
```

#### `getEvents()`

Obté tots els esdeveniments d'aquesta categoria.

```javascript
/**
 * Obté esdeveniments de la categoria
 * @returns {Array<CalendariIOC_Event>} Wydarzenia de la categoria
 */
getEvents() {
    if (!this.calendar) {
        return [];
    }
    
    return this.calendar.events.filter(event => event.category === this);
}
```

#### `canBeDeleted()`

Verifica si la categoria es pot eliminar.

```javascript
/**
 * Verifica si es pot eliminar la categoria
 * @returns {Object} Resultat de la verificació
 */
canBeDeleted() {
    const result = {
        canDelete: true,
        reason: null,
        eventsCount: 0
    };
    
    // Categories del sistema no es poden eliminar
    if (this.isSystem) {
        result.canDelete = false;
        result.reason = 'Les categories del sistema no es poden eliminar';
        return result;
    }
    
    // Verificar si té esdeveniments associats
    const events = this.getEvents();
    result.eventsCount = events.length;
    
    if (events.length > 0) {
        result.canDelete = false;
        result.reason = `La categoria té ${events.length} esdeveniments associats`;
    }
    
    return result;
}
```

## CalendariIOC_Event

### Propòsit i Responsabilitats

El model **CalendariIOC_Event** representa un esdeveniment individual amb validacions, gestió de replicació i mètodes de domini específics.

### Estructura de Classe

```javascript
/**
 * Model d'esdeveniment amb mètodes de negoci específics
 */
class CalendariIOC_Event {
    constructor(data = {}) {
        // Propietats bàsiques
        this.id = data.id || '';
        this.title = data.title || '';
        this.description = data.description || '';
        this.date = data.date || '';
        this.startTime = data.startTime || null;
        this.endTime = data.endTime || null;
        
        // Referències directes a objectes
        this.calendar = data.calendar || null;
        this.category = data.category || null;
        
        // Propietats específiques
        this.isSystemEvent = data.isSystemEvent || false;
        this.isReplicated = data.isReplicated || false;
        this.originalDate = data.originalDate || null;
        this.replicationConfidence = data.replicationConfidence || null;
        
        // Metadades
        this.createdAt = data.createdAt || new Date().toISOString();
        this.lastModified = data.lastModified || new Date().toISOString();
    }
}
```

### Mètodes Principals

#### `validate()`

Valida l'esdeveniment segons regles de negoci.

```javascript
/**
 * Valida l'esdeveniment
 * @returns {Object} Resultat de validació
 */
validate() {
    const validation = {
        isValid: true,
        errors: [],
        warnings: []
    };
    
    // Validar títol
    if (!this.title || this.title.trim().length === 0) {
        validation.isValid = false;
        validation.errors.push('El títol és obligatori');
    }
    
    // Validar data
    if (!this.date || !this.isValidDate(this.date)) {
        validation.isValid = false;
        validation.errors.push('Data invàlida');
    }
    
    // Validar categoria
    if (!this.category) {
        validation.warnings.push('Esdeveniment sense categoria assignada');
    }
    
    // Validar horaris
    if (this.startTime && this.endTime) {
        if (this.startTime >= this.endTime) {
            validation.errors.push('L\'hora de fi ha de ser posterior a la d\'inici');
            validation.isValid = false;
        }
    }
    
    return validation;
}
```

#### `setCategory(category)`

Assigna categoria a l'esdeveniment i actualitza comptadors.

```javascript
/**
 * Assigna categoria a l'esdeveniment
 * @param {CalendariIOC_Category} category - Instància de la categoria
 */
setCategory(category) {
    // Decrementar ús de categoria anterior
    if (this.category) {
        this.category.usageCount = Math.max(0, this.category.usageCount - 1);
    }
    
    // Assignar nova categoria
    this.category = category;
    
    // Incrementar ús de nova categoria
    if (category) {
        category.incrementUsage();
    }
    
    this.updateLastModified();
}
```

#### `moveTo(newDate)`

Mou l'esdeveniment a una nova data amb validacions.

```javascript
/**
 * Mou esdeveniment a nova data
 * @param {string} newDate - Nova data (ISO string)
 * @returns {boolean} True si s'ha mogut correctament
 */
moveTo(newDate) {
    if (!this.isValidDate(newDate)) {
        throw new CalendariIOCException('Data de destí invàlida', 'INVALID_DATE');
    }
    
    // Guardar data original si és el primer moviment
    if (!this.originalDate && !this.isReplicated) {
        this.originalDate = this.date;
    }
    
    const oldDate = this.date;
    this.date = newDate;
    this.updateLastModified();
    
    return true;
}
```

#### `clone(newCalendar = null)`

Crea una còpia de l'esdeveniment per replicació.

```javascript
/**
 * Clona esdeveniment per replicació
 * @param {CalendariIOC_Calendar} newCalendar - Calendari destí
 * @returns {CalendariIOC_Event} Nova instància clonada
 */
clone(newCalendar = null) {
    const clonedData = {
        title: this.title,
        description: this.description,
        date: this.date,
        startTime: this.startTime,
        endTime: this.endTime,
        calendar: newCalendar,
        category: this.category, // Mantenir referència a categoria
        isSystemEvent: this.isSystemEvent,
        isReplicated: true,
        originalDate: this.date,
        replicationConfidence: null
    };
    
    return new CalendariIOC_Event(clonedData);
}
```

## CalendariIOC_DataRehydrator

### Propòsit i Responsabilitats

El **CalendariIOC_DataRehydrator** és l'encarregat de convertir dades serialitzades (JSON) en instàncies vives de models amb totes les referències interconnectades correctament.

### Funcionalitat Principal

```javascript
/**
 * Hidratador de dades per reconstituir objectes des de localStorage
 */
class CalendariIOC_DataRehydrator {
    /**
     * Hidrata dades JSON en instàncies de models interconnectades
     * @param {Object} rawData - Dades serialitzades des de localStorage
     * @returns {Object} Objecte amb instàncies hidratades
     */
    static hydrate(rawData) {
        const result = {
            calendars: [],
            categoriesMap: new Map(),
            eventsMap: new Map()
        };
        
        // Primer pas: crear instàncies de calendaris
        rawData.calendars?.forEach(calendarData => {
            const calendar = new CalendariIOC_Calendar(calendarData);
            result.calendars.push(calendar);
        });
        
        // Segon pas: crear categories i vincular-les als calendaris
        result.calendars.forEach(calendar => {
            const rawCalendar = rawData.calendars.find(c => c.id === calendar.id);
            
            rawCalendar.categories?.forEach(categoryData => {
                const category = new CalendariIOC_Category({
                    ...categoryData,
                    calendar: calendar
                });
                
                calendar.categories.push(category);
                result.categoriesMap.set(category.id, category);
            });
        });
        
        // Tercer pas: crear esdeveniments i establir totes les referències
        result.calendars.forEach(calendar => {
            const rawCalendar = rawData.calendars.find(c => c.id === calendar.id);
            
            rawCalendar.events?.forEach(eventData => {
                const event = new CalendariIOC_Event({
                    ...eventData,
                    calendar: calendar,
                    category: result.categoriesMap.get(eventData.categoryId)
                });
                
                calendar.events.push(event);
                result.eventsMap.set(event.id, event);
            });
        });
        
        return result;
    }
    
    /**
     * Serialitza instàncies en format JSON per emmagatzematge
     * @param {Array<CalendariIOC_Calendar>} calendars - Instàncies de calendaris
     * @returns {Object} Dades serialitzades
     */
    static serialize(calendars) {
        return {
            calendars: calendars.map(calendar => calendar.toJSON()),
            lastSaved: new Date().toISOString(),
            version: '1.1'
        };
    }
}
```

### Gestió d'Errors d'Hidratació

```javascript
/**
 * Valida integritat de dades durant hidratació
 * @param {Object} rawData - Dades a validar
 * @returns {Object} Resultat de validació
 */
static validateDataIntegrity(rawData) {
    const validation = {
        isValid: true,
        errors: [],
        warnings: []
    };
    
    // Verificar estructura bàsica
    if (!rawData.calendars || !Array.isArray(rawData.calendars)) {
        validation.isValid = false;
        validation.errors.push('Estructura de calendaris invàlida');
        return validation;
    }
    
    // Verificar consistència de referències
    rawData.calendars.forEach(calendar => {
        calendar.events?.forEach(event => {
            if (event.categoryId && !calendar.categories?.find(c => c.id === event.categoryId)) {
                validation.warnings.push(`Esdeveniment ${event.id} referència categoria inexistent`);
            }
        });
    });
    
    return validation;
}
```

## Integració amb Managers

### Exemple d'Ús amb CalendarManager

```javascript
// En CalendarManager.js
class CalendarManager {
    createCalendar(calendarData) {
        // Crear instància del model
        const calendar = new CalendariIOC_Calendar(calendarData);
        
        // Afegir categories per defecte
        const defaultCategories = this.getDefaultCategories();
        defaultCategories.forEach(catData => {
            calendar.addCategory(catData);
        });
        
        // Afegir a l'estat global
        appStateManager.calendars.push(calendar);
        
        return calendar;
    }
    
    deleteCalendar(calendar) {
        // Neteja automàtica de referències
        calendar.events.forEach(event => {
            event.calendar = null;
            event.category = null;
        });
        
        calendar.categories.forEach(category => {
            category.calendar = null;
        });
        
        // Eliminar de l'estat
        const index = appStateManager.calendars.indexOf(calendar);
        if (index !== -1) {
            appStateManager.calendars.splice(index, 1);
        }
    }
}
```

## Avantatges de l'Arquitectura de Models

### 1. Simplicitat de Codi

```javascript
// Abans (v1.0): Lookup manual amb IDs
const category = CategoryService.getCategoryById(event.categoryId);
const events = calendar.events.filter(e => e.categoryId === categoryId);

// Ara (v1.1): Referències directes
const category = event.category;
const events = category.getEvents();
```

### 2. Validacions Integrades

```javascript
// Validació automàtica en crear esdeveniments
const event = new CalendariIOC_Event(eventData);
const validation = event.validate();

if (!validation.isValid) {
    throw new CalendariIOCException('Esdeveniment invàlid', 'VALIDATION_ERROR', validation.errors);
}
```

### 3. Serialització Automàtica

```javascript
// Conversió automàtica per emmagatzematge
const calendarJson = calendar.toJSON();
localStorage.setItem('calendar-data', JSON.stringify(calendarJson));

// Hidratació automàtica en carregar
const rawData = JSON.parse(localStorage.getItem('calendar-data'));
const hydrated = CalendariIOC_DataRehydrator.hydrate(rawData);
```

---
[← Services Referència](Services-Referència) | [Export Referència →](Export-Referència)