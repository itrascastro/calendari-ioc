/**
 * =================================================================
 * TEST 01 - TOGGLE THEME
 * =================================================================
 * 
 * @file        test-01-toggle-theme.cy.js
 * @description Test de verificació del canvi de tema clar/fosc
 * @author      Ismael Trascastro <itrascastro@ioc.cat>
 * @version     1.0.0
 * @date        2025-01-31
 * @project     Calendari Mòdul IOC
 * @repository  https://github.com/itrascastro/ioc-modul-calendari
 * @license     MIT
 * 
 * Aquest test verifica els aspectes del canvi de tema:
 * - Estat inicial detectat correctament
 * - Transició executada sense errors
 * - Estat final verificat múltiples maneres
 * - Reversibilitat comprovada
 * 
 * =================================================================
 */

describe('IOC CALENDARI - TEST 01 TOGGLE THEME', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
    cy.contains('Calendari IOC').should('be.visible');
    cy.wait(1000); // Assegurar càrrega completa
  });

  it('01. toggle-theme - Verificació completa', () => {
    // === ARRANGE ===
    // Detectar estat inicial del tema amb múltiples verificacions
    cy.get('body').should('exist').then($body => {
      const initialIsDark = $body.hasClass('dark-mode');
      const expectedFinalClass = initialIsDark ? 'light' : 'dark';
      
      cy.log(`🎨 Estat inicial: ${initialIsDark ? 'DARK' : 'LIGHT'} mode`);
      cy.log(`🎯 Objectiu: Canviar a ${expectedFinalClass.toUpperCase()} mode`);
      
      // Verificar que el botó de toggle existeix amb ID i data-action correctes
      cy.get('#theme-toggle')
        .should('exist')
        .should('be.visible')
        .should('have.attr', 'data-action', 'toggle-theme')
        .then($button => {
          const buttonText = $button.text().trim();
          cy.log(`🔘 Botó theme-toggle trobat: "${buttonText}"`);
          
          // Verificar consistència inicial: text del botó ha de correspondre amb l'estat
          const expectedText = initialIsDark ? 'Mode Clar' : 'Mode Fosc';
          expect(buttonText).to.equal(expectedText);
          cy.log(`✅ Text del botó consistent amb estat inicial: "${buttonText}"`);
        });
      
      // === ACT ===
      // Executar el canvi de tema
      cy.get('[data-action="toggle-theme"]').click();
      
      // Esperar que la transició es completi
      cy.wait(200); // Petit delay per transicions CSS
      
      // === ASSERT MÚLTIPLE ===
      // Verificació 1: Classe CSS ha canviat
      cy.get('body').should(initialIsDark ? 'not.have.class' : 'have.class', 'dark-mode');
      
      // Verificació 2: Estat del body ha canviat
      cy.get('body').then($bodyAfter => {
        const finalIsDark = $bodyAfter.hasClass('dark-mode');
        expect(finalIsDark).to.not.equal(initialIsDark);
        cy.log(`✅ Transició exitosa: ${initialIsDark ? 'DARK→LIGHT' : 'LIGHT→DARK'}`);
      });
      
      // Verificació 3: Text del botó ha canviat adequadament
      cy.get('#theme-toggle').then($buttonAfter => {
        const newButtonText = $buttonAfter.text().trim();
        const finalIsDark = !initialIsDark; // Ha canviat
        const expectedNewText = finalIsDark ? 'Mode Clar' : 'Mode Fosc';
        
        expect(newButtonText).to.equal(expectedNewText);
        cy.log(`✅ Text del botó actualitzat correctament: "${newButtonText}"`);
      });
      
      // Verificació 4: Consistència final botó-estat
      cy.get('body').then($bodyFinal => {
        cy.get('#theme-toggle').then($buttonFinal => {
          const finalIsDark = $bodyFinal.hasClass('dark-mode');
          const finalButtonText = $buttonFinal.text().trim();
          const expectedText = finalIsDark ? 'Mode Clar' : 'Mode Fosc';
          
          expect(finalButtonText).to.equal(expectedText);
          cy.log(`✅ Consistència perfecta: ${finalIsDark ? 'DARK' : 'LIGHT'} mode → botó diu "${finalButtonText}"`);
        });
      });
      
      // === VERIFICACIÓ DE REVERSIBILITAT ===
      cy.log('🔄 VERIFICANT REVERSIBILITAT COMPLETA...');
      
      // Capturar estat abans de la reversió
      cy.get('body').then($bodyBeforeReverse => {
        cy.get('#theme-toggle').then($buttonBeforeReverse => {
          const beforeReverseIsDark = $bodyBeforeReverse.hasClass('dark-mode');
          const beforeReverseButtonText = $buttonBeforeReverse.text().trim();
          
          cy.log(`🔄 Estat actual: ${beforeReverseIsDark ? 'DARK' : 'LIGHT'} mode, botó: "${beforeReverseButtonText}"`);
          
          // Executar reversió
          cy.get('[data-action="toggle-theme"]').click();
          cy.wait(200);
          
          // Verificar reversió completa
          cy.get('body').then($bodyAfterReverse => {
            cy.get('#theme-toggle').then($buttonAfterReverse => {
              const afterReverseIsDark = $bodyAfterReverse.hasClass('dark-mode');
              const afterReverseButtonText = $buttonAfterReverse.text().trim();
              
              // Ha de ser exactament l'estat inicial
              expect(afterReverseIsDark).to.equal(initialIsDark);
              
              // Text del botó també ha de ser consistent
              const expectedReversedText = afterReverseIsDark ? 'Mode Clar' : 'Mode Fosc';
              expect(afterReverseButtonText).to.equal(expectedReversedText);
              
              cy.log(`✅ Reversió perfecta: ${afterReverseIsDark ? 'DARK' : 'LIGHT'} mode, botó: "${afterReverseButtonText}"`);
              cy.log(`✅ Tornat exactament a l'estat inicial: ${initialIsDark ? 'DARK' : 'LIGHT'} mode`);
            });
          });
        });
      });
      
      
      // === VERIFICACIÓ FINAL D'INTEGRITAT ===
      cy.log('🔍 VERIFICACIÓ FINAL D\'INTEGRITAT DE L\'APLICACIÓ...');
      
      // Assegurar que l'aplicació segueix funcionant perfectament
      cy.get('[data-action="new-calendar"]')
        .should('exist')
        .should('be.visible')
        .should('not.be.disabled');
        
      cy.get('.calendar-container, .sidebar, .main-content')
        .should('exist');
      
      // Verificar que el tema segueix sent consistent després de tots els canvis
      cy.get('body').then($finalBody => {
        cy.get('#theme-toggle').then($finalButton => {
          const finalIsDark = $finalBody.hasClass('dark-mode');
          const finalButtonText = $finalButton.text().trim();
          const expectedFinalText = finalIsDark ? 'Mode Clar' : 'Mode Fosc';
          
          expect(finalButtonText).to.equal(expectedFinalText);
          expect(finalIsDark).to.equal(initialIsDark); // Ha de ser igual a l'inicial després de dues togles
          
          cy.log(`✅ CONSISTÈNCIA FINAL PERFECTA: ${finalIsDark ? 'DARK' : 'LIGHT'} mode, botó: "${finalButtonText}"`);
        });
      });
      
      cy.log('🎉 TOGGLE-THEME: TEST COMPLET EXECUTAT AMB PERFECCIÓ ABSOLUTA!');
    });
  });

});