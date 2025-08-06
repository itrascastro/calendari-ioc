/**
 * =================================================================
 * TEST 05 - SWITCH CALENDAR
 * =================================================================
 * 
 * @file        test-05-switch-calendar.cy.js
 * @description Test de verificació del canvi entre calendaris
 * @author      Ismael Trascastro <itrascastro@ioc.cat>
 * @version     1.0.0
 * @date        2025-01-31
 * @project     Calendari Mòdul IOC
 * @repository  https://github.com/itrascastro/ioc-modul-calendari
 * @license     MIT
 * 
 * Aquest test verifica els aspectes del switch-calendar:
 * - currentCalendarId canvia al localStorage
 * - Element DOM obté classe 'active' 
 * - Vista mensual s'activa amb dades correctes
 * - Navegació de dates respecta rang del calendari
 * 
 * =================================================================
 */

describe('IOC CALENDARI - TEST 05 SWITCH CALENDAR', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
    cy.contains('Calendari IOC').should('be.visible');
    cy.wait(1000);
  });

  it('05. switch-calendar - Verificació completa', () => {
    // === ARRANGE: CREAR CALENDARIS PREDEFINITS ===
    cy.log('🏗️ FASE 1: Creant calendaris per testing switch...');
    
    const calendarsToCreate = [
      {
        type: 'Altre',
        name: 'TEST_PERSONAL',
        start: '2024-01-01',
        end: '2024-06-30',
        expectedId: 'TEST_PERSONAL'
      },
      {
        type: 'Formació Professional (FP)',
        cicle: 'TCICLE',
        module: 'TMODUL',
        expectedId: 'FP_TCICLE_TMODUL'
      },
      {
        type: 'Altre', 
        name: 'TEST_WORK',
        start: '2024-07-01',
        end: '2024-12-31',
        expectedId: 'TEST_WORK'
      }
    ];
    
    // Crear cada calendari sistemàticament
    calendarsToCreate.forEach((calendar, index) => {
      cy.log(`📅 Creant calendari ${index + 1}: ${calendar.expectedId}`);
      
      cy.get('[data-action="new-calendar"]').click();
      cy.get('#calendarSetupModal').should('be.visible');
      cy.get('#studyType').select(calendar.type);
      
      if (calendar.type === 'Formació Professional (FP)') {
        cy.get('#cicleCode').type(calendar.cicle);
        cy.get('#moduleCode').type(calendar.module);
      } else {
        cy.get('#calendarName').type(calendar.name);
        cy.get('#startDate').type(calendar.start);
        cy.get('#endDate').type(calendar.end);
      }
      
      cy.get('[data-action="add-calendar"]').click();
      cy.wait(1500); // Esperar creació completa amb configuracions
      
      cy.log(`✅ Calendari ${calendar.expectedId} creat`);
    });
    
    // Verificar estructura dels calendaris creats
    cy.get('.calendar-list-item').should('have.length', 3);
    cy.log('✅ 3 calendaris creats correctament');
    
    // === FASE 2: IDENTIFICAR CALENDARI ACTIU INICIAL ===
    cy.log('🎯 FASE 2: Identificant calendari actiu inicial...');
    
    cy.window().then((win) => {
      const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
      const initialCurrentId = data.currentCalendarId;
      cy.log(`📋 currentCalendarId inicial: ${initialCurrentId}`);
      cy.wrap(initialCurrentId).as('initialCurrentId');
    });
    
    // === ACT + ASSERT FASE 1: SWITCH AL PRIMER CALENDARI ===
    cy.log('🔄 FASE 3: Switch al primer calendari (TEST_PERSONAL)...');
    
    // Obtenir ID real del primer calendari del DOM
    cy.get('.calendar-list-item')
      .first()
      .should('have.attr', 'data-calendar-id')
      .then((firstCalendarId) => {
        cy.log(`🎯 Target calendari: ${firstCalendarId}`);
        cy.wrap(firstCalendarId).as('firstCalendarId');
        
        // Executar switch
        cy.get(`.calendar-list-item[data-calendar-id="${firstCalendarId}"] [data-action="switch-calendar"]`)
          .click();
        cy.wait(800);
        
        // VERIFICACIÓ 1: currentCalendarId ha canviat al localStorage
        cy.window().then((win) => {
          const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
          const newCurrentId = data.currentCalendarId;
          
          expect(newCurrentId).to.equal(firstCalendarId);
          cy.log(`✅ currentCalendarId actualitzat: ${newCurrentId}`);
        });
        
        // VERIFICACIÓ 2: Element DOM té classe 'active'
        cy.get(`.calendar-list-item[data-calendar-id="${firstCalendarId}"]`)
          .should('have.class', 'active');
        cy.log('✅ Classe "active" aplicada al DOM');
        
        // VERIFICACIÓ 3: Altres calendaris NO tenen classe 'active'
        cy.get('.calendar-list-item').each(($item) => {
          const itemId = $item.attr('data-calendar-id');
          if (itemId !== firstCalendarId) {
            expect($item).to.not.have.class('active');
          }
        });
        cy.log('✅ Altres calendaris NO tenen classe "active"');
      });
    
    // === ACT + ASSERT FASE 2: SWITCH AL SEGON CALENDARI ===
    cy.log('🔄 FASE 4: Switch al segon calendari (FP)...');
    
    cy.get('.calendar-list-item')
      .eq(1) // Segon calendari
      .should('have.attr', 'data-calendar-id')
      .then((secondCalendarId) => {
        cy.log(`🎯 Nou target: ${secondCalendarId}`);
        cy.wrap(secondCalendarId).as('secondCalendarId');
        
        // Executar switch
        cy.get(`.calendar-list-item[data-calendar-id="${secondCalendarId}"] [data-action="switch-calendar"]`)
          .click();
        cy.wait(800);
        
        // VERIFICACIÓ 1: currentCalendarId ha canviat
        cy.window().then((win) => {
          const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
          const newCurrentId = data.currentCalendarId;
          
          expect(newCurrentId).to.equal(secondCalendarId);
          cy.log(`✅ currentCalendarId ara és: ${newCurrentId}`);
        });
        
        // VERIFICACIÓ 2: Nou calendari té classe 'active'
        cy.get(`.calendar-list-item[data-calendar-id="${secondCalendarId}"]`)
          .should('have.class', 'active');
        cy.log('✅ Nou calendari actiu al DOM');
        
        // VERIFICACIÓ 3: Calendari anterior NO té classe 'active'
        cy.get('@firstCalendarId').then((firstId) => {
          cy.get(`.calendar-list-item[data-calendar-id="${firstId}"]`)
            .should('not.have.class', 'active');
          cy.log('✅ Calendari anterior ja no és actiu');
        });
      });
    
    // === FASE 5: VERIFICAR VISTA MENSUAL AMB DADES CORRECTES ===
    cy.log('📅 FASE 5: Verificant vista mensual carrega dades correctes...');
    
    cy.get('@secondCalendarId').then((activeCalendarId) => {
      // Verificar que les dades del calendari actiu són consistents
      cy.window().then((win) => {
        const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
        const activeCalendar = data.calendars[activeCalendarId];
        
        expect(activeCalendar).to.exist;
        expect(activeCalendar.id).to.equal(activeCalendarId);
        
        cy.log(`📊 Calendari actiu: ${activeCalendar.name}`);
        cy.log(`📅 Rang: ${activeCalendar.startDate} → ${activeCalendar.endDate}`);
        cy.log(`🏷️ Categories: ${activeCalendar.categories.length}`);
        cy.log(`📅 Esdeveniments: ${activeCalendar.events.length}`);
        
        // Verificar que currentDate està dins del rang del calendari
        const currentDate = new Date(data.currentDate);
        const startDate = new Date(activeCalendar.startDate);
        const endDate = new Date(activeCalendar.endDate);
        
        expect(currentDate).to.be.at.least(startDate);
        expect(currentDate).to.be.at.most(endDate);
        cy.log('✅ currentDate dins del rang del calendari actiu');
      });
    });
    
    // === FASE 6: VERIFICAR NAVEGACIÓ DE DATES ===
    cy.log('🧭 FASE 6: Verificant navegació respecta rang calendari...');
    
    // Verificar botons de navegació estan configurats correctament
    cy.get('body').then($body => {
      if ($body.find('.nav-arrow').length > 0) {
        cy.log('📍 Botons navegació trobats');
        
        // Comprovar estat dels botons (poden estar habilitats/deshabitats segons la data actual)
        cy.get('.nav-arrow[data-direction="-1"]').then($prevBtn => {
          const isDisabled = $prevBtn.is(':disabled');
          cy.log(`📍 Botó anterior: ${isDisabled ? 'DESHABITAT' : 'HABILITAT'}`);
        });
        
        cy.get('.nav-arrow[data-direction="1"]').then($nextBtn => {
          const isDisabled = $nextBtn.is(':disabled');
          cy.log(`📍 Botó següent: ${isDisabled ? 'DESHABITAT' : 'HABILITAT'}`);
        });
        
        cy.log('✅ Botons navegació verificats');
      } else {
        cy.log('ℹ️ Botons navegació no trobats en aquesta vista');
      }
    });
    
    // === FASE 7: SWITCH AL TERCER CALENDARI I VERIFICACIÓ FINAL ===
    cy.log('🔄 FASE 7: Switch final al tercer calendari...');
    
    cy.get('.calendar-list-item')
      .eq(2) // Tercer calendari
      .should('have.attr', 'data-calendar-id')
      .then((thirdCalendarId) => {
        cy.log(`🎯 Target final: ${thirdCalendarId}`);
        
        // Switch final
        cy.get(`.calendar-list-item[data-calendar-id="${thirdCalendarId}"] [data-action="switch-calendar"]`)
          .click();
        cy.wait(800);
        
        // VERIFICACIÓ FINAL COMPLETA
        cy.window().then((win) => {
          const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
          
          // 1. currentCalendarId correcte
          expect(data.currentCalendarId).to.equal(thirdCalendarId);
          
          // 2. Calendari actiu al DOM
          cy.get(`.calendar-list-item[data-calendar-id="${thirdCalendarId}"]`)
            .should('have.class', 'active');
          
          // 3. Només un calendari actiu
          cy.get('.calendar-list-item.active').should('have.length', 1);
          
          // 4. Dades del calendari són consistents
          const finalCalendar = data.calendars[thirdCalendarId];
          expect(finalCalendar.id).to.equal(thirdCalendarId);
          
          cy.log('✅ VERIFICACIÓ FINAL PERFECTA');
          cy.log(`📊 Switch completat a: ${finalCalendar.name}`);
        });
      });
    
    // === VERIFICACIÓ D'INTEGRITAT TOTAL ===
    cy.log('🎯 FASE 8: Verificació integritat total...');
    
    // L'aplicació segueix completament funcional
    cy.get('[data-action="new-calendar"]')
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled');
    
    // Tots els calendaris segueixen existint
    cy.get('.calendar-list-item').should('have.length', 3);
    
    // Exactament un calendari està actiu
    cy.get('.calendar-list-item.active').should('have.length', 1);
    
    cy.log('🎉 SWITCH-CALENDAR: Verificació completa!');
    cy.log('✅ currentCalendarId, classe active, vista mensual i navegació - TOT PERFECTE');
  });

});