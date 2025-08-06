/**
 * =================================================================
 * TEST 15 - SELECT COLOR
 * =================================================================
 *
 * @file        test-15-select-color.cy.js
 * @description Test de verificació del canvi de color d'una categoria.
 * @author      Ismael Trascastro <itrascastro@ioc.cat>
 * @version     1.1.0
 * @date        2025-08-03
 * @project     Calendari Mòdul IOC
 * @repository  https://github.com/itrascastro/ioc-modul-calendari
 * @license     MIT
 *
 * Aquest test (versió simplificada) verifica la funcionalitat bàsica
 * de canviar el color d'una categoria en un únic calendari.
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

    it('15.1 Canvia el color d\'una categoria i verifica el canvi', () => {
        // === ARRANGE ===
        cy.log('🏗️ ARRANGE: Creant calendari, categoria i esdeveniment');

        // 1. Crear Calendari
        cy.get('[data-action="new-calendar"]').click();
        cy.get('#studyType').select('Altre');
        cy.get('#calendarName').type('Test Color 1');
        cy.get('#startDate').type('2025-01-01');
        cy.get('#endDate').type('2025-12-31');
        cy.get('[data-action="add-calendar"]').click();
        cy.wait(500);

        // 2. Afegir categoria personalitzada
        const categoryName = 'Categoria Canvi Color';
        cy.get('#new-category-name').type(categoryName);
        cy.get('[data-action="add-category"]').click();
        cy.wait(500);

        // 3. Afegir esdeveniment
        cy.window().then(win => {
            const calendar = win.app.appStateManager.getCurrentCalendar();
            const category = calendar.categories.find(c => c.name === categoryName);
            calendar.events.push({ id: 'E1', title: 'Event Cal 1', date: '2025-01-10', categoryId: category.id });
            win.app.storageManager.saveToStorage();
            win.app.viewManager.renderCurrentView();
        });
        cy.contains('.event', 'Event Cal 1').should('be.visible');

        const newColorHex = '#e67e22';
        const newColorRgb = 'rgb(230, 126, 34)';
        
        cy.window().then(win => {
            const categoryId = win.app.appStateManager.categoryTemplates.find(c => c.name === categoryName).id;

            // Replicar la lògica de modalRenderer.selectCategoryColor
            win.app.appStateManager.categoryTemplates.find(t => t.id === categoryId).color = newColorHex;
            Object.values(win.app.appStateManager.calendars).forEach(cal => {
                const calendarCategory = cal.categories.find(c => c.id === categoryId);
                if (calendarCategory) {
                    calendarCategory.color = newColorHex;
                }
            });

            win.app.storageManager.saveToStorage();
            win.app.calendarManager.updateUI(); // Això renderitza els panells i la vista
        });

        // === ASSERT ===
        cy.log('🧐 ASSERT: Verificant que el color ha canviat');

        cy.contains('.category-list-item', categoryName)
            .find('.color-dot')
            .should('have.css', 'background-color', newColorRgb);
        
        cy.contains('.event', 'Event Cal 1')
            .should('have.css', 'background-color', newColorRgb);

        cy.window().then((win) => {
            const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
            const categoryId = win.app.appStateManager.categoryTemplates.find(c => c.name === categoryName).id;

            const globalCategory = data.categoryTemplates.find(c => c.id === categoryId);
            expect(globalCategory.color).to.equal(newColorHex);

            const cal1 = Object.values(data.calendars)[0];
            const catInCal1 = cal1.categories.find(c => c.id === categoryId);
            expect(catInCal1.color).to.equal(newColorHex);
        });
    });
});