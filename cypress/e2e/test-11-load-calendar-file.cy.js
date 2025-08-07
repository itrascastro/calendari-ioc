/**
 * =================================================================
 * TEST 11 - LOAD CALENDAR FILE
 * =================================================================
 *
 * @file        test-11-load-calendar-file.cy.js
 * @description Test de verificació de la càrrega de fitxers de calendaris
 * @author      Ismael Trascastro <itrascastro@ioc.cat>
 * @version     1.0.0
 * @date        2025-08-07
 * @project     Calendari Mòdul IOC
 * @repository  https://github.com/itrascastro/ioc-modul-calendari
 * @license     MIT
 *
 * Aquest test verifica la funcionalitat de càrrega de calendaris:
 * - Generació de calendaris de test utilitzant els models CalendariIOC
 * - Conversió a format JSON per simulació de fitxer
 * - Càrrega correcta del calendari a l'aplicació
 * - Verificació de la UI actualitzada amb el calendari carregat
 * - Validació del localStorage amb les dades correctes
 *
 * =================================================================
 */

describe('IOC CALENDARI - TEST 11 LOAD CALENDAR FILE', () => {

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
    cy.contains('Calendari IOC').should('be.visible');
    cy.wait(1000);
  });

  it('11. load-calendar-file - Verificació completa amb dades de models', () => {
    let testCalendarInstance;
    let calendarJSON;

    // === ARRANGE ===
    cy.log('🏗️ FASE 1: Generant calendari de test usant els models...');
    cy.window().then((win) => {
      const { CalendariIOC_Calendar, CalendariIOC_Category, CalendariIOC_Event } = win.app;
      const calendarId = `TEST_CALENDAR_MODELS_${Date.now()}`;

      // 1. Crear instància del calendari
      testCalendarInstance = new CalendariIOC_Calendar({
        id: calendarId,
        name: "Test Calendar from Models",
        type: "Altre",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      });

      // 2. Crear instàncies de categories
      const cat1 = new CalendariIOC_Category({ id: `${calendarId}_C1`, name: "Planificació Models", color: "#8e44ad" });
      const cat2 = new CalendariIOC_Category({ id: `${calendarId}_C2`, name: "Desenvolupament Models", color: "#27ae60" });

      // 3. Afegir categories al calendari
      testCalendarInstance.addCategory(cat1);
      testCalendarInstance.addCategory(cat2);
      testCalendarInstance.lastCategoryId = 2;

      // 4. Crear instàncies d'esdeveniments (amb referència a la categoria)
      const event1 = new CalendariIOC_Event({ id: `${calendarId}_E1`, title: "Event Model 1", date: "2025-01-15", category: cat1 });
      const event2 = new CalendariIOC_Event({ id: `${calendarId}_E2`, title: "Event Model 2", date: "2025-01-20", category: cat2 });
      const event3 = new CalendariIOC_Event({ id: `${calendarId}_E3`, title: "Event Model 3", date: "2025-02-01", category: cat1 });

      // 5. Afegir esdeveniments al calendari
      testCalendarInstance.addEvent(event1);
      testCalendarInstance.addEvent(event2);
      testCalendarInstance.addEvent(event3);
      testCalendarInstance.lastEventId = 3;

      // 6. Convertir a JSON per a la càrrega
      calendarJSON = testCalendarInstance.toJSON();
      cy.log(`Calendari de test generat: "${testCalendarInstance.name}"`);
    });

    // === ACT ===
    cy.log('🎯 FASE 2: Executant la lògica de càrrega directament amb el JSON generat...');
    cy.window().then((win) => {
      win.app.calendarManager.loadCalendarFile(calendarJSON);
    });

    // === ASSERT ===
    cy.log('🔍 FASE 3: Verificant resultats a la UI i al localStorage...');

    // 1. Esperar el missatge d'èxit
    cy.get('.message-success').should('contain.text', `Calendari "Test Calendar from Models" carregat correctament`);

    // 2. Verificació a la UI
    cy.log('    - Verificant UI: El nom del calendari ha d\'aparèixer a la llista');
    cy.get('.calendar-list-item').should('be.visible').and('contain.text', 'Test Calendar from Models');
    cy.get('.calendar-list-item.active').should('contain.text', 'Test Calendar from Models');
    cy.log('    ✅ UI verificada correctament.');

    // 3. Verificació al localStorage
    cy.log('    - Verificant localStorage: El calendari carregat ha de ser idèntic al JSON original');
    cy.window().then((win) => {
      const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
      const loadedCalendarId = Object.keys(data.calendars).find(id => id.includes('TEST_CALENDAR_MODELS'));
      const loadedCalendar = data.calendars[loadedCalendarId];

      expect(loadedCalendar).to.exist;
      // Comprovem contra el JSON, que és el que es desa
      expect(loadedCalendar).to.deep.equal(calendarJSON);
      expect(data.currentCalendarId).to.equal(loadedCalendarId);
      cy.log('    ✅ localStorage verificat correctament.');
    });

    cy.log('🎉 TEST COMPLETAT EXITOSAMENT');
  });
});
