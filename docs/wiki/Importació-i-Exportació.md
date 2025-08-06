# Importació i Exportació

L'aplicació Calendari IOC ofereix un sistema complet d'importació i exportació que et permet compartir calendaris, fer còpies de seguretat i intercanviar dades amb altres aplicacions de calendari.

## Visió General

### Per què importar i exportar?

- **Còpies de seguretat**: Guardar els teus calendaris fora de l'aplicació
- **Compartició**: Enviar calendaris a companys o estudiants
- **Migració**: Moure calendaris entre diferents dispositius o aplicacions
- **Interoperabilitat**: Usar calendaris d'altres aplicacions dins del Calendari IOC
- **Publicació**: Generar versions web estàtiques dels calendaris

### Formats Suportats

**Exportació (3 formats):**
- **JSON**: Format nadiu de l'aplicació, màxima compatibilitat
- **ICS**: Format estàndard de calendaris, compatible amb Google Calendar, Outlook, etc.
- **HTML**: Pàgina web estàtica per publicació online

**Importació (1 format):**
- **ICS**: Importació d'esdeveniments des de fitxers ICS/iCalendar

## Exportació de Calendaris

### Com Exportar un Calendari

1. **Seleccionar calendari**: Assegura't que el calendari que vols exportar està actiu
2. **Obrir menú d'exportació**: Fes clic al botó "Exportar" al panell lateral
3. **Triar format**: Selecciona entre JSON, ICS o HTML segons les teves necessitats
4. **Descarregar fitxer**: L'arxiu es descarregarà automàticament

### Format JSON

**Característiques:**
- **Format nadiu**: Conserva tota la informació del calendari sense pèrdues
- **Estructura completa**: Inclou calendari, categories, esdeveniments i metadades
- **Reimportació**: Es pot reimportar completament a l'aplicació
- **Còpia de seguretat**: Format ideal per fer backups complets

**Contingut del fitxer JSON:**
```json
{
  "id": "FP_DAM_M07B0_2024-25_S1",
  "name": "FP_DAM_M07B0_2024-25_S1", 
  "type": "FP",
  "startDate": "2024-09-16",
  "endDate": "2025-01-24",
  "categories": [
    {
      "id": "IOC_GENERIC",
      "name": "IOC",
      "color": "#3182ce",
      "isSystem": true
    }
  ],
  "events": [
    {
      "id": "FP_DAM_M07B0_2024-25_S1_E1",
      "title": "Lliurament Pràctica 1",
      "date": "2024-10-15",
      "categoryId": "USER_CAT_1",
      "description": "Primera pràctica del mòdul"
    }
  ],
  "exportInfo": {
    "version": "1.0",
    "exportDate": "2025-01-25T10:30:00.000Z",
    "exportedBy": "Calendari-IOC"
  }
}
```

**Ús recomanat:**
- Còpies de seguretat regulars
- Migració entre dispositius
- Arxivatge de calendaris antics
- Desenvolupament i testing

### Format ICS (iCalendar)

**Característiques:**
- **Estàndard universal**: Compatible amb la majoria d'aplicacions de calendari
- **Només esdeveniments**: Exporta únicament els esdeveniments, no les categories
- **Integració**: Es pot importar a Google Calendar, Outlook, Apple Calendar, etc.
- **Data zones**: Gestió correcta de zones horàries

**Contingut del fitxer ICS:**
```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Calendari IOC//NONSGML v1.0//CA
CALSCALE:GREGORIAN
METHOD:PUBLISH

BEGIN:VEVENT
UID:FP_DAM_M07B0_2024-25_S1_E1@calendari-ioc.local
DTSTART:20241015
SUMMARY:Lliurament Pràctica 1
DESCRIPTION:Primera pràctica del mòdul
CATEGORIES:Lliuraments
END:VEVENT

END:VCALENDAR
```

**Ús recomanat:**
- Compartir esdeveniments amb usuaris d'altres aplicacions
- Integració amb calendaris personals de Google o Outlook
- Sincronització amb calendaris mòbils
- Publicació d'esdeveniments en webs externes

### Format HTML

**Característiques:**
- **Visualització web**: Pàgina HTML completa llesta per publicar
- **Autocontinguda**: Tot el CSS i JavaScript integrat en un sol fitxer
- **Responsive**: S'adapta a dispositius mòbils i de sobretaula
- **No editable**: Format només de lectura per consulta

**Contingut generat:**
- Calendari visual amb tots els esdeveniments
- Categories amb colors originals
- Navegació per mesos
- Informació detallada dels esdeveniments
- Estils consistents amb l'aplicació original

**Ús recomanat:**
- Compartir calendaris per correu electrònic
- Publicar horaris en pàgines web
- Crear versions offline per consulta
- Presentations i informes

## Importació de Calendaris

### Importació ICS

**Limitacions i requireiments:**
- **Només calendaris tipus "Altre"**: No es pot importar a calendaris FP o BTX per mantenir la integritat
- **Format ICS vàlid**: El fitxer ha de complir l'estàndard iCalendar
- **Esdeveniments únics**: Els esdeveniments duplicats s'ignoren automàticament

### Com Importar un Fitxer ICS

1. **Crear calendari "Altre"**: Primer has de tenir un calendari de tipus "Altre" actiu
2. **Accedir a importació**: Fes clic al botó "Importar ICS" al panell lateral
3. **Seleccionar fitxer**: Tria el fitxer .ics del teu ordinador
4. **Configurar importació**: L'aplicació et mostrarà una previsualització
5. **Confirmar importació**: Els esdeveniments s'afegiran al calendari actual

### Processament de la Importació

**Conversió d'esdeveniments:**
- **Títols**: Es manté el títol original (SUMMARY)
- **Dates**: Conversió automàtica a format local
- **Descripcions**: Es preserven les descripcions (DESCRIPTION)
- **Categories**: Es creen automàticament si no existeixen

**Gestió de categories:**
- Si l'esdeveniment té categoria especificada, es busca o es crea
- Si no té categoria, s'assigna a "Sense Categoria"
- Les noves categories s'afegeixen automàticament al catàleg global

**Validació de dates:**
- Verificació que les dates estan dins del rang del calendari
- Els esdeveniments fora del rang es marquen com "no ubicats"
- Conversió automàtica de zones horàries

### Esdeveniments No Ubicats

Quan alguns esdeveniments no es poden ubicar durant la importació:

**Causes habituals:**
- Dates fora del rang del calendari
- Format de data no reconegut
- Esdeveniments sense data vàlida

**Resolució:**
1. L'aplicació et mostrarà una llista d'esdeveniments no ubicats
2. Pots revisar cada esdeveniment i ajustar les dates manualment
3. Utilitzar la funcionalitat "Esdeveniments No Ubicats" per gestionar-los posteriorment

## Casos d'Ús Pràctics

### Cas 1: Còpia de Seguretat Regular

**Objectiu**: Mantenir còpies de seguretat dels calendaris importants

**Procediment:**
1. **Exportació JSON mensual**: Exporta tots els calendaris actius en format JSON
2. **Emmagatzematge segur**: Guarda els fitxers en un servei cloud (Drive, OneDrive, etc.)
3. **Nomenclatura**: Usa noms com `CalendariIOC_2024-25_S1_backup_enero.json`
4. **Verificació**: Obre ocasionalment els backups per verificar la integritat

### Cas 2: Compartició amb Companys

**Objectiu**: Compartir el calendari d'un mòdul amb altres professors

**Procediment:**
1. **Exportació ICS**: Exporta el calendari en format ICS
2. **Compartició**: Envia l'arxiu per correu o penja'l en una plataforma compartida
3. **Importació**: Els companys poden importar l'ICS a les seves aplicacions de calendari
4. **Actualitzacions**: Repeteix el procés quan hi hagi canvis significatius

### Cas 3: Publicació Web

**Objectiu**: Publicar el calendari del curs en una pàgina web

**Procediment:**
1. **Exportació HTML**: Exporta el calendari en format HTML
2. **Personalització**: Opcionalment, edita l'HTML per afegir logotips o estils personalitzats
3. **Publicació**: Penja l'arxiu HTML al servidor web del centre
4. **Enllaç**: Comparteix l'enllaç amb estudiants i famílies

### Cas 4: Migració de Calendaris Externs

**Objectiu**: Incorporar esdeveniments d'altres calendaris a l'aplicació

**Procediment:**
1. **Exportació des de l'origen**: Exporta el calendari extern en format ICS
2. **Crear calendari "Altre"**: Crea un nou calendari de tipus "Altre" al Calendari IOC
3. **Importació**: Utilitza la funcionalitat d'importació ICS
4. **Revisió i ajustos**: Revisa els esdeveniments importats i ajusta categories si cal

## Resolució de Problemes

### Error en Exportació

**Problema**: El fitxer exportat no es descarrega
**Solucions:**
- Verifica que el navegador permet descàrregues automàtiques
- Comprova que hi ha espai suficient al disc dur
- Intenta amb un altre navegador

### Error en Importació ICS

**Problema**: "Format ICS no vàlid"
**Solucions:**
- Verifica que el fitxer té extensió .ics
- Obre el fitxer amb un editor de text per verificar que conté dades ICS vàlides
- Prova d'importar un fitxer ICS més simple primer

**Problema**: "Esdeveniments no ubicats"
**Solucions:**
- Revisa les dates dels esdeveniments no ubicats
- Ajusta el rang de dates del calendari de destí
- Corregeix manualment les dates problemàtiques

### Problemes de Compatibilitat

**Problema**: Els esdeveniments importats no es mostren correctament
**Solucions:**
- Verifica que les categories s'han creat correctament
- Comprova que les dates estan en el format correcte
- Revisa que el calendari de destí és de tipus "Altre"

## Limitacions i Consideracions

### Limitacions Tècniques

- **Importació només a "Altre"**: Per mantenir la integritat dels calendaris institucionals
- **Format ICS únic**: La importació només suporta fitxers ICS/iCalendar
- **Sense recursivitat**: Els esdeveniments recurrents es tractaran com esdeveniments individuals
- **Zones horàries**: Possible pèrdua de precisió en la conversió de zones horàries complexes

### Consideracions de Seguretat

- **Dades sensibles**: Revisa que els calendaris exportats no continguin informació confidencial
- **Compartició responsable**: Només comparteix calendaris amb persones autoritzades
- **Backups segurs**: Emmagatzema les còpies de seguretat en llocs segurs

---
[← Categories i Organització](Categories-i-Organització) | [Replicació entre Calendaris →](Replicació-entre-Calendaris)