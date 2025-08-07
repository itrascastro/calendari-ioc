/**
 * =================================================================
 * TEST 13 - DELETE CATEGORY
 * =================================================================
 *
 * @file        test-13-delete-category.cy.js
 * @description Test de verificació de l`eliminació de categories.
 * @author      Ismael Trascastro <itrascastro@ioc.cat>
 * @version     1.0.0
 * @date        2025-08-03
 * @project     Calendari Mòdul IOC
 * @repository  https://github.com/itrascastro/ioc-modul-calendari
 * @license     MIT
 *
 * Aquest test verifica exhaustivament la funcionalitat d`eliminar categories:
 * 1.  Eliminació correcta d`una categoria personalitzada que té esdeveniments associats.
 *     - Verifica que el modal d`advertència apareix.
 *     - Verifica que la categoria i els seus esdeveniments s`eliminen de la UI i del localStorage.
 * 2.  Impossibilitat d`eliminar una categoria de sistema.
 *     - Verifica que les categories de sistema no tenen el botó d`eliminar.
 * 3.  Cancel·lació de l`eliminació des del modal.
 *     - Verifica que si l`usuari cancel·la, no es produeix cap canvi a la UI ni al localStorage.
 *
 * =================================================================
 */
describe('IOC CALENDARI - TEST 13 DELETE CATEGORY', () => {

    beforeEach(() => {
        cy.clearLocalStorage();
        cy.visit('/');
        cy.contains('Calendari IOC').should('be.visible');
        cy.wait(1000); // Espera per a la inicialització de l`app
    });

    /**
     * Cas de prova 1: Eliminació correcta d`una categoria amb esdeveniments associats.
     */
    it('13.1 Elimina correctament una categoria i els seus esdeveniments associats', () => {
        // === ARRANGE ===
        cy.log('🏗️ ARRANGE: Creant calendari, categoria i esdeveniment');

        // 1. Crear un calendari
        cy.get('[data-action="new-calendar"]').click();
        cy.get('#studyType').select('Altre');
        cy.get('#calendarName').type('Test Eliminar Categoria');
        cy.get('#startDate').type('2025-01-01');
        cy.get('#endDate').type('2025-12-31');
        cy.get('[data-action="add-calendar"]').click();
        cy.wait(500);

        // 2. Afegir una categoria personalitzada
        const categoryName = 'Categoria a Esborrar';
        cy.get('#new-category-name').type(categoryName);
        cy.get('[data-action="add-category"]').click();
        cy.wait(500);
        cy.contains('.category-list-item', categoryName).should('be.visible');

        let categoryId;
        let eventId;

        // Guardar el ID de la categoria
        cy.window().then((win) => {
            const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
            const cat = data.categoryTemplates.find(c => c.name === categoryName);
            expect(cat).to.exist;
            categoryId = cat.id;
        });

        // 3. Afegir un esdeveniment directament a l'estat usant els models correctes
        cy.window().then((win) => {
            const { appStateManager, storageManager, viewManager, idHelper, CalendariIOC_Event } = win.app;
            const calendar = appStateManager.getCurrentCalendar();
            
            // Trobar la INSTÀNCIA de la categoria, no només el seu ID
            const categoryInstance = calendar.categories.find(c => c.id === categoryId);
            expect(categoryInstance).to.exist;

            eventId = idHelper.generateNextEventId(calendar.id);

            // Crear una INSTÀNCIA de CalendariIOC_Event
            const newEvent = new CalendariIOC_Event({
                id: eventId,
                title: 'Esdeveniment de Prova',
                date: '2025-01-15',
                category: categoryInstance, // Passar la instància completa
                description: 'Creat per test',
                isSystemEvent: false
            });

            // Utilitzar el mètode públic per afegir l'esdeveniment
            calendar.addEvent(newEvent);
            
            storageManager.saveToStorage();
            viewManager.renderCurrentView();
            cy.log(`IDs guardats -> Categoria: ${categoryId}, Esdeveniment: ${eventId}`);
        });

        cy.contains('.event', 'Esdeveniment de Prova').should('be.visible');

        // === ACT ===
        cy.log('🎬 ACT: Fent clic a eliminar i confirmant');

        // 1. Trobar la categoria i fer clic al botó d`eliminar
        cy.contains('.category-list-item', categoryName)
            .find('[data-action="delete-category"]').click();

        // 2. Verificar el modal de confirmació i el missatge d`advertència
        cy.get('#confirmModal').should('be.visible');
        // 2. Verificar que el modal de confirmació apareix
        cy.get('#confirmModal').should('be.visible');
        // Opcional: verificar que conté el nom de la categoria per seguretat
        cy.get('#confirmModal .modal-body').should('contain.text', categoryName);

        // 3. Confirmar l`eliminació
        cy.get('#confirmModal .btn-danger').click();
        cy.wait(500);

        // === ASSERT ===
        cy.log('🧐 ASSERT: Verificant que la categoria i l`esdeveniment han estat eliminats');

        // 1. Verificar UI
        cy.contains('.category-list-item', categoryName).should('not.exist');
        cy.contains('.event', 'Esdeveniment de Prova').should('not.exist');
        cy.log('✅ UI verificada: Categoria i esdeveniment no són visibles.');

        // 2. Verificar localStorage
        cy.window().then((win) => {
            const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
            
            // La categoria no ha d`existir al catàleg global
            const deletedCatInTemplates = data.categoryTemplates.find(c => c.id === categoryId);
            expect(deletedCatInTemplates).to.be.undefined;

            const cal = Object.values(data.calendars)[0];
            // La categoria no ha d`existir a les categories del calendari
            const deletedCatInCal = cal.categories.find(c => c.id === categoryId);
            expect(deletedCatInCal).to.be.undefined;

            // L`esdeveniment no ha d`existir als esdeveniments del calendari
            const deletedEvent = cal.events.find(e => e.id === eventId);
            expect(deletedEvent).to.be.undefined;

            cy.log('✅ localStorage verificat: Categoria i esdeveniment eliminats correctament.');
        });
    });

    /**
     * Cas de prova 2: Intentar eliminar una categoria de sistema.
     */
    it('13.2 No permet eliminar una categoria de sistema', () => {
        // === ARRANGE ===
        cy.log('🏗️ ARRANGE: Creant un calendari FP per carregar categories de sistema');
        cy.get('[data-action="new-calendar"]').click();
        cy.get('#studyType').select('Formació Professional (FP)');
        cy.get('#cicleCode').type('DAW');
        cy.get('#moduleCode').type('M06');
        cy.get('[data-action="add-calendar"]').click();
        cy.wait(2000); // Espera extra per renderitzar categories de sistema

        // === ACT & ASSERT ===
        cy.log('🎬🧐 ACT & ASSERT: Verificant que les categories de sistema no tenen botó d`eliminar');

        // Agafem una categoria de sistema coneguda, com "Festius" (ID: 'SYS_CAT_2')
        cy.get('.category-list-item[data-category-id="SYS_CAT_2"]').as('systemCategory');

        // Verificació clau: el botó d`eliminar NO ha d`existir dins d`aquest element.
        cy.get('@systemCategory').find('[data-action="delete-category"]').should('not.exist');

        cy.log('✅ Verificació correcta: La categoria de sistema "Festius" no té botó per eliminar.');
    });

    /**
     * Cas de prova 3: Cancel·lar l`eliminació des del modal.
     */
    it('13.3 Permet cancel·lar l`eliminació des del modal', () => {
        // === ARRANGE ===
        cy.log('🏗️ ARRANGE: Creant calendari, categoria i guardant estat inicial');
        
        // 1. Crear calendari i categoria
        cy.get('[data-action="new-calendar"]').click();
        cy.get('#studyType').select('Altre');
        cy.get('#calendarName').type('Test Cancelar Borrat');
        cy.get('#startDate').type('2025-01-01');
        cy.get('#endDate').type('2025-12-31');
        cy.get('[data-action="add-calendar"]').click();
        cy.wait(500);

        const categoryName = 'Categoria Intacte';
        cy.get('#new-category-name').type(categoryName);
        cy.get('[data-action="add-category"]').click();
        cy.wait(500);

        // 2. Guardar l`estat inicial del localStorage
        let initialState;
        cy.window().then((win) => {
            initialState = win.localStorage.getItem('calendari-ioc-data');
            cy.log('📝 Estat inicial del localStorage guardat.');
        });

        // === ACT ===
        cy.log('🎬 ACT: Fent clic a eliminar i cancel·lant');

        // 1. Clic al botó d`eliminar
        cy.contains('.category-list-item', categoryName)
            .find('[data-action="delete-category"]').click();

        // 2. Verificar que el modal apareix
        cy.get('#confirmModal').should('be.visible');

        // 3. Clic al botó de cancel·lar (normalment un 'btn-secondary' o amb 'data-dismiss')
        cy.get('#confirmModal .btn-secondary').click();
        cy.wait(500);

        // === ASSERT ===
        cy.log('🧐 ASSERT: Verificant que no hi ha hagut canvis');

        // 1. Verificar UI
        cy.contains('.category-list-item', categoryName).should('be.visible');
        cy.log('✅ UI verificada: La categoria encara és visible.');

        // 2. Verificar localStorage
        cy.window().then((win) => {
            const currentState = win.localStorage.getItem('calendari-ioc-data');
            expect(currentState).to.equal(initialState);
            cy.log('✅ localStorage verificat: L`estat no ha canviat.');
        });
    });
});
