# Guia d'Instal·lació per Desenvolupadors

Aquesta guia proporciona instruccions detallades per configurar un entorn de desenvolupament per al Calendari IOC, incloent les eines necessàries, configuració del projecte i primers passos per començar a desenvolupar.

## Requisits del Sistema

### Requisits Mínims

**Sistema operatiu:**
- Windows 10+ / macOS 10.14+ / Linux Ubuntu 18.04+
- Suport per aplicacions web modernes

**Navegadors suportats:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Eines de desenvolupament:**
- Editor de codi (recomanat: VS Code)
- Git 2.20+
- Servidor web local (opcional)

### Requisits Recomanats

**Hardware:**
- RAM: 8GB mínima, 16GB recomanada
- Disc: 5GB espai lliure mínim
- Procesador: Multi-core moderns

**Eines adicionals:**
- Node.js 16+ (per eines de desenvolupament opcionals)
- Extension Live Server per VS Code
- GitKraken o SourceTree (GUI Git opcional)

## Instal·lació i Configuració

### Pas 1: Clonació del Repositori

```bash
# Clonar el repositori
git clone https://github.com/itrascastro/ioc-modul-calendari.git

# Navegar al directori del projecte
cd ioc-modul-calendari

# Verificar que tots els fitxers s'han descarregat
ls -la
```

**Estructura esperada:**
```
ioc-modul-calendari/
├── css/
├── js/
├── config/
├── docs/
├── index.html
└── README.md
```

### Pas 2: Configuració de l'Editor

#### Visual Studio Code (Recomanat)

**Extensions recomanades:**
```json
{
  "recommendations": [
    "ms-vscode.vscode-json",
    "ritwickdey.liveserver",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag"
  ]
}
```

**Configuració de workspace** (`.vscode/settings.json`):
```json
{
  "editor.tabSize": 4,
  "editor.insertSpaces": true,
  "editor.formatOnSave": true,
  "files.encoding": "utf8",
  "files.eol": "\n",
  "files.trimTrailingWhitespace": true,
  "javascript.preferences.includePackageJsonAutoImports": "off",
  "typescript.preferences.includePackageJsonAutoImports": "off"
}
```

### Pas 3: Configuració del Servidor Local

#### Opció A: Live Server (VS Code)

1. Instal·lar l'extensió "Live Server"
2. Obrir `index.html`
3. Clic dret → "Open with Live Server"
4. L'aplicació s'obrirà a `http://localhost:5500`

#### Opció B: Servidor Python

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Accedir a http://localhost:8000
```

#### Opció C: Servidor Node.js

```bash
# Instal·lar http-server globalment
npm install -g http-server

# Executar des del directori del projecte
http-server -p 8000

# Accedir a http://localhost:8000
```

### Pas 4: Verificació de la Instal·lació

**Proves bàsiques:**
1. L'aplicació carrega sense errors a la consola
2. Es pot crear un calendari nou
3. Es poden afegir esdeveniments
4. Els temes clar/fosc funcionen
5. La persistència funciona (recarregar pàgina manté dades)

## Estructura del Projecte

### Organització de Fitxers

```
ioc-modul-calendari/
├── css/                    # Estils
│   ├── base.css           # Estils base i variables CSS
│   └── calendar.css       # Estils específics del calendari
├── js/                     # Codi JavaScript
│   ├── Bootstrap.js       # Punt d'entrada i coordinació
│   ├── managers/          # Gestors de lògica de negoci
│   ├── state/             # Gestió d'estat i persistència
│   ├── ui/                # Components d'interfície d'usuari
│   ├── helpers/           # Utilitats i funcions auxiliars
│   ├── services/          # Serveis de domini específic
│   ├── export/            # Exportadors de dades
│   ├── import/            # Importadors de dades
│   └── config/            # Configuració i constants
├── config/                # Fitxers de configuració JSON
│   ├── common-semestre.json
│   ├── fp-semestre.json
│   └── btx-semestre.json
├── docs/                  # Documentació del projecte
│   └── wiki/              # Pàgines de documentació
├── screenshots/           # Captures de pantalla
├── index.html            # Pàgina principal
└── README.md             # Documentació bàsica
```

### Convencions de Noms

**Fitxers JavaScript:**
- Classes: `PascalCase` (ex: `CalendarManager.js`)
- Funcions i variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

**Fitxers CSS:**
- Classes: `kebab-case`
- Variables CSS: `--kebab-case`

**Fitxers de configuració:**
- Format: `tipus-semestre.json`
- Noms descriptius en català

## Configuració de Desenvolupament

### Variables d'Entorn

El projecte no utilitza variables d'entorn tradicionals, però es poden configurar constants de desenvolupament:

```javascript
// js/config/DevConfig.js (crear si cal)
const DEV_CONFIG = {
    DEBUG_MODE: true,
    CONSOLE_LOGS: true,
    MOCK_DATA: false,
    API_ENDPOINTS: {
        // Futurs endpoints si cal
    }
};
```

### Mode Debug

Per activar funcionalitats de debugging:

```javascript
// A la consola del navegador
window.debugMode = true;

// Això activarà:
// - Logs detallats
// - Informació d'estat a la consola
// - Funcions d'debugging globals
```

### Eines de Desenvolupament

#### Console Commands

```javascript
// Funcions disponibles a la consola per debugging
debugState.getState()           // Informació de l'estat actual
debugState.exportState()        // Exportar estat actual
debugState.resetState()         // Reiniciar estat
debugState.importState(data)    // Importar estat específic
```

#### Live Reload

Si utilitzes Live Server o similar, els canvis a CSS es recarregaran automàticament. Per JavaScript, caldrà recarregar manualment la pàgina.

## Workflow de Desenvolupament

### Cicle de Desenvolupament Típic

1. **Crear branca** per la funcionalitat
```bash
git checkout -b feature/nova-funcionalitat
```

2. **Desenvolupar** la funcionalitat
   - Modificar fitxers necessaris
   - Provar en navegador
   - Validar funcionalitat

3. **Testing manual**
   - Provar escenaris principals
   - Verificar compatibilitat
   - Comprovar no hi ha regressions

4. **Commit i push**
```bash
git add .
git commit -m "Feat: Afegir nova funcionalitat X"
git push origin feature/nova-funcionalitat
```

5. **Pull Request** i revisió de codi

### Convencions de Commits

**Format:**
```
Tipus: Descripció breu

Descripció detallada si cal

Fixes #issue
```

**Tipus de commits:**
- `Feat:` Nova funcionalitat
- `Fix:` Correcció de bug
- `Docs:` Canvis en documentació
- `Style:` Canvis de format/estil
- `Refactor:` Refactorització de codi
- `Test:` Afegir o modificar tests
- `Chore:` Tasques de manteniment

### Branching Strategy

**Branques principals:**
- `master`: Codi estable i desplegable
- `develop`: Integració de noves funcionalitats

**Branques de funcionalitats:**
- `feature/nom-funcionalitat`: Noves funcionalitats
- `fix/nom-bug`: Correccions de bugs
- `docs/tema`: Actualitzacions de documentació

## Debugging i Resolució de Problemes

### Debugging JavaScript

#### Console Logs

```javascript
// Logs estructurats per debugging
console.log('[ComponentName] Message', data);
console.warn('[ComponentName] Warning', warning);
console.error('[ComponentName] Error', error);
```

#### Breakpoints

1. Obrir Developer Tools (F12)
2. Navegar a la pestanya "Sources"
3. Obrir el fitxer JavaScript
4. Clicar al número de línia per afegir breakpoint

#### Performance Profiling

1. Developer Tools → Performance
2. Clic "Record"
3. Interactuar amb l'aplicació
4. Aturar recording i analitzar

### Problemes Comuns

#### L'aplicació no carrega

**Possibles causes:**
- Fitxers no servits correctament
- Errors de JavaScript bloquejant
- Problemes de CORS

**Solucions:**
1. Verificar servidor local funcionant
2. Comprovar consola per errors
3. Verificar que tots els fitxers estan presents

#### localStorage no funciona

**Possibles causes:**
- Mode incògnit del navegador
- localStorage deshabilitat
- Quota exhaurida

**Solucions:**
1. Usar navegador normal (no incògnit)
2. Verificar configuració del navegador
3. Netejar localStorage anterior

#### Canvis CSS no es veuen

**Possibles causes:**
- Cache del navegador
- CSS no recarregat

**Solucions:**
1. Hard refresh (Ctrl+F5 / Cmd+Shift+R)
2. Deshabilitar cache en Developer Tools
3. Verificar fitxer CSS modificat

## Testing

### Testing Manual

**Escenaris obligatoris:**
1. **Creació de calendaris**
   - FP, BTX i Altre
   - Verificar configuració automàtica
   - Comprovar categories i esdeveniments

2. **Gestió d'esdeveniments**
   - Crear, editar, eliminar
   - Drag & drop
   - Validacions de data

3. **Categories**
   - Crear, editar, eliminar
   - Catàleg global
   - Categories del sistema

4. **Replicació**
   - Entre calendaris diferents
   - Gestió d'esdeveniments no ubicats
   - Algoritme proporcional

5. **Import/Export**
   - JSON, ICS, HTML
   - Verificar integritat de dades

### Browser Testing

**Navegadors prioritaris:**
1. Chrome (desenvolupament principal)
2. Firefox
3. Safari
4. Edge

**Aspectes a provar:**
- Funcionalitat bàsica
- Rendiment
- Compatibilitat CSS
- JavaScript APIs

### Performance Testing

**Aspectes a mesurar:**
- Temps de càrrega inicial
- Temps de resposta a accions
- Ús de memòria
- Gestió de grans volums de dades

## Optimització de Desenvolupament

### Eines Recomanades

**Extensions VS Code:**
- Auto Rename Tag
- Path Intellisense
- JSON Tools
- Live Server
- Git Lens

**Extensions Navegador:**
- Vue.js devtools (si s'utilitza)
- React Developer Tools (si s'utilitza)
- Accessibility Insights

### Shortcuts Útils

**VS Code:**
- `Ctrl+P`: Obrir fitxer ràpid
- `Ctrl+Shift+P`: Paleta de comandos
- `Ctrl+B`: Toggle sidebar
- `Ctrl+J`: Toggle terminal
- `F12`: Anar a definició

**Developer Tools:**
- `F12`: Obrir/tancar
- `Ctrl+Shift+I`: Inspector
- `Ctrl+Shift+J`: Consola
- `Ctrl+Shift+M`: Toggle device mode

## Recursos Adicionals

### Documentació de Referència

- [MDN Web Docs](https://developer.mozilla.org/) - JavaScript i Web APIs
- [CSS-Tricks](https://css-tricks.com/) - CSS avançat
- [Web.dev](https://web.dev/) - Bones pràctiques web

### Comunitat i Suport

- Issues del projecte GitHub
- Documentació interna del wiki
- Comentaris del codi font

Aquesta guia proporciona tot el necessari per configurar un entorn de desenvolupament productiu per al Calendari IOC i començar a contribuir al projecte de manera efectiva.

---
[← Manteniment i Actualitzacions](Manteniment-i-Actualitzacions) | [Estructura del Codi →](Estructura-del-Codi)