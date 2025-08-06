# Gestió d'Esdeveniments

Els esdeveniments són l'element central dels calendaris IOC. Aquesta guia explica com crear, editar, organitzar i gestionar esdeveniments de manera eficient.

## Tipus d'Esdeveniments

### 1. Esdeveniments d'Usuari
Creats manualment pels usuaris del sistema.
- **Editables**: Es poden modificar títol, data, categoria i descripció
- **Movibles**: Es poden arrossegar a altres dates
- **Eliminables**: Es poden esborrar sense restriccions

### 2. Esdeveniments del Sistema IOC
Generats automàticament segons la configuració institucional.
- **No editables**: Nom i descripció fixes
- **No movibles**: Dates establertes per l'IOC
- **Identificació visual**: Marcats com "(Sistema)" a les llistes

**Exemples d'esdeveniments del sistema:**
- Festius oficials
- Períodes de PAF (Proves d'Avaluació Final)
- Esdeveniments institucionals de l'IOC

## Crear Esdeveniments

### Mètode 1: Clic directe al calendari

1. **Seleccionar data**: Fes clic en qualsevol dia del calendari
2. **Modal automàtic**: S'obre el formulari "Afegir Esdeveniment"
3. **Data preomplerta**: La data seleccionada ja està configurada

### Mètode 2: Botó d'acció

1. **Obrir modal**: Clic al botó "Afegir Esdeveniment" (si està disponible)
2. **Seleccionar data**: Escull la data manualment al formulari

### Formulari de creació

**Camps obligatoris:**
- **Títol**: Nom descriptiu de l'esdeveniment
- **Data**: Data de l'esdeveniment (format automàtic)
- **Categoria**: Selecciona una categoria de la llista

**Camps opcionals:**
- **Descripció**: Detalls addicionals, notes, enllaços

### Exemples de títols efectius
```
✅ Bones pràctiques:
- "Lliurament EAC5 - Desenvolupament Web"
- "Examen M03 UF2"
- "Reunió tutoria grupal"
- "Practica BBDD - Consultes avançades"

❌ Evitar:
- "Cosa"
- "Important"
- "Recordar"
```

## Editar Esdeveniments

### Accedir a l'edició
- **Doble clic**: Sobre qualsevol esdeveniment al calendari
- **S'obre el modal** amb les dades precarregades

### Camps editables
- **Títol**: Modificar nom de l'esdeveniment
- **Data**: Canviar a una altra data vàlida
- **Categoria**: Reassignar a diferent categoria
- **Descripció**: Actualitzar detalls

### Validacions automàtiques
- **Data dins del rang**: Ha d'estar entre les dates del calendari
- **Categoria vàlida**: Ha d'existir al catàleg actual
- **Títol no buit**: Obligatori tenir nom

### Guardar canvis
- **Botó "Guardar"**: Confirma els canvis
- **Actualització immediata**: Es mostra al calendari
- **Persistència automàtica**: Es guarda al navegador

## Eliminar Esdeveniments

### Mètodes d'eliminació

**Des del modal d'edició:**
1. Obre l'esdeveniment (doble clic)
2. Clic al botó "Eliminar Esdeveniment"
3. Confirma l'acció al diàleg

**Confirmació de seguretat:**
- Apareix un diàleg de confirmació
- Indica que l'acció no es pot desfer
- Opcions: "Confirmar" o "Cancel·lar"

### Esdeveniments no eliminables
- **Esdeveniments del sistema**: No tenen botó d'eliminar
- **Esdeveniments de replicació**: Poden tenir restriccions especials

## Moure Esdeveniments (Drag & Drop)

### Com funciona
1. **Clic i arrossega**: Mantén premut sobre un esdeveniment
2. **Arrossegar**: Mou el cursor a la nova data
3. **Deixar anar**: L'esdeveniment es mou automàticament

### Indicadors visuals
- **Esdeveniment arrossegat**: S'il·lumina mentre es mou
- **Dies vàlids**: Es marquen en verd quan es pot deixar
- **Dies no vàlids**: Es marquen en vermell si no es pot

### Restriccions de moviment
- **Rang del calendari**: Només dins les dates del calendari actiu
- **Esdeveniments del sistema**: No es poden moure
- **Dies fora de període**: No es permet moure a dates no vàlides

### Validacions automàtiques
- **Data dins del rang**: Comprova automàticament el rang vàlid
- **Missatges d'error**: Informa si no es pot moure
- **Reversió automàtica**: Torna a la posició original si no és vàlid

## Gestió de Categories

### Assignar categoria a esdeveniments
- **Obligatori**: Tot esdeveniment ha de tenir categoria
- **Selecció**: Desplegable amb categories disponibles
- **Creació automàtica**: Noves categories s'afegeixen al catàleg

### Canviar categoria d'esdeveniments existents
1. Edita l'esdeveniment (doble clic)
2. Selecciona nova categoria del desplegable
3. Guarda els canvis

### Auto-assignació de categories
- **Categoria nova**: Si no existeix al calendari, s'afegeix automàticament
- **Catàleg global**: Categories es comparteixen entre calendaris
- **Sincronització**: Canvis de nom/color s'apliquen a tots els calendaris

## Vistes i Navegació

### Vistes disponibles
- **Month**: Vista mensual (per defecte)
- **Week**: Vista setmanal amb més detall
- **Day**: Vista diària amb horaris
- **Semester**: Vista global del semestre
- **Global**: Tots els calendaris alhora

### Navegació entre períodes
- **Fletxes de navegació**: Anterior/Següent segons la vista
- **Limitacions automàtiques**: No es pot navegar fora del rang del calendari
- **Indicador de període**: Mostra el període actual

### Filtres i cerca
- **Per categoria**: Filtra esdeveniments per tipus
- **Per data**: Navega a dates específiques
- **Per calendari**: Canvia entre calendaris actius

## Gestió Massiva

### Selecció múltiple
- Actualment no implementada
- Futura funcionalitat per accions en lot

### Importació d'esdeveniments
- **Fitxers ICS**: Per calendaris tipus "Altre"
- **Replicació**: Copia esdeveniments entre calendaris
- Veure [Importació i Exportació](Importació-i-Exportació)

### Exportació d'esdeveniments
- **JSON**: Format nadiu per còpies de seguretat
- **ICS**: Format estàndard per altres aplicacions
- **HTML**: Versió imprimible o web

## Limitacions i Consideracions

### Restriccions temporals
- **Rang del calendari**: No es poden crear esdeveniments fora del període
- **Dates passades**: Es poden crear però no és recomanable
- **Límit màxim**: No hi ha límit tècnic d'esdeveniments per dia

### Rendiment
- **Molts esdeveniments**: L'aplicació gestiona fins centenars d'esdeveniments
- **Vista Global**: Pot ser lenta amb molts calendaris simultanis
- **Càrrega inicial**: Primera càrrega pot trigar segons la quantitat de dades

### Compatibilitat
- **Format de dates**: Utilitza UTC internament
- **Zones horàries**: No gestiona zones horàries complexes
- **Recurrència**: No suporta esdeveniments recurrents nativamente

## Consells d'Ús

### Organització efectiva
1. **Noms descriptius**: Inclou codi de mòdul/assignatura si cal
2. **Categories coherents**: Usa un sistema consistent de categories
3. **Descriptions útils**: Afegeix enllaços, notes o recordatoris

### Fluxe de treball recomanat
1. **Crea el calendari** amb les dates correctes
2. **Defineix categories** abans de crear esdeveniments
3. **Afegeix esdeveniments** de forma incremental
4. **Usa replicació** per esdeveniments comuns entre calendaris

### Manteniment regular
- **Revisa esdeveniments passats** periòdicament
- **Actualitza descriptions** amb nova informació
- **Exporta còpies de seguretat** regularment

## Resolució de Problemes

### No puc crear esdeveniments
- **Comprova**: Tens un calendari seleccionat?
- **Verifica**: La data està dins del rang del calendari?
- **Revisa**: Tens categories disponibles?

### L'esdeveniment no apareix
- **Refresca**: La vista actual (canvia de mes i torna)
- **Comprova**: La categoria no està oculta o filtrada
- **Verifica**: L'esdeveniment està a la data correcta

### No puc moure esdeveniments
- **Esdeveniments del sistema**: No es poden moure
- **Dates no vàlides**: Comprova el rang del calendari
- **Calendaris diferents**: El drag&drop només funciona dins del mateix calendari

### Problemes amb categories
- **Categories no apareixen**: Veure [Categories i Organització](Categories-i-Organització)
- **Colors no canvien**: Prova a refrescar la pàgina
- **Sincronització**: Els canvis poden trigar uns segons

---
[← Creació de calendaris](Creació-de-Calendaris) | [Categories i organització →](Categories-i-Organització)