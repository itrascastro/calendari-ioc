/**
 * =================================================================
 * TEST 18 - DELETE CALENDAR
 * =================================================================
 *
 * @file        test-18-delete-calendar.cy.js
 * @description Test de verificació de l`eliminació de calendaris.
 * @author      Ismael Trascastro <itrascastro@ioc.cat>
 * @version     1.0.0
 * @date        2025-08-06
 * @project     Calendari Mòdul IOC
 * @repository  https://github.com/itrascastro/ioc-modul-calendari
 * @license     MIT
 *
 * Aquest test verifica exhaustivament la funcionalitat d'eliminar un calendari:
 * 1.  Eliminació correcta d'un calendari amb confirmació.
 *     - Verifica que el modal de confirmació apareix.
 *     - Verifica que el calendari s'elimina de la UI i del localStorage.
 *     - Verifica que el currentCalendarId s'actualitza correctament.
 * 2.  Cancel·lació de l'eliminació des del modal.
 *     - Verifica que si l'usuari cancel·la, no es produeix cap canvi.
 *
 * =================================================================
 */
describe('IOC CALENDARI - TEST 18 DELETE CALENDAR', () => {

    beforeEach(() => {
        cy.clearLocalStorage();
        cy.visit('/');
        cy.contains('Calendari IOC').should('be.visible');
        cy.wait(1000);
    });

    /**
     * Cas de prova 1: Eliminació correcta d'un calendari amb confirmació.
     */
    it('18.1 Elimina correctament un calendari després de la confirmació', () => {
        // === ARRANGE ===
        cy.log('🏗️ ARRANGE: Creant dos calendaris');

        // Calendari a eliminar
        const calendarToDeleteName = 'Calendari a Eliminar';
        cy.get('[data-action="new-calendar"]').click();
        cy.get('#studyType').select('Altre');
        cy.get('#calendarName').type(calendarToDeleteName);
        cy.get('#startDate').type('2025-01-01');
        cy.get('#endDate').type('2025-12-31');
        cy.get('[data-action="add-calendar"]').click();
        cy.wait(500);

        // Calendari a conservar
        const calendarToKeepName = 'Calendari a Conservar';
        cy.get('[data-action="new-calendar"]').click();
        cy.get('#studyType').select('Altre');
        cy.get('#calendarName').type(calendarToKeepName);
        cy.get('#startDate').type('2025-01-01');
        cy.get('#endDate').type('2025-12-31');
        cy.get('[data-action="add-calendar"]').click();
        cy.wait(500);

        // Verificar que tots dos calendaris existeixen
        cy.get('.calendar-list-item').should('have.length', 2);
        cy.contains('.calendar-list-item', calendarToDeleteName).should('be.visible');
        cy.contains('.calendar-list-item', calendarToKeepName).should('be.visible');

        let calendarToDeleteId;
        let calendarToKeepId;

        cy.window().then(win => {
            const calendars = Object.values(win.app.appStateManager.calendars);
            calendarToDeleteId = calendars.find(c => c.name === calendarToDeleteName).id;
            calendarToKeepId = calendars.find(c => c.name === calendarToKeepName).id;
            cy.log(`IDs -> A eliminar: ${calendarToDeleteId}, A conservar: ${calendarToKeepId}`);
        });

        // === ACT ===
        cy.log('🎬 ACT: Obrint modals i confirmant eliminació');

        // 1. Obrir el modal d'accions del calendari a eliminar
        cy.contains('.calendar-list-item', calendarToDeleteName)
            .find('[data-action="open-calendar-actions-modal"]').click({ force: true });
        cy.get('#calendarActionsModal').should('have.class', 'show');

        // 2. Fer clic al botó d'eliminar
        cy.get('#calendarActionsModal [data-action="delete-calendar"]').click();

        // 3. Verificar que el modal de confirmació apareix
        cy.get('#confirmModal').should('be.visible');
        cy.get('#confirmModal .modal-body').should('contain.text', calendarToDeleteName);

        // 4. Confirmar l'eliminació
        cy.get('#confirmModal .btn-danger').click();
        cy.wait(500);

        // === ASSERT ===
        cy.log('🧐 ASSERT: Verificant que el calendari ha estat eliminat');

        // 1. Verificar UI
        cy.contains('.calendar-list-item', calendarToDeleteName).should('not.exist');
        cy.contains('.calendar-list-item', calendarToKeepName).should('be.visible');
        cy.get('.calendar-list-item').should('have.length', 1);
        cy.log('✅ UI verificada: Calendari eliminat i l`altre conservat.');

        // 2. Verificar localStorage
        cy.window().then((win) => {
            const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
            
            // El calendari eliminat no ha d'existir
            expect(data.calendars[calendarToDeleteId]).to.be.undefined;

            // El calendari conservat ha d'existir
            expect(data.calendars[calendarToKeepId]).to.exist;

            // El currentCalendarId ha de ser el del calendari conservat
            expect(data.currentCalendarId).to.equal(calendarToKeepId);

            cy.log('✅ localStorage verificat: Calendari eliminat i currentCalendarId actualitzat.');
        });
    });

    /**
     * Cas de prova 2: Cancel·lar l'eliminació des del modal.
     */
    it('18.2 Permet cancel·lar l`eliminació des del modal', () => {
        // === ARRANGE ===
        cy.log('🏗️ ARRANGE: Creant calendari i guardant estat inicial');
        
        const calendarName = 'Calendari Intacte';
        cy.get('[data-action="new-calendar"]').click();
        cy.get('#studyType').select('Altre');
        cy.get('#calendarName').type(calendarName);
        cy.get('#startDate').type('2025-01-01');
        cy.get('#endDate').type('2025-12-31');
        cy.get('[data-action="add-calendar"]').click();
        cy.wait(500);

        let initialState;
        cy.window().then((win) => {
            initialState = win.localStorage.getItem('calendari-ioc-data');
            cy.log('📝 Estat inicial del localStorage guardat.');
        });

        // === ACT ===
        cy.log('🎬 ACT: Fent clic a eliminar i cancel·lant');

        // 1. Obrir modal d'accions
        cy.contains('.calendar-list-item', calendarName)
            .find('[data-action="open-calendar-actions-modal"]').click({ force: true });

        // 2. Clic al botó d'eliminar
        cy.get('#calendarActionsModal [data-action="delete-calendar"]').click();

        // 3. Verificar que el modal de confirmació apareix
        cy.get('#confirmModal').should('be.visible');

        // 4. Clic al botó de cancel·lar
        cy.get('#confirmModal .btn-secondary').click();
        cy.wait(500);

        // === ASSERT ===
        cy.log('🧐 ASSERT: Verificant que no hi ha hagut canvis');

        // 1. Verificar UI
        cy.contains('.calendar-list-item', calendarName).should('be.visible');
        cy.get('.calendar-list-item').should('have.length', 1);
        cy.log('✅ UI verificada: El calendari encara és visible.');

        // 2. Verificar localStorage
        cy.window().then((win) => {
            const currentState = win.localStorage.getItem('calendari-ioc-data');
            expect(currentState).to.equal(initialState);
            cy.log('✅ localStorage verificat: L`estat no ha canviat.');
        });
    });
});
