/**
 * TEST 11: Carregar Calendari des de Fitxer JSON
 *
 * Aquest test verifica la funcionalitat de carregar un calendari des d'un fitxer JSON.
 * Gràcies a la refactorització de `loadCalendarFile` per acceptar un objecte JSON
 * directament, el test pot injectar les dades i provar la lògica de negoci de forma
 * fiable.
 *
 * Estratègia Final i Correcta:
 * 1.  **Arrange**: Es llegeix un fitxer de calendari de referència (`altre-basic.json`).
 * 2.  **Act**: Es crida directament a `win.app.calendarManager.loadCalendarFile()`,
 *     passant-li les dades del fitxer llegit. Això executa tota la lògica de
 *     validació i processament de l'aplicació.
 * 3.  **Assert**: S'espera el missatge d'èxit i es verifica que
 *     la UI i el `localStorage` reflecteixen la càrrega correcta del calendari.
 */
describe('IOC CALENDARI - TEST 11 LOAD CALENDAR FILE', () => {
  const filePath = 'dev-resources/test-calendars/altre-basic.json';

  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.clear();
        cy.spy(win.console, 'log').as('consoleLog');
      },
    });
    cy.get('@consoleLog').should('be.calledWithMatch', /Aplicació inicialitzada/);
  });

  it('11. load-calendar-file - Verificació completa', () => {
    // === ARRANGE ===
    cy.log('🏗️ FASE 1: Preparant test i llegint fitxer de referència...');
    cy.readFile(filePath).then((originalJson) => {
      cy.log(`Ficher de referència "${filePath}" llegit correctament.`);

      // === ACT ===
      cy.log('🎯 FASE 2: Executant la lògica de càrrega directament amb el JSON...');

      cy.window().then((win) => {
        // Cridar a la funció de negoci, ara accessible i testeable
        win.app.calendarManager.loadCalendarFile(originalJson);
      });

      // === ASSERT ===
      cy.log('🔍 FASE 3: Verificant resultats a la UI i al localStorage...');

      // 1. Esperar el missatge d'èxit com a senyal de finalització
      cy.get('.message-success').should('contain.text', `Calendari "${originalJson.name}" carregat correctament`);

      // 2. Verificació a la UI
      cy.log('    - Verificant UI: El nom del calendari ha d\'aparèixer a la llista');
      cy.get('.calendar-list-item').should('be.visible');
      cy.get('.calendar-list-item').should('contain.text', originalJson.name);
      cy.get('.calendar-list-item.active').should('contain.text', originalJson.name);
      cy.log('    ✅ UI verificada correctament.');

      // 3. Verificació al localStorage (només lectura)
      cy.log('    - Verificant localStorage: El calendari carregat ha de ser idèntic a l\'original');
      cy.window().then((win) => {
        const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
        const loadedCalendar = data.calendars[originalJson.id];

        expect(loadedCalendar).to.exist;
        expect(loadedCalendar).to.deep.equal(originalJson);
        expect(data.currentCalendarId).to.equal(originalJson.id);
        cy.log('    ✅ localStorage verificat correctament.');
      });

      cy.log('🎉 TEST COMPLETAT EXITOSAMENT');
    });
  });
});