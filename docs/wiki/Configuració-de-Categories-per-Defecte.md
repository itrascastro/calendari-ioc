# Configuració de Categories per Defecte

Aquesta guia està dirigida a **administradors i coordinadors** de l'IOC que necessiten configurar les categories que es creen automàticament quan s'afegeixen calendaris de Formació Professional i Batxillerat.

## Visió General

Les **categories per defecte** són categories del sistema que es creen automàticament en tots els calendaris de tipus FP i BTX. Aquestes categories proporcionen una base consistent per organitzar esdeveniments i asseguren que tots els calendaris tinguin les categories essencials.

### Tipus de Categories

**Categories del Sistema (protegides):**
- No es poden eliminar ni modificar pels usuaris
- Colors i noms predefinits
- Específiques per tipus de calendari
- **Nova ubicació**: Externalitzades a fitxers JSON independents

**Categories d'Usuari:**
- Creades pels professors segons necessitats
- Es poden modificar i eliminar
- S'afegeixen al catàleg global automàticament
- **Gestió de colors**: Sistema intel·ligent evita duplicats automàticament

## Nova Arquitectura de Categories del Sistema

### Externalització de Configuració

**Ubicació actual**: `config/sys-categories.json` (centralitzat)

Anteriorment les categories estaven dins dels fitxers de configuració semestral. Ara s'han externalitzat per millorar la mantenibilitat i separar responsabilitats.

### Configuració Centralitzada

**Fitxer**: `config/sys-categories.json`

```json
[
  {
    "id": "SYS_CAT_1",
    "name": "IOC_GENERIC",
    "isSystem": true
  },
  {
    "id": "SYS_CAT_2",
    "name": "FESTIU",
    "isSystem": true
  },
  {
    "id": "SYS_CAT_3",
    "name": "PAF",
    "isSystem": true
  }
]
```

### Gestió Automàtica de Colors

Les categories del sistema **no especifiquen colors** al fitxer de configuració. Els colors s'assignen automàticament mitjançant el `ColorCategoryHelper` que:

- Evita duplicats intel·ligentment
- Escaneig tots els colors existents en ús
- Selecciona colors òptims de la paleta predefinida
- Garanteix diversitat visual entre categories

### Avantatges de la Nova Arquitectura

1. **Mantenibilitat**: Categories independents de la configuració semestral
2. **Escalabilitat**: Fàcil afegir noves categories sense modificar múltiples fitxers
3. **Consistència**: Colors assignats automàticament sense conflictes
4. **Flexibilitat**: Sistema adaptatiu que evita duplicats automàticament

## Categories del Sistema Unificades

### Descripció de Categories del Sistema

#### IOC_GENERIC (Color assignat automàticament)
**Ús**: Esdeveniments institucionals de l'IOC
- Comunicats oficials
- Reunions de claustre
- Formació del professorat
- Activitats institucionals

**Exemples d'esdeveniments:**
- "Reunió de coordinació de cicle"
- "Formació plataforma Moodle"
- "Claustre de professorat"

#### FESTIU (Color assignat automàticament)
**Ús**: Dies festius i no lectius
- Festius oficials
- Ponts
- Vacances

**Exemples d'esdeveniments:**
- "Dia de Reis"
- "Setmana Santa" 
- "Festa del Treball"

#### PAF (Color assignat automàticament)
**Ús**: Proves d'Avaluació Final específiques de FP
- PAF1 (primera convocatòria)
- PAF2 (segona convocatòria)
- Proves específiques de mòduls

**Exemples d'esdeveniments:**
- "PAF1 - Primera convocatòria"
- "PAF2 - Segona convocatòria"
- "PAF extraordinària"

## Sistema de Gestió de Colors

### ColorCategoryHelper

Les categories del sistema utilitzen el nou `ColorCategoryHelper` que proporciona:

### Configuració Actual

**Ubicació**: `config/btx-semestre.json`

```json
{
  "systemCategories": [
    {
      "id": "IOC_GENERIC",
      "name": "IOC", 
      "color": "#3182ce",
      "isSystem": true
    },
    {
      "id": "FESTIU_GENERIC",
      "name": "FESTIU",
      "color": "#e53e3e", 
      "isSystem": true
    },
    {
      "id": "EXAMENS_GENERIC",
      "name": "EXAMENS",
      "color": "#805ad5",
      "isSystem": true
    }
  ]
}
```

### Descripció de Categories BTX

#### IOC (Blau - #3182ce)
**Ús**: Mateix que FP - esdeveniments institucionals

#### FESTIU (Vermell - #e53e3e)  
**Ús**: Mateix que FP - dies festius i no lectius

#### EXAMENS (Violeta - #805ad5)
**Ús**: Proves d'avaluació específiques de BTX
- Exàmens parcials
- Exàmens finals
- Proves PAU (si escau)
- Recuperacions

**Exemples d'esdeveniments:**
- "Exàmens parcials 1r trimestre"
- "Exàmens finals de semestre"
- "PAU - Convocatòria juny"

## Personalització de Categories

### Afegir Noves Categories del Sistema

Per afegir una nova categoria del sistema, editar el fitxer apropiat:

```json
{
  "id": "PRACTIQUES_GENERIC",
  "name": "PRÀCTIQUES",
  "color": "#38a169",
  "isSystem": true
}
```

**Consideracions:**
- **ID únic**: Ha de ser únic a nivell global
- **Nom descriptiu**: Clar i concís
- **Color accessible**: Bon contrast per llegibilitat
- **isSystem: true**: Marca com a categoria protegida

### Modificar Categories Existents

**Color**: Es pot canviar editant el valor `color`
**Nom**: Es pot canviar editant el valor `name`
**ID**: No es recomana canviar (trencaria calendaris existents)

### Eliminar Categories del Sistema

**Precaució**: Eliminar una categoria del sistema pot causar problemes en calendaris existents que la utilitzen.

**Procediment recomanat:**
1. Verificar que no hi ha calendaris que la utilitzin
2. Eliminar esdeveniments que la referencien
3. Eliminar la categoria de la configuració

## Paleta de Colors Recomanada

### Colors Principals

**Blau**: `#3182ce` - Institucional, oficial
**Vermell**: `#e53e3e` - Festius, urgents
**Taronja**: `#fd7f28` - Avaluacions, PAF
**Violeta**: `#805ad5` - Exàmens, proves
**Verd**: `#38a169` - Pràctiques, activitats positives

### Colors Secundaris

**Groc**: `#d69e2e` - Avisos, recordatoris
**Rosa**: `#d53f8c` - Esdeveniments especials
**Cian**: `#319795` - Activitats opcionals
**Gris**: `#718096` - Informació general

### Consideracions d'Accessibilitat

Tots els colors han de complir els estàndards WCAG AA:
- Contrast mínim 4.5:1 amb text blanc
- Contrast mínim 3:1 amb text negre
- Colors diferenciables per persones amb daltonisme

## Categories d'Usuari Recomanades

### Suggeriments per Professors

**Categories acadèmiques:**
- "Lliuraments" (vermell) - Dates límit de lliurament
- "Tutories" (blau) - Sessions de tutoria
- "Activitats" (verd) - Activitats extraescolars

**Categories organitzatives:**
- "Reunions" (groc) - Reunions de departament
- "Formació" (violeta) - Cursos i formació
- "Personal" (rosa) - Esdeveniments personals

### Categories per Tipus de Mòdul

**Mòduls pràctics:**
- "Pràctiques" (verd)
- "Projectes" (taronja)
- "Demostracions" (blau)

**Mòduls teòrics:**
- "Classe magistral" (blau)
- "Debats" (violeta)
- "Presentacions" (groc)

## Implementació Tècnica

### Com es Carreguen les Categories

```javascript
// SemesterConfig.js
async loadDefaultCategories() {
    const categories = this.mergedConfig.systemCategories || [];
    
    return categories.map(cat => ({
        ...cat,
        isSystem: true  // Forçar protecció
    }));
}
```

### Validació de Categories

```javascript
validateCategory(category) {
    // Verificar camps obligatoris
    if (!category.id || !category.name || !category.color) {
        return false;
    }
    
    // Verificar format de color
    if (!/^#[0-9A-F]{6}$/i.test(category.color)) {
        return false;
    }
    
    return true;
}
```

## Manteniment de Categories

### Revisió Periòdica

**Tasques recomanades cada semestre:**
1. Revisar ús de categories existents
2. Identificar necessitats de noves categories
3. Actualitzar colors si cal per accessibilitat
4. Eliminar categories obsoletes

### Feedback d'Usuaris

**Recollir feedback sobre:**
- Categories que falten
- Categories poc útils
- Problemes de colors o noms
- Propostes de millora

### Documentació de Canvis

Mantenir un registre de:
- Data del canvi
- Categoria afectada
- Motiu del canvi
- Impacte en usuaris

## Coordinació amb Professors

### Comunicació de Canvis

**Quan es fan canvis:**
- Notificar amb antelació
- Explicar el motiu del canvi
- Proporcionar alternatives si cal
- Documentar el procés

### Formació d'Usuaris

**Temes a cobrir:**
- Diferència entre categories sistema i usuari
- Com crear categories personals
- Ús del catàleg global
- Bones pràctiques d'organització

## Resolució de Problemes

### Categoria No Apareix

**Possibles causes:**
- Error de sintaxi JSON
- ID duplicat
- Configuració no carregada

**Solució:**
1. Validar JSON
2. Verificar IDs únics
3. Reiniciar aplicació

### Colors Incorrectes

**Possibles causes:**
- Format de color invàlid
- Cache del navegador
- CSS personalitzat interferint

**Solució:**
1. Verificar format hexadecimal
2. Netejar cache
3. Revisar CSS personalitzat

### Categories Duplicades

**Causa**: Categoria present a múltiples fitxers de configuració

**Solució**: Mantenir cada categoria només en un fitxer

## Bones Pràctiques

### Nomenclatura

- Noms curts i descriptius
- Evitar abreviatures poc clares
- Usar català consistent
- Capitalització coherent

### Gestió de Colors

- Mantenir paleta consistent
- Evitar colors massa similars
- Considerar impressió en blanc i negre
- Testejar accessibilitat

### Coordinació

- Involucrar professors en decisions
- Fer canvis gradualment
- Mantenir compatibilitat
- Documentar justificacions

---
[← Gestió d'Esdeveniments del Sistema](Gestió-d-Esdeveniments-del-Sistema) | [Manteniment i Actualitzacions →](Manteniment-i-Actualitzacions)