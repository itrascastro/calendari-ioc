/**
 * =================================================================
 * TEST 12 - ADD CATEGORY
 * =================================================================
 * 
 * @file        test-12-add-category.cy.js
 * @description Test de verificació de l'afegida de categories
 * @author      Ismael Trascastro <itrascastro@ioc.cat>
 * @version     1.0.0
 * @date        2025-01-31
 * @project     Calendari Mòdul IOC
 * @repository  https://github.com/itrascastro/ioc-modul-calendari
 * @license     MIT
 * 
 * Aquest test verifica la funcionalitat d'afegir categories:
 * - Afegir categoria via click botó [data-action="add-category"]
 * - Afegir categoria via tecla Enter al camp #new-category-name
 * - Verificar estructura localStorage correcta per cada categoria
 * - Verificar UI actualitzada (categoria visible, camp buidat)
 * - Test robustesa amb múltiples categories
 * - Verificar consistència d'IDs i integritat de dades
 * 
 * =================================================================
 */

describe('IOC CALENDARI - TEST 12 ADD CATEGORY', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
    cy.contains('Calendari IOC').should('be.visible');
    cy.wait(1000);
  });

  it('12. add-category - Verificació completa via click i Enter', () => {
    // === ARRANGE: CREAR CALENDARI BASE ===
    cy.log('🏗️ FASE 1: Creant calendari base...');
    
    const testCalendar = {
      type: 'Altre',
      name: 'Categories Test',
      start: '2024-01-01',
      end: '2024-12-31'
    };
    
    // Crear calendari
    cy.get('[data-action="new-calendar"]').click();
    cy.get('#calendarSetupModal').should('be.visible');
    
    cy.get('#studyType').select(testCalendar.type);
    cy.get('#calendarName').type(testCalendar.name);
    cy.get('#startDate').type(testCalendar.start);
    cy.get('#endDate').type(testCalendar.end);
    
    cy.get('[data-action="add-calendar"]').click();
    cy.wait(1000);
    
    // Verificar creació
    cy.get('.calendar-list-item')
      .should('contain.text', testCalendar.name);
    
    cy.log('✅ Calendari base creat correctament');
    
    // === VERIFICAR SISTEMA CATEGORIES DISPONIBLE ===
    cy.log('🔍 FASE 1.5: Verificant sistema de categories...');
    
    cy.get('#new-category-name')
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled');
    
    cy.get('[data-action="add-category"]')
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled');
    
    cy.log('✅ Sistema de categories disponible');
    
    // === ACT: AFEGIR CATEGORIA VIA CLICK BOTÓ ===
    cy.log('👆 FASE 2: Afegint categoria via click botó...');
    
    const testCategory1 = 'Categoria Click Test';
    
    // Introduir nom categoria
    cy.get('#new-category-name')
      .clear()
      .type(testCategory1);
    
    // Verificar camp omplert
    cy.get('#new-category-name')
      .should('have.value', testCategory1);
    
    // Executar acció add-category
    cy.get('[data-action="add-category"]')
      .click();
    
    cy.wait(500);
    
    cy.log('✅ Categoria afegida via click botó');
    
    // === ASSERT: VERIFICAR LOCALSTORAGE PRIMERA CATEGORIA ===
    cy.log('💾 FASE 3: Verificant localStorage primera categoria...');
    
    cy.window().then((win) => {
      const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
      const calendarsList = Object.values(data.calendars);
      const testCalendarObj = calendarsList.find(cal => cal.name === testCalendar.name);
      
      expect(testCalendarObj).to.exist;
      
      // Verificar categories array
      expect(testCalendarObj.categories).to.be.an('array');
      expect(testCalendarObj.categories).to.have.length(1);
      
      const firstCategory = testCalendarObj.categories[0];
      
      // Verificar estructura categoria
      expect(firstCategory).to.have.property('id').that.is.a('string');
      expect(firstCategory).to.have.property('name').that.equals(testCategory1);
      expect(firstCategory).to.have.property('color').that.is.a('string').and.matches(/^#[0-9a-fA-F]{6}$/);
      expect(firstCategory).to.have.property('isSystem').that.is.false;
      
      // Verificar ID format correcte
      expect(firstCategory.id).to.match(/^.+_C1$/);
      
      // Verificar lastCategoryId incrementat
      expect(testCalendarObj.lastCategoryId).to.equal(1);
      
      cy.log('✅ Primera categoria verificada al localStorage:');
      cy.log(`   ID: ${firstCategory.id}`);
      cy.log(`   Name: ${firstCategory.name}`);
      cy.log(`   Color: ${firstCategory.color}`);
      cy.log(`   isSystem: ${firstCategory.isSystem}`);
    });
    
    // === ASSERT: VERIFICAR UI PRIMERA CATEGORIA ===
    cy.log('👁️ FASE 4: Verificant UI primera categoria...');
    
    // Verificar camp buidat després d'afegir
    cy.get('#new-category-name')
      .should('have.value', '');
    
    // Buscar categoria al panell de categories
    cy.get('body').then($body => {
      const categoryElements = $body.find('.category-item, .category-badge, [data-category]');
      
      if (categoryElements.length > 0) {
        cy.log(`📊 Categories visibles: ${categoryElements.length}`);
        
        // Verificar que la categoria és visible
        cy.contains(testCategory1)
          .should('be.visible');
        
        cy.log('✅ Categoria visible al panell');
      } else {
        cy.log('ℹ️ Elements de categories no detectats al DOM');
      }
    });
    
    // === ACT: AFEGIR CATEGORIA VIA TECLA ENTER ===
    cy.log('⌨️ FASE 5: Afegint categoria via tecla Enter...');
    
    const testCategory2 = 'Categoria Enter Test';
    
    // Introduir nom i pressionar Enter
    cy.get('#new-category-name')
      .clear()
      .type(testCategory2)
      .type('{enter}');
    
    cy.wait(500);
    
    cy.log('✅ Categoria afegida via tecla Enter');
    
    // === ASSERT: VERIFICAR LOCALSTORAGE SEGONA CATEGORIA ===
    cy.log('💾 FASE 6: Verificant localStorage segona categoria...');
    
    cy.window().then((win) => {
      const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
      const calendarsList = Object.values(data.calendars);
      const testCalendarObj = calendarsList.find(cal => cal.name === testCalendar.name);
      
      // Verificar array categories ara té 2 elements
      expect(testCalendarObj.categories).to.have.length(2);
      
      const secondCategory = testCalendarObj.categories[1];
      
      // Verificar estructura segona categoria
      expect(secondCategory).to.have.property('id').that.is.a('string');
      expect(secondCategory).to.have.property('name').that.equals(testCategory2);
      expect(secondCategory).to.have.property('color').that.is.a('string').and.matches(/^#[0-9a-fA-F]{6}$/);
      expect(secondCategory).to.have.property('isSystem').that.is.false;
      
      // Verificar ID format correcte i diferent
      expect(secondCategory.id).to.match(/^.+_C2$/);
      expect(secondCategory.id).to.not.equal(testCalendarObj.categories[0].id);
      
      // Verificar lastCategoryId incrementat
      expect(testCalendarObj.lastCategoryId).to.equal(2);
      
      cy.log('✅ Segona categoria verificada al localStorage:');
      cy.log(`   ID: ${secondCategory.id}`);
      cy.log(`   Name: ${secondCategory.name}`);
      cy.log(`   Color: ${secondCategory.color}`);
    });
    
    // === FASE 7: TEST ROBUSTESA MÚLTIPLES CATEGORIES ===
    cy.log('🔄 FASE 7: Test robustesa múltiples categories...');
    
    const additionalCategories = [
      'Categoria Robustesa 1',
      'Categoria Robustesa 2',
      'Categoria Robustesa 3'
    ];
    
    additionalCategories.forEach((categoryName, index) => {
      cy.log(`➕ Afegint categoria ${index + 3}: "${categoryName}"`);
      
      cy.get('#new-category-name')
        .clear()
        .type(categoryName);
      
      // Alternar entre click i Enter
      if (index % 2 === 0) {
        cy.get('[data-action="add-category"]').click();
      } else {
        cy.get('#new-category-name').type('{enter}');
      }
      
      cy.wait(300);
    });
    
    cy.log('✅ Categories addicionals afegides');
    
    // === ASSERT: VERIFICAR CONSISTÈNCIA FINAL ===
    cy.log('🔍 FASE 8: Verificant consistència final...');
    
    cy.window().then((win) => {
      const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
      const calendarsList = Object.values(data.calendars);
      const testCalendarObj = calendarsList.find(cal => cal.name === testCalendar.name);
      
      // Verificar total categories
      const totalExpectedCategories = 5;
      expect(testCalendarObj.categories).to.have.length(totalExpectedCategories);
      expect(testCalendarObj.lastCategoryId).to.equal(totalExpectedCategories);
      
      // Verificar unicitat d'IDs
      const categoryIds = testCalendarObj.categories.map(cat => cat.id);
      expect(categoryIds).to.have.lengthOf(new Set(categoryIds).size);
      
      // Verificar totes les categories tenen estructura correcta
      testCalendarObj.categories.forEach((category, index) => {
        expect(category).to.have.property('id').that.is.a('string');
        expect(category).to.have.property('name').that.is.a('string').and.is.not.empty;
        expect(category).to.have.property('color').that.matches(/^#[0-9a-fA-F]{6}$/);
        expect(category).to.have.property('isSystem').that.is.false;
        
        // Verificar format ID
        expect(category.id).to.match(new RegExp(`_C${index + 1}$`));
      });
      
      // Verificar noms específics
      const expectedNames = [testCategory1, testCategory2, ...additionalCategories];
      testCalendarObj.categories.forEach((category, index) => {
        expect(category.name).to.equal(expectedNames[index]);
      });
      
      cy.log('✅ Consistència perfecta verificada:');
      cy.log(`   📊 Total categories: ${testCalendarObj.categories.length}`);
      cy.log(`   🔢 Last Category ID: ${testCalendarObj.lastCategoryId}`);
      cy.log(`   🆔 IDs únics: ${categoryIds.length === new Set(categoryIds).size ? 'SÍ' : 'NO'}`);
      
      testCalendarObj.categories.forEach((cat, i) => {
        cy.log(`   ${i + 1}. ${cat.name} (${cat.id}) [${cat.color}]`);
      });
    });
    
    // === VERIFICACIÓ FINAL FUNCIONALITAT ===
    cy.log('🔧 FASE 9: Verificant funcionalitat final aplicació...');
    
    // Verificar que podem continuar afegint categories
    cy.get('#new-category-name')
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled')
      .should('have.value', '');
    
    cy.get('[data-action="add-category"]')
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled');
    
    // Verificar que aplicació segueix funcional
    cy.get('[data-action="new-calendar"]')
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled');
    
    cy.log('✅ Aplicació completament funcional després del test');
    
    cy.log('🎉 TEST 12 COMPLETAT: add-category via click i Enter verificat exhaustivament!');
  });
});