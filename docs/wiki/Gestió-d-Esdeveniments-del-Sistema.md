# Gestió d'Esdeveniments del Sistema

Aquesta guia està dirigida a **administradors i coordinadors** de l'IOC que necessiten gestionar els esdeveniments del sistema que s'apliquen automàticament als calendaris de Formació Professional i Batxillerat.

## Visió General

Els **esdeveniments del sistema** són esdeveniments predefinits que es creen automàticament quan s'afegeix un calendari de tipus FP o BTX. Aquests esdeveniments inclouen festius oficials, proves d'avaluació final (PAF) i altres dates importants del calendari acadèmic.

### Tipus d'Esdeveniments del Sistema

**Formació Professional (FP):**
- **Festius**: Dies no lectius oficials
- **PAF**: Proves d'Avaluació Final (PAF1, PAF2)
- **Períodes especials**: Tancament d'aula mòdul, recuperacions

**Batxillerat (BTX):**
- **Festius**: Dies no lectius oficials
- **Examens**: Proves d'avaluació i PAU
- **Períodes especials**: Tancament de semestre

## Configuració d'Esdeveniments del Sistema

### Ubicació dels Fitxers

Els esdeveniments del sistema es defineixen als fitxers de configuració JSON:

```
config/
├── common-semestre.json    # Esdeveniments comuns (festius generals)
├── fp-semestre.json        # Esdeveniments específics FP (PAF, etc.)
└── btx-semestre.json       # Esdeveniments específics BTX (exàmens, etc.)
```

### Estructura d'un Esdeveniment del Sistema

```json
{
  "id": "festiu_2024_01",
  "title": "Dia de Reis",
  "date": "2025-01-06", 
  "categoryId": "FESTIU",
  "description": "Festiu oficial",
  "isSystemEvent": true
}
```

**Camps obligatoris:**
- **id**: Identificador únic de l'esdeveniment
- **title**: Nom de l'esdeveniment
- **date**: Data en format YYYY-MM-DD
- **categoryId**: Categoria del sistema associada
- **isSystemEvent**: Sempre `true` per esdeveniments del sistema

## Gestió de Festius

### Festius Comuns

**Fitxer**: `config/common-semestre.json`

```json
{
  "systemEvents": [
    {
      "id": "festiu_2024_01",
      "title": "Dia de Reis",
      "date": "2025-01-06",
      "categoryId": "FESTIU",
      "description": "Festiu oficial",
      "isSystemEvent": true
    },
    {
      "id": "festiu_2024_02", 
      "title": "Divendres Sant",
      "date": "2025-04-18",
      "categoryId": "FESTIU",
      "description": "Setmana Santa",
      "isSystemEvent": true
    },
    {
      "id": "festiu_2024_03",
      "title": "Festa del Treball",
      "date": "2025-05-01", 
      "categoryId": "FESTIU",
      "description": "Festiu oficial",
      "isSystemEvent": true
    }
  ]
}
```

### Festius Específics per Comunitat

**Consideracions per Catalunya:**
- Sant Jordi (23 d'abril)
- Diada Nacional (11 de setembre)
- Festius locals segons la ubicació del centre

**Exemple de configuració:**
```json
{
  "id": "festiu_catalunya_01",
  "title": "Sant Jordi",
  "date": "2025-04-23",
  "categoryId": "FESTIU", 
  "description": "Festa de Catalunya",
  "isSystemEvent": true
}
```

## Gestió de PAF (Formació Professional)

### Configuració de PAF

**Fitxer**: `config/fp-semestre.json`

```json
{
  "systemEvents": [
    {
      "id": "paf1_2025_s1",
      "title": "PAF1 - Primera convocatòria",
      "date": "2024-12-16",
      "categoryId": "PAF",
      "description": "Prova d'Avaluació Final - Primera convocatòria",
      "isSystemEvent": true
    },
    {
      "id": "paf2_2025_s1", 
      "title": "PAF2 - Segona convocatòria",
      "date": "2025-01-20",
      "categoryId": "PAF",
      "description": "Prova d'Avaluació Final - Segona convocatòria", 
      "isSystemEvent": true
    }
  ]
}
```

### Dates PAF per Semestre

**Primer Semestre (setembre-gener):**
- PAF1: Aproximadament 15 de desembre
- PAF2: Aproximadament 20 de gener

**Segon Semestre (febrer-juny):**
- PAF1: Aproximadament 15 de maig  
- PAF2: Aproximadament 15 de juny

### Personalització per Cicle

Alguns cicles poden tenir dates PAF específiques:

```json
{
  "id": "paf1_dam_specific",
  "title": "PAF1 DAM - Convocatòria especial",
  "date": "2024-12-18",
  "categoryId": "PAF",
  "description": "PAF específica per DAM - projecte final",
  "isSystemEvent": true
}
```

## Gestió d'Exàmens (Batxillerat)

### Configuració d'Exàmens BTX

**Fitxer**: `config/btx-semestre.json`

```json
{
  "systemEvents": [
    {
      "id": "examens_btx_parcial",
      "title": "Exàmens Parcials",
      "date": "2024-11-15",
      "categoryId": "EXAMENS",
      "description": "Període d'exàmens parcials",
      "isSystemEvent": true
    },
    {
      "id": "examens_btx_final",
      "title": "Exàmens Finals",
      "date": "2025-01-20", 
      "categoryId": "EXAMENS",
      "description": "Període d'exàmens finals de semestre",
      "isSystemEvent": true
    }
  ]
}
```

### Proves PAU

Per a centres que preparen PAU:

```json
{
  "id": "pau_juny",
  "title": "PAU - Convocatòria de juny",
  "date": "2025-06-10",
  "categoryId": "EXAMENS",
  "description": "Proves d'accés a la universitat", 
  "isSystemEvent": true
}
```

## Esdeveniments Especials del Centre

### Tancament d'Aula Mòdul

```json
{
  "id": "tancament_aula_modul",
  "title": "Tancament d'aula mòdul",
  "date": "2025-01-24",
  "categoryId": "IOC", 
  "description": "Fi del període lectiu - tancament aules",
  "isSystemEvent": true
}
```

### Períodes de Recuperació

```json
{
  "id": "recuperacio_s1",
  "title": "Període de recuperació",
  "date": "2025-01-27",
  "categoryId": "IOC",
  "description": "Període de recuperació i segona avaluació",
  "isSystemEvent": true
}
```

## Procediment d'Actualització

### Pas 1: Planificació Annual

**Abans de cada curs acadèmic:**
1. Revisar calendari oficial de la Generalitat
2. Consultar calendari específic de l'IOC
3. Coordinar amb altres centres si cal
4. Identificar festius locals

### Pas 2: Actualització de Fitxers

**Ordre recomanat:**
1. **common-semestre.json**: Festius generals
2. **fp-semestre.json**: Esdeveniments específics FP
3. **btx-semestre.json**: Esdeveniments específics BTX

### Pas 3: Validació

**Comprovacions necessàries:**
- Dates dins del rang del semestre
- IDs únics per cada esdeveniment
- Categories correctes (FESTIU, PAF, EXAMENS, IOC)
- Format de data correcte (YYYY-MM-DD)

### Pas 4: Testing

**Proves recomanades:**
1. Crear calendari FP de prova
2. Verificar que esdeveniments apareixen
3. Crear calendari BTX de prova
4. Verificar categories correctes
5. Comprovar que no es poden eliminar

## Categories del Sistema

### Categories Predefinides

**FESTIU**
- Color: Vermell (#e53e3e)
- Ús: Tots els festius oficials
- Protegida: No es pot eliminar ni modificar

**PAF** (només FP)
- Color: Taronja (#fd7f28)
- Ús: Proves d'Avaluació Final
- Protegida: No es pot eliminar ni modificar

**EXAMENS** (només BTX)
- Color: Violeta (#805ad5)
- Ús: Proves d'avaluació i exàmens
- Protegida: No es pot eliminar ni modificar

**IOC**
- Color: Blau (#3182ce)
- Ús: Esdeveniments institucionals
- Protegida: No es pot eliminar ni modificar

## Resolució de Problemes

### Esdeveniments No Apareixen

**Possibles causes:**
- Error de sintaxi JSON
- Data fora del rang del semestre
- ID duplicat
- Categoria inexistent

**Solució:**
1. Validar sintaxi JSON amb un validador online
2. Verificar dates dins del rang
3. Comprovar IDs únics
4. Verificar noms de categories

### Esdeveniments Duplicats

**Causa**: Esdeveniment present tant a common com a específic

**Solució**: Mantenir esdeveniments comuns només a common-semestre.json

### Categoria Incorrecta

**Símptomes**: Esdeveniments amb colors o noms incorrectes

**Solució**: Verificar que categoryId coincideix amb categories predefinides

## Bones Pràctiques

### Nomenclatura d'IDs

**Format recomanat:**
- Festius: `festiu_YYYY_##`
- PAF: `paf#_YYYY_s#`
- Exàmens: `examens_btx_tipus`
- IOC: `ioc_tipus_YYYY`

### Descripcions Clares

- Usar descripcions informatives
- Incloure context quan sigui necessari
- Mantenir consistència en el format

### Coordinació

- Comunicar canvis amb professors
- Avisar amb antelació de noves dates
- Mantenir registre de canvis

## Impacte en Usuaris

### Per a Professors

Els esdeveniments del sistema:
- Apareixen automàticament en calendaris nous
- No es poden eliminar accidentalment
- Proporcionen context temporal consistent

### Per a Estudiants

Els esdeveniments del sistema:
- Ofereixen dates clau sempre visibles
- Faciliten planificació d'estudis
- Eviten confusions sobre dates oficials

## Manteniment Continu

### Revisió Semestral

**Tasques recomanades:**
- Verificar que totes les dates són correctes
- Actualitzar esdeveniments per al proper semestre
- Eliminar esdeveniments obsolets
- Afegir nous esdeveniments si cal

### Feedback i Millores

- Recollir feedback de professors i coordinadors
- Ajustar esdeveniments segons necessitats
- Documentar canvis per futures referències

---
[← Configuració Semestral](Configuració-Semestral) | [Configuració de Categories →](Configuració-de-Categories-per-Defecte)