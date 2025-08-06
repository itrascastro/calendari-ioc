# Referència de Components UI

Els components UI del Calendari IOC gestionen tota la interfície d'usuari, des dels panells laterals fins als modals de configuració. Aquest document proporciona una referència completa dels dos components principals del sistema UI.

## Estructura dels Components UI

```
js/ui/
├── ModalRenderer.js      # Gestió de modals i formularis
└── PanelsRenderer.js     # Renderitzat de panells laterals
```

---

## ModalRenderer

**Responsabilitat**: Gestió centralitzada de tots els modals i formularis de l'aplicació

### Funcions Bàsiques de Modal

#### `openModal(modalId)`
Obre un modal específic afegint la classe CSS 'show'.

```javascript
openModal(modalId) {
    document.getElementById(modalId)?.classList.add('show');
}
```

**Paràmetres:**
- `modalId` (string): ID del modal a obrir

**Ús:**
```javascript
modalRenderer.openModal('eventModal');
modalRenderer.openModal('calendarSetupModal');
```

#### `closeModal(modalId)`
Tanca un modal específic eliminant la classe CSS 'show'.

```javascript
closeModal(modalId) {
    document.getElementById(modalId)?.classList.remove('show');
}
```

**Paràmetres:**
- `modalId` (string): ID del modal a tancar

### Modals Específics

#### `openNewCalendarModal()`
Configura i obre el modal per crear un nou calendari.

**Funcionalitat:**
- Reinicia l'estat d'edició (`editingCalendarId = null`)
- Configura el títol com "Nou Calendari"
- Neteja formularis anteriors
- Oculta camps dinàmics i botons innecessaris
- Configura listeners per canvis de tipus d'estudi

```javascript
openNewCalendarModal() {
    appStateManager.editingCalendarId = null;
    document.getElementById('setupModalTitle').textContent = 'Nou Calendari';
    document.getElementById('studyType').value = '';
    document.getElementById('dynamicFields').innerHTML = '';
    document.getElementById('namePreview').style.display = 'none';
    document.getElementById('saveCalendarBtn').textContent = 'Crear Calendari';
    document.getElementById('deleteCalendarBtn').style.display = 'none';
    
    this.setupStudyTypeListener();
    this.openModal('calendarSetupModal');
}
```

#### `setupStudyTypeListener()`
Configura la funcionalitat dinàmica per al selector de tipus d'estudi.

**Comportament per tipus:**

**Formació Professional (FP):**
- Camps: Cicle Formatiu, Codi del Mòdul
- Vista prèvia automàtica del nom del calendari
- Integració amb configuració semestral FP

**Batxillerat (BTX):**
- Camps: Curs, Modalitat/Especialitat
- Vista prèvia automàtica del nom
- Integració amb configuració semestral BTX

**Altre:**
- Camp lliure per nom personalitzat
- Sense configuració automàtica

#### `setupFPNamePreview()`
Configura la vista prèvia automàtica per calendaris de Formació Professional.

**Generació del nom:**
Format: `FP_{cicle}_{mòdul}_{codi_semestre}`

Exemple: `FP_DAM_M07B0_25S1`

#### `setupBTXNamePreview()`
Configura la vista prèvia automàtica per calendaris de Batxillerat.

**Generació del nom:**
Format: `BTX_{curs}_{modalitat}_{codi_semestre}`

#### `openEditCalendarModal(calendarId)`
Configura i obre el modal per editar un calendari existent.

**Funcionalitat:**
- Carrega dades del calendari seleccionat
- Configura el títol com "Editar Calendari"
- Omple els camps amb valors existents
- Mostra el botó d'eliminació
- Estableix l'estat d'edició

#### `openEventModal(eventId, date)`
Obre el modal de gestió d'esdeveniments.

**Modes d'operació:**

**Crear nou esdeveniment:**
```javascript
modalRenderer.openEventModal(null, '2024-10-15');
```

**Editar esdeveniment existent:**
```javascript
modalRenderer.openEventModal('FP_DAM_M07B0_25S1_E3');
```

**Funcionalitat:**
- Carrega categories disponibles al selector
- Configura validació de dates
- Gestiona camps opcionals (descripció)
- Sincronitza amb el sistema de drag & drop

#### `populateEventCategories(calendarId)`
Pobla el selector de categories en el modal d'eventos.

**Ordre de categories:**
1. Categories del sistema (IOC, FESTIU, PAF)
2. Categories del catàleg global
3. Categories específiques del calendari

**Gestió d'opcions:**
- Agrupa categories per tipus
- Marca categories del sistema visualment
- Permet creació de noves categories sobre la marxa

### Gestió de Formularis

#### `validateEventForm()`
Valida el formulari d'esdeveniments abans de guardar.

**Validacions:**
- Títol obligatori i no buit
- Data dins del rang del calendari
- Categoria seleccionada o creada
- Format de data correcte

#### `validateCalendarForm()`
Valida el formulari de calendaris.

**Validacions per tipus:**
- **FP**: Cicle i mòdul obligatoris, format correcte
- **BTX**: Curs i modalitat obligatoris
- **Altre**: Nom personalitzat obligatori

**Validacions comunes:**
- Dates d'inici i fi vàlides
- Rang de dates lògic (inici < fi)
- Nom de calendari únic

---

## PanelsRenderer

**Responsabilitat**: Renderitzat dels panells laterals (calendaris, categories, esdeveniments)

### Renderització de Calendaris

#### `renderSavedCalendars()`
Renderitza la llista de calendaris guardats al panell lateral.

```javascript
renderSavedCalendars() {
    const container = document.getElementById('calendars-list-container');
    if (!container) return;
    
    const calendarIds = Object.keys(appStateManager.calendars);
    if (calendarIds.length === 0) {
        container.innerHTML = `<p>Crea o carrega un calendari.</p>`;
        return;
    }
    
    container.innerHTML = calendarIds.map(id => {
        const calendar = appStateManager.calendars[id];
        const isActive = id === appStateManager.currentCalendarId;
        const startDate = dateHelper.formatForDisplay(dateHelper.parseUTC(calendar.startDate));
        const endDate = dateHelper.formatForDisplay(dateHelper.parseUTC(calendar.endDate));
        return `
            <div class="calendar-list-item ${isActive ? 'active' : ''}" data-calendar-id="${id}">
                <div class="calendar-info" data-action="switch-calendar">
                    <div class="calendar-name">${calendar.name}</div>
                    <div class="calendar-dates">${startDate} - ${endDate}</div>
                </div>
                <button class="actions-menu" data-action="open-calendar-actions-modal" data-calendar-id="${id}">⋮</button>
            </div>
        `;
    }).join('');
}
```

**Funcionalitat:**
- Mostra tots els calendaris disponibles
- Marca el calendari actiu visualment
- Inclou dates formatejades per context
- Proporciona menú d'accions per calendari

### Renderització de Categories

#### `renderCategories()`
Renderitza les categories disponibles per al calendari actual.

**Estratègia de combinació:**
1. **Categories del sistema**: IOC, FESTIU, PAF (sempre visibles, no editables)
2. **Catàleg global**: Categories reutilitzables entre calendaris
3. **Categories específiques**: Categories úniques del calendari actual

```javascript
renderCategories() {
    const calendar = appStateManager.getCurrentCalendar();
    if (!calendar) {
        container.innerHTML = '<p>Selecciona un calendari.</p>';
        return;
    }

    const systemCategories = calendar.categories.filter(cat => cat.isSystem);
    const calendarSpecificCategories = calendar.categories.filter(cat => !cat.isSystem);
    const catalogCategories = appStateManager.categoryTemplates.filter(template => 
        !calendarSpecificCategories.some(calCat => calCat.id === template.id)
    );
    
    const allCategories = [...systemCategories, ...catalogCategories, ...calendarSpecificCategories];
}
```

**Representació visual:**
- Color de fons de cada categoria
- Nom editable (excepte categories del sistema)
- Botó d'eliminació (només categories d'usuari)
- Indicador visual per categories del sistema

#### `renderCategoryItem(category)`
Renderitza un element individual de categoria.

**Elements generats:**
- Quadrat de color de la categoria
- Nom de la categoria (editable o no)
- Botons d'acció segons el tipus de categoria

### Renderització d'Esdeveniments No Ubicats

#### `renderUnplacedEvents()`
Renderitza la llista d'esdeveniments que no s'han pogut ubicar durant la replicació.

```javascript
renderUnplacedEvents() {
    const container = document.getElementById('unplaced-events-container');
    const unplacedEvents = appStateManager.unplacedEvents;
    
    if (unplacedEvents.length === 0) {
        container.innerHTML = '<p>No hi ha esdeveniments per ubicar.</p>';
        return;
    }
    
    container.innerHTML = unplacedEvents.map((unplaced, index) => `
        <div class="unplaced-event-item" data-index="${index}">
            <div class="event-info">
                <div class="event-title">${unplaced.event.title}</div>
                <div class="event-original-date">Data original: ${unplaced.event.date}</div>
                <div class="event-source">De: ${unplaced.sourceCalendar.name}</div>
            </div>
            <button class="place-event-btn" data-action="place-unplaced-event" data-index="${index}">
                Col·locar
            </button>
        </div>
    `).join('');
}
```

**Funcionalitat:**
- Mostra informació de l'esdeveniment original
- Indica el calendari d'origen
- Proporciona botó per col·locació manual
- Actualitza automàticament després de col·locar esdeveniments

### Gestió d'Estats Visuals

#### `updateActiveCalendar(calendarId)`
Actualitza visualment quin calendari està actiu.

**Accions:**
- Elimina classe 'active' de tots els elements
- Afegeix classe 'active' al calendari seleccionat
- Actualitza contingut dependent del calendari actiu

#### `showLoadingState(containerId)`
Mostra estat de càrrega durant operacions llargues.

#### `showEmptyState(containerId, message)`
Mostra missatge quan no hi ha contingut per mostrar.

### Integració amb Event Delegation

**Data attributes utilitzats:**
- `data-action`: Tipus d'acció a executar
- `data-calendar-id`: ID del calendari associat
- `data-category-id`: ID de la categoria associada
- `data-event-id`: ID de l'esdeveniment associat
- `data-index`: Índex per llistes dinàmiques

**Accions suportades:**
- `switch-calendar`: Canviar calendari actiu
- `open-calendar-actions-modal`: Obrir menú d'accions de calendari
- `edit-category`: Activar edició de categoria
- `delete-category`: Eliminar categoria
- `place-unplaced-event`: Col·locar esdeveniment no ubicat

---

## Integració ModalRenderer ↔ PanelsRenderer

### Flux de Treball Típic

```
User Action → ModalRenderer (Input) → Manager (Process) → PanelsRenderer (Update)
```

**Exemple: Crear nova categoria**
1. Usuario usa modal per crear categoria (`ModalRenderer`)
2. `CategoryManager` processa la creació
3. `PanelsRenderer.renderCategories()` actualitza la vista

### Sincronització d'Estats

**Després de canvis significatius:**
```javascript
// Exemple en CalendarManager
completeCalendarCreation() {
    // ... lògica de creació ...
    
    modalRenderer.closeModal('calendarSetupModal');  // Tancar modal
    panelsRenderer.renderSavedCalendars();           // Actualitzar llista
    panelsRenderer.renderCategories();               // Actualitzar categories
    viewManager.renderCurrentView();                 // Actualitzar vista principal
}
```

### Gestió d'Errors UI

**Missatges d'error en modals:**
- Validació en temps real
- Missatges contextuals
- Prevenció de submit amb errors

**Missatges d'error en panells:**
- Estats buits informatiu
- Missatges d'error de càrrega
- Indicadors d'estat per operacions llargues

Aquests components UI proporcionen una interfície robusta i consistent per a tota l'aplicació, seguint patrons de disseny moderns i mantenint una separació clara entre presentació i lògica de negoci.

---
[← State Management](state-Referència) | [Views →](views-Referència)