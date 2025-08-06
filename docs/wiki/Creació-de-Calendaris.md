# Creació de Calendaris

El Calendari IOC suporta tres tipus de calendaris diferents, cadascun amb configuracions específiques per adaptar-se als diferents estudis de l'IOC.

## Tipus de Calendaris

### 1. Formació Professional (FP)
Calendaris especialitzats per cicles formatius amb configuració automàtica de dates i esdeveniments del sistema IOC.

### 2. Batxillerat (BTX)
Calendaris per assignatures de batxillerat amb períodes lectius adaptats.

### 3. Altre (Personalitzat)
Calendaris totalment personalitzables per necessitats específiques.

## Calendaris de Formació Professional (FP)

### Configuració requerida

**Cicle Formatiu:**
- Codi del cicle (ex: DAM, DAW, ASIX, SMX, etc.)
- Ha de ser un codi reconegut per l'IOC
- No distingeix entre majúscules i minúscules

**Codi del Mòdul:**
- Format: M + número + lletra opcional (ex: M07B0, M03, M15A1)
- Segueix la nomenclatura oficial dels mòduls d'FP

### Generació automàtica del nom
El sistema genera automàticament el nom seguint el patró:
```
FP_{CICLE}_{MODUL}_{CURS}-{SEMESTRE}
```

**Exemple:**
- Cicle: `DAM`
- Mòdul: `M07B0`
- Resultat: `FP_DAM_M07B0_2024-25_S1`

### Configuració automàtica

**Dates del semestre:**
- S'obtenen automàticament del fitxer `config/fp-semestre.json`
- Inclouen dates d'inici i fi del semestre actual
- Data de PAF1 si està configurada

**Categories per defecte:**
- `IOC_GENERIC`: Esdeveniments generals de l'IOC
- `FESTIU`: Dies festius oficials
- `PAF`: Proves d'Avaluació Final
- Categories específiques del mòdul si estan configurades

**Esdeveniments del sistema:**
- Festius oficials
- Períodes de PAF
- Acontecimientos institucionals de l'IOC

### Pas a pas per crear un calendari FP

1. **Obrir modal de creació:**
   - Clic al botó "+" de la barra superior

2. **Seleccionar tipus:**
   - Marca l'opció "Formació Professional"

3. **Introduir dades:**
   ```
   Cicle Formatiu: DAM
   Codi del Mòdul: M07B0
   ```

4. **Previsualització:**
   - El sistema mostra el nom generat: `FP_DAM_M07B0_2024-25_S1`
   - Verifica que sigui correcte

5. **Crear calendari:**
   - Clic a "Afegir Calendari"
   - El calendari es crea amb tota la configuració automàtica

## Calendaris de Batxillerat (BTX)

### Configuració requerida

**Assignatura:**
- Nom de l'assignatura (ex: FISICA, QUIMICA, MATEMATIQUES)
- Preferiblement en majúscules per coherència

### Generació automàtica del nom
```
BTX_{ASSIGNATURA}_{CURS}-{SEMESTRE}
```

**Exemple:**
- Assignatura: `FISICA`
- Resultat: `BTX_FISICA_2024-25_S1`

### Configuració automàtica

**Dates del semestre:**
- S'obtenen de `config/btx-semestre.json`
- Adaptades al calendari de batxillerat

**Categories per defecte:**
- Similar a FP però adaptades a BTX
- Categories específiques de batxillerat

### Pas a pas per crear un calendari BTX

1. **Seleccionar tipus:** "Batxillerat"
2. **Introduir assignatura:** `FISICA`
3. **Verificar previsualització:** `BTX_FISICA_2024-25_S1`
4. **Crear calendari**

## Calendaris Personalitzats (Altre)

### Configuració manual

**Nom del calendari:**
- Nom lliure escollit per l'usuari
- Pot contenir espais i caràcters especials

**Dates:**
- **Data d'inici:** Primera data del calendari
- **Data de fi:** Última data del calendari
- Ambdues són obligatòries

### Validacions

**Data de fi posterior a data d'inici:**
- El sistema valida que el rang sigui coherent
- Mostra error si les dates no són vàlides

**Rang mínim i màxim:**
- Mínim: 1 dia
- Màxim: 2 anys (limitació pràctica)

### Característiques especials

**Sense esdeveniments del sistema:**
- No es carreguen esdeveniments automàtics de l'IOC
- L'usuari té control total sobre el contingut

**Categories personalitzades:**
- Comença sense categories predefinides
- L'usuari crea les categories que necessiti

**Importació ICS:**
- Els calendaris tipus "Altre" poden importar fitxers ICS
- Ideal per calendaris externs o especials

### Pas a pas per crear un calendari personalitzat

1. **Seleccionar tipus:** "Altre"
2. **Introduir nom:** `Projecte Final`
3. **Seleccionar dates:**
   ```
   Data d'inici: 01/09/2024
   Data de fi: 30/06/2025
   ```
4. **Crear calendari**

## Gestió de Calendaris Existents

### Canviar entre calendaris
- **Panell esquerre:** Llista de calendaris guardats
- **Calendari actiu:** Ressaltat amb color diferent
- **Canvi:** Clic sobre qualsevol calendari de la llista

### Accions disponibles

**Menú d'accions (⋮):**
- **Exportar:** Descarregar en diferents formats
- **Duplicar:** Crear còpia del calendari
- **Eliminar:** Esborrar calendari (amb confirmació)
- **Carregar JSON:** Importar configuració

### Indicadors visuals
- **Nom del calendari:** Es mostra a la barra superior
- **Rang de dates:** Visible als controls de navegació
- **Tipus:** Identificable pel prefix (FP_, BTX_ o lliure)

## Limitacions i Consideracions

### Nombres únics
- No es poden crear dos calendaris amb el mateix nom
- El sistema avisa si ja existeix

### Modificació posterior
- Els calendaris FP i BTX no es poden modificar després de crear-se
- Els calendaris "Altre" mantenen flexibilitat total

### Configuració semestral
- Els calendaris FP i BTX depenen dels fitxers de configuració
- Veure [Configuració Semestral](Configuració-Semestral) per actualitzacions

### Emmagatzematge
- Tots els calendaris es guarden localment al navegador
- Exporta regularment per fer còpies de seguretat

## Consells per crear calendaris

### Nomenclatura consistent
- Usa convencions clares per als noms
- Considera l'any acadèmic al nom

### Planificació prèvia
- Defineix les categories que necessitaràs
- Revisa les dates abans de confirmar

### Organització
- Crea calendaris separats per mòduls/assignatures diferents
- Usa la replicació per compartir esdeveniments comuns

---
[← Guia d'inici](Guia-d-Inici-Rapid) | [Gestió d'esdeveniments →](Gestió-d-Esdeveniments)