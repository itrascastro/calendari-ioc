# Services - Referència Tècnica

Aquesta referència documenta els serveis especialitzats del Calendari IOC, que encapsulen lògica de negoci complexa i algoritmes específics del domini, proporcionant funcionalitats reutilitzables i desacoblades.

**Nota v1.1+**: A partir de la versió 1.1, CategoryService va ser eliminat com a part de la migració a l'arquitectura "Graph of Objects in Memory".

## Visió General dels Services

Els **services** implementen lògica de negoci especialitzada que és massa complexa per als managers o massa específica per als helpers. Segueixen principis de responsabilitat única i són fàcilment testejables i reutilitzables.

### Arquitectura dels Services

**Principis de disseny:**
- Responsabilitat única i ben definida
- Stateless (sense estat intern)
- Reutilitzables entre diferents components
- Fàcils de testejar de manera aïllada
- APIs clares i documentades

**Ubicació**: `js/services/` (i subcarpetes especialitzades)

## CategoryService (Eliminat a v1.1+)

**Nota històrica**: CategoryService va ser eliminat a la versió 1.1 com a part de la migració a l'arquitectura "Graph of Objects in Memory". La seva funcionalitat ha estat integrada directament als models CalendariIOC_Category i CategoryManager.

### Migració v1.0 → v1.1

- **Funcionalitat de sincronització**: Ara integrada a CategoryManager
- **Catàleg global**: Gestió directa via instàncies CalendariIOC_Category  
- **Lookup de categories**: Eliminat, ara es fan referències directes entre objectes

## Services de Replicació

### Arquitectura de Replicació

Els **services de replicació** implementen diferents algoritmes de replicació d'esdeveniments entre calendaris segons el tipus de calendari origen i destí. Utilitzen el patró **Factory** per seleccionar automàticament l'algoritme més adequat.

**Ubicació**: `js/services/replica/`

#### Estructura Jeràrquica

```
js/services/replica/
├── ReplicaService.js           # Classe base amb mètodes comuns
├── EstudiReplicaService.js     # Algoritme per calendaris FP/BTX
├── GenericReplicaService.js    # Algoritme per calendaris "Altre"
└── ReplicaServiceFactory.js    # Factory per selecció automàtica
```

### ReplicaService (Classe Base)

#### Propòsit i Responsabilitats

La **classe base ReplicaService** proporciona mètodes comuns per tots els algoritmes de replicació, incloent anàlisi d'espai útil, càlcul de confiança i detecció de PAF.

#### Mètodes Comuns

##### `analyzeWorkableSpace(calendar)`

Analitza l'espai útil disponible en un calendari considerant tipus, esdeveniments del sistema i festius.

```javascript
/**
 * Analitza l'espai útil disponible en un calendari
 * @param {Object} calendar - Calendari a analitzar
 * @returns {Array} Array de dates disponibles en format string
 */
analyzeWorkableSpace(calendar) {
    const espaiUtil = [];
    const dataFiAvalucions = this.findPAF1(calendar);
    
    // Esdeveniments que ocupen l'espai (sistema IOC, festius, etc.)
    const occupiedBySystem = new Set(
        calendar.events
            .filter(e => e.isSystemEvent)
            .map(e => e.date)
    );
    
    // Iterar dia a dia segons tipus de calendari
    let currentDate = dateHelper.parseUTC(calendar.startDate);
    const endDate = dateHelper.parseUTC(dataFiAvalucions);
    
    while (currentDate <= endDate) {
        const dateStr = dateHelper.toUTCString(currentDate);
        
        // Per calendaris "Altre": tots els dies excepte els ocupats pel sistema
        // Per calendaris FP/BTX: només dies laborals que no estan ocupats pel sistema
        const isValidDay = calendar.type === 'Altre' 
            ? !occupiedBySystem.has(dateStr)
            : dateHelper.isWeekday(dateStr) && !occupiedBySystem.has(dateStr);
        
        if (isValidDay) {
            espaiUtil.push(dateStr);
        }
        
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    
    return espaiUtil;
}
```

##### `calculateProportionalConfidence(indexOrigen, indexIdeal, indexFinal, factor)`

Calcula la confiança d'una replicació basada en la proximitat entre posició ideal i final.

```javascript
/**
 * Calcula confiança basada en proximitat de posicions
 * @param {number} indexOrigen - Índex original
 * @param {number} indexIdeal - Índex ideal calculat
 * @param {number} indexFinal - Índex final assignat
 * @param {number} factor - Factor de proporció/compressió
 * @returns {number} Percentatge de confiança (70-99)
 */
calculateProportionalConfidence(indexOrigen, indexIdeal, indexFinal, factor) {
    let confidence = 95; // Base alta
    
    // Penalització per diferència entre ideal i final
    const diferencia = Math.abs(indexIdeal - indexFinal);
    if (diferencia > 0) {
        confidence -= Math.min(diferencia * 2, 15); // Màxim -15%
    }
    
    // Bonificació per factors "nets" (prop de 1.0)
    if (Math.abs(factor - 1.0) < 0.1) {
        confidence += 3; // Replicació gairebé directa
    }
    
    return Math.max(Math.min(confidence, 99), 70);
}
```

##### `findPAF1(calendar)`

Detecta la data de fi d'avaluacions (PAF1) per determinar l'espai útil del calendari.

```javascript
/**
 * Detecta data de fi d'avaluacions PAF1
 * @param {Object} calendar - Calendari a analitzar
 * @returns {string} Data PAF1 o data de fi del calendari
 */
findPAF1(calendar) {
    // Per calendaris FP i BTX: usar paf1Date directe
    if ((calendar.type === 'FP' || calendar.type === 'BTX') && calendar.paf1Date) {
        return calendar.paf1Date;
    }
    
    // Per calendaris "Altre": buscar esdeveniments PAF
    const pafEvents = calendar.events.filter(event => {
        // Buscar per ID de categoria del sistema
        if (event.categoryId === 'SYS_CAT_3') return true;
        
        // Buscar per títol que contingui "PAF1"
        if (event.title.toUpperCase().includes('PAF1')) return true;
        
        return false;
    });
    
    if (pafEvents.length > 0) {
        const sortedPafEvents = pafEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        const firstPaf = sortedPafEvents[0];
        return firstPaf.date;
    }
    
    // Fallback: usar final de calendari
    return calendar.endDate;
}
```

### EstudiReplicaService

#### Propòsit i Responsabilitats

L'**EstudiReplicaService** implementa l'algoritme de replicació per calendaris d'estudi (FP/BTX), mantenint 100% de compatibilitat amb el comportament anterior. Està optimitzat per calendaris amb restriccions acadèmiques.

#### Característiques Específiques

- **Només dies laborables**: Replicació únicament en dies de dilluns a divendres
- **Un esdeveniment per dia**: Cada dia pot tenir màxim un esdeveniment replicat
- **Cerca radial de slots**: Algoritme de cerca per trobar el slot lliure més proper
- **Detecció automàtica de PAF**: Utilitza dates PAF1 per delimitar període útil

### GenericReplicaService

#### Propòsit i Responsabilitats

El **GenericReplicaService** implementa un algoritme optimitzat per calendaris genèrics tipus "Altre", centrat en la preservació d'agrupacions d'esdeveniments per dia i màxima eficiència de col·locació.

#### Característiques Específiques

- **Tots els dies de la setmana**: Inclou caps de setmana si no estan ocupats pel sistema
- **Múltiples esdeveniments per dia**: Preserva agrupacions d'esdeveniments del mateix dia
- **Estratègies adaptatives**: Còpia directa, expansió o compressió segons relació d'espais
- **Optimització de storage**: Algoritme més eficient que redueix problemàtiques d'emmagatzematge

### ReplicaServiceFactory

#### Propòsit i Responsabilitats

El **ReplicaServiceFactory** implementa el patró Factory per seleccionar automàticament el servei de replicació més adequat segons els tipus de calendaris origen i destí.

#### Lògica de Selecció

```javascript
/**
 * Selecciona el servei de replicació adequat segons tipus de calendaris
 * @param {Object} sourceCalendar - Calendari origen
 * @param {Object} targetCalendar - Calendari destí
 * @returns {ReplicaService} Instància del servei adequat
 */
static getService(sourceCalendar, targetCalendar) {
    const sourceType = sourceCalendar.type || 'Altre';
    const targetType = targetCalendar.type || 'Altre';
    
    // Si qualsevol dels calendaris és "Altre", usar GenericReplicaService
    if (sourceType === 'Altre' || targetType === 'Altre') {
        return new GenericReplicaService();
    } 
    
    // Si ambdós són calendaris d'estudi (FP, BTX), usar EstudiReplicaService
    return new EstudiReplicaService();
}
```

## DateValidationService

### Propòsit i Responsabilitats

El **DateValidationService** proporciona validacions complexes de dates, considerant regles de negoci específiques, festius i restriccions acadèmiques.

### API Pública

#### `validateEventDate(date, calendarType, constraints)`

Valida si una data és vàlida per a un esdeveniment en un tipus de calendari específic.

#### `isWorkingDay(date, calendarType)`

Determina si una data és un dia lectiu segons el tipus de calendari.

#### `getNextWorkingDay(date, calendarType)`

Obté el proper dia lectiu a partir d'una data donada.

#### `validateDateRange(startDate, endDate, constraints)`

Valida un rang de dates segons restriccions específiques.

---
[← Testing i Debugging](Testing-i-Debugging) | [Export Referència →](Export-Referència)