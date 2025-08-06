# Calendari IOC - Documentació

Benvingut a la documentació oficial del **Calendari IOC**, una aplicació web per gestionar calendaris acadèmics de l'Institut Obert de Catalunya.

**Versió Actual: 1.1** - Arquitectura "Graph of Objects in Memory" amb ES6 classes

## Visió General

El Calendari IOC és una eina completa per crear, gestionar i organitzar calendaris acadèmics especialitzats per als diferents estudis de l'IOC. Suporta calendaris de Formació Professional (FP), Batxillerat (BTX) i calendaris personalitzats.

### Característiques principals:
- **Múltiples tipus de calendaris**: FP, BTX i personalitzats
- **Gestió d'esdeveniments**: Creació, edició i organització d'esdeveniments
- **Sistema de categories**: Catàleg global de categories reutilitzables
- **Importació/Exportació**: Suport per formats ICS, JSON i HTML
- **Replicació**: Sistema per copiar esdeveniments entre calendaris
- **Mode fosc**: Interfície adaptable al tema preferit
- **Drag & Drop**: Interfície intuitiva per moure esdeveniments

### Novetats v1.1:
- **Arquitectura "Graph of Objects in Memory"**: Models ES6 amb referències directes
- **Eliminació de CategoryService**: Simplificació de la gestió de categories
- **Millor rendiment**: Eliminació de capes de lookup intermèdies
- **Codi més net**: Lògica de negoci encapsulada als models

## Documentació per Usuaris Finals

**Usuaris regulars:**
- [**Guia d'Inici Ràpid**](Guia-d-Inici-Rapid) - Primers passos per usar l'aplicació
- [**Creació de Calendaris**](Creació-de-Calendaris) - Com crear calendaris FP, BTX i Altre
- [**Gestió d'Esdeveniments**](Gestió-d-Esdeveniments) - Crear, editar i moure esdeveniments
- [**Categories i Organització**](Categories-i-Organització) - Sistema de categories i catàleg global
- [**Importació i Exportació**](Importació-i-Exportació) - Formats ICS, JSON i HTML
- [**Replicació entre Calendaris**](Replicació-entre-Calendaris) - Sistema de rèpliques
- [**Personalització i Temes**](Personalització-i-Temes) - Mode fosc i configuració visual

**Administradors i coordinadors:**
- [**Configuració Semestral**](Configuració-Semestral) - Actualitzar dates cada curs acadèmic
- [**Gestió d'Esdeveniments del Sistema**](Gestió-d-Esdeveniments-del-Sistema) - PAF, festius, períodes lectius
- [**Configuració de Categories per Defecte**](Configuració-de-Categories-per-Defecte) - Categories inicials
- [**Manteniment i Actualitzacions**](Manteniment-i-Actualitzacions) - Tasques periòdiques

## Documentació per Desenvolupadors

**Arquitectura del sistema:**
- [**Arquitectura General**](Arquitectura-General) - Visió general del sistema
- [**Patrons Arquitectònics Detallats**](Patrons-Arquitectònics-Detallats) - Manager, Singleton, Factory, etc.
- [**Flux de Dades i Control**](Flux-de-Dades-i-Control) - Com flueixen les dades
- [**Capes del Sistema**](Capes-del-Sistema) - Presentació, Lògica, Dades, Utilitats
- [**Arquitectura d'Estat**](Arquitectura-d-Estat) - AppStateManager i persistència
- [**Arquitectura de Renderitzat**](Arquitectura-de-Renderitzat) - Sistema de vistes
- [**Decisions de Disseny**](Decisions-de-Disseny-i-Justificacions) - Justificacions tècniques
- [**Diagrames d'Arquitectura**](Diagrames-d-Arquitectura) - Diagrames visuals

**Referència de classes:**
- [**Models (v1.1+)**](models-Referència) - CalendariIOC_Calendar, CalendariIOC_Event, CalendariIOC_Category
- [**Managers**](managers-Referència) - CalendarManager, CategoryManager, EventManager, etc.
- [**State**](state-Referència) - AppStateManager, StorageManager
- [**UI**](ui-Referència) - ModalRenderer, PanelsRenderer
- [**Views**](views-Referència) - MonthView, WeekView, DayView, etc.
- [**Helpers**](helpers-Referència) - DateHelper, UIHelper, ThemeHelper, etc.
- [**Services**](Services-Referència) - CategoryService, ReplicaService, etc.
- [**Export**](Export-Referència) - JsonExporter, IcsExporter, HtmlExporter
- [**Import**](Import-Referència) - IcsImporter
- [**Config**](Config-Referència) - SemesterConfig

**Guies de desenvolupament:**
- [**Guia d'Instal·lació per Desenvolupadors**](Guia-d-Instal·lació-Dev) - Setup desenvolupament
- [**Estructura del Codi**](Estructura-del-Codi) - Organització d'arxius
- [**Punts d'Extensió Crítics**](Punts-d-Extensió-Crítics) - Com estendre l'aplicació
- [**Testing i Debugging**](Testing-i-Debugging) - Eines de desenvolupament

## Començar

- **Si ets usuari**: Comença per la [Guia d'Inici Ràpid](Guia-d-Inici-Rapid)
- **Si ets administrador**: Revisa la [Configuració Semestral](Configuració-Semestral)
- **Si ets desenvolupador**: Llegeix l'[Arquitectura General](Arquitectura-General)

Per reportar errors o suggerir millores, utilitza el sistema d'issues del repositori GitHub.