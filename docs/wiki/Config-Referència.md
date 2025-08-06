# Config - Referència Tècnica

Aquesta referència documenta el sistema de configuració del Calendari IOC, que gestiona la càrrega dinàmica de configuracions semestrals, esdeveniments del sistema i paràmetres específics per a diferents tipus de calendaris.

## Visió General del Sistema de Configuració

El **sistema de configuració** implementa un carregador dinàmic que combina múltiples fonts de configuració JSON per proporcionar esdeveniments del sistema, categories per defecte i paràmetres específics segons el tipus de calendari.

### Arquitectura de Configuració

**Ubicació**: `js/config/`

**Fitxers de configuració**: `config/*.json`
**Patró principal**: Strategy Pattern amb Composition per combinar configuracions
**Càrrega dinàmica**: Configuracions carregades segons demanda i tipus de calendari

## SemesterConfig

### Propòsit i Responsabilitats

El **SemesterConfig** és el component central que gestiona la càrrega, validació i fusió de configuracions per a diferents tipus de calendaris, proporcionant una interfície unificada per accedir a esdeveniments del sistema i categories predefinides.

### API Pública

#### `constructor(calendarType)`

Crea una nova instància de SemesterConfig per al tipus de calendari especificat.

```javascript
const fpConfig = new SemesterConfig('FP');     // Formació Professional
const btxConfig = new SemesterConfig('BTX');   // Batxillerat  
const altreConfig = new SemesterConfig('Altre'); // Calendari personalitzat
```

#### `async initialize()`

Inicialitza la configuració carregant els fitxers JSON corresponents.

```javascript
const config = new SemesterConfig('FP');
await config.initialize();
// Ara la configuració està llesta per usar
```

#### Getters principals

```javascript
// Informació del semestre
config.getSemester()           // Objecte amb dates i codi
config.getStartDate()          // Data d'inici
config.getEndDate()            // Data de fi  
config.getSemesterCode()       // Codi del semestre

// Esdeveniments i categories
config.getSystemEvents()       // Esdeveniments del sistema processats
config.getDefaultCategories()  // Categories per defecte processades
```

### Mètodes de Processament Automàtic

#### `generateEventIds(events)`

Processa els esdeveniments carregats dels fitxers JSON afegint IDs únics i la propietat `isSystemEvent: true`.

```javascript
// Processament automàtic d'esdeveniments
generateEventIds(events) {
    return events.map((event, index) => ({
        ...event,
        id: `SYS_EVENT_${index + 1}`,
        isSystemEvent: true  // Afegit automàticament
    }));
}
```

**Nota**: Els fitxers JSON ja no contenen `"isSystemEvent": true` redundant. Aquesta propietat s'afegeix automàticament durant el processament.

#### `addIsSystemToCategories(categories)`

Processa les categories del sistema afegint automàticament la propietat `isSystem: true`.

```javascript
// Processament automàtic de categories del sistema
addIsSystemToCategories(categories) {
    return categories.map(category => ({
        ...category,
        isSystem: true  // Afegit automàticament
    }));
}
```

**Nota**: El fitxer `sys-categories.json` ja no conté `"isSystem": true` redundant. Aquesta propietat s'afegeix automàticament durant la càrrega.

### Implementació Interna

```javascript
// Exemple d'ús complet
const fpConfig = new SemesterConfig('FP');
await fpConfig.initialize();

// Accés a la configuració processada  
const events = fpConfig.getSystemEvents();     // Amb isSystemEvent: true
const categories = fpConfig.getDefaultCategories(); // Amb isSystem: true  
const startDate = fpConfig.getStartDate();     // "2025-09-12"
```

## Estructura dels Fitxers JSON

### Fitxers d'esdeveniments

**config/common-semestre.json**, **config/fp-semestre.json**, **config/btx-semestre.json**:

```json
{
  "systemEvents": [
    {
      "title": "Festiu BCN",
      "date": "2025-09-24", 
      "categoryId": "SYS_CAT_2"
      // Nota: NO conté "isSystemEvent": true (s'afegeix automàticament)
    }
  ]
}
```

### Fitxer de categories del sistema

**config/sys-categories.json**:

```json
[
  {
    "id": "SYS_CAT_1",
    "name": "IOC_GENERIC"
    // Nota: NO conté "isSystem": true (s'afegeix automàticament)
  }
]
```

## Flux de Processament

1. **Càrrega inicial**: `new SemesterConfig(type)`
2. **Inicialització**: `await config.initialize()`
3. **Processament automàtic**:
   - `generateEventIds()` afegeix IDs i `isSystemEvent: true`
   - `addIsSystemToCategories()` afegeix `isSystem: true`  
4. **Accés a dades**: Ús dels getters públics

Aquest sistema manté els fitxers JSON nets eliminant redundància mentre proporciona les propietats necessàries durant l'execució.
