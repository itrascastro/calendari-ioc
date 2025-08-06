/**
 * =================================================================
 * TEST 03 - NEW CALENDAR MODAL
 * =================================================================
 * 
 * @file        test-03-new-calendar-modal.cy.js
 * @description Test de verificació del modal de creació de calendaris
 * @author      Ismael Trascastro <itrascastro@ioc.cat>
 * @version     1.0.0
 * @date        2025-01-31
 * @project     Calendari Mòdul IOC
 * @repository  https://github.com/itrascastro/ioc-modul-calendari
 * @license     MIT
 * 
 * Aquest test verifica el funcionament del modal new-calendar:
 * - Obertura del modal correctament
 * - Verificació de camps dinàmics per cada tipus de calendari:
 *   · FP: cicleCode + moduleCode
 *   · BTX: subjectCode  
 *   · Altre: calendarName + startDate + endDate
 * - Funcionalitat de canvi dinàmic entre tipus
 * 
 * =================================================================
 */

describe('IOC CALENDARI - TEST 03 NEW CALENDAR MODAL', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
    cy.contains('Calendari IOC').should('be.visible');
    cy.wait(1000);
  });

  it('03. new-calendar - Verificació camps dinàmics', () => {
    // === ARRANGE - ESTAT INICIAL ===
    cy.log('🎯 FASE 1: Verificant estat inicial...');
    
    // Verificar que no hi ha modal obert
    cy.get('#calendarSetupModal').should('not.have.class', 'show');
    cy.log('✅ Cap modal obert inicialment');
    
    // === ACT - OBRIR MODAL ===
    cy.log('🖱️ FASE 2: Obrint modal new-calendar...');
    
    cy.get('[data-action="new-calendar"]')
      .should('exist')
      .should('be.visible')
      .click();
    
    cy.wait(300); // Esperar animació
    
    // === ASSERT - VERIFICAR MODAL OBERT ===
    cy.log('🔍 FASE 3: Verificant modal obert...');
    
    cy.get('#calendarSetupModal')
      .should('have.class', 'show')
      .should('be.visible');
    
    // Verificar títol del modal
    cy.get('#setupModalTitle')
      .should('contain.text', 'Nou Calendari');
    
    // Verificar camps inicials
    cy.get('#studyType')
      .should('exist')
      .should('be.visible')
      .should('have.value', ''); // Inicialment buit
    
    cy.get('#dynamicFields')
      .should('exist')
      .should('be.empty'); // Inicialment buit
    
    cy.log('✅ Modal obert correctament amb camps inicials');
    
    // === VERIFICAR TIPUS FP ===
    cy.log('📚 FASE 4: Verificant camps per tipus FP...');
    
    cy.get('#studyType').select('FP');
    cy.wait(200); // Esperar renderització
    
    // Verificar camps específics de FP
    cy.get('#dynamicFields #cicleCode')
      .should('exist')
      .should('be.visible')
      .should('have.attr', 'placeholder'); // Té placeholder, no importa quin
    
    cy.get('#dynamicFields #moduleCode')
      .should('exist')
      .should('be.visible')
      .should('have.attr', 'placeholder'); // Té placeholder, no importa quin
    
    // Verificar que només aquests camps existeixen per FP
    cy.get('#dynamicFields').within(() => {
      cy.get('input').should('have.length', 2);
      cy.get('#cicleCode').should('exist');
      cy.get('#moduleCode').should('exist');
    });
    
    cy.log('✅ Camps FP correctes: cicleCode + moduleCode');
    
    // === VERIFICAR TIPUS BTX ===
    cy.log('🎓 FASE 5: Verificant camps per tipus BTX...');
    
    cy.get('#studyType').select('BTX');
    cy.wait(200);
    
    // Verificar camp específic de BTX
    cy.get('#dynamicFields #subjectCode')
      .should('exist')
      .should('be.visible');
    
    // Verificar que només aquest camp existeix per BTX
    cy.get('#dynamicFields').within(() => {
      cy.get('input').should('have.length', 1);
      cy.get('#subjectCode').should('exist');
    });
    
    // Verificar que els camps de FP han desaparegut
    cy.get('#dynamicFields #cicleCode').should('not.exist');
    cy.get('#dynamicFields #moduleCode').should('not.exist');
    
    cy.log('✅ Camps BTX correctes: només subjectCode');
    
    // === VERIFICAR TIPUS ALTRE ===
    cy.log('📝 FASE 6: Verificant camps per tipus Altre...');
    
    cy.get('#studyType').select('Altre');
    cy.wait(200);
    
    // Verificar camps específics d'Altre
    cy.get('#dynamicFields #calendarName')
      .should('exist')
      .should('be.visible');
    
    cy.get('#dynamicFields #startDate')
      .should('exist')
      .should('be.visible')
      .should('have.attr', 'type', 'date');
    
    cy.get('#dynamicFields #endDate')
      .should('exist')
      .should('be.visible')
      .should('have.attr', 'type', 'date');
    
    // Verificar que són exactament aquests 3 camps
    cy.get('#dynamicFields').within(() => {
      cy.get('input').should('have.length', 3);
      cy.get('#calendarName').should('exist');
      cy.get('#startDate').should('exist');
      cy.get('#endDate').should('exist');
    });
    
    // Verificar que els camps anteriors han desaparegut
    cy.get('#dynamicFields #subjectCode').should('not.exist');
    
    cy.log('✅ Camps Altre correctes: calendarName + startDate + endDate');
    
    // === VERIFICAR FUNCIONALITAT DE CANVI ===
    cy.log('🔄 FASE 7: Verificant canvis dinàmics...');
    
    // Tornar a FP per verificar que el canvi funciona
    cy.get('#studyType').select('FP');
    cy.wait(200);
    
    cy.get('#dynamicFields #cicleCode').should('exist');
    cy.get('#dynamicFields #moduleCode').should('exist');
    cy.get('#dynamicFields #calendarName').should('not.exist');
    
    cy.log('✅ Canvis dinàmics funcionen perfectament');
    
    // === VERIFICAR FUNCIONALITAT ADDICIONAL ===
    cy.log('⚙️ FASE 8: Verificant funcionalitat del modal...');
    
    // Verificar que hi ha botó de guardar
    cy.get('#saveCalendarBtn, [data-action="add-calendar"]')
      .should('exist')
      .should('be.visible');
    
    // Verificar que el modal es pot tancar
    cy.get('body').then($body => {
      const closeButton = $body.find('.modal .btn-close, .modal .close, .modal [data-dismiss="modal"]');
      if (closeButton.length > 0) {
        cy.wrap(closeButton.first()).should('be.visible');
        cy.log('✅ Botó de tancar detectat');
      } else {
        cy.log('ℹ️ Modal sense botó de tancar explícit');
      }
    });
    
    cy.log('🎉 NEW-CALENDAR: Modal i camps dinàmics verificats completament');
  });

});