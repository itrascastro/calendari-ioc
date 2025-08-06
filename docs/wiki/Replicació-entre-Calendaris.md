# Replicació entre Calendaris

La replicació és una funcionalitat avançada del Calendari IOC que permet copiar esdeveniments d'un calendari a un altre de manera intel·ligent, adaptant-se automàticament a les diferents dates i característiques dels calendaris de destí.

## Visió General

### Què és la replicació?

La replicació és el procés de **copiar esdeveniments d'un calendari origen a un calendari destí**, adaptant-se automàticament a:
- **Dates diferents**: Els calendaris poden tenir períodes lectius diferents
- **Durades diferents**: Un semestre pot ser més llarg o curt que l'altre
- **Obstacles**: Festius i esdeveniments del sistema en el calendari de destí

### Per què replicar?

**Casos d'ús habituals:**
- **Professors**: Copiar la planificació d'un mòdul d'un semestre a l'altre
- **Coordinadors**: Adaptar calendaris entre diferents cicles formatius
- **Reutilització**: Aprofitar planificacions d'anys anteriors
- **Consistència**: Mantenir la mateixa estructura temporal entre calendaris similars

## Com Funciona la Nova Arquitectura de Replicació

### Sistema Multi-Algoritme Intel·ligent

L'aplicació utilitza un **sistema avançat de replicació** amb múltiples algoritmes especialitzats que se seleccionen automàticament segons el tipus de calendaris:

#### Arquitectura basada en Factory Pattern

1. **Detecció automàtica de tipus**: El sistema identifica els tipus de calendari origen i destí (FP, BTX o Altre)
2. **Selecció d'algoritme**: Utilitza el **ReplicaServiceFactory** per seleccionar el servei més adequat
3. **Execució optimitzada**: Cada algoritme està especialitzat per màxima eficiència en el seu domini
4. **Gestió unificada**: Tots els serveis retornen el mateix format de resultat per compatibilitat

#### Algoritmes Disponibles

**EstudiReplicaService** (per calendaris FP/BTX):
- Mantén 100% compatibilitat amb el comportament anterior
- Només dies laborables (dilluns a divendres)
- Un esdeveniment per dia màxim
- Cerca radial de slots lliures
- Detecció automàtica de PAF1

**GenericReplicaService** (per calendaris "Altre"):
- Optimitzat per calendaris genèrics sense restriccions acadèmiques
- Suport per tots els dies de la setmana
- Múltiples esdeveniments per dia
- Preservació d'agrupacions d'esdeveniments
- Estratègies adaptatives: còpia directa, expansió i compressió

#### Procés de Selecció Automàtica

```
Si origen = "Altre" O destí = "Altre"
    → Usar GenericReplicaService
Sino
    → Usar EstudiReplicaService (FP/BTX)
```

### Exemples Pràctics per Tipus de Replicació

#### Replicació entre Calendaris d'Estudi (FP ↔ BTX)

**Calendari Origen FP (Primer Semestre):**
- Durada: 100 dies lectius (només laborables)
- Esdeveniment a la posició 25 (25% del període)

**Calendari Destí BTX (Segon Semestre):**
- Durada: 90 dies lectius (només laborables)
- L'esdeveniment es col·locarà a la posició 22-23 (25% de 90 dies)
- **Algoritme**: EstudiReplicaService amb cerca radial de slots

#### Replicació amb Calendaris "Altre"

**Calendari Origen "Altre":**
- Durada: 200 dies (inclou caps de setmana)
- 3 esdeveniments el mateix dia (agrupació)

**Calendari Destí "Altre" (Espais Idèntics):**
- Durada: 200 dies (mateix espai útil)
- **Estratègia**: Còpia directa dia a dia
- **Resultat**: Agrupació d'esdeveniments preservada al 100%

**Calendari Destí "Altre" (Espai Major):**
- Durada: 250 dies (més espai disponible)
- **Estratègia**: Expansió proporcional
- **Resultat**: Events distribuïts amb més espai entre ells

**Calendari Destí "Altre" (Espai Menor):**
- Durada: 150 dies (menys espai disponible)
- **Estratègia**: Compressió amb gestió de col·lisions
- **Resultat**: Alguns esdeveniments poden quedar no ubicats

## Procediment de Replicació

### Pas 1: Preparar els Calendaris

**Requisits:**
- **Calendari origen**: Ha de tenir esdeveniments creats pel professor (no del sistema)
- **Calendari destí**: Ha de tenir dates d'inici i fi definides
- **Mínim 2 calendaris**: Necessites almenys dos calendaris per poder replicar

### Pas 2: Iniciar la Replicació

1. **Seleccionar calendari origen**: Assegura't que el calendari amb els esdeveniments que vols copiar està actiu
2. **Obrir replicació**: Fes clic al botó "Replicar Calendari" al panell lateral
3. **Seleccionar destí**: Al modal que s'obre, selecciona el calendari de destí de la llista desplegable
4. **Confirmar replicació**: Fes clic a "Executar Replicació"

### Pas 3: Revisar els Resultats

Després de la replicació, l'aplicació et mostrarà:
- **Esdeveniments col·locats**: Nombre d'esdeveniments copiats correctament
- **Esdeveniments no ubicats**: Esdeveniments que no s'han pogut col·locar automàticament
- **Resum detallat**: Informació sobre el procés de replicació

## Gestió d'Esdeveniments No Ubicats

### Què són els esdeveniments no ubicats?

Els **esdeveniments no ubicats** són aquells que l'algoritme no ha pogut col·locar automàticament al calendari de destí per:
- **Conflicte de dates**: La data calculada ja té un esdeveniment
- **Fora de rang**: La data calculada està fora del període del calendari destí
- **Espai insuficient**: El calendari destí no té prou dies lectius

### Com Gestionar-los

**Visualització:**
- Els esdeveniments no ubicats es mostren en una secció especial del panell lateral
- Cada esdeveniment mostra la data original i el motiu per no poder ubicar-lo

**Opcions de resolució:**
1. **Col·locació manual**: Fes clic sobre un esdeveniment no ubicat per obrir el modal d'edició i assignar-li una nova data
2. **Modificació automàtica**: L'aplicació pot proposar dates alternatives si detecta espais lliures
3. **Eliminació**: Si l'esdeveniment ja no és rellevant, el pots eliminar de la llista

### Procediment per Col·locar Esdeveniments No Ubicats

1. **Identificar l'esdeveniment**: Revisa la llista d'esdeveniments no ubicats
2. **Clic per editar**: Fes clic sobre l'esdeveniment que vols col·locar
3. **Modificar data**: Al modal que s'obre, selecciona una nova data dins del rang del calendari
4. **Confirmar col·locació**: L'esdeveniment es mourà a la nova data i s'eliminarà de la llista de no ubicats

## Configuració de Categories en la Replicació

### Gestió Automàtica de Categories

Quan repliques esdeveniments, l'aplicació gestiona automàticament les categories:

**Si la categoria existeix al destí:**
- L'esdeveniment manté la seva categoria original
- Els colors i noms es conserven

**Si la categoria no existeix al destí:**
- L'aplicació crea automàticament la categoria al calendari de destí
- La categoria s'afegeix també al catàleg global per futures reutilitzacions
- Es manté el color i nom originals

### Categories del Sistema

**Exclusió automàtica:**
- Els esdeveniments del sistema (PAF, FESTIU, IOC) **no es repliquen**
- Només es copien els esdeveniments creats pel professor
- Això evita duplicar esdeveniments institucionals que ja existeixen

## Casos d'Ús Avançats

### Cas 1: Replicació entre Semestres del Mateix Curs

**Escenari**: Professor que vol utilitzar la mateixa planificació del primer semestre en el segon

**Procediment:**
1. Crea el calendari del segon semestre
2. Replica des del primer semestre al segon
3. Revisa els esdeveniments no ubicats (normalment pocs)
4. Ajusta dates específiques si cal

**Resultat**: Planificació coherent adaptada automàticament al nou calendari

### Cas 2: Adaptació entre Cursos Acadèmics

**Escenari**: Reutilitzar la planificació del curs 2023-24 per al 2024-25

**Procediment:**
1. Crea el calendari del nou curs acadèmic
2. Replica des del calendari anterior
3. Revisa i actualitza continguts específics
4. Ajusta dates que no s'hagin adaptat correctament

**Consideracions**: Pot haver-hi més esdeveniments no ubicats per diferències en festius o estructura del curs

### Cas 3: Adaptació entre Tipus de Calendaris

#### Escenari A: FP/BTX → "Altre"

**Situació**: Adaptar planificació d'estudi a calendari genèric
**Avantatge**: Els esdeveniments de dies laborables es col·locaran en el calendari "Altre" que inclou caps de setmana
**Algoritme**: GenericReplicaService
**Resultat**: Millor taxa d'èxit, menys esdeveniments no ubicats

#### Escenari B: "Altre" → FP/BTX

**Situació**: Adaptar calendari genèric a calendari d'estudi
**Limitació**: Els esdeveniments de caps de setmana del calendari origen quedaran no ubicats
**Algoritme**: GenericReplicaService (seleccionat per presència de calendari "Altre")
**Resultat**: Requereix més revisió manual per esdeveniments de caps de setmana

#### Escenari C: Entre Calendaris "Altre"

**Situació**: Òptima per preservació d'agrupacions i flexibilitat
**Avantatges**:
- Màxima preservació d'esdeveniments per dia
- Estratègies adaptatives segons relació d'espais
- Reducció de problemàtiques de storage
**Algoritme**: GenericReplicaService amb preservació d'agrupacions

## Optimització de la Replicació

### Millors Pràctiques

**Abans de replicar:**
- **Neteja el calendari origen**: Elimina esdeveniments que no vols replicar
- **Verifica dates del destí**: Assegura't que el calendari destí té dates correctes
- **Planifica categories**: Revisa que les categories siguin adequades per al destí

**Durant la replicació:**
- **Revisa la previsualització**: Si l'aplicació ofereix vista prèvia, utilitza-la
- **Confirma amb cura**: Una vegada executada, la replicació pot ser difícil de desfer

**Després de replicar:**
- **Revisa esdeveniments col·locats**: Verifica que les dates siguin apropiades
- **Gestiona no ubicats immediatament**: No deixis esdeveniments sense ubicar
- **Ajusta continguts**: Adapta descripcions i títols al nou context si cal

### Consells per Minimitzar Esdeveniments No Ubicats

**Estratègies per tipus de calendari:**

**Per calendaris FP/BTX:**
- **Calendaris similars**: Replica entre calendaris d'estudi amb durades similars
- **Espai suficient**: Assegura't que el destí tingui prou dies lectius (laborables)
- **Evita sobrecàrrega**: No repliquis a calendaris ja molt carregats (màxim 1 event/dia)

**Per calendaris "Altre":**
- **Optimització per agrupacions**: Els calendaris "Altre" són òptims per preservar múltiples esdeveniments per dia
- **Flexibilitat temporal**: Aprofita que inclouen caps de setmana per més espai disponible
- **Selecció d'estratègia**: 
  - Espais idèntics → Còpia directa (0 events no ubicats)
  - Espai major → Expansió (0 events no ubicats)
  - Espai menor → Compressió (alguns events poden quedar no ubicats)

**Per replicacions mixtes:**
- **FP/BTX → "Altre"**: Replicació segura, perfecta compatibilitat
- **"Altre" → FP/BTX**: Revisa esdeveniments de caps de setmana que quedaran no ubicats

## Limitacions i Consideracions

### Limitacions Tècniques

- **Només esdeveniments del professor**: Els esdeveniments del sistema no es repliquen
- **Sense recursivitat**: Els esdeveniments no mantenen relacions temporals complexes
- **Màxim un nivell**: No es poden fer replicacions en cadena automàtiques
- **Selecció automàtica d'algoritme**: No es pot forçar manualment l'ús d'un algoritme específic

### Consideracions de Disseny per Algoritme

**EstudiReplicaService:**
- **Comportament preservat**: 100% compatible amb versions anteriors
- **Restriccions acadèmiques**: Només dies laborables, un event per dia
- **Algoritme proporcionat**: Manté la proporció temporal en dies lectius

**GenericReplicaService:**
- **Optimització per agrupacions**: Preserva múltiples esdeveniments per dia
- **Estratègies adaptatives**: Selecciona automàticament còpia, expansió o compressió
- **Eficiència de storage**: Redueix problemàtiques de memòria i emmagatzematge
- **Flexibilitat temporal**: Utilitza tots els dies disponibles, inclosos caps de setmana

**Gestió Comuna:**
- **Preservació de categories**: Les categories es mantenen o es creen automàticament
- **Gestió d'errors robust**: Tots els algoritmes gestionen conflictes de manera intel·ligent
- **Format de resultat unificat**: Compatibilitat garantida amb ReplicaManager

### Reversibilitat

**Important**: La replicació **no és fàcilment reversible**. 

**Recomanació**: Fes una còpia de seguretat (exportació JSON) del calendari de destí abans de replicar, per si vols desfer els canvis.

## Solució de Problemes

### "No hi ha esdeveniments per replicar"

**Causa**: El calendari origen només té esdeveniments del sistema
**Solució**: Afegeix esdeveniments creats pel professor al calendari origen

### "Calendari destí sense espai útil"

**Causa**: El calendari destí no té dies lectius disponibles
**Solució**: 
- Verifica les dates d'inici i fi del calendari destí
- Per calendaris FP/BTX: assegura't que hi ha dies laborables
- Per calendaris "Altre": verifica que no tots els dies estan ocupats pel sistema

### Tots els esdeveniments queden no ubicats

**Causa**: Diferències estructurals grans entre calendaris o incompatibilitat d'algoritme
**Solució**:
- **Per calendaris FP/BTX**: Utilitza calendaris amb durades similars en dies laborables
- **Per calendaris "Altre"**: Aprovecita la flexibilitat dels caps de setmana
- **Replicació mixta**: Si repliques "Altre" → FP/BTX, molts esdeveniments de caps de setmana quedaran no ubicats (comportament esperat)
- Col·loca manualment els esdeveniments més importants
- Considera crear un calendari de destí del tipus adequat

### "Molts esdeveniments no ubicats en replicació Altre → FP/BTX"

**Causa**: Comportament esperat quan es replica des d'un calendari que inclou caps de setmana a un de només dies laborables
**Solució**:
- Comportament normal del GenericReplicaService
- Els esdeveniments de caps de setmana del calendari "Altre" no tenen lloc en calendaris FP/BTX
- Revisa i col·loca manualment els esdeveniments de caps de setmana en dies laborables
- Considera usar un calendari destí tipus "Altre" si necessites conservar tots els esdeveniments

---
[← Importació i Exportació](Importació-i-Exportació) | [Personalització i Temes →](Personalització-i-Temes)