# Import - Referència Tècnica

Aquesta referència documenta el sistema d'importació del Calendari IOC, que permet als usuaris importar esdeveniments des de fitxers externs en formats estàndard, facilitant la migració de dades i la integració amb altres sistemes de calendari.

## Visió General del Sistema d'Import

El **sistema d'import** implementa parsers especialitzats per diferents formats de fitxers, amb validació robusta i gestió d'errors per assegurar la integritat de les dades importades.

### Arquitectura d'Import

**Ubicació**: `js/import/`

**Patró principal**: Strategy Pattern amb Chain of Responsibility per validació
**Formats suportats**: ICS (iCalendar), JSON (futur), CSV (futur)
**Validació**: Múltiples nivells de validació amb feedback detallat

## IcsImporter

### Propòsit i Responsabilitats

El **IcsImporter** parseja fitxers en format iCalendar (RFC 5545) per convertir esdeveniments externs en el format nadiu del Calendari IOC, gestionant diferències de zona horària, formats de data i compatibilitat amb diferents aplicacions.

### API Pública

#### `import(icsContent, options)`

Importa esdeveniments des d'un fitxer ICS complet.

```javascript
/**
 * Importa esdeveniments des de contingut ICS
 * @param {string} icsContent - Contingut del fitxer ICS
 * @param {Object} options - Opcions d'importació
 * @returns {Object} Resultat de la importació
 */
static import(icsContent, options = {}) {
    const importResult = {
        success: false,
        eventsImported: 0,
        categoriesCreated: 0,
        errors: [],
        warnings: [],
        events: [],
        categories: []
    };
    
    try {
        // Parsejar contingut ICS
        const parsedData = this.parseIcsContent(icsContent);
        
        // Validar estructura ICS
        const validation = this.validateIcsStructure(parsedData);
        if (!validation.isValid) {
            importResult.errors = validation.errors;
            return importResult;
        }
        
        // Processar esdeveniments
        const processResult = this.processEvents(parsedData.events, options);
        
        // Generar categories necessàries
        const categories = this.extractAndCreateCategories(processResult.events, options);
        
        // Assemblar resultat final
        importResult.success = true;
        importResult.events = processResult.events;
        importResult.categories = categories;
        importResult.eventsImported = processResult.events.length;
        importResult.categoriesCreated = categories.length;
        importResult.warnings = processResult.warnings;
        
    } catch (error) {
        importResult.errors.push(`Error d'importació: ${error.message}`);
    }
    
    return importResult;
}
```

#### `parseIcsContent(icsContent)`

Parseja el contingut brut d'un fitxer ICS.

```javascript
/**
 * Parseja contingut ICS en estructura d'objectes
 * @param {string} icsContent - Contingut ICS a parsejar
 * @returns {Object} Estructura parsejada del calendari
 */
static parseIcsContent(icsContent) {
    const lines = this.preprocessIcsLines(icsContent);
    const calendar = {
        properties: {},
        events: [],
        timezones: []
    };
    
    let currentComponent = null;
    let currentEvent = null;
    
    for (const line of lines) {
        const { key, value, params } = this.parseIcsLine(line);
        
        switch (key) {
            case 'BEGIN':
                currentComponent = this.handleBeginComponent(value, calendar);
                if (value === 'VEVENT') {
                    currentEvent = { properties: {}, rawData: [] };
                }
                break;
                
            case 'END':
                if (value === 'VEVENT' && currentEvent) {
                    calendar.events.push(currentEvent);
                    currentEvent = null;
                }
                break;
                
            default:
                this.handleProperty(key, value, params, currentEvent || calendar, line);
                break;
        }
    }
    
    return calendar;
}
```

### Implementació del Parser ICS

#### Preprocessament de Línies

```javascript
/**
 * Preprocessa línies ICS per gestionar continuacions i encoding
 * @param {string} icsContent - Contingut brut
 * @returns {Array} Línies processades
 */
static preprocessIcsLines(icsContent) {
    // Normalitzar terminadors de línia
    const normalizedContent = icsContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    const lines = normalizedContent.split('\n');
    const processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        
        // Gestionar continuacions de línia (RFC 5545: línies que comencen amb espai)
        while (i + 1 < lines.length && lines[i + 1].match(/^[ \t]/)) {
            i++;
            line += lines[i].substring(1); // Eliminar el primer caràcter (espai/tab)
        }
        
        if (line.length > 0) {
            processedLines.push(line);
        }
    }
    
    return processedLines;
}
```

#### Parsing de Línies Individuals

```javascript
/**
 * Parseja una línia ICS individual
 * @param {string} line - Línia a parsejar
 * @returns {Object} Propietat parsejada
 */
static parseIcsLine(line) {
    // Separar la línia en nom i valor
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) {
        throw new Error(`Línia ICS malformada: ${line}`);
    }
    
    const nameAndParams = line.substring(0, colonIndex);
    const value = line.substring(colonIndex + 1);
    
    // Parsejar nom i paràmetres
    const { name, params } = this.parseNameAndParams(nameAndParams);
    
    // Processar valor segons el tipus
    const processedValue = this.processPropertyValue(value, name, params);
    
    return {
        key: name,
        value: processedValue,
        params: params,
        rawValue: value
    };
}
```

#### Parsing de Paràmetres

```javascript
/**
 * Parseja nom de propietat i paràmetres
 * @param {string} nameAndParams - Part abans dels dos punts
 * @returns {Object} Nom i paràmetres
 */
static parseNameAndParams(nameAndParams) {
    const parts = nameAndParams.split(';');
    const name = parts[0];
    const params = {};
    
    for (let i = 1; i < parts.length; i++) {
        const paramPart = parts[i];
        const equalIndex = paramPart.indexOf('=');
        
        if (equalIndex !== -1) {
            const paramName = paramPart.substring(0, equalIndex);
            const paramValue = paramPart.substring(equalIndex + 1);
            
            // Eliminar cometes si n'hi ha
            params[paramName] = paramValue.replace(/^"(.*)"$/, '$1');
        }
    }
    
    return { name, params };
}
```

### Conversió d'Esdeveniments

#### Processament d'Esdeveniments ICS

```javascript
/**
 * Converteix esdeveniments ICS al format nadiu
 * @param {Array} icsEvents - Array d'esdeveniments ICS
 * @param {Object} options - Opcions de conversió
 * @returns {Object} Esdeveniments convertits amb warnings
 */
static processEvents(icsEvents, options = {}) {
    const result = {
        events: [],
        warnings: []
    };
    
    icsEvents.forEach((icsEvent, index) => {
        try {
            const convertedEvent = this.convertIcsEventToNative(icsEvent, options);
            
            if (convertedEvent) {
                result.events.push(convertedEvent);
            }
        } catch (error) {
            result.warnings.push(`Esdeveniment ${index + 1}: ${error.message}`);
        }
    });
    
    return result;
}
```

#### Conversió Individual d'Esdeveniment

```javascript
/**
 * Converteix un esdeveniment ICS al format nadiu
 * @param {Object} icsEvent - Esdeveniment ICS
 * @param {Object} options - Opcions de conversió
 * @returns {Object} Esdeveniment en format nadiu
 */
static convertIcsEventToNative(icsEvent, options) {
    const props = icsEvent.properties;
    
    // Validar propietats obligatòries
    this.validateRequiredProperties(props);
    
    // Extreure informació base
    const event = {
        id: this.generateEventId(props),
        title: this.extractTitle(props),
        date: this.extractDate(props),
        startTime: this.extractStartTime(props),
        endTime: this.extractEndTime(props),
        description: this.extractDescription(props),
        categoryId: this.determineCategoryId(props, options),
        isSystemEvent: false,
        importMetadata: {
            source: 'ics',
            originalUid: props.UID?.value,
            importDate: new Date().toISOString()
        }
    };
    
    // Validar esdeveniment convertit
    const validation = this.validateConvertedEvent(event);
    if (!validation.isValid) {
        throw new Error(`Esdeveniment invàlid: ${validation.errors.join(', ')}`);
    }
    
    return event;
}
```

#### Extractors de Propietats

```javascript
/**
 * Extreu títol de l'esdeveniment
 * @param {Object} props - Propietats ICS
 * @returns {string} Títol net
 */
static extractTitle(props) {
    const summary = props.SUMMARY?.value || 'Esdeveniment sense títol';
    return this.unescapeIcsText(summary);
}

/**
 * Extreu data de l'esdeveniment
 * @param {Object} props - Propietats ICS
 * @returns {string} Data en format YYYY-MM-DD
 */
static extractDate(props) {
    const dtstart = props.DTSTART?.value;
    if (!dtstart) {
        throw new Error('DTSTART és obligatori');
    }
    
    return this.parseIcsDate(dtstart).date;
}

/**
 * Extreu hora d'inici
 * @param {Object} props - Propietats ICS
 * @returns {string|null} Hora en format HH:MM o null
 */
static extractStartTime(props) {
    const dtstart = props.DTSTART?.value;
    if (!dtstart) return null;
    
    const parsed = this.parseIcsDate(dtstart);
    return parsed.hasTime ? parsed.time : null;
}

/**
 * Extreu descripció de l'esdeveniment
 * @param {Object} props - Propietats ICS
 * @returns {string} Descripció neta
 */
static extractDescription(props) {
    const description = props.DESCRIPTION?.value || '';
    return this.unescapeIcsText(description);
}
```

### Gestió de Dates i Zones Horàries

#### Parser de Dates ICS

```javascript
/**
 * Parseja una data ICS considerant format i zona horària
 * @param {string} icsDateValue - Valor de data ICS
 * @param {Object} params - Paràmetres de la propietat
 * @returns {Object} Data i hora parsejades
 */
static parseIcsDate(icsDateValue, params = {}) {
    // Determinar format: només data (YYYYMMDD) o data-hora (YYYYMMDDTHHMMSS)
    const isDateOnly = icsDateValue.length === 8;
    const hasTime = !isDateOnly;
    
    let year, month, day, hour = 0, minute = 0, second = 0;
    
    if (isDateOnly) {
        // Format: YYYYMMDD
        year = parseInt(icsDateValue.substring(0, 4));
        month = parseInt(icsDateValue.substring(4, 6));
        day = parseInt(icsDateValue.substring(6, 8));
    } else {
        // Format: YYYYMMDDTHHMMSS[Z]
        const datePart = icsDateValue.substring(0, 8);
        const timePart = icsDateValue.substring(9); // Saltar la T
        
        year = parseInt(datePart.substring(0, 4));
        month = parseInt(datePart.substring(4, 6));
        day = parseInt(datePart.substring(6, 8));
        
        if (timePart.length >= 6) {
            hour = parseInt(timePart.substring(0, 2));
            minute = parseInt(timePart.substring(2, 4));
            second = parseInt(timePart.substring(4, 6));
        }
    }
    
    // Gestionar zona horària
    const isUtc = icsDateValue.endsWith('Z');
    const timezone = params.TZID || (isUtc ? 'UTC' : 'local');
    
    // Crear objecte Date i ajustar per zona horària
    const date = new Date(year, month - 1, day, hour, minute, second);
    const adjustedDate = this.adjustForTimezone(date, timezone);
    
    return {
        date: this.formatDateForSystem(adjustedDate),
        time: hasTime ? this.formatTimeForSystem(adjustedDate) : null,
        hasTime: hasTime,
        timezone: timezone,
        originalValue: icsDateValue
    };
}
```

#### Ajust de Zones Horàries

```javascript
/**
 * Ajusta data per zona horària
 * @param {Date} date - Data a ajustar
 * @param {string} timezone - Zona horària origen
 * @returns {Date} Data ajustada a zona local
 */
static adjustForTimezone(date, timezone) {
    if (timezone === 'UTC') {
        // Convertir de UTC a hora local
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    }
    
    // Per altres zones horàries, assumir conversió bàsica
    // En una implementació completa, s'utilitzaria una llibreria com moment.js
    return date;
}
```

### Gestió de Categories

#### Extracció i Creació de Categories

```javascript
/**
 * Extreu categories dels esdeveniments ICS i crea les necessàries
 * @param {Array} events - Esdeveniments convertits
 * @param {Object} options - Opcions d'importació
 * @returns {Array} Categories creades
 */
static extractAndCreateCategories(events, options = {}) {
    const categoryMap = new Map();
    const createdCategories = [];
    
    events.forEach(event => {
        if (event.categoryId && !categoryMap.has(event.categoryId)) {
            const category = this.createCategoryFromEvent(event, options);
            categoryMap.set(event.categoryId, category);
            createdCategories.push(category);
        }
    });
    
    return createdCategories;
}

/**
 * Crea una categoria basada en informació de l'esdeveniment
 * @param {Object} event - Esdeveniment amb informació de categoria
 * @param {Object} options - Opcions de creació
 * @returns {Object} Nova categoria
 */
static createCategoryFromEvent(event, options) {
    return {
        id: event.categoryId,
        name: this.generateCategoryName(event.categoryId),
        color: this.selectCategoryColor(event.categoryId, options),
        isSystem: false,
        source: 'import',
        description: `Categoria importada des d'ICS: ${event.categoryId}`
    };
}
```

#### Determinació de Categories

```javascript
/**
 * Determina la categoria d'un esdeveniment ICS
 * @param {Object} props - Propietats de l'esdeveniment
 * @param {Object} options - Opcions d'importació
 * @returns {string} ID de categoria
 */
static determineCategoryId(props, options) {
    // Ordre de prioritat per determinar categoria:
    
    // 1. Categoria explícita en ICS
    if (props.CATEGORIES?.value) {
        const categories = props.CATEGORIES.value.split(',');
        return this.mapIcsCategoryToSystem(categories[0].trim(), options);
    }
    
    // 2. Basada en paraules clau del títol
    const title = props.SUMMARY?.value || '';
    const keywordCategory = this.detectCategoryFromKeywords(title, options);
    if (keywordCategory) {
        return keywordCategory;
    }
    
    // 3. Basada en la font del calendari
    if (options.defaultCategory) {
        return options.defaultCategory;
    }
    
    // 4. Categoria per defecte d'import
    return this.getDefaultImportCategory();
}
```

### Validació i Gestió d'Errors

#### Validació d'Estructura ICS

```javascript
/**
 * Valida l'estructura bàsica d'un fitxer ICS
 * @param {Object} parsedData - Dades parsejades
 * @returns {Object} Resultat de validació
 */
static validateIcsStructure(parsedData) {
    const validation = {
        isValid: true,
        errors: [],
        warnings: []
    };
    
    // Validar capçalera de calendari
    if (!parsedData.properties.VERSION) {
        validation.errors.push('Falta la versió del calendari (VERSION)');
        validation.isValid = false;
    }
    
    if (!parsedData.properties.PRODID) {
        validation.warnings.push('Falta l\'identificador del producte (PRODID)');
    }
    
    // Validar esdeveniments
    if (!parsedData.events || parsedData.events.length === 0) {
        validation.warnings.push('No s\'han trobat esdeveniments al fitxer');
    }
    
    // Validar esdeveniments individuals
    parsedData.events.forEach((event, index) => {
        const eventValidation = this.validateIcsEvent(event, index);
        validation.errors.push(...eventValidation.errors);
        validation.warnings.push(...eventValidation.warnings);
        
        if (!eventValidation.isValid) {
            validation.isValid = false;
        }
    });
    
    return validation;
}
```

#### Validació d'Esdeveniments

```javascript
/**
 * Valida un esdeveniment ICS individual
 * @param {Object} icsEvent - Esdeveniment a validar
 * @param {number} index - Índex de l'esdeveniment
 * @returns {Object} Resultat de validació
 */
static validateIcsEvent(icsEvent, index) {
    const validation = {
        isValid: true,
        errors: [],
        warnings: []
    };
    
    const props = icsEvent.properties;
    const eventPrefix = `Esdeveniment ${index + 1}`;
    
    // Propietats obligatòries segons RFC 5545
    if (!props.UID) {
        validation.errors.push(`${eventPrefix}: Falta UID obligatori`);
        validation.isValid = false;
    }
    
    if (!props.DTSTART) {
        validation.errors.push(`${eventPrefix}: Falta DTSTART obligatori`);
        validation.isValid = false;
    }
    
    if (!props.SUMMARY) {
        validation.warnings.push(`${eventPrefix}: No té títol (SUMMARY)`);
    }
    
    // Validar coherència de dates
    if (props.DTSTART && props.DTEND) {
        try {
            const startDate = this.parseIcsDate(props.DTSTART.value);
            const endDate = this.parseIcsDate(props.DTEND.value);
            
            if (new Date(endDate.date) < new Date(startDate.date)) {
                validation.errors.push(`${eventPrefix}: Data de fi anterior a la d'inici`);
                validation.isValid = false;
            }
        } catch (error) {
            validation.errors.push(`${eventPrefix}: Error parseant dates: ${error.message}`);
            validation.isValid = false;
        }
    }
    
    return validation;
}
```

### Opcions d'Importació

```javascript
/**
 * Opcions per personalitzar la importació ICS
 */
const ICS_IMPORT_OPTIONS = {
    // Gestió de categories
    categoryMapping: {          // Mapejat de categories ICS a sistema
        'meeting': 'IOC',
        'exam': 'EXAMENS',
        'holiday': 'FESTIU'
    },
    defaultCategory: 'IMPORTAT', // Categoria per defecte
    createMissingCategories: true, // Crear categories automàticament
    
    // Gestió de dates
    timezone: 'Europe/Madrid',   // Zona horària per defecte
    adjustDates: true,           // Ajustar dates automàticament
    
    // Filtres d'importació
    dateRange: {                 // Importar només dins d'aquest rang
        start: '2025-01-01',
        end: '2025-12-31'
    },
    excludeCategories: [],       // Categories a excloure
    
    // Configuració tècnica
    maxEvents: 1000,             // Límit màxim d'esdeveniments
    skipErrors: true,            // Continuar amb errors no crítics
    validateDates: true,         // Validar dates estrictament
    preserveOriginalData: true   // Mantenir metadades originals
};
```

### Gestió d'Errors i Recuperació

```javascript
/**
 * Gestió d'errors amb recuperació automàtica
 */
class ImportErrorHandler {
    static handleParsingError(error, line, lineNumber) {
        console.warn(`Error parsing line ${lineNumber}: ${line}`);
        console.warn('Error details:', error.message);
        
        // Intentar recuperació automàtica
        const recovered = this.attemptLineRecovery(line, error);
        
        return {
            skip: !recovered,
            recoveredLine: recovered,
            warning: `Línia ${lineNumber} corregida automàticament`
        };
    }
    
    static attemptLineRecovery(line, error) {
        // Intents de recuperació comuns
        
        // 1. Corregir encoding UTF-8
        const utf8Fixed = this.fixUtf8Encoding(line);
        if (utf8Fixed !== line) {
            return utf8Fixed;
        }
        
        // 2. Escapar caràcters problemàtics
        const escapedLine = this.escapeProblematicChars(line);
        if (escapedLine !== line) {
            return escapedLine;
        }
        
        // 3. Corregir formats de data comuns
        const dateFixed = this.fixCommonDateFormats(line);
        if (dateFixed !== line) {
            return dateFixed;
        }
        
        return null; // No es pot recuperar
    }
}
```

### Utilitats d'Importació

```javascript
/**
 * Utilitats comunes per importació
 */
class ImportUtils {
    static unescapeIcsText(text) {
        if (!text) return '';
        
        return text
            .replace(/\\n/g, '\n')
            .replace(/\\;/g, ';')
            .replace(/\\,/g, ',')
            .replace(/\\\\/g, '\\');
    }
    
    static generateEventId(props) {
        const uid = props.UID?.value;
        const timestamp = Date.now();
        
        if (uid) {
            // Utilitzar UID original si és únic
            return `import_${this.sanitizeId(uid)}`;
        }
        
        // Generar ID basat en contingut
        const summary = props.SUMMARY?.value || '';
        const dtstart = props.DTSTART?.value || '';
        const hash = this.simpleHash(summary + dtstart + timestamp);
        
        return `import_${hash}`;
    }
    
    static simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }
}
```

El sistema d'importació proporciona robustesa i flexibilitat per integrar dades externes, mantenint la integritat del sistema mentre facilita la migració des d'altres plataformes de calendari.

---
[← Export Referència](Export-Referència) | [Config Referència →](Config-Referència)