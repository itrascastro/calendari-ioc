# Personalització i Temes

El Calendari IOC ofereix opcions de personalització visual per adaptar-se a les teves preferències i millorar la teva experiència d'ús, especialment pel que fa al tema de colors i la visibilitat dels continguts.

## Sistema de Temes

### Mode Clar vs Mode Fosc

L'aplicació suporta dos temes principals:

**Mode Clar (per defecte):**
- Fons blanc i tons clars
- Text fosc per màxima llegibilitat
- Ideal per entorns ben il·luminats
- Menor consum de bateria en pantalles LCD

**Mode Fosc:**
- Fons fosc i tons grisos
- Text clar amb bon contrast
- Reduces la fatiga ocular en entorns foscos
- Menor consum de bateria en pantalles OLED

### Detecció Automàtica del Sistema

**Funcionament intel·ligent:**
- L'aplicació detecta automàticament la preferència de tema del teu sistema operatiu
- Si el teu dispositiu està configurat en mode fosc, l'aplicació s'iniciarà en mode fosc
- Si el teu sistema usa mode clar, l'aplicació començarà amb el tema clar

**Avantatges:**
- **Coherència visual** amb la resta del sistema
- **Canvi automàtic** si has configurat canvis automàtics al teu SO
- **Experiència unificada** entre totes les aplicacions

## Canviar de Tema

### Interruptor Manual

**Ubicació**: A la part superior dreta de l'aplicació trobaràs el botó de canvi de tema.

**Com canviar:**
1. **Localitza el botó**: Busca el botó que diu "Canviar a Mode Fosc" o "Canviar a Mode Clar"
2. **Fes clic**: El tema canviarà immediatament
3. **Text del botó**: El text del botó s'actualitzarà per reflectir l'acció oposada disponible

### Comportament del Canvi

**Canvi instantani:**
- El tema es canvia immediatament sense necessitat de recarregar la pàgina
- Tots els elements visuals s'adapten automàticament
- Les transicions són suaus per evitar efectes molestos

**Sessió temporal:**
- El canvi de tema només dura durant la sessió actual
- Quan recarreguis la pàgina o obris l'aplicació de nou, tornarà al tema del sistema
- Això garanteix coherència amb les teves preferències generals

## Adaptació dels Elements Visuals

### Colors dels Esdeveniments

**Contrast automàtic:**
- Els esdeveniments mantenen els seus colors de categoria en ambdós temes
- L'aplicació calcula automàticament si el text ha de ser blanc o negre per màxima llegibilitat
- Els colors s'ajusten subtilment per mantenir bon contrast en mode fosc

**Exemple:**
- **Mode clar**: Esdeveniment vermell amb text blanc
- **Mode fosc**: El mateix esdeveniment amb vermell lleugerament més clar i text que garanteix bon contrast

### Interfície General

**Adaptació completa:**
- **Panells laterals**: S'adapten completament al tema seleccionat
- **Modals i diàlegs**: Mantenen coherència visual amb el tema
- **Botons i controls**: Colors ajustats per cada tema
- **Backgrounds**: Transicions suaus entre colors de fons

### Calendari Principal

**Vista mensual:**
- **Dies del mes**: Contrast adequat per llegibilitat
- **Dies altres mesos**: Sutilment atenuats segons el tema
- **Avui**: Ressaltat de manera coherent amb el tema
- **Cap de setmana**: Indicació visual adaptada

## Consideracions d'Accessibilitat

### Contrast de Colors

**Estàndards WCAG:**
- Tots els temes compleixen els estàndards d'accessibilitat web
- Contrast mínim de 4.5:1 per text normal
- Contrast mínim de 3:1 per text gran i elements gràfics

**Elements crítics:**
- Text principal sempre amb contrast màxim
- Botons i enllaços clarament diferenciats
- Estats actius i hover ben visibles

### Reducció de Fatiga Ocular

**Mode fosc optimitzat:**
- Colors foscos que no són completament negres (millor per l'ull)
- Text amb suficient contrast però no completament blanc
- Transitions suaus per evitar canvis bruscos de llum

**Mode clar ergonòmic:**
- Blancs suaus en lloc de blanc pur
- Text amb contrast adequat però no excessiu
- Colors equilibrats per sessions llargues de treball

## Configuració Avançada

### Preferències del Navegador

**Respecte a la configuració:**
L'aplicació respecta la configuració `prefers-color-scheme` del teu navegador, que pot estar influenciada per:
- Configuració del sistema operatiu
- Hora del dia (si tens canvis automàtics)
- Configuració específica del navegador

**Per canviar la preferència del sistema:**

**Windows:**
Configuració → Personalització → Colors → Tria el mode

**macOS:**
Preferències del Sistema → General → Aspecte

**Linux (GNOME):**
Configuració → Aspecte → Estil

### Personalització per Desenvolupadors

Si ets desenvolupador i vols personalitzar els temes, pots modificar les variables CSS definides a `css/base.css`:

```css
/* Variables per Mode Clar */
:root {
  --bg-primary: #ffffff;
  --text-primary: #2d3748;
  --border-color: #e2e8f0;
}

/* Variables per Mode Fosc */
body.dark-mode {
  --bg-primary: #1a202c;
  --text-primary: #f7fafc;
  --border-color: #4a5568;
}
```

## Casos d'Ús Recomanats

### Mode Clar Recomanat Per:

- **Treballs diürns** en entorns ben il·luminats
- **Impressió de documents** (millor contrast en paper)
- **Presentacions** i sharing screen
- **Usuaris amb problemes de visió** que necessiten màxim contrast

### Mode Fosc Recomanat Per:

- **Treballs nocturns** o en entorns poc il·luminats
- **Sessions llargues** davant de la pantalla
- **Dispositius mòbils** per estalviar bateria (pantalles OLED)
- **Preferència personal** per estètica moderna

### Canvi Dinàmic

**Durant la jornada:**
- Començar en mode clar al matí
- Canviar a mode fosc a la tarda/vespre
- Adaptar-se segons la il·luminació ambiental

## Resolució de Problemes

### El tema no canvia
**Solució**: Verifica que el JavaScript està habilitat al navegador

### Colors incorrectes després del canvi
**Solució**: Refresca la pàgina si persisteix el problema

### El tema no respecta la configuració del sistema
**Solució**: 
- Verifica la configuració de `prefers-color-scheme` al navegador
- Alguns navegadors antics no suporten aquesta funcionalitat

### Contrast insuficient en mode fosc
**Solució**: 
- Ajusta la brillantor de la pantalla
- Verifica la configuració de contrast del monitor

## Futurs Desenvolupaments

### Característiques Planificades

**Persistència de preferències:**
- Possibilitat de desar la preferència de tema per sessions futures
- Configuració independent de la configuració del sistema

**Temes personalitzats:**
- Opcions per crear temes personalitzats amb colors específics
- Temes temàtics per diferents contextos (centres educatius, etc.)

**Programació automàtica:**
- Canvis automàtics segons l'hora del dia
- Sincronització amb horari lectiu

---
[← Replicació entre Calendaris](Replicació-entre-Calendaris) | [Configuració Semestral →](Configuració-Semestral)