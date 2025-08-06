# Export - Referència Tècnica

Aquesta referència documenta el sistema d'exportació del Calendari IOC, que permet als usuaris exportar les seves dades en diferents formats estàndard per integració amb altres aplicacions i sistemes.

## Visió General del Sistema d'Export

El **sistema d'export** implementa el patró Strategy per proporcionar múltiples formats d'exportació, cadascun optimitzat per casos d'ús específics. Tots els exportadors segueixen una interfície comuna que garanteix consistència i facilita l'extensibilitat.

### Arquitectura d'Export

**Ubicació**: `js/export/`

**Patró principal**: Strategy Pattern - Cada format d'exportació és una estratègia diferent
**Formats suportats**: JSON (nadiu), ICS (iCalendar), HTML (estàtic)
**Interfície comuna**: Tots implementen mètodes `export()` estàndard

## JsonExporter

### Propòsit i Responsabilitats

El **JsonExporter** genera exports en format JSON nadiu del Calendari IOC, preservant tota la informació i estructura de dades de manera íntegra per a backup, migració o intercanvi de dades.

### API Pública

#### `export(calendar, options)`

Exporta un calendari complet a format JSON amb opcions de filtrat i formatatge.

```javascript
/**
 * Exporta calendari a format JSON
 * @param {Object} calendar - Calendari a exportar
 * @param {Object} options - Opcions d'exportació
 * @returns {string} JSON formatat del calendari
 */
static export(calendar, options = {}) {
    const exportData = {
        metadata: this.generateMetadata(calendar, options),
        calendar: this.serializeCalendar(calendar),
        events: this.serializeEvents(calendar.events, options),
        categories: this.serializeCategories(calendar.categories),
        configuration: this.includeConfiguration(calendar, options)
    };
    
    return this.formatOutput(exportData, options);
}
```

#### `exportMultiple(calendars, options)`

Exporta múltiples calendaris en un únic fitxer JSON.

```javascript
/**
 * Exporta múltiples calendaris
 * @param {Array} calendars - Array de calendaris
 * @param {Object} options - Opcions d'exportació
 * @returns {string} JSON amb múltiples calendaris
 */
static exportMultiple(calendars, options = {}) {
    const exportData = {
        metadata: {
            exportDate: new Date().toISOString(),
            version: '1.0',
            type: 'multi-calendar',
            count: calendars.length,
            ...options.metadata
        },
        calendars: calendars.map(calendar => ({
            id: calendar.id,
            name: calendar.name,
            type: calendar.type,
            data: this.serializeCalendar(calendar)
        }))
    };
    
    return this.formatOutput(exportData, options);
}
```

### Implementació de Serialització

#### Serialització de Calendari

```javascript
/**
 * Serialitza dades base del calendari
 * @param {Object} calendar - Calendari a serialitzar
 * @returns {Object} Dades serialitzades del calendari
 */
static serializeCalendar(calendar) {
    return {
        id: calendar.id,
        name: calendar.name,
        type: calendar.type,
        created: calendar.created || new Date().toISOString(),
        modified: calendar.modified || new Date().toISOString(),
        settings: calendar.settings || {},
        metadata: {
            eventsCount: calendar.events?.length || 0,
            categoriesCount: calendar.categories?.length || 0
        }
    };
}
```

#### Serialització d'Esdeveniments

```javascript
/**
 * Serialitza esdeveniments amb opcions de filtrat
 * @param {Array} events - Array d'esdeveniments
 * @param {Object} options - Opcions de filtrat
 * @returns {Array} Esdeveniments serialitzats
 */
static serializeEvents(events, options = {}) {
    let filteredEvents = events;
    
    // Aplicar filtres de data
    if (options.dateRange) {
        filteredEvents = this.filterByDateRange(events, options.dateRange);
    }
    
    // Aplicar filtres de categoria
    if (options.categories) {
        filteredEvents = this.filterByCategories(filteredEvents, options.categories);
    }
    
    return filteredEvents.map(event => ({
        id: event.id,
        title: event.title,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        description: event.description || '',
        categoryId: event.categoryId,
        isSystemEvent: event.isSystemEvent || false,
        metadata: event.metadata || {}
    }));
}
```

#### Serialització de Categories

```javascript
/**
 * Serialitza categories del calendari
 * @param {Array} categories - Array de categories
 * @returns {Array} Categories serialitzades
 */
static serializeCategories(categories) {
    return categories.map(category => ({
        id: category.id,
        name: category.name,
        color: category.color,
        isSystem: category.isSystem || false,
        description: category.description || ''
    }));
}
```

### Opcions de Configuració

```javascript
/**
 * Opcions per personalitzar l'exportació JSON
 */
const JSON_EXPORT_OPTIONS = {
    // Formatatge de sortida
    pretty: true,           // JSON formatat o compacte
    indent: 2,              // Nivell d'indentació
    
    // Filtres de contingut
    dateRange: {            // Rang de dates a incloure
        start: '2025-01-01',
        end: '2025-12-31'
    },
    categories: [],         // IDs de categories a incloure (buit = totes)
    includeSystemEvents: true,  // Incloure esdeveniments del sistema
    
    // Metadades adicionals
    metadata: {
        author: 'Author Name',
        description: 'Export description',
        tags: ['backup', 'migration']
    },
    
    // Configuració tècnica
    includeConfiguration: true,  // Incloure configuració del calendari
    compressOutput: false        // Comprimir amb algoritmes de text
};
```

## IcsExporter

### Propòsit i Responsabilitats

El **IcsExporter** genera fitxers en format iCalendar (RFC 5545) compatibles amb aplicacions estàndard com Outlook, Google Calendar, Apple Calendar i altres sistemes de calendari.

### API Pública

#### `export(calendar, options)`

Exporta calendari a format ICS estàndard.

```javascript
/**
 * Exporta calendari a format ICS
 * @param {Object} calendar - Calendari a exportar
 * @param {Object} options - Opcions d'exportació
 * @returns {string} Contingut ICS formatat
 */
static export(calendar, options = {}) {
    const icsLines = [];
    
    // Capçalera ICS
    icsLines.push(...this.generateIcsHeader(calendar, options));
    
    // Esdeveniments
    calendar.events.forEach(event => {
        if (this.shouldIncludeEvent(event, options)) {
            icsLines.push(...this.generateIcsEvent(event, calendar));
        }
    });
    
    // Peu ICS
    icsLines.push(...this.generateIcsFooter());
    
    return icsLines.join('\r\n');
}
```

### Implementació ICS

#### Generació de Capçalera

```javascript
/**
 * Genera capçalera estàndard ICS
 * @param {Object} calendar - Calendari origen
 * @param {Object} options - Opcions d'exportació
 * @returns {Array} Línies de capçalera ICS
 */
static generateIcsHeader(calendar, options) {
    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//IOC//Calendari IOC//CA',
        `X-WR-CALNAME:${this.escapeIcsText(calendar.name)}`,
        `X-WR-CALDESC:Calendari ${calendar.type} - ${calendar.name}`,
        'X-WR-TIMEZONE:Europe/Madrid',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH'
    ];
}
```

#### Generació d'Esdeveniments ICS

```javascript
/**
 * Genera esdeveniment en format ICS
 * @param {Object} event - Esdeveniment a convertir
 * @param {Object} calendar - Calendari contenidor
 * @returns {Array} Línies ICS de l'esdeveniment
 */
static generateIcsEvent(event, calendar) {
    const category = this.findCategoryById(event.categoryId, calendar.categories);
    const eventLines = [];
    
    eventLines.push('BEGIN:VEVENT');
    eventLines.push(`UID:${event.id}@calendari-ioc.cat`);
    eventLines.push(`DTSTART:${this.formatIcsDate(event.date, event.startTime)}`);
    
    if (event.endTime) {
        eventLines.push(`DTEND:${this.formatIcsDate(event.date, event.endTime)}`);
    }
    
    eventLines.push(`SUMMARY:${this.escapeIcsText(event.title)}`);
    
    if (event.description) {
        eventLines.push(`DESCRIPTION:${this.escapeIcsText(event.description)}`);
    }
    
    if (category) {
        eventLines.push(`CATEGORIES:${this.escapeIcsText(category.name)}`);
        eventLines.push(`X-CATEGORY-COLOR:${category.color}`);
    }
    
    eventLines.push(`DTSTAMP:${this.formatIcsTimestamp(new Date())}`);
    eventLines.push('END:VEVENT');
    
    return eventLines;
}
```

#### Formatatge de Dates ICS

```javascript
/**
 * Formata data per format ICS
 * @param {string} date - Data en format YYYY-MM-DD
 * @param {string} time - Hora en format HH:MM (opcional)
 * @returns {string} Data formatada per ICS
 */
static formatIcsDate(date, time = null) {
    const dateObj = new Date(date);
    
    if (time) {
        const [hours, minutes] = time.split(':');
        dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        // Format amb hora: YYYYMMDDTHHMMSSZ
        return dateObj.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    } else {
        // Format només data: YYYYMMDD
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }
}
```

#### Escapament de Text ICS

```javascript
/**
 * Escapa text per compatibilitat ICS
 * @param {string} text - Text a escapar
 * @returns {string} Text escapat
 */
static escapeIcsText(text) {
    if (!text) return '';
    
    return text
        .replace(/\\/g, '\\\\')     // Escapar backslashes
        .replace(/;/g, '\\;')       // Escapar semicolons
        .replace(/,/g, '\\,')       // Escapar comes
        .replace(/\n/g, '\\n')      // Escapar salts de línia
        .replace(/\r/g, '');        // Eliminar retorns de carro
}
```

### Opcions ICS

```javascript
/**
 * Opcions per personalitzar l'exportació ICS
 */
const ICS_EXPORT_OPTIONS = {
    // Informació del calendari
    timeZone: 'Europe/Madrid',
    language: 'ca-ES',
    
    // Filtres d'esdeveniments
    includeSystemEvents: true,
    includePrivateEvents: false,
    dateRange: null,
    
    // Compatibilitat
    version: '2.0',
    compatibility: 'standard',  // 'standard', 'outlook', 'google'
    
    // Extensions
    includeColors: true,
    includeCategories: true,
    includeLocation: false
};
```

## HtmlExporter

### Propòsit i Responsabilitats

El **HtmlExporter** genera una pàgina HTML estàtica que mostra el calendari de manera visual i imprimible, útil per a distribució, documentació i arxivatge.

### API Pública

#### `export(calendar, options)`

Exporta calendari com a pàgina HTML completa.

```javascript
/**
 * Exporta calendari a format HTML
 * @param {Object} calendar - Calendari a exportar
 * @param {Object} options - Opcions d'exportació
 * @returns {string} Document HTML complet
 */
static export(calendar, options = {}) {
    const htmlDoc = {
        head: this.generateHtmlHead(calendar, options),
        body: this.generateHtmlBody(calendar, options)
    };
    
    return this.assembleHtmlDocument(htmlDoc, options);
}
```

### Implementació HTML

#### Generació de Capçalera HTML

```javascript
/**
 * Genera capçalera HTML amb estils
 * @param {Object} calendar - Calendari a exportar
 * @param {Object} options - Opcions d'exportació
 * @returns {string} Capçalera HTML
 */
static generateHtmlHead(calendar, options) {
    const styles = this.generateCss(options);
    const title = `${calendar.name} - Calendari IOC`;
    
    return `
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${this.escapeHtml(title)}</title>
            <style>${styles}</style>
        </head>
    `;
}
```

#### Generació de CSS

```javascript
/**
 * Genera estils CSS per al calendari HTML
 * @param {Object} options - Opcions d'estil
 * @returns {string} CSS generat
 */
static generateCss(options = {}) {
    const theme = options.theme || 'light';
    const colors = this.getThemeColors(theme);
    
    return `
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: ${colors.background};
            color: ${colors.text};
        }
        
        .calendar-header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            border-bottom: 2px solid ${colors.border};
        }
        
        .calendar-title {
            font-size: 2em;
            margin-bottom: 10px;
            color: ${colors.primary};
        }
        
        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1px;
            background-color: ${colors.border};
            margin-bottom: 20px;
        }
        
        .day-header {
            background-color: ${colors.headerBg};
            padding: 10px;
            text-align: center;
            font-weight: bold;
        }
        
        .day-cell {
            background-color: ${colors.cellBg};
            min-height: 80px;
            padding: 5px;
            position: relative;
        }
        
        .event {
            background-color: var(--category-color);
            color: white;
            padding: 2px 5px;
            margin: 1px 0;
            border-radius: 3px;
            font-size: 0.8em;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .legend {
            margin-top: 30px;
            padding: 20px;
            border: 1px solid ${colors.border};
            border-radius: 5px;
        }
        
        @media print {
            body { padding: 0; }
            .legend { page-break-inside: avoid; }
        }
    `;
}
```

#### Generació del Cos HTML

```javascript
/**
 * Genera cos HTML amb calendari visual
 * @param {Object} calendar - Calendari a renderitzar
 * @param {Object} options - Opcions de renderització
 * @returns {string} Cos HTML
 */
static generateHtmlBody(calendar, options) {
    const header = this.generateCalendarHeader(calendar);
    const grid = this.generateCalendarGrid(calendar, options);
    const legend = this.generateLegend(calendar.categories);
    const footer = this.generateFooter(options);
    
    return `
        <body>
            ${header}
            ${grid}
            ${legend}
            ${footer}
        </body>
    `;
}
```

#### Generació de Grid del Calendari

```javascript
/**
 * Genera grid visual del calendari
 * @param {Object} calendar - Calendari a renderitzar
 * @param {Object} options - Opcions de vista
 * @returns {string} HTML del grid
 */
static generateCalendarGrid(calendar, options) {
    const { year, month } = this.getDateRange(calendar, options);
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
    
    let gridHtml = '<div class="calendar-grid">';
    
    // Capçaleres dels dies
    const dayHeaders = ['Dg', 'Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds'];
    dayHeaders.forEach(day => {
        gridHtml += `<div class="day-header">${day}</div>`;
    });
    
    // Cel·les buides abans del primer dia
    for (let i = 0; i < firstDayOfWeek; i++) {
        gridHtml += '<div class="day-cell empty"></div>';
    }
    
    // Dies del mes
    for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = this.getEventsForDate(calendar.events, date);
        
        gridHtml += '<div class="day-cell">';
        gridHtml += `<div class="day-number">${day}</div>`;
        
        dayEvents.forEach(event => {
            const category = this.findCategoryById(event.categoryId, calendar.categories);
            const style = category ? `style="--category-color: ${category.color}"` : '';
            gridHtml += `<div class="event" ${style}>${this.escapeHtml(event.title)}</div>`;
        });
        
        gridHtml += '</div>';
    }
    
    gridHtml += '</div>';
    return gridHtml;
}
```

### Opcions HTML

```javascript
/**
 * Opcions per personalitzar l'exportació HTML
 */
const HTML_EXPORT_OPTIONS = {
    // Aparença
    theme: 'light',         // 'light', 'dark'
    layout: 'month',        // 'month', 'week', 'list'
    
    // Contingut
    showLegend: true,
    showHeader: true,
    includeDescription: true,
    
    // Vista temporal
    dateRange: 'current-month',  // 'current-month', 'semester', 'year', 'custom'
    customRange: null,
    
    // Exportació
    optimizeForPrint: false,
    includeStyles: true,
    compactMode: false
};
```

## Factory Pattern per Exportadors

### ExportFactory

```javascript
/**
 * Factory per crear exportadors
 */
class ExportFactory {
    constructor() {
        this.exporters = new Map();
        this.registerDefaultExporters();
    }
    
    registerDefaultExporters() {
        this.register('json', JsonExporter);
        this.register('ics', IcsExporter);
        this.register('html', HtmlExporter);
    }
    
    register(format, exporterClass) {
        this.exporters.set(format, exporterClass);
    }
    
    create(format) {
        const ExporterClass = this.exporters.get(format);
        if (!ExporterClass) {
            throw new Error(`Exporter for format '${format}' not found`);
        }
        return new ExporterClass();
    }
    
    getSupportedFormats() {
        return Array.from(this.exporters.keys());
    }
    
    export(format, calendar, options = {}) {
        const exporter = this.create(format);
        return exporter.export(calendar, options);
    }
}

// Instància global
const exportFactory = new ExportFactory();
```

## Utilitats Comunes d'Export

### Validació de Dades

```javascript
/**
 * Utilitats per validar dades abans d'exportar
 */
class ExportValidator {
    static validateCalendar(calendar) {
        const errors = [];
        
        if (!calendar.id) errors.push('Calendar ID is required');
        if (!calendar.name) errors.push('Calendar name is required');
        if (!Array.isArray(calendar.events)) errors.push('Events must be an array');
        if (!Array.isArray(calendar.categories)) errors.push('Categories must be an array');
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    static validateEvents(events) {
        const errors = [];
        
        events.forEach((event, index) => {
            if (!event.id) errors.push(`Event ${index}: ID is required`);
            if (!event.title) errors.push(`Event ${index}: Title is required`);
            if (!event.date) errors.push(`Event ${index}: Date is required`);
        });
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
```

### Gestió de Fitxers

```javascript
/**
 * Utilitats per gestionar descàrrega de fitxers
 */
class FileDownloadHelper {
    static downloadText(content, filename, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
    
    static getFilename(calendar, format, options = {}) {
        const timestamp = options.includeTimestamp ? 
            `_${new Date().toISOString().slice(0, 10)}` : '';
        
        const safeName = calendar.name
            .replace(/[^a-zA-Z0-9]/g, '_')
            .toLowerCase();
        
        return `${safeName}${timestamp}.${format}`;
    }
}
```

El sistema d'export proporciona flexibilitat màxima per als usuaris, permetent integració amb sistemes externs i preservació de dades en formats estàndard i propietaris.

---
[← Services Referència](Services-Referència) | [Import Referència →](Import-Referència)