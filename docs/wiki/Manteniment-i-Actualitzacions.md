# Manteniment i Actualitzacions

Aquesta guia proporciona les tasques de manteniment periòdic i els procediments d'actualització necessaris per mantenir el Calendari IOC funcionant correctament i actualitzat.

## Visió General

El manteniment del Calendari IOC inclou tasques periòdiques, actualitzacions de configuració i resolució proactiva de problemes per assegurar el bon funcionament de l'aplicació al llarg del temps.

### Responsabilitats

**Administradors de sistema:**
- Actualitzacions de fitxers de configuració
- Monitoratge de l'estat de l'aplicació
- Gestió de còpies de seguretat

**Coordinadors acadèmics:**
- Verificació de dates i esdeveniments
- Coordinació amb el professorat
- Validació de contingut acadèmic

## Calendari de Manteniment

### Tasques Anuals

#### Preparació de Curs (Juny-Agost)

**Configuració semestral:**
1. Actualitzar dates del nou curs acadèmic
2. Revisar i actualitzar festius oficials
3. Configurar dates PAF i examens
4. Actualitzar esdeveniments del sistema

**Documentació:**
- Revisar i actualitzar guies d'usuari
- Actualitzar procediments interns
- Preparar material de formació

#### Fi de Curs (Juny)

**Arxivatge:**
1. Crear còpies de seguretat dels calendaris del curs finalitzat
2. Exportar dades per a arxivatge
3. Netejar dades obsoletes si cal
4. Documentar incidents i millores

### Tasques Semestrals

#### Inici de Semestre (Setembre i Febrer)

**Verificació:**
1. Comprovar que les dates de configuració són correctes
2. Verificar que els esdeveniments del sistema apareixen
3. Provar la creació de calendaris nous
4. Validar funcionament de categories

**Comunicació:**
- Informar professors de novetats
- Proporcionar suport inicial
- Recollir feedback inicial

#### Fi de Semestre (Gener i Juny)

**Anàlisi:**
1. Revisar estadístiques d'ús
2. Identificar problemes recurrents
3. Recollir feedback del professorat
4. Planificar millores

### Tasques Mensuals

#### Primera Setmana del Mes

**Monitoratge:**
1. Verificar funcionament general de l'aplicació
2. Comprovar que les còpies de seguretat automàtiques funcionen
3. Revisar logs d'errors (si n'hi ha)
4. Verificar disponibilitat de l'aplicació

**Suport:**
- Respondre consultes d'usuaris
- Resoldre incidències reportades
- Actualitzar documentació si cal

#### Tercera Setmana del Mes

**Optimització:**
1. Revisar rendiment de l'aplicació
2. Netejar dades temporals si cal
3. Verificar que el localStorage no està ple
4. Comprovar compatibilitat amb navegadors

## Procediments d'Actualització

### Actualització de Configuració Semestral

#### Pas 1: Preparació

**Abans de fer canvis:**
1. Crear còpia de seguretat dels fitxers actuals
2. Documentar els canvis planificats
3. Coordinat amb altres administradors
4. Planificar moment de mínima interrupció

#### Pas 2: Actualització de Fitxers

**Ordre recomanat:**
1. `common-semestre.json` - Esdeveniments i dates comunes
2. `fp-semestre.json` - Configuració específica FP
3. `btx-semestre.json` - Configuració específica BTX

#### Pas 3: Validació

**Verificacions obligatòries:**
1. Sintaxi JSON correcta
2. Dates dins dels rangs esperats
3. IDs únics per esdeveniments
4. Categories referenciades existeixen

#### Pas 4: Testing

**Proves necessàries:**
1. Crear calendari FP de prova
2. Crear calendari BTX de prova
3. Verificar esdeveniments del sistema
4. Comprovar categories correctes

#### Pas 5: Comunicació

**Avisar a usuaris:**
- Data i hora dels canvis
- Impacte esperat
- Instruccions si cal fer alguna acció
- Contacte per suport

### Actualització de l'Aplicació

#### Canvis Menors (Correccions)

**Procediment simplificat:**
1. Aplicar canvis als fitxers JavaScript/CSS
2. Provar en entorn de desenvolupament
3. Aplicar a producció
4. Verificar funcionament

#### Canvis Majors (Noves Funcionalitats)

**Procediment complet:**
1. **Planificació detallada**
2. **Desenvolupament en entorn aïllat**
3. **Testing exhaustiu**
4. **Documentació actualitzada**
5. **Formació d'usuaris si cal**
6. **Desplegament gradual**
7. **Monitoratge post-desplegament**

## Gestió de Còpies de Seguretat

### Estratègia de Backup

#### Nivells de Backup

**Nivell 1: Aplicació**
- Còpies dels fitxers JavaScript, CSS, HTML
- Fitxers de configuració JSON
- Documentació

**Nivell 2: Dades d'usuari**
- Exports JSON dels calendaris actius
- Configuracions personalitzades
- Dades del localStorage (si és possible)

#### Freqüència

**Aplicació:**
- Abans de cada actualització
- Mensualment com a mínim
- Abans de canvis de configuració importants

**Dades:**
- Setmanalment durant període lectiu
- Diàriament durant períodes crítics (PAF, exàmens)
- Sota demanda quan sigui necessari

### Procediments de Backup

#### Backup Automàtic (Recomanat)

```bash
#!/bin/bash
# Script de backup automàtic
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/calendari-ioc"

# Crear directori de backup
mkdir -p "$BACKUP_DIR/$DATE"

# Copiar fitxers d'aplicació
cp -r /path/to/calendari-ioc/* "$BACKUP_DIR/$DATE/"

# Comprimir
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" "$BACKUP_DIR/$DATE"

# Netejar backup temporal
rm -rf "$BACKUP_DIR/$DATE"

# Mantenir només 30 backups
ls -t "$BACKUP_DIR"/backup_*.tar.gz | tail -n +31 | xargs rm -f
```

#### Backup Manual

**Fitxers a incloure:**
- Tot el directori del projecte
- Fitxers de configuració JSON
- Documentació adicional
- Scripts de manteniment

### Restauració

#### Procediment de Restauració

1. **Identificar el backup apropiat**
2. **Aturar servei si cal**
3. **Restaurar fitxers des del backup**
4. **Verificar integritat**
5. **Reiniciar servei**
6. **Validar funcionament**

## Monitoratge i Alertes

### Indicadors Clau

#### Rendiment
- Temps de càrrega de l'aplicació
- Temps de resposta a accions d'usuari
- Ús de memoria del navegador

#### Disponibilitat
- Accessibilitat de l'aplicació
- Funcionament de funcionalitats crítiques
- Compatibilitat amb navegadors principals

#### Errors
- Errors JavaScript al navegador
- Problemes de càrrega de configuració
- Fallades de localStorage

### Alertes Recomanades

#### Alertes Crítiques
- Aplicació no accessible
- Fitxers de configuració corruptes
- Errors massius de localStorage

#### Alertes d'Avís
- Rendiment degradat
- Problemes de compatibilitat
- Errors esporàdics

## Resolució de Problemes Comuns

### Problemes de Configuració

#### Esdeveniments del Sistema No Apareixen

**Diagnòstic:**
1. Verificar sintaxi JSON
2. Comprovar dates vàlides
3. Verificar categories referenciades

**Solució:**
1. Corregir errors de sintaxi
2. Ajustar dates si cal
3. Crear categories faltants

#### Categories Incorrectes

**Diagnòstic:**
1. Verificar fitxers de configuració
2. Comprovar cache del navegador
3. Verificar ID de categories

**Solució:**
1. Corregir configuració
2. Netejar cache
3. Actualitzar referències

### Problemes de Rendiment

#### Aplicació Lenta

**Possibles causes:**
- Massa dades a localStorage
- Problemes de xarxa
- Navegador obsolet

**Solucions:**
- Netejar dades antigues
- Optimitzar fitxers
- Recomanar actualització navegador

#### localStorage Ple

**Símptomes:**
- Errors en guardar calendaris
- Pèrdua de dades

**Solució:**
- Export i reimport de dades essencials
- Neteja de dades obsoletes
- Educació d'usuaris sobre límits

## Procediments d'Emergència

### Fallada Crítica de l'Aplicació

#### Resposta Immediata
1. **Avaluar l'abast** del problema
2. **Comunicar** als usuaris afectats
3. **Activar** procediment de restauració
4. **Documentar** l'incident

#### Restauració
1. Identificar causa de la fallada
2. Restaurar des del backup més recent
3. Aplicar correccions si cal
4. Verificar funcionament complet

### Pèrdua de Dades

#### Avaluació
1. Determinar abast de la pèrdua
2. Identificar usuaris afectats
3. Avaluar backups disponibles

#### Recuperació
1. Restaurar des de backups
2. Notificar usuaris de la situació
3. Implementar mesures preventives
4. Documentar l'incident

## Millores Contínues

### Recollida de Feedback

#### Fonts de Feedback
- Professors usuaris
- Coordinadors acadèmics
- Personal administratiu
- Estudiants (indirectament)

#### Mètodes de Recollida
- Enquestes periòdiques
- Reunions de seguiment
- Incidències reportades
- Observació d'ús

### Planificació de Millores

#### Criteris de Priorització
1. **Criticitat**: Impacte en funcionalitat essencial
2. **Freqüència**: Problemàtica recurrent
3. **Usuaris afectats**: Nombre d'usuaris impactats
4. **Esforç**: Complexitat de implementació

#### Cicle de Millores
1. **Identificació** de necessitats
2. **Anàlisi** de viabilitat
3. **Planificació** detallada
4. **Implementació** controlada
5. **Avaluació** de resultats

## Documentació de Manteniment

### Registre d'Activitats

**Informació a registrar:**
- Data i hora de l'activitat
- Tipus de manteniment realitzat
- Responsable de l'activitat
- Resultats obtinguts
- Problemes trobats

### Historial de Canvis

**Per cada canvi important:**
- Versió anterior i nova
- Justificació del canvi
- Impacte esperat
- Procediment seguit
- Validació realitzada

### Lliçons Apreses

**Documentar:**
- Problemes identificats
- Solucions aplicades
- Mesures preventives implementades
- Recomanacions per al futur

Aquesta guia de manteniment assegura que el Calendari IOC es mantingui funcional, actualitzat i alineat amb les necessitats de la comunitat educativa de l'IOC.

---
[← Configuració de Categories per Defecte](Configuració-de-Categories-per-Defecte) | [Guia d'Instal·lació Dev →](Guia-d-Instal·lació-Dev)