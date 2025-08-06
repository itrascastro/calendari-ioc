# Referència de Views i Renderitzadors

El sistema de vistes del Calendari IOC proporciona múltiples perspectives per visualitzar els calendaris: vista global, semestral, mensual, setmanal i diària. Aquest document detalla l'arquitectura del sistema de views i els renderitzadors específics.

## Arquitectura del Sistema de Views

### Estructura de Fitxers

```
js/
├── managers/
│   └── ViewManager.js          # Coordinador central de vistes
└── ui/views/
    ├── CalendarRenderer.js      # Classe base abstracta
    ├── GlobalViewRenderer.js    # Vista de tots els calendaris
    ├── SemesterViewRenderer.js  # Vista completa del semestre
    ├── MonthViewRenderer.js     # Vista mensual (per defecte)
    ├── WeekViewRenderer.js      # Vista setmanal
    └── DayViewRenderer.js       # Vista diària detallada
```

### Patró de Disseny

**Herència i Polimorfisme:**
- `CalendarRenderer`: Classe base amb funcionalitat compartida
- Renderitzadors específics: Hereten i especialitzen comportaments
- **Strategy Pattern**: ViewManager selecciona el renderitzador apropiat

---

## ViewManager

**Responsabilitat**: Coordinació central de totes les vistes del calendari

### Propietats Principals

```javascript
class ViewManager {
    constructor() {
        this.currentView = 'month';  // Vista activa
        this.availableViews = ['global', 'semester', 'month', 'week', 'day'];
        this.renderers = {
            global: null,
            month: null,
            day: null,
            week: null,
            semester: null
        };
    }
}
```

### Gestió de Vistes

#### `changeView(viewType)`
Canvia la vista activa i re-renderitza el calendari.

```javascript
changeView(viewType) {
    if (!this.availableViews.includes(viewType)) {
        console.warn(`Vista no vàlida: ${viewType}`);
        return false;
    }
    
    this.currentView = viewType;
    appStateManager.currentView = viewType;
    document.body.setAttribute('data-current-view', viewType);
    this.updateViewButtons(viewType);
    this.renderCurrentView();
    
    return true;
}
```

**Funcionalitat:**
- Valida que la vista existeix
- Actualitza l'estat global
- Modifica atributs CSS per styling
- Actualitza botons de navegació  
- Re-renderitza amb la nova vista

#### `renderCurrentView()`
Renderitza la vista actualment activa.

```javascript
renderCurrentView() {
    const calendar = appStateManager.getCurrentCalendar();
    if (!calendar) {
        this.renderEmptyState();
        return;
    }
    
    const renderer = this.renderers[this.currentView];
    if (!renderer) {
        console.error(`Renderitzador no trobat: ${this.currentView}`);
        return;
    }
    
    renderer.render(calendar, appStateManager.currentDate);
}
```

#### `changeToDateView(dateStr)`
Canvia a la vista diària d'una data específica.

**Funcionalitat:**
- Valida que la data està dins del rang del calendari
- Actualitza la data actual a l'estat
- Canvia a vista diària
- Centralitza la navegació per data

### Navegació Temporal

#### `navigateToDate(targetDate)`
Navega a una data específica mantenint la vista actual.

#### `navigateToPrevious()` / `navigateToNext()`
Navegació relativa segons la vista activa:
- **Month**: Mes anterior/següent
- **Week**: Setmana anterior/següent  
- **Day**: Dia anterior/següent
- **Semester**: Semestre anterior/següent

---

## CalendarRenderer (Classe Base)

**Responsabilitat**: Funcionalitat compartida per tots els renderitzadors de calendari

### Generació de Dades

#### `generateDayData(date, calendar, isOutOfMonth)`
Genera l'estructura de dades per un dia específic.

```javascript
generateDayData(date, calendar, isOutOfMonth = false) {
    const dateStr = dateHelper.toUTCString(date);
    const dayData = {
        date: date,
        dateStr: dateStr,
        dayNumber: date.getUTCDate(),
        isOutOfMonth: isOutOfMonth,
        isToday: false,
        weekNumber: null,
        events: []
    };
    
    if (calendar && !isOutOfMonth && dateValidationService.isDateInCalendarRange(dateStr, calendar)) {
        dayData.weekNumber = dateHelper.getCalendarWeekNumber(date, calendar.startDate);
        dayData.events = calendar.events.filter(e => e.date === dateStr);
    }
    
    return dayData;
}
```

**Estructura retornada:**
- **date**: Objecte Date
- **dateStr**: String UTC (YYYY-MM-DD)
- **dayNumber**: Número del dia (1-31)
- **isOutOfMonth**: Dia de mesos adjacents
- **weekNumber**: Setmana del calendari acadèmic
- **events**: Array d'esdeveniments del dia

### Renderització d'Esdeveniments

#### `generateEventHTML(event, calendar, outputFormat)`
Genera HTML per un esdeveniment específic.

**Modes de sortida:**

**DOM (interactiu):**
```javascript
const truncatedTitle = textHelper.truncateText(event.title, 30);
const eventClasses = ['event', isUserEvent ? 'is-user-event' : 'is-system-event'];
const openModalAction = isUserEvent ? `data-action="open-event-modal" data-event="${JSON.stringify(event).replace(/"/g, '&quot;')}"` : '';
const draggableAttr = isUserEvent ? 'draggable="true"' : '';
const contrastStyle = colorContrastHelper.getContrastStyle(color);

return `<div class="${eventClasses.join(' ')}" style="${contrastStyle}" ${openModalAction} ${draggableAttr} title="${event.title}">${truncatedTitle}</div>`;
```

**HTML (exportació):**
```javascript
const systemClass = event.isSystemEvent ? ' system' : '';
const contrastStyle = colorContrastHelper.getContrastStyle(color);
return `<div class="event-item${systemClass}" style="${contrastStyle}" title="${event.title}">${event.title}</div>`;
```

### Utilitats Compartides

#### `isDayInCalendarRange(dayData, calendar)`
Verifica si un dia està dins del rang vàlid del calendari.

#### `completePeriodStartDays(firstDay, startOffset, calendar)`
Genera dies del període anterior per completar graelles.

#### `completePeriodEndDays(lastDay, endOffset, calendar)`
Genera dies del període següent per completar graelles.

---

## Renderitzadors Específics

### MonthViewRenderer

**Vista per defecte de l'aplicació, mostra un mes complet en format graella.**

#### Funcionalitat Principal

```javascript
render(calendar, currentDate, outputFormat = 'DOM') {
    const year = currentDate.getUTCFullYear();
    const month = currentDate.getUTCMonth();
    
    // Calcular primers i últims dies del mes
    const firstDayOfMonth = dateHelper.createUTC(year, month, 1);
    const lastDayOfMonth = dateHelper.createUTC(year, month + 1, 0);
    const startDayOfWeek = firstDayOfMonth.getUTCDay() === 0 ? 6 : firstDayOfMonth.getUTCDay() - 1;
    
    const monthData = {
        year: year,
        month: month,
        monthName: dateHelper.getMonthName(currentDate),
        days: []
    };
    
    // Completar graella 7x6
    const prevDays = this.completePeriodStartDays(firstDayOfMonth, startDayOfWeek, calendar);
    monthData.days.push(...prevDays);
    
    // Dies del mes actual
    for (let i = 1; i <= lastDayOfMonth.getUTCDate(); i++) {
        const date = dateHelper.createUTC(year, month, i);
        monthData.days.push(this.generateDayData(date, calendar, false));
    }
    
    // Dies següents per completar
    const totalCells = startDayOfWeek + lastDayOfMonth.getUTCDate();
    const nextMonthCells = (7 - (totalCells % 7)) % 7;
    // ... completar graella
    
    return outputFormat === 'HTML' ? 
           this.generateHTMLOutput(monthData, calendar) : 
           this.generateDOMOutput(monthData, calendar);
}
```

**Característiques:**
- **Graella 7x6**: Setmanes completes sempre visibles
- **Dies adjacents**: Mostra dies dels mesos anterior i següent
- **Esdeveniments visuals**: Esdeveniments truncats per espai
- **Drag & Drop**: Suporta arrossegar esdeveniments entre dies

### WeekViewRenderer

**Vista setmanal detallada amb més espai per esdeveniments.**

#### Funcionalitat

```javascript
render(calendar, currentDate, outputFormat = 'DOM') {
    const weekStart = dateHelper.getWeekStartDate(currentDate);
    const weekData = {
        weekNumber: dateHelper.getCalendarWeekNumber(currentDate, calendar.startDate),
        days: []
    };
    
    // Generar 7 dies de la setmana
    for (let i = 0; i < 7; i++) {
        const date = dateHelper.addDays(weekStart, i);
        weekData.days.push(this.generateDayData(date, calendar, false));
    }
    
    return outputFormat === 'HTML' ? 
           this.generateHTMLOutput(weekData, calendar) : 
           this.generateDOMOutput(weekData, calendar);
}
```

**Característiques:**
- **7 dies consecutius**: Dilluns a diumenge
- **Més detall**: Esdeveniments amb títols complets
- **Navegació ràpida**: Setmana anterior/següent
- **Numeració setmanes**: Basada en calendari acadèmic

### DayViewRenderer

**Vista diària amb màxim detall per un sol dia.**

#### Funcionalitat

```javascript
render(calendar, currentDate, outputFormat = 'DOM') {
    const dayData = this.generateDayData(currentDate, calendar, false);
    
    // Afegir informació extra per vista diària
    dayData.detailedEvents = dayData.events.map(event => ({
        ...event,
        categoryName: categoryService.getCategoryName(event.categoryId, calendar),
        categoryColor: categoryService.getCategoryColor(event.categoryId, calendar)
    }));
    
    return outputFormat === 'HTML' ? 
           this.generateHTMLOutput(dayData, calendar) : 
           this.generateDOMOutput(dayData, calendar);
}
```

**Característiques:**
- **Un sol dia**: Focus total en esdeveniments del dia
- **Detall complet**: Descripcions, categories, tots els camps
- **Edició directa**: Accés ràpid a edició d'esdeveniments
- **Context temporal**: Navegació dia anterior/següent

### SemesterViewRenderer

**Vista panoràmica de tot el semestre.**

#### Funcionalitat

```javascript
render(calendar, currentDate, outputFormat = 'DOM') {
    const semesterData = {
        startDate: dateHelper.parseUTC(calendar.startDate),
        endDate: dateHelper.parseUTC(calendar.endDate),
        months: []
    };
    
    // Generar tots els mesos del semestre
    let currentMonth = semesterData.startDate;
    while (currentMonth <= semesterData.endDate) {
        const monthData = this.generateMonthSummary(currentMonth, calendar);
        semesterData.months.push(monthData);
        currentMonth = dateHelper.addMonths(currentMonth, 1);
    }
    
    return outputFormat === 'HTML' ? 
           this.generateHTMLOutput(semesterData, calendar) : 
           this.generateDOMOutput(semesterData, calendar);
}
```

**Característiques:**
- **Vista completa**: Tot el periode del calendari
- **Resum mensual**: Esdeveniments agrupats per mes
- **Distribució temporal**: Visió global de la càrrega de treball
- **Navegació ràpida**: Saltar a qualsevol mes

### GlobalViewRenderer

**Vista de tots els calendaris simultàniament.**

#### Funcionalitat

```javascript
render(calendars, currentDate, outputFormat = 'DOM') {
    const globalData = {
        calendars: Object.values(calendars).map(calendar => ({
            id: calendar.id,
            name: calendar.name,
            summary: this.generateCalendarSummary(calendar),
            recentEvents: this.getRecentEvents(calendar, 5)
        }))
    };
    
    return outputFormat === 'HTML' ? 
           this.generateHTMLOutput(globalData) : 
           this.generateDOMOutput(globalData);
}
```

**Característiques:**
- **Multi-calendari**: Tots els calendaris en una vista
- **Resum executiu**: Estadístiques de cada calendari
- **Esdeveniments destacats**: Esdeveniments propers de tots els calendaris
- **Navegació calendaris**: Canvi ràpid entre calendaris

---

## Integració amb Altres Components

### ViewManager ↔ AppStateManager

**Sincronització d'estat:**
```javascript
// Quan canvia la vista
viewManager.changeView('week');
// ↓
appStateManager.currentView = 'week';

// Quan canvia la data
appStateManager.currentDate = newDate;
// ↓
viewManager.renderCurrentView();
```

### ViewManager ↔ PanelsRenderer

**Actualització coordinada:**
```javascript
// Després de canvis de dades
storageManager.saveToStorage();           // Persistir
panelsRenderer.renderSavedCalendars();    // Actualitzar panells
viewManager.renderCurrentView();          // Actualitzar vista principal
```

### Renderitzadors ↔ Event System

**Data attributes per interactivitat:**
```javascript
// Eventos d'usuari
`data-action="open-event-modal" data-event="${JSON.stringify(event)}"`

// Drag & Drop
`draggable="true" data-event-id="${event.id}"`

// Navegació de dates
`data-action="navigate-to-date" data-date="${dateStr}"`
```

---

## Optimitzacions de Rendiment

### Renderització Selectiva

**Només re-renderitzar quan cal:**
- Canvis en esdeveniments del calendari actiu
- Canvis de vista
- Navegació temporal
- Canvis de tema (CSS, no re-renderització)

### Reutilització de Dades

**Cache de càlculs costosos:**
- Número de setmana del calendari acadèmic
- Validacions de rang de dates
- Combinacions de categories

### Lazy Loading

**Càrrega diferida de vistes:**
- Els renderitzadors es carreguen només quan es necessiten
- Inicialització diferida de components pesants

Aquest sistema de vistes proporciona una arquitectura flexible i escalable que permet afegir noves vistes fàcilment mentre manté la consistència i el rendiment de l'aplicació.

---
[← UI Components](ui-Referència) | [Helpers →](helpers-Referència)