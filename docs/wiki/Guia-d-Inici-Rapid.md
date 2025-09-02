# Guia d'Inici Ràpid

Aquesta guia t'ajudarà a començar a utilitzar el Calendari IOC en pocs minuts.

## Primer Cop

### 1. Accedir a l'aplicació
- Obre l'aplicació al navegador web
- No cal instal·lació ni registre
- Funciona completament offline després de la primera càrrega

### 2. Interfície principal
L'aplicació es divideix en tres àrees:

**Panell esquerre (sidebar):**
- **Esdeveniments Pendents**: Events sense ubicació definitiva
- **Calendaris Desats**: Llista dels calendaris creats amb botó "+ Nou" i "↑ Carregar"
- **Categories d'Esdeveniments**: Catàleg de categories amb formulari per afegir noves

**Àrea central:**
- **Vista del calendari**: Mostra els esdeveniments del calendari actiu
- **Botons de navegació**: Fletxes esquerra/dreta per canviar períodes
- **Selector de vista**: Global, Semestre, Mensual, Setmanal, Dia

**Barra superior (header):**
- **Logo i títol**: "Calendari IOC" amb logo de l'IOC
- **Botó Reset**: Netejar totes les dades
- **Toggle de tema**: Canvi entre mode clar i fosc

## Crear el teu primer calendari

### Pas 1: Obrir el modal de creació
- Al panell esquerre, a la secció "Calendaris Desats"
- Fes clic al botó **"+ Nou"**
- S'obrirà el modal "Nou Calendari de Mòdul"

### Pas 2: Seleccionar tipus de calendari

**Per Formació Professional (FP):**
1. Al camp "Tipus", selecciona **"Formació Professional (FP)"**
2. Apareixeran camps dinàmics específics per FP
3. Omple els camps requerits segons la configuració del tipus
4. El nom del calendari es generarà automàticament i es mostrarà en la vista prèvia

**Per Batxillerat (BTX):**
1. Al camp "Tipus", selecciona **"Batxillerat (BTX)"**
2. Apareixeran camps dinàmics específics per BTX
3. Omple els camps requerits segons la configuració
4. El nom es generarà automàticament

**Per calendaris personalitzats:**
1. Al camp "Tipus", selecciona **"Altre"**
2. Apareixeran camps per definir dates personalitzades
3. Introdueix el nom i dates d'inici/fi del calendari

### Pas 3: Guardar
- Fes clic a **"Crear Calendari"**
- El calendari es crearà amb les categories i esdeveniments per defecte del tipus seleccionat
- Es mostrarà automàticament en la vista activa del calendari

**Important:** Els calendaris FP i BTX inclouen categories per defecte (PAF, Festius, etc.). Els calendaris tipus "Altre" poden no tenir categories inicials.

## Gestionar categories (PRIMER PAS ESSENCIAL)

> **⚠️ PREREQUISIT IMPORTANT:** Per crear esdeveniments necessites almenys una categoria. Sense categories, no podràs afegir esdeveniments al calendari.

### Verificar categories existents
1. Al panell esquerre, revisa la secció **"Categories d'Esdeveniments"**
2. Si veus categories llistades, ja pots crear esdeveniments
3. Si no hi ha categories o vols afegir-ne de noves, segueix els passos següents

### Crear nova categoria
1. Al panell esquerre, a la secció "Categories d'Esdeveniments"
2. A la part inferior, escriu el nom a la caixa "Nova categoria..."
3. Fes clic al botó **"+"** que apareix al costat
4. La categoria s'afegeix al catàleg global amb un color assignat automàticament

### Editar categoria existent
1. Fes clic sobre el nom d'una categoria
2. Es convertirà en un camp editable
3. Modifica el nom i prem Enter o fes clic fora
4. El canvi s'aplica a tots els calendaris

### Canviar color de categoria
1. Fes clic sobre el punt de color de la categoria
2. S'obrirà el selector de colors
3. Selecciona un nou color
4. El canvi s'aplica immediatament

## Afegir el teu primer esdeveniment

> **✅ PREREQUISIT:** Assegura't que tens almenys una categoria creada (veure secció anterior).

### Pas 1: Seleccionar data
- Fes clic en qualsevol dia del calendari (vista mensual, setmanal o diària)
- S'obrirà el modal "Nou Esdeveniment"

### Pas 2: Completar informació
1. **Títol**: Nom de l'esdeveniment (ex: "Lliurament EAC5")
2. **Data**: Es preomple automàticament, però es pot canviar
3. **Categoria**: Selecciona una categoria existent de la llista desplegable
4. **Descripció**: (Opcional) Detalls adicionals

### Pas 3: Guardar
- Fes clic a **"Desar Esdeveniment"**
- L'esdeveniment apareixerà al calendari amb el color de la categoria assignada
- Es pot editar fent doble clic sobre l'esdeveniment

**Si no pots seleccionar categoria:** Torna a la secció "Gestionar categories" i crea almenys una categoria primer.

## Moure esdeveniments

### Drag & Drop
1. Fes clic i manté premut sobre un esdeveniment
2. Arrossega'l a la nova data desitjada
3. Deixa anar per confirmar el moviment
4. Només es poden moure esdeveniments d'usuari (no del sistema)

### Validacions automàtiques
- No es poden moure events fora del rang del calendari
- Els events del sistema IOC no es poden moure
- El sistema avisa si la data de destí no és vàlida

## Consells ràpids

### Navegació eficient
- **Tecles de cursor**: Navega entre mesos
- **Escape**: Tancar qualsevol modal
- **Double clic**: Editar esdeveniments existents

### Organització
- Usa categories coherents per tipus d'activitat
- Els noms descriptius faciliten la cerca
- El mode fosc és útil per sessions llargues

### Productivitat
- Els esdeveniments es poden copiar entre calendaris (veure [Replicació](Replicació-entre-Calendaris))
- Exporta calendaris per compartir o fer còpies de seguretat
- Les categories es reutilitzen automàticament entre calendaris

## Problemes comuns

**No puc crear esdeveniments:**
- Comprova que tens un calendari seleccionat
- Assegura't que la data està dins del rang del calendari

**No veig les meves categories:**
- Les categories del catàleg global apareixen automàticament
- Prova a refrescar la pàgina si no es mostren

**Els canvis no es guarden:**
- L'aplicació guarda automàticament a localStorage
- Comprova que el navegador permet emmagatzematge local

## Següents passos

- Aprèn més sobre la [Gestió d'Esdeveniments](Gestió-d-Esdeveniments)
- Descobreix el sistema de [Categories i Organització](Categories-i-Organització)
- Explora les opcions d'[Importació i Exportació](Importació-i-Exportació)

---
[← Tornar a l'inici](Home) | [Crear calendaris →](Creació-de-Calendaris)