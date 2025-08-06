# Decisions de Disseny i Justificacions

Aquest document explica les decisions arquitectòniques i de disseny preses durant el desenvolupament del Calendari IOC, proporcionant el context, les alternatives considerades i les justificacions per cada decisió important.

## Decisions Arquitectòniques Fonamentals

### 1. Object Literals vs ES6 Classes per Entitats de Dades

**Decisió**: Utilitzar object literals en lloc de classes ES6 per representar calendaris, esdeveniments i categories.

**Context**: 
Al JavaScript modern, tant object literals com classes ES6 poden ser utilitzats per representar entitats de dades.

**Alternatives considerades**:
- **ES6 Classes**: Més modernes, permeten herència, encapsulació de mètodes
- **Object Literals**: Structures de dades simples, fàcil serialització JSON

**Decisió adoptada**: Object Literals

**Justificació**:
```javascript
// Object Literal (escollit)
const calendar = {
    id: "FP_DAM_M07B0_25S1",
    name: "FP DAM M07B0",
    events: [],
    categories: []
};

// Serialització directa
localStorage.setItem('calendar', JSON.stringify(calendar));

// VS ES6 Class (descartat)
class Calendar {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    
    addEvent(event) { /* ... */ }
}

// Problemes de serialització
JSON.stringify(new Calendar(...)); // Perd mètodes
```

**Beneficis**:
- **Serialització perfecta**: JSON.stringify/parse sense pèrdues
- **Simplicitat**: Menys complexitat conceptual
- **Flexibilitat**: Fàcil modificació d'estructura
- **Persistència**: Compatible amb localStorage sense transformacions

**Trade-offs acceptats**:
- Manca d'encapsulació de mètodes en les entitats
- No hi ha validació automàtica a nivell d'entitat
- Compensat amb validació a nivell de manager/service

### 2. Singleton Pattern per AppStateManager

**Decisió**: Implementar AppStateManager com a Singleton

**Context**: 
L'aplicació necessita un punt central per gestionar tot l'estat, accessible des de qualsevol component.

**Alternatives considerades**:
- **Multiple Instances**: Diferents instàncies per diferents àrees
- **Global Object**: Objecte global simple
- **Singleton Pattern**: Una sola instància global

**Decisió adoptada**: Singleton Pattern

**Justificació**:
```javascript
// Singleton implementat
class AppStateManager {
    constructor() {
        if (AppStateManager.instance) {
            return AppStateManager.instance;
        }
        AppStateManager.instance = this;
        this.appState = { /* ... */ };
    }
}

const appStateManager = new AppStateManager(); // Instància global
```

**Beneficis**:
- **Consistència d'estat**: Un sol punt de veritat
- **Accés global**: Disponible des de qualsevol component
- **Control centralitzat**: Totes les mutacions d'estat passant per un punt
- **Debugging**: Fàcil inspecció de tot l'estat

**Consideracions**:
- Fa l'aplicació més fàcil de debugar i mantenir
- Evita problemes de sincronització entre múltiples instàncies

### 3. Event Delegation vs Individual Event Listeners

**Decisió**: Utilitzar Event Delegation amb un sol listener per l'aplicació

**Context**:
L'aplicació genera molt contingut dinàmic (esdeveniments, categories, calendaris) que necessita interactivitat.

**Alternatives considerades**:
- **Individual Listeners**: Un listener per cada element interactiu
- **Component Listeners**: Listeners per cada component
- **Event Delegation**: Un sol listener que delega

**Decisió adoptada**: Event Delegation

**Justificació**:
```javascript
// Event Delegation (escollit)
class Bootstrap {
    initializeEventListeners() {
        // Un sol listener per tota l'aplicació
        document.addEventListener('click', (e) => this.handleClick(e));
    }
    
    handleClick(event) {
        const target = event.target.closest('[data-action]');
        if (!target) return;
        
        const action = target.dataset.action;
        // Routing centralitzat
        this.routeAction(action, target.dataset);
    }
}

// VS Individual Listeners (descartat)
events.forEach(event => {
    const element = document.getElementById(event.id);
    element.addEventListener('click', () => editEvent(event.id));
});
```

**Beneficis**:
- **Rendiment**: Un sol listener vs potencialment centenars
- **Contingut dinàmic**: Funciona automàticament amb elements nous
- **Manteniment**: Lògica centralitzada d'events
- **Memory leaks**: Evita problemes de gestió de listeners

### 4. Manager Pattern per Business Logic

**Decisió**: Organitzar la lògica de negoci en Managers especialitzats

**Context**:
L'aplicació té diferents dominis de funcionalitat que necessiten organització clara.

**Alternatives considerades**:
- **Monolithic Controller**: Un sol controlador gegant
- **Functional Modules**: Mòduls funcionals independents
- **Manager Pattern**: Managers especialitzats per domini

**Decisió adoptada**: Manager Pattern

**Justificació**:
```javascript
// Manager Pattern (escollit)
class CalendarManager {
    addCalendar() { /* lògica específica de calendaris */ }
    deleteCalendar() { /* ... */ }
    switchCalendar() { /* ... */ }
}

class EventManager {
    saveEvent() { /* lògica específica d'esdeveniments */ }
    deleteEvent() { /* ... */ }
    moveEvent() { /* ... */ }
}

// Separació clara de responsabilitats
```

**Beneficis**:
- **Separació de concerns**: Cada manager té una responsabilitat clara
- **Testabilitat**: Fàcil de testejar de forma aïllada
- **Extensibilitat**: Fàcil afegir nous managers
- **Mantenibilitat**: Canvis localitzats

## Decisions de Persistència i Dades

### 5. localStorage vs External Database

**Decisió**: Utilitzar localStorage com a persistència principal

**Context**:
L'aplicació necessita persistir dades d'usuari però és una aplicació web estàtica.

**Alternatives considerades**:
- **External Database**: Base de dades remota amb autenticació
- **Browser Database**: IndexedDB per dades complexes
- **localStorage**: Emmagatzematge simple del navegador

**Decisió adoptada**: localStorage

**Justificació**:
- **Simplicitat de deployment**: Aplicació completament client-side
- **No requereix servidor**: Funciona com a fitxers estàtics
- **Privacitat**: Dades només al dispositiu de l'usuari
- **Rendiment**: Accés instantani sense latència de xarxa

**Limitacions acceptades**:
- Dades limitades al dispositiu/navegador
- No sincronització entre dispositius
- Límit d'emmagatzematge (~5-10MB)

**Mitigació**:
- Sistema d'import/export per migració manual
- Backup automàtic a través d'exportació

### 6. UTC vs Local Time

**Decisió**: Utilitzar UTC internament amb conversió a local per visualització

**Context**:
Els calendaris acadèmics necessiten dates consistents independentment de la zona horària.

**Alternatives considerades**:
- **Local Time**: Treballar sempre amb hora local
- **Mixed Approach**: UTC per emmagatzematge, local per UI
- **Full UTC**: UTC per tot

**Decisió adoptada**: UTC intern, local per visualització

**Justificació**:
```javascript
// DateHelper centralitza la gestió UTC
class DateHelper {
    createUTC(year, month, day) {
        return new Date(Date.UTC(year, month, day));
    }
    
    toUTCString(date) {
        return date.toISOString().split('T')[0];
    }
    
    formatForDisplay(date) {
        return date.toLocaleDateString('ca-ES', { 
            timeZone: 'UTC' 
        });
    }
}
```

**Beneficis**:
- **Consistència**: Dates sempre consistents
- **Evita bugs**: Problemes típics de zona horària
- **Academicament correcte**: Dates acadèmiques són absolutes

## Decisions d'Interfície d'Usuari

### 7. Sistema de Temes: Auto-detect vs Persistent

**Decisió**: Auto-detecció del tema del sistema sense persistència

**Context**:
Els usuaris esperen que les aplicacions respectin les seves preferències de sistema.

**Alternatives considerades**:
- **Always Light**: Sempre tema clar
- **User Choice Persistent**: Elecció de l'usuari guardada
- **System Auto-detect**: Detectar preferència del sistema

**Decisió adoptada**: System Auto-detect sense persistència

**Justificació**:
```javascript
// ThemeHelper
getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 
           'dark' : 'light';
}

loadSavedTheme() {
    // Sempre començar amb el tema del sistema
    const systemTheme = this.getSystemTheme();
    this.applyTheme(systemTheme);
}
```

**Beneficis**:
- **Consistència de sistema**: Coherent amb altres aplicacions
- **Automàtic**: Canvis automàtics si l'usuari canvia sistema
- **Menys configuració**: L'usuari no ha de configurar res

**Trade-off**:
- L'usuari no pot tenir una preferència diferent al sistema
- Compensat amb toggle manual per sessions

### 8. Modal vs Inline Editing

**Decisió**: Utilitzar modals per la majoria d'operacions d'edició

**Context**:
Les operacions d'edició necessiten espai i focus de l'usuari.

**Alternatives considerades**:
- **Inline Editing**: Edició directa en el lloc
- **Sidebar Forms**: Formularis en panells laterals
- **Modal Dialogs**: Finestres modals

**Decisió adoptada**: Modal Dialogs

**Justificació**:
- **Focus**: L'usuari es centra en una tasca
- **Validació**: Espai per validacions i errors
- **Complexitat**: Permet formularis complexos
- **Mobile-friendly**: Funciona bé en mòbils

**Excepció**: Edició inline per noms de categories (operació simple)

## Decisions de Rendiment

### 9. Rendering Strategy: Re-render vs DOM Manipulation

**Decisió**: Re-renderització completa dels components en canvis d'estat

**Context**:
Quan l'estat canvia, la UI necessita actualitzar-se.

**Alternatives considerades**:
- **Incremental DOM**: Només canviar parts específiques
- **Virtual DOM**: Sistema de diferències
- **Full Re-render**: Re-renderitzar components complets

**Decisió adoptada**: Full Re-render

**Justificació**:
- **Simplicitat**: Més fàcil de implementar i debugar
- **Predictibilitat**: Estat UI sempre consistent amb estat de dades
- **Rendiment adequat**: Per la mida de l'aplicació, el rendiment és acceptable
- **Sense framework**: Evita la complexitat d'un framework

**Optimitzacions**:
- Re-render només components afectats
- Batch updates quan és possible

### 10. Code Splitting vs Single Bundle

**Decisió**: Single bundle amb càrrega seqüencial

**Context**:
L'aplicació té múltiples components que podrien carregarse sota demanda.

**Alternatives considerades**:
- **Dynamic Import**: Càrrega sota demanda de components
- **Route-based Splitting**: Divisió per funcionalitat
- **Single Bundle**: Tot en un sol fitxer/càrrega

**Decisió adoptada**: Single Bundle

**Justificació**:
- **Simplicitat de deployment**: Tots els fitxers es carreguen a l'inici
- **Rendiment predictible**: No sorpreses de càrrega
- **Mida manejable**: L'aplicació no és prou gran per justificar splitting
- **Offline-ready**: Un cop carregada, funciona completament offline

## Decisions de Compatibilitat

### 11. Browser Support Strategy

**Decisió**: Suport per navegadors moderns (ES6+)

**Context**:
Calendari IOC és per usuaris de l'IOC amb navegadors moderns.

**Decisió adoptada**: ES6+ sense polyfills

**Justificació**:
- **Audiència target**: Usuaris educatius amb navegadors actualitzats
- **Simplicitat**: Evita transpilació i polyfills
- **Modern APIs**: Pot utilitzar APIs natives modernes
- **Mantenibilitat**: Codi més net i modern

**Mitigació**: Detecció de compatibilitat i missatge informatiu si cal

### 12. Accessibility Strategy

**Decisió**: Accessibilitat incorporada de forma nativa

**Context**:
L'aplicació ha de ser accessible per usuaris amb diferents capacitats.

**Implementació**:
- **Semantic HTML**: Estructura semàntica correcta
- **ARIA attributes**: Quan la semàntica no és suficient
- **Color Contrast**: Compliment WCAG AA
- **Keyboard Navigation**: Navegació completa per teclat

**Justificació**:
- **Inclusivitat**: Accessible per tots els usuaris de l'IOC
- **Compliment estàndards**: Seguiment d'estàndards web
- **Millor UX**: Beneficia tots els usuaris, no només els que tenen necessitats especials

## Conclusions i Leccions Apreses

### Principis Aplicats

1. **Simplicitat sobre sofisticació**: Preferir solucions simples que funcionin
2. **Consistència sobre variabilitat**: Mantenir patrons consistents
3. **Mantenibilitat sobre optimització prematura**: Codi fàcil de mantenir
4. **Funcionalitat sobre perfecció**: Funcionalitat robusta sobre característiques avançades

### Decisions que han funcionat bé

- **Object literals**: Simplicitat de dades ha facilitat el desenvolupament
- **Event delegation**: Ha simplificat enormement la gestió d'events
- **localStorage**: Simplicitat i rapidez sense complexitat de servidor
- **Manager pattern**: Ha mantingut el codi organitzat i extensible

### Àrees per futura evolució

- **Component framework**: Si l'aplicació creix significativament
- **State management library**: Si l'estat es torna més complex
- **Build process**: Si es necessiten optimitzacions de rendiment
- **Backend integration**: Si es requereix sincronització entre dispositius

Aquestes decisions han creat una aplicació robusta, mantenible i extensible que compleix els objectius del projecte Calendari IOC de manera eficient.

---
[← Arquitectura d'Estat](Arquitectura-d-Estat) | [Guia d'Instal·lació Dev →](Guia-d-Instal·lació-Dev)