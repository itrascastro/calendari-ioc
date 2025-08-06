/**
 * =================================================================
 * TEST 06 - CALENDAR ACTIONS MODAL
 * =================================================================
 * 
 * @file        test-06-calendar-actions-modal.cy.js
 * @description Test de verificació del modal d'accions de calendari
 * @author      Ismael Trascastro <itrascastro@ioc.cat>
 * @version     1.0.0
 * @date        2025-01-31
 * @project     Calendari Mòdul IOC
 * @repository  https://github.com/itrascastro/ioc-modul-calendari
 * @license     MIT
 * 
 * Aquest test verifica l'obertura del modal d'accions segons tipus:
 * - Calendaris "Altre": mostren opció "Importar ICS" 
 * - Calendaris FP/BTX: NO mostren opció "Importar ICS"
 * - Modal s'obre correctament per tots els tipus
 * 
 * =================================================================
 */

describe('IOC CALENDARI - TEST 06 CALENDAR ACTIONS MODAL', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
    cy.contains('Calendari IOC').should('be.visible');
    cy.wait(1000);
  });

  it('06A. Calendari ALTRE - TOTS els botons correctes', () => {
    // Crear calendari "Altre"
    cy.get('[data-action="new-calendar"]').click();
    cy.get('#studyType').select('Altre').should('have.value', 'Altre');
    cy.get('#calendarName').type('TEST_ALTRO_COMPLET');
    cy.get('#startDate').type('2024-01-01');
    cy.get('#endDate').type('2024-12-31');
    cy.get('[data-action="add-calendar"]').click();
    cy.wait(2000);
    
    // Verificar calendari creat
    cy.window().then((win) => {
      const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
      const calendars = Object.values(data.calendars);
      const lastCalendar = calendars[calendars.length - 1];
      expect(lastCalendar.type).to.equal('Altre');
    });
    
    // Obrir modal d'accions
    cy.get('[data-action="open-calendar-actions-modal"]')
      .first()
      .click({ force: true });
    cy.wait(500);
    cy.get('#calendarActionsModal').should('have.class', 'show');
    
    // VERIFICACIÓ TOTS ELS BOTONS
    cy.log('🔍 VERIFICANT TOTS ELS BOTONS PER CALENDARI ALTRE...');
    
    // 1. Botó DESAR - sempre visible
    cy.get('#calendarActionsModal [data-action="save-calendar-json"]')
      .should('exist')
      .should('be.visible')
      .should('contain.text', 'Desar');
    
    // 2. Botó EXPORTAR ICS - sempre visible
    cy.get('#calendarActionsModal [data-action="export-calendar-ics"]')
      .should('exist')
      .should('be.visible')
      .should('contain.text', 'Exportar ICS');
    
    // 3. Botó EXPORTAR HTML - sempre visible
    cy.get('#calendarActionsModal [data-action="export-calendar-html"]')
      .should('exist')
      .should('be.visible')
      .should('contain.text', 'Exportar HTML');
    
    // 4. Botó IMPORTAR ICS - NOMÉS visible per "Altre"
    cy.get('#importIcsBtn')
      .should('exist')
      .should('have.css', 'display', 'block')
      .should('contain.text', 'Importar ICS');
    
    // 5. Botó REPLICAR - sempre visible
    cy.get('#calendarActionsModal [data-action="replicate-calendar"]')
      .should('exist')
      .should('be.visible')
      .should('contain.text', 'Replicar');
    
    // 6. Botó ELIMINAR - sempre visible amb classe danger
    cy.get('#calendarActionsModal [data-action="delete-calendar"]')
      .should('exist')
      .should('be.visible')
      .should('have.class', 'danger')
      .should('contain.text', 'Eliminar');
      
    cy.log('✅ CALENDARI ALTRE: TOTS ELS 6 BOTONS VERIFICATS CORRECTAMENT');
  });

  it('06B. Calendari FP - TOTS els botons correctes', () => {
    // Crear calendari FP
    cy.get('[data-action="new-calendar"]').click();
    cy.get('#studyType').select('Formació Professional (FP)');
    cy.get('#cicleCode').type('DAW');
    cy.get('#moduleCode').type('M06');
    cy.get('[data-action="add-calendar"]').click();
    cy.wait(2000);
    
    // Obrir modal d'accions
    cy.get('[data-action="open-calendar-actions-modal"]')
      .first()
      .click({ force: true });
    cy.wait(500);
    cy.get('#calendarActionsModal').should('have.class', 'show');
    
    // VERIFICACIÓ TOTS ELS BOTONS
    cy.log('🔍 VERIFICANT TOTS ELS BOTONS PER CALENDARI FP...');
    
    // 1. Botó DESAR - sempre visible
    cy.get('#calendarActionsModal [data-action="save-calendar-json"]')
      .should('exist')
      .should('be.visible')
      .should('contain.text', 'Desar');
    
    // 2. Botó EXPORTAR ICS - sempre visible
    cy.get('#calendarActionsModal [data-action="export-calendar-ics"]')
      .should('exist')
      .should('be.visible')
      .should('contain.text', 'Exportar ICS');
    
    // 3. Botó EXPORTAR HTML - sempre visible
    cy.get('#calendarActionsModal [data-action="export-calendar-html"]')
      .should('exist')
      .should('be.visible')
      .should('contain.text', 'Exportar HTML');
    
    // 4. Botó IMPORTAR ICS - OCULT per FP/BTX
    cy.get('#importIcsBtn')
      .should('exist')
      .should('have.css', 'display', 'none');
    
    // 5. Botó REPLICAR - sempre visible
    cy.get('#calendarActionsModal [data-action="replicate-calendar"]')
      .should('exist')
      .should('be.visible')
      .should('contain.text', 'Replicar');
    
    // 6. Botó ELIMINAR - sempre visible amb classe danger
    cy.get('#calendarActionsModal [data-action="delete-calendar"]')
      .should('exist')
      .should('be.visible')
      .should('have.class', 'danger')
      .should('contain.text', 'Eliminar');
      
    cy.log('✅ CALENDARI FP: TOTS ELS 6 BOTONS VERIFICATS (5 visibles + Import ICS ocult)');
  });

  it('06C. Calendari BTX - TOTS els botons correctes', () => {
    // Crear calendari BTX
    cy.get('[data-action="new-calendar"]').click();
    cy.get('#studyType').select('BTX');
    cy.get('#subjectCode').type('HISTORIA');
    cy.get('[data-action="add-calendar"]').click();
    cy.wait(2000);
    
    // Obrir modal d'accions
    cy.get('[data-action="open-calendar-actions-modal"]')
      .first()
      .click({ force: true });
    cy.wait(500);
    cy.get('#calendarActionsModal').should('have.class', 'show');
    
    // VERIFICACIÓ TOTS ELS BOTONS
    cy.log('🔍 VERIFICANT TOTS ELS BOTONS PER CALENDARI BTX...');
    
    // 1. Botó DESAR - sempre visible
    cy.get('#calendarActionsModal [data-action="save-calendar-json"]')
      .should('exist')
      .should('be.visible')
      .should('contain.text', 'Desar');
    
    // 2. Botó EXPORTAR ICS - sempre visible
    cy.get('#calendarActionsModal [data-action="export-calendar-ics"]')
      .should('exist')
      .should('be.visible')
      .should('contain.text', 'Exportar ICS');
    
    // 3. Botó EXPORTAR HTML - sempre visible
    cy.get('#calendarActionsModal [data-action="export-calendar-html"]')
      .should('exist')
      .should('be.visible')
      .should('contain.text', 'Exportar HTML');
    
    // 4. Botó IMPORTAR ICS - OCULT per FP/BTX
    cy.get('#importIcsBtn')
      .should('exist')
      .should('have.css', 'display', 'none');
    
    // 5. Botó REPLICAR - sempre visible
    cy.get('#calendarActionsModal [data-action="replicate-calendar"]')
      .should('exist')
      .should('be.visible')
      .should('contain.text', 'Replicar');
    
    // 6. Botó ELIMINAR - sempre visible amb classe danger
    cy.get('#calendarActionsModal [data-action="delete-calendar"]')
      .should('exist')
      .should('be.visible')
      .should('have.class', 'danger')
      .should('contain.text', 'Eliminar');
      
    cy.log('✅ CALENDARI BTX: TOTS ELS 6 BOTONS VERIFICATS (5 visibles + Import ICS ocult)');
  });
});