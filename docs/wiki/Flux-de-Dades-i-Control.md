# Flux de Dades i Control

Aquest document detalla com flueixen les dades i el control a través dels diferents components del Calendari IOC, des de les accions de l'usuari fins a la persistència i actualització de la interfície.

## Visió General del Flux

### Architecture Overview

```
User Action (DOM Event)
          ↓
Event Delegation (Bootstrap)
          ↓
Command Routing (Action Dispatch)
          ↓
Manager Processing (Business Logic)
          ↓
State Update (AppStateManager)
          ↓
Persistence (StorageManager)
          ↓
UI Update (Renderers)
          ↓
DOM Refresh
```

## Flux Detallat per Operacions

### 1. Creació d'un Nou Calendari

#### Fase 1: Iniciació de l'Usuari
```
User clicks "Nou Calendari"
↓
Bootstrap.handleClick() captura l'event
↓
data-action="open-new-calendar-modal" detectat
↓
modalRenderer.openNewCalendarModal() executat
```

#### Fase 2: Configuració del Modal
```
ModalRenderer.openNewCalendarModal()
↓
- Neteja formularis anteriors
- Configura listeners dinàmics per tipus d'estudi
- Obre modal 'calendarSetupModal'
↓
Modal visible amb formulari buit
```

#### Fase 3: Selecció de Tipus
```
User selecciona tipus "FP"
↓
Bootstrap.handleChange() captura el canvi
↓
modalRenderer.setupStudyTypeListener() activat
↓
- Camps dinàmics generats (cicle, mòdul)
- Vista prèvia del nom activada
- Listeners per actualització en temps real
```

#### Fase 4: Validació i Enviament
```
User omple camps i clica "Crear Calendari"
↓
Bootstrap.handleClick() → data-action="save-calendar"
↓
calendarManager.addCalendar() executat
↓
VALIDACIÓ:
- Verificar camps obligatoris
- Validar format de dates
- Comprovar nom únic
```

#### Fase 5: Processament
```
CalendarManager.addCalendar()
↓
Tipus "FP" detectat → processFPCalendar()
↓
SemesterConfig carregada i inicialitzada
↓
Configuració automàtica:
- Categories del sistema (IOC, FESTIU, PAF)
- Esdeveniments del sistema (dates importants)
- Estructura base del calendari
↓
createCalendarData() amb configuració aplicada
```

#### Fase 6: Actualització d'Estat
```
Nou calendari creat → appStateManager.calendars[id] = newCalendar
↓
appStateManager.currentCalendarId = newCalendar.id
↓
storageManager.saveToStorage() → Persistència
```

#### Fase 7: Actualització UI
```
calendarManager.completeCalendarSave()
↓
ACTUALITZACIÓ COORDINADA:
- modalRenderer.closeModal('calendarSetupModal')
- panelsRenderer.renderSavedCalendars()
- panelsRenderer.renderCategories()
- viewManager.renderCurrentView()
↓
UI completament actualitzada amb nou calendari actiu
```

### 2. Creació d'un Esdeveniment

#### Fase 1: Iniciació
```
User clica en una data del calendari
↓
Bootstrap.handleClick() → data-action="add-event"
↓
modalRenderer.openEventModal(null, targetDate)
```

#### Fase 2: Preparació del Modal
```
ModalRenderer.openEventModal()
↓
- Neteja formulari anterior
- Estableix data seleccionada
- Carrega categories disponibles
- Configura validacions
↓
Modal d'esdeveniment obert i preparat
```

#### Fase 3: Enviament
```
User omple dades i clica "Guardar"
↓
Bootstrap.handleClick() → data-action="save-event"
↓
eventManager.saveEvent() executat
```

#### Fase 4: Processament i Validació
```
EventManager.saveEvent()
↓
VALIDACIONS:
- dateValidationService.isDateInCalendarRange()
- Verificar títol no buit
- Validar categoria seleccionada
↓
Generació d'ID únic → IdHelper.generateNextEventId()
↓
Associació amb categoria → CategoryService.findCategoryById()
```

#### Fase 5: Actualització d'Estat
```
Nou esdeveniment → calendar.events.push(newEvent)
↓
calendar.eventCounter++
↓
storageManager.saveToStorage()
```

#### Fase 6: Actualització UI
```
eventManager.completeEventSave()
↓
- modalRenderer.closeModal('eventModal')
- viewManager.renderCurrentView()
- panelsRenderer.renderCategories() (si nova categoria)
```

### 3. Replicació entre Calendaris

#### Fase 1: Iniciació
```
User clica "Replicar Calendari"
↓
replicaManager.openReplicationModal(sourceCalendarId)
```

#### Fase 2: Preparació
```
ReplicaManager.openReplicationModal()
↓
- Identificar calendaris disponibles com a destí
- Poblar selector de calendaris destí
- Guardar ID calendari origen
↓
Modal de replicació obert
```

#### Fase 3: Execució
```
User selecciona destí i clica "Executar Replicació"
↓
replicaManager.executeReplication()
↓
replicaService.replicate(sourceCalendar, targetCalendar)
```

#### Fase 4: Processament Algorítmic
```
ReplicaService.replicate()
↓
ANÀLISI:
- Filtrar esdeveniments de professor (no sistema)
- Calcular espai útil d'origen i destí
- Calcular factor de proporció
↓
MAPEO PROPORCIONAL:
- Per cada esdeveniment origen
- Calcular posició proporcional al destí
- Verificar col·lisions
- Col·locar o marcar com "no ubicat"
```

#### Fase 5: Gestió de Resultats
```
Esdeveniments processats separats en:
- events placed: Col·locats correctament
- events unplaced: No ubicats per conflictes
↓
targetCalendar.events.push(...placedEvents)
↓
appStateManager.unplacedEvents.push(...unplacedEvents)
```

#### Fase 6: Actualització UI amb Persistència
```
replicaManager.completeReplication()
↓
GESTIÓ DE PERSISTÈNCIA:
- Canvi al calendari destí amb gestió de lastVisitedMonths
- Recuperació de l'últim mes visitat del calendari destí
- Validació de rang i aplicació de fallback si cal
↓
UI UPDATE:
- modalRenderer.closeModal('replicationModal')
- panelsRenderer.renderUnplacedEvents()
- viewManager.renderCurrentView() (mostra mes correcte)
- uiHelper.showMessage() amb resum
```

### 4. Canvi de Calendari amb Persistència de Navegació

#### Fase 1: Iniciació de l'Usuari
```
User clica calendari al sidebar
↓
Bootstrap.handleClick() captura event
↓
data-calendar-id="X" detectat
↓
calendarManager.switchCalendar(calendarId) executat
```

#### Fase 2: Persistència de l'Estat Actual
```
calendarManager.switchCalendar(calendarId)
↓
GUARDAR ESTAT ACTUAL:
- currentCalendar = appStateManager.getCurrentCalendar()
- if (currentCalendar && currentDate) {
    appStateManager.lastVisitedMonths[currentCalendar.id] = currentDate
  }
```

#### Fase 3: Canvi de Calendari i Recuperació
```
CANVIAR CALENDARI:
- appStateManager.currentCalendarId = calendarId
↓
RECUPERAR NAVEGACIÓ:
- if (lastVisitedMonths[calendarId] exists) {
    targetDate = parseUTC(lastVisitedMonths[calendarId])
    // Validar rang del calendari
    if (targetDate fora de rang) {
      targetDate = primer mes del calendari
    }
  } else {
    targetDate = primer mes del calendari
  }
↓
APLICAR NOVA DATA:
- appStateManager.currentDate = targetDate
```

#### Fase 4: Actualització UI
```
UI UPDATE:
- viewManager.changeView('month') (sempre vista mensual)
- storageManager.saveToStorage()
- panelsRenderer.renderSavedCalendars() (actualitzar actiu)
- viewManager.renderCurrentView() (mostra mes recordat)
```

### 5. Canvi de Vista amb Neteja de Listeners

#### Fase 1: Iniciació de l'Usuari
```
User clica botó de vista (day/week/month/semester)
↓
Bootstrap.handleClick() captura event
↓
data-view="X" detectat
↓
viewManager.changeView(viewType) executat
```

#### Fase 2: Persistència i Neteja
```
viewManager.changeView(viewType)
↓
PERSISTÈNCIA CONDICIONAL:
- if (currentView === 'month' && viewType !== 'month') {
    // Guardar últim mes visitat abans de sortir
    calendar = getCurrentCalendar()
    lastVisitedMonths[calendar.id] = currentDate
  }
↓
NETEJA DE LISTENERS:
- this.removeScrollListeners()
- // Elimina scroll listeners de vista semestral per evitar interferències
```

#### Fase 3: Actualització Vista
```
CANVI DE VISTA:
- this.currentView = viewType
- appStateManager.currentView = viewType
- document.body.setAttribute('data-current-view', viewType)
↓
UI UPDATE:
- this.updateViewButtons(viewType) (marcar botó actiu)
- this.renderCurrentView() (renderitzar nova vista)
```

### 6. Navegació Mensual amb Persistència Automàtica

#### Fase 1: Iniciació de l'Usuari
```
User clica fletxes de navegació mensual
↓
Bootstrap.handleClick() captura event
↓
data-direction="-1" o "1" detectat
↓
viewManager.navigatePeriod(direction) executat
```

#### Fase 2: Càlcul i Validació
```
viewManager.navigateMonth(direction)
↓
CÀLCUL NOVA DATA:
- newDate = currentDate + direction mesos
- newDateEnd = últim dia del nou mes
↓
VALIDACIÓ RANG:
- if (newDate dins rang calendari) {
    // Data vàlida, continuar
  } else {
    return null // Navegació no permesa
  }
```

#### Fase 3: Persistència Automàtica i Actualització
```
PERSISTÈNCIA AUTOMÀTICA:
- calendar = getCurrentCalendar()
- lastVisitedMonths[calendar.id] = toUTCString(newDate)
↓
ACTUALITZACIÓ:
- appStateManager.currentDate = newDate
- this.renderCurrentView() (mostra nou mes)
- updateNavigationControls() (actualitzar estat fletxes)
```

## Flux de Dades per Components

### AppStateManager → Components

**Lectura d'estat:**
```
ViewManager.renderCurrentView()
↓
calendar = appStateManager.getCurrentCalendar()
↓
renderer.render(calendar, appStateManager.currentDate)
```

**Subscripció a canvis:**
```
Qualsevol canvi a appStateManager
↓
Components afectats es re-renderitzen automàticament
↓
UI sempre consistent amb l'estat
```

### Components → AppStateManager

**Actualització d'estat:**
```
Manager processa acció
↓
appStateManager.property = newValue
↓
storageManager.saveToStorage() (automàtic)
```

### StorageManager ↔ AppStateManager

**Càrrega inicial:**
```
Application startup
↓
storageManager.loadFromStorage()
↓
appStateManager.appState = loadedData
↓
Migracions automàtiques executades
```

**Persistència contínua:**
```
Qualsevol canvi d'estat significatiu
↓
storageManager.saveToStorage()
↓
localStorage actualitzat
```

## Patrons de Comunicació

### Event Delegation Pattern

**Configuració:**
```javascript
// Bootstrap.js
document.addEventListener('click', (e) => this.handleClick(e));
document.addEventListener('change', (e) => this.handleChange(e));
```

**Dispatch:**
```javascript
handleClick(event) {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    
    const action = target.dataset.action;
    const data = target.dataset;
    
    switch (action) {
        case 'add-event':
            modalRenderer.openEventModal(null, data.date);
            break;
        case 'edit-event':
            modalRenderer.openEventModal(data.eventId);
            break;
        // ... altres accions
    }
}
```

### Manager → Manager Communication

**Coordinació entre managers:**
```javascript
// EventManager necessita actualitzar categories
eventManager.saveEvent()
↓
if (newCategoryCreated) {
    categoryManager.addToCatalog(newCategory);
}
↓
panelsRenderer.renderCategories();
```

### Renderer → Renderer Communication

**Actualització en cadena:**
```javascript
panelsRenderer.renderSavedCalendars()
↓
(calendari actiu canviat)
↓
panelsRenderer.renderCategories()
↓
viewManager.renderCurrentView()
```

## Gestió d'Errors i Recuperació

### Error Flow

```
User Action
↓
Validation Error detectat
↓
Manager llança excepció o retorna false
↓
uiHelper.showMessage('Error message', 'error')
↓
UI manté estat anterior (no canvis aplicats)
```

### Recovery Mechanisms

**Storage corruption:**
```
storageManager.loadFromStorage() falla
↓
Dades corruptes detectades
↓
storageManager.clearStorage()
↓
appStateManager.resetAppState()
↓
Application continua amb estat buit
```

**Manager errors:**
```
calendarManager.addCalendar() falla
↓
Estado no modificat
↓
Modal roman obert per correció
↓
Error mostrat a l'usuari
```

## Optimitzacions de Flux

### Lazy Loading

**Configuracions semestrals:**
```
SemesterConfig només carregada quan es necessita
↓
Primera vegada: fetch + parse + cache
↓
Següents vegades: retorn immediat del cache
```

### Batch Updates

**Múltiples canvis d'estat:**
```javascript
// En lloc de:
appStateManager.currentCalendarId = newId;  // Trigger update
appStateManager.currentDate = newDate;      // Trigger update

// Millor:
appStateManager.batchUpdate({
    currentCalendarId: newId,
    currentDate: newDate
});  // Single update trigger
```

### Debounced Operations

**Operacions costoses:**
```javascript
// Search/filter amb debounce
const debouncedSearch = debounce((query) => {
    searchResults = filterCalendars(query);
    renderSearchResults();
}, 300);
```

Aquest sistema de flux assegura que les dades flueixen de manera predictible i eficient a través de tota l'aplicació, mantenint la consistència i proporcionant una experiència d'usuari fluida.

---
[← Patrons Arquitectònics](Patrons-Arquitectònics-Detallats) | [Capes del Sistema →](Capes-del-Sistema)