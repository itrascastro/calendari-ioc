/**
 * =================================================================
 * TEST 23 - REPLICATE CALENDAR
 * =================================================================
 *
 * @file        test-23-replicate-calendar.cy.js
 * @description Test de verificació de la replicació de calendaris.
 * @author      Ismael Trascastro <itrascastro@ioc.cat>
 * @version     1.0.0
 * @date        2025-08-06
 * @project     Calendari Mòdul IOC
 * @repository  https://github.com/itrascastro/ioc-modul-calendari
 * @license     MIT
 *
 * Aquest test verifica el flux complet de replicació entre dos calendaris
 * del mateix tipus (FP -> FP), assegurant que el contingut d'usuari
 * (categories i esdeveniments) es copia correctament.
 *
 * =================================================================
 */
describe('IOC CALENDARI - TEST 23 REPLICATE CALENDAR', () => {

    let origenCal, destiCal;

    beforeEach(() => {
        cy.clearLocalStorage();
        // Carregar les dades de test abans de cada prova
        cy.readFile('dev-resources/test23/calendario-origen-fp-s1.json').then(data => {
            origenCal = data;
        });
        cy.readFile('dev-resources/test23/calendario-destino-fp-s1.json').then(data => {
            destiCal = data;
        });
        cy.visit('/');
        cy.contains('Calendari IOC').should('be.visible');
        cy.wait(1000);
    });

    it('23.1 Replica correctament el contingut d\'usuari d\'un calendari FP a un altre', () => {
        // === ARRANGE ===
        cy.log('🏗️ ARRANGE: Carregant calendaris d\'origen i destí');

        // Carregar ambdós calendaris a l\'estat de l\'aplicació
        cy.window().then(win => {
            win.app.calendarManager.loadCalendarFile(destiCal);
            win.app.calendarManager.loadCalendarFile(origenCal);
        });

        // Verificar que els dos calendaris s\'han carregat a la UI
        cy.get('.calendar-list-item').should('have.length', 2);
        cy.contains('.calendar-list-item', origenCal.name).should('be.visible');
        cy.contains('.calendar-list-item', destiCal.name).should('be.visible');

        // Assegurar que el calendari de destí és l\'actiu
        cy.contains('.calendar-list-item', destiCal.name)
            .find('[data-action="switch-calendar"]')
            .click();
        cy.contains('.calendar-list-item.active', destiCal.name).should('be.visible');
        cy.wait(500);

        // === ACT ===
        cy.log('🎬 ACT: Executant la replicació');

        // 1. Obrir el modal d\'accions del calendari de destí
        cy.contains('.calendar-list-item', destiCal.name)
            .find('[data-action="open-calendar-actions-modal"]')
            .click({ force: true });
        cy.get('#calendarActionsModal').should('have.class', 'show');

        // 2. Fer clic a "Replicar"
        cy.get('[data-action="replicate-calendar"]').click();
        cy.get('#replicationModal').should('be.visible');

        // 3. Seleccionar el calendari d\'origen al desplegable
        cy.get('#targetCalendarSelect').select(origenCal.id);

        // 4. Executar la replicació
        cy.get('[data-action="execute-replication"]').click();
        cy.wait(1000); // Esperar que es processi la replicació

        // === ASSERT ===
        cy.log('🧐 ASSERT: Verificant que el contingut s\'ha replicat correctament');

        // 1. Verificar que no hi ha esdeveniments no ubicats
        cy.get('.unplaced-events-panel').should('not.exist');
        cy.log('✅ No hi ha conflictes (esdeveniments no ubicats).');

        // 2. Verificar el localStorage
        cy.window().then(win => {
            const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
            const replicatedCal = data.calendars[destiCal.id];

            // Extreure només les categories i esdeveniments d\'usuari de l\'origen
            const origenUserCategories = origenCal.categories.filter(c => !c.isSystem);
            const origenUserEvents = origenCal.events.filter(e => !e.isSystemEvent);

            // Extreure el mateix del calendari replicat
            const replicatedUserCategories = replicatedCal.categories.filter(c => !c.isSystem);
            const replicatedUserEvents = replicatedCal.events.filter(e => !e.isSystemEvent);

            cy.log(`Categories d\'usuari esperades: ${origenUserCategories.length}, Replicades: ${replicatedUserCategories.length}`);
            cy.log(`Esdeveniments d\'usuari esperats: ${origenUserEvents.length}, Replicats: ${replicatedUserEvents.length}`);

            // Verificació de recompte
            expect(replicatedUserCategories.length).to.equal(origenUserCategories.length);
            expect(replicatedUserEvents.length).to.equal(origenUserEvents.length);

            // Verificació de contingut (comparant noms i títols, ja que els IDs canvien)
            const origenCategoryNames = origenUserCategories.map(c => c.name).sort();
            const replicatedCategoryNames = replicatedUserCategories.map(c => c.name).sort();
            expect(replicatedCategoryNames).to.deep.equal(origenCategoryNames);

            const origenEventTitles = origenUserEvents.map(e => e.title).sort();
            const replicatedEventTitles = replicatedUserEvents.map(e => e.title).sort();
            expect(replicatedEventTitles).to.deep.equal(origenEventTitles);

            cy.log('✅ Les categories i esdeveniments d\'usuari s\'han replicat correctament al localStorage.');
        });
    });
});