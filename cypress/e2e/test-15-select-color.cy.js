/**
 * =================================================================
 * TEST 15 - SELECT COLOR (Refactoritzat)
 * =================================================================
 *
 * @file        test-15-select-color.cy.js
 * @description Test de verificació del canvi de color d´una categoria.
 * @author      Ismael Trascastro <itrascastro@ioc.cat>
 * @version     2.0.0
 * @date        2025-08-06
 * @project     Calendari Mòdul IOC
 * @repository  https://github.com/itrascastro/ioc-modul-calendari
 * @license     MIT
 *
 * Aquest test verifica el flux complet de canvi de color d´una categoria:
 * 1.  Crea un calendari, una categoria i un esdeveniment associat.
 * 2.  Obre el selector de colors fent clic al 'color-dot'.
 * 3.  Selecciona un nou color del modal.
 * 4.  Verifica que el canvi de color es reflecteix a la UI (llista de categories i esdeveniment).
 * 5.  Verifica que el nou color es guarda correctament al localStorage.
 *
 * =================================================================
 */
describe('IOC CALENDARI - TEST 15 SELECT COLOR', () => {

    beforeEach(() => {
        cy.clearLocalStorage();
        cy.visit('/');
        cy.contains('Calendari IOC').should('be.visible');
        cy.wait(1000);
    });

    it('15.1 Canvia el color d´una categoria i verifica el canvi de forma honesta', () => {
        // === ARRANGE ===
        cy.log('🏗️ ARRANGE: Creant calendari, categoria i esdeveniment');

        // 1. Crear Calendari
        cy.get('[data-action="new-calendar"]').click();
        cy.get('#studyType').select('Altre');
        cy.get('#calendarName').type('Test Color Real');
        cy.get('#startDate').type('2025-01-01');
        cy.get('#endDate').type('2025-12-31');
        cy.get('[data-action="add-calendar"]').click();
        cy.wait(500);

        // 2. Afegir categoria personalitzada
        const categoryName = 'Categoria Canvi Color';
        cy.get('#new-category-name').type(categoryName);
        cy.get('[data-action="add-category"]').click();
        cy.wait(500);

        let categoryId;
        let initialColorRgb;

        // 3. Afegir esdeveniment i guardar dades inicials
        cy.window().then(win => {
            const { appStateManager, storageManager, viewManager, CalendariIOC_Event, idHelper } = win.app;
            const calendar = appStateManager.getCurrentCalendar();
            const category = calendar.categories.find(c => c.name === categoryName);
            expect(category).to.exist;
            categoryId = category.id;

            const eventId = idHelper.generateNextEventId(calendar.id);
            const newEvent = new CalendariIOC_Event({
                id: eventId,
                title: 'Event de Prova de Color',
                date: '2025-01-10',
                category: category
            });
            calendar.addEvent(newEvent);

            storageManager.saveToStorage();
            viewManager.renderCurrentView();
        });

        // Verificar que l'esdeveniment és visible
        cy.contains('.event', 'Event de Prova de Color').should('be.visible')
            .then($event => {
                // Guardar el color inicial per comparar-lo després
                initialColorRgb = $event.css('background-color');
                cy.log(`🎨 Color inicial guardat: ${initialColorRgb}`);
            });

        // === ACT & ASSERT ===
        cy.log('🎬 ACT & ASSERT: Obrint selector, seleccionant color i verificant tot en cadena');

        // 1. Obrir el selector de colors
        cy.contains('.category-list-item', categoryName)
            .find('.color-dot')
            .click();

        // 2. Verificar que el modal s'ha obert
        cy.get('#colorPickerModal').should('exist').and('have.class', 'show');

        // 3. Seleccionar un nou color dinàmicament i encadenar les asercions
        cy.get('.color-option').eq(4).then($colorOption => {
            // --- FASE ACT ---
            const newColorHex = $colorOption.data('color');
            const newColorRgb = $colorOption.css('background-color');
            cy.log(`🎨 Seleccionant nou color dinàmicament: HEX=${newColorHex}, RGB=${newColorRgb}`);
            
            cy.wrap($colorOption).click();
            cy.wait(500);

            // --- FASE ASSERT (dins del .then() per garantir l'ordre) ---
            cy.log('🧐 ASSERT: Verificant que el color ha canviat a la UI i al localStorage');

            // 1. Verificar que el modal s'ha tancat
            cy.get('#colorPickerModal').should('not.have.class', 'show');

            // 2. Verificar el canvi de color a la UI
            cy.contains('.category-list-item', categoryName)
                .find('.color-dot')
                .should('have.css', 'background-color', newColorRgb)
                .and('not.have.css', 'background-color', initialColorRgb);
            cy.log('✅ Color del "color-dot" actualitzat correctament.');

            cy.contains('.event', 'Event de Prova de Color')
                .should('have.css', 'background-color', newColorRgb)
                .and('not.have.css', 'background-color', initialColorRgb);
            cy.log('✅ Color de fons de l\'esdeveniment actualitzat correctament.');

            // 3. Verificar el canvi al localStorage
            cy.window().then((win) => {
                const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
                
                const globalCategory = data.categoryTemplates.find(c => c.id === categoryId);
                expect(globalCategory.color).to.equal(newColorHex);

                const cal = Object.values(data.calendars)[0];
                const catInCal = cal.categories.find(c => c.id === categoryId);
                expect(catInCal.color).to.equal(newColorHex);
                
                cy.log('✅ Nou color verificat correctament al localStorage.');
            });
        });
    });
});
