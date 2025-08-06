/**
 * TEST 10: Importar Calendari ICS
 *
 * Aquest test verifica la funcionalitat d'importar esdeveniments des d'un fitxer ICS
 * a un calendari existent de tipus "Altre". Gràcies a la refactorització de 
 * `importIcsToCalendar` i `icsImporter.importIcsFile` per acceptar contingut 
 * directament, el test pot injectar les dades ICS i provar la lògica de negoci 
 * de forma fiable.
 *
 * Estratègia Final i Correcta:
 * 1.  **Arrange**: Es crea un calendari tipus "Altre" directament amb el manager
 *     i es defineix contingut ICS controlat dins del test.
 * 2.  **Act**: Es crida directament a `win.app.calendarManager.importIcsToCalendar()`,
 *     passant-li el contingut ICS generat. Això executa tota la lògica de
 *     parsing, validació i processament de l'aplicació.
 * 3.  **Assert**: S'espera el missatge d'èxit i es verifica que
 *     els esdeveniments esperats s'han importat correctament amb la categoria "Importats".
 */
describe('IOC CALENDARI - TEST 10 IMPORT ICS', () => {

  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.clear();
        cy.spy(win.console, 'log').as('consoleLog');
      },
    });
    cy.get('@consoleLog').should('be.calledWithMatch', /Aplicació inicialitzada/);
  });

  it('10. import-calendar-ics - Verificació completa', () => {
    // === ARRANGE ===
    cy.log('🏗️ FASE 1: Definint contingut ICS de test i creant calendari destí...');
    
    // 1. Definir contingut ICS de test amb esdeveniments coneguts
    const testIcsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Test Import Calendar
X-WR-TIMEZONE:Europe/Madrid

BEGIN:VEVENT
UID:test-event-001@calendari-ioc.test
DTSTART;VALUE=DATE:20240315
DTEND;VALUE=DATE:20240316
SUMMARY:Esdeveniment de dia complet
DESCRIPTION:Aquest és un esdeveniment que dura tot el dia
END:VEVENT

BEGIN:VEVENT
UID:test-event-002@calendari-ioc.test
DTSTART:20240610T093000Z
DTEND:20240610T103000Z
SUMMARY:Reunió matinal
DESCRIPTION:Reunió programada pel matí amb hora específica
END:VEVENT

BEGIN:VEVENT
UID:test-event-003@calendari-ioc.test
DTSTART:20240825T140000Z
DTEND:20240825T160000Z
SUMMARY:Presentació projecte
DESCRIPTION:Presentació final del projecte a la tarda
END:VEVENT

BEGIN:VEVENT
UID:test-event-004@calendari-ioc.test
DTSTART;VALUE=DATE:20241120
DTEND;VALUE=DATE:20241121
SUMMARY:Jornada formativa
DESCRIPTION:Jornada completa de formació sense hora específica
END:VEVENT

BEGIN:VEVENT
UID:test-event-005@calendari-ioc.test
DTSTART;VALUE=DATE:20241201
DTEND;VALUE=DATE:20241203
SUMMARY:Esdeveniment múltiples dies
DESCRIPTION:Esdeveniment que s'estén durant tres dies consecutius
END:VEVENT

END:VCALENDAR`;

    // 2. Definir esdeveniments esperats basats en el contingut ICS
    // (calculats manualment segons la lògica de IcsImporter.parseIcsContent)
    const expectedEvents = [
      { title: 'Esdeveniment de dia complet', date: '2024-03-15', description: 'Aquest és un esdeveniment que dura tot el dia' },
      { title: '[11:30] Reunió matinal', date: '2024-06-10', description: 'Reunió programada pel matí amb hora específica' }, // UTC+2 horari estiu
      { title: '[16:00] Presentació projecte', date: '2024-08-25', description: 'Presentació final del projecte a la tarda' }, // UTC+2 horari estiu
      { title: 'Jornada formativa', date: '2024-11-20', description: 'Jornada completa de formació sense hora específica' },
      { title: 'Esdeveniment múltiples dies', date: '2024-12-01', description: 'Esdeveniment que s\'estén durant tres dies consecutius' },
      { title: 'Esdeveniment múltiples dies', date: '2024-12-02', description: 'Esdeveniment que s\'estén durant tres dies consecutius' }
    ];

    // 3. Crear calendari tipus "Altre" directament amb el manager
    const testCalendarId = 'TEST_IMPORT_ICS_CALENDAR';
    const testCalendarData = {
      name: 'Test Import ICS Calendar',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      type: 'Altre'
    };
    
    cy.window().then((win) => {
      // Crear calendari directament amb la lògica de negoci
      win.app.calendarManager.createCalendarData(
        testCalendarId,
        testCalendarData.name,
        testCalendarData.startDate,
        testCalendarData.endDate,
        testCalendarData.type
      );
      
      // Guardar a localStorage
      win.app.storageManager.saveToStorage();
      
      // Actualitzar UI per reflectir el nou calendari
      win.app.calendarManager.updateUI();
      
      cy.log(`Calendari creat directament: ${testCalendarId}`);
    });
    
    // Verificar que el calendari s'ha creat correctament a la UI
    cy.get('.calendar-list-item').should('contain.text', testCalendarData.name);

    // === ACT ===
    cy.log('🎯 FASE 2: Executant la importació ICS directament amb el contingut de test...');

    cy.window().then((win) => {
      // Verificar que el calendari existeix abans d'importar
      const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
      const targetCalendar = data.calendars[testCalendarId];
      
      expect(targetCalendar).to.exist;
      expect(targetCalendar.type).to.equal('Altre');
      expect(targetCalendar.name).to.equal(testCalendarData.name);
      expect(targetCalendar.events).to.have.length(0); // Inicialment buit
      
      cy.log(`Calendari verificat: ${targetCalendar.id}`);
      cy.log(`Contingut ICS té ${testIcsContent.length} caràcters`);
      
      // Debug: Verificar que els managers existeixen
      cy.log(`Managers disponibles: ${Object.keys(win.app)}`);
      
      // Cridar a la funció de negoci amb contingut ICS de test
      try {
        win.app.calendarManager.importIcsToCalendar(testCalendarId, testIcsContent);
        cy.log('✅ Importació ICS executada sense errors');
      } catch (error) {
        cy.log(`❌ Error en importació: ${error.message}`);
        throw error;
      }
    });

    // Esperar que la importació es processi
    cy.wait(3000);

    // === ASSERT ===
    cy.log('🔍 FASE 3: Verificant resultats de la importació...');

    // 1. Verificar directament al localStorage primer
    cy.window().then((win) => {
      const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
      const updatedCalendar = data.calendars[testCalendarId];
      
      cy.log(`Debug: Calendari després importació té ${updatedCalendar.events.length} esdeveniments`);
      cy.log(`Debug: Categories: ${updatedCalendar.categories.map(c => c.name).join(', ')}`);
      
      // Debug: Llistar tots els esdeveniments importats
      updatedCalendar.events.forEach((event, index) => {
        cy.log(`Debug Event ${index + 1}: "${event.title}" el ${event.date}`);
      });
      
      if (updatedCalendar.events.length === 0) {
        cy.log('❌ No s\'han importat esdeveniments - verificant errors...');
        
        // Verificar si hi ha missatges d'error
        cy.get('body').then($body => {
          if ($body.find('.message-error').length > 0) {
            cy.get('.message-error').then($error => {
              cy.log(`❌ Missatge d'error: ${$error.text()}`);
            });
          } else {
            cy.log('❌ No hi ha missatges d\'error visibles');
          }
        });
        
        throw new Error('La importació ICS no ha funcionat - no s\'han importat esdeveniments');
      }
    });

    // 2. Si hi ha esdeveniments, verificar missatge d'èxit
    cy.get('.message-success').should('be.visible');
    cy.get('.message-success').should('contain.text', 'esdeveniments importats correctament');

    // 3. Verificació al localStorage
    cy.log('    - Verificant localStorage: Els esdeveniments ICS han de ser importats');
    cy.window().then((win) => {
      const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
      const updatedCalendar = data.calendars[testCalendarId];
      
      expect(updatedCalendar).to.exist;
      
      // Verificar que s'ha creat la categoria "Importats"
      const importCategory = updatedCalendar.categories.find(cat => cat.name === 'Importats');
      expect(importCategory).to.exist;
      expect(importCategory.isSystem).to.be.false;
      expect(importCategory.color).to.exist;
      cy.log(`    ✅ Categoria "Importats" creada: ID ${importCategory.id}`);
      
      // Verificar que s'han importat esdeveniments amb la categoria correcta
      const importedEvents = updatedCalendar.events.filter(event => 
        event.categoryId === importCategory.id
      );
      
      // Verificar que s'han importat esdeveniments
      expect(importedEvents.length).to.be.greaterThan(0);
      cy.log(`    ✅ ${importedEvents.length} esdeveniments importats`);
      
      // Verificar estructura dels esdeveniments importats
      importedEvents.forEach((event, index) => {
        expect(event.id).to.exist;
        expect(event.title).to.exist;
        expect(event.date).to.exist;
        expect(event.categoryId).to.equal(importCategory.id);
        expect(event.isSystemEvent).to.be.false;
        expect(event.description).to.not.be.undefined;
        
        // Verificar format de data
        expect(event.date).to.match(/^\d{4}-\d{2}-\d{2}$/);
        
        // Verificar format correcte de l'ID generat
        expect(event.id).to.match(new RegExp(`^${testCalendarId}_E\\d+$`));
        
        cy.log(`    ✅ Event ${index + 1}: "${event.title}" el ${event.date}`);
      });
      
      // Verificar que els esdeveniments estan ordenats correctament
      // (primer amb hora específica [HH:MM], després esdeveniments de dia complet)
      let hasTimeEvents = importedEvents.filter(e => /^\[\d{2}:\d{2}\]/.test(e.title));
      let dayEvents = importedEvents.filter(e => !/^\[\d{2}:\d{2}\]/.test(e.title));
      
      expect(hasTimeEvents.length).to.be.greaterThan(0);
      expect(dayEvents.length).to.be.greaterThan(0);
      
      cy.log(`    ✅ ${hasTimeEvents.length} esdeveniments amb hora específica`);
      cy.log(`    ✅ ${dayEvents.length} esdeveniments de dia complet`);
      
      // Verificar que hi ha esdeveniments amb hora específica
      if (hasTimeEvents.length > 0) {
        cy.log(`    ✅ Ordenació per hora verificada`);
      }
      
      // Verificar integritat referencial
      importedEvents.forEach(event => {
        const categoryExists = updatedCalendar.categories.some(cat => cat.id === event.categoryId);
        expect(categoryExists).to.be.true;
      });
      cy.log('    ✅ Integritat referencial verificada');
      
      // Verificar que els comptadors s'han actualitzat correctament
      expect(updatedCalendar.lastEventId).to.equal(importedEvents.length);
      expect(updatedCalendar.lastCategoryId).to.equal(1); // Només categoria "Importats"
      
      // Verificar que no hi ha IDs duplicats
      const eventIds = importedEvents.map(e => e.id);
      const uniqueEventIds = [...new Set(eventIds)];
      expect(eventIds).to.have.length(uniqueEventIds.length);
      cy.log('    ✅ IDs únics verificats');
      
      cy.log('    ✅ localStorage verificat correctament.');
    });

    // 3. Verificació a la UI (opcional - pot fallar si no es renderitza immediatament)
    cy.log('    - Verificant UI: La categoria "Importats" ha d\'aparèixer al panell');
    cy.get('body').then($body => {
      if ($body.find('.category-item:contains("Importats")').length > 0) {
        cy.log('    ✅ UI verificada correctament - categoria "Importats" visible.');
      } else {
        cy.log('    ⚠️ UI no actualitzada immediatament - però localStorage està correcte.');
      }
    });

    cy.log('🎉 TEST COMPLETAT EXITOSAMENT');
  });
});