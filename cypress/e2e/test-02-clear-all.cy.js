/**
 * =================================================================
 * TEST 02 - CLEAR ALL
 * =================================================================
 * 
 * @file        test-02-clear-all.cy.js
 * @description Test de verificació de la funcionalitat clear-all
 * @author      Ismael Trascastro <itrascastro@ioc.cat>
 * @version     1.0.0
 * @date        2025-01-31
 * @project     Calendari Mòdul IOC
 * @repository  https://github.com/itrascastro/ioc-modul-calendari
 * @license     MIT
 * 
 * Aquest test verifica el funcionament essencial de clear-all:
 * - Crear dades per verificar que existeixen
 * - Executar clear-all amb confirmació
 * - Verificar eliminació de 'calendari-ioc-data' del localStorage
 * - Verificar UI neta i aplicació funcional
 * 
 * =================================================================
 */

describe('IOC CALENDARI - TEST 02 CLEAR ALL', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
    cy.contains('Calendari IOC').should('be.visible');
    cy.wait(1000);
  });

  it('02. clear-all - Verificació completa', () => {
    // === ARRANGE - CREAR DADES SIMPLES ===
    cy.log('🏗️ FASE 1: Creant dades per netejar...');
    
    // Crear només 1 calendari per verificar que hi ha dades
    const testCalendar = { type: 'Altre', name: 'Test Clear', start: '2024-01-01', end: '2024-12-31' };
    
    cy.get('[data-action="new-calendar"]').click();
    cy.get('#studyType').select(testCalendar.type);
    cy.get('#calendarName').type(testCalendar.name);
    cy.get('#startDate').type(testCalendar.start);
    cy.get('#endDate').type(testCalendar.end);
    cy.get('[data-action="add-calendar"]').click();
    cy.wait(500);
    
    // Verificar que s'ha creat el calendari
    cy.get('.calendar-list-item').should('contain.text', testCalendar.name);
    cy.log('✅ Calendari creat correctament');
    
    // === VERIFICAR DADES EXISTEIXEN ===
    cy.log('📊 FASE 2: Verificant que localStorage té dades...');
    
    // Verificar que localStorage conté 'calendari-ioc-data'
    cy.window().then((win) => {
      const data = win.localStorage.getItem('calendari-ioc-data');
      expect(data).to.not.be.null;
      cy.log('✅ localStorage conté calendari-ioc-data');
    });
    
    // === ACT - EXECUTAR CLEAR-ALL ===
    cy.log('🧹 FASE 3: Executant clear-all...');
    
    // Clicar clear-all
    cy.get('[data-action="clear-all"]')
      .should('exist')
      .should('be.visible')
      .click();
    
    // === CONFIRMAR AL MODAL ===
    cy.log('⚠️ FASE 4: Confirmant al modal...');
    
    cy.wait(500); // Esperar modal
    
    // Buscar modal i confirmar
    cy.get('body').then($body => {
      const modal = $body.find('.modal.show, [role="dialog"], .confirm-modal').first();
      if (modal.length > 0) {
        cy.log('✅ Modal trobat, confirmant...');
        // Buscar botó de confirmació
        cy.get('.modal.show .btn-danger, [role="dialog"] .btn-danger').first().click({ force: true });
      } else {
        cy.log('⚠️ Modal no trobat - procedir directament');
      }
    });
    
    cy.wait(1000); // Esperar processament
    
    // === ASSERT - VERIFICACIONS ESSENCIALS ===
    cy.log('🔍 FASE 5: Verificant netejat...');
    
    // Verificació CLAU: localStorage.getItem('calendari-ioc-data') === null
    cy.window().then((win) => {
      const data = win.localStorage.getItem('calendari-ioc-data');
      expect(data).to.be.null;
      cy.log('✅ calendari-ioc-data eliminat del localStorage');
    });
    
    // Verificació UI: No hi ha calendaris
    cy.get('.calendar-list-item').should('not.exist');
    cy.log('✅ UI neta - no calendaris visibles');
    
    // Verificació funcionalitat: Aplicació segueix funcionant
    cy.get('[data-action="new-calendar"]')
      .should('exist')
      .should('be.visible')
      .click();
    
    cy.get('#calendarSetupModal, .modal').should('be.visible');
    cy.get('#studyType').should('exist');
    
    // Tancar modal
    cy.get('body').type('{esc}');
    
    cy.log('🎉 CLEAR-ALL: Test completat - localStorage netejat, UI neta, aplicació funcional');
  });

});