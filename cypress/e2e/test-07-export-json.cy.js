/**
 * =================================================================
 * TEST 07 - EXPORT JSON
 * =================================================================
 * 
 * @file        test-07-export-json.cy.js
 * @description Test de verificació de l'exportació de calendaris a JSON
 * @author      Ismael Trascastro <itrascastro@ioc.cat>
 * @version     1.0.0
 * @date        2025-01-31
 * @project     Calendari Mòdul IOC
 * @repository  https://github.com/itrascastro/ioc-modul-calendari
 * @license     MIT
 * 
 * Aquest test verifica que l'acció save-calendar-json funciona:
 * - L'acció existeix al modal
 * - L'acció s'executa sense errors
 * - L'aplicació segueix funcional després de l'execució
 * 
 * =================================================================
 */

describe('IOC CALENDARI - TEST 07 EXPORT JSON', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
    cy.contains('Calendari IOC').should('be.visible');
    cy.wait(1000);
  });

  it('07. save-calendar-json - Verificació completa', () => {
    // === ARRANGE: CREAR CALENDARI ===
    cy.log('🏗️ FASE 1: Creant calendari per exportar...');
    
    const testCalendar = {
      type: 'Altre',
      name: 'Calendari Export Test',
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
    
    cy.log('✅ Calendari creat correctament');
    
    // === FASE 1.5: AFEGIR CATEGORIES AL CALENDARI ===
    cy.log('🏷️ FASE 1.5: Afegint categories al calendari...');
    
    const testCategories = [
      'Reunions JSON Test',
      'Projectes Export',
      'Events Importants'
    ];
    
    // Verificar si hi ha sistema de categories disponible
    cy.get('body').then($body => {
      if ($body.find('#new-category-name').length > 0) {
        cy.log('📋 Sistema de categories disponible, afegint categories...');
        
        testCategories.forEach((categoryName, index) => {
          cy.get('#new-category-name')
            .clear()
            .type(categoryName);
          
          cy.get('[data-action="add-category"]').click();
          cy.wait(500);
          
          cy.log(`✅ Categoria ${index + 1} afegida: "${categoryName}"`);
        });
        
        // Verificar que les categories s'han creat (si existeixen)
        cy.get('body').then($body => {
          const categoryElements = $body.find('.category-item, .category-badge, [data-category]');
          if (categoryElements.length > 0) {
            cy.log(`📊 Categories detectades: ${categoryElements.length}`);
            expect(categoryElements.length).to.be.at.least(1);
          } else {
            cy.log('ℹ️ No s\'han detectat elements de categories al DOM');
          }
        });
        
      } else {
        cy.log('ℹ️ Sistema de categories no disponible - continuant sense categories');
      }
    });
    
    // === FASE 1.6: AFEGIR ESDEVENIMENTS AL CALENDARI ===
    cy.log('📅 FASE 1.6: Afegint esdeveniments al calendari...');
    
    const testEvents = [
      'Reunió JSON Export',
      'Demo Exportació', 
      'Validació Final'
    ];
    
    // Buscar botó add-event i crear esdeveniments
    cy.get('body').then($body => {
      const addEventBtns = $body.find('[data-action="add-event"]');
      
      if (addEventBtns.length > 0) {
        cy.log(`📅 Trobats ${addEventBtns.length} botons add-event - creant esdeveniments...`);
        
        testEvents.forEach((eventTitle, index) => {
          cy.log(`📝 Creant esdeveniment ${index + 1}: "${eventTitle}"`);
          
          // Clicar botó add-event
          cy.get('[data-action="add-event"]')
            .first()
            .click({ force: true });
          
          cy.wait(1000);
          
          // Esperar modal i omplir
          cy.get('#eventModal')
            .should('be.visible', { timeout: 5000 })
            .then(() => {
              // Omplir títol
              cy.get('#eventTitle')
                .should('be.visible')
                .clear({ force: true })
                .type(eventTitle, { force: true });
              
              // Omplir data (opcional, pot tenir data per defecte)
              cy.get('#eventDate').then($dateField => {
                if ($dateField.val() === '') {
                  cy.wrap($dateField).type('2024-06-15', { force: true });
                }
              });
              
              // SELECCIONAR UNA CATEGORIA (CLAU DEL PROBLEMA!)
              cy.get('#eventCategory, #categorySelect, select[name="category"]').then($categorySelect => {
                if ($categorySelect.length > 0) {
                  // Seleccionar la primera categoria disponible (que no sigui la opció buida)
                  cy.wrap($categorySelect).find('option').then($options => {
                    if ($options.length > 1) {
                      // Seleccionar la segona opció (primera categoria real)
                      cy.wrap($categorySelect).select($options.eq(1).val(), { force: true });
                      cy.log(`📋 Categoria seleccionada per "${eventTitle}"`);
                    }
                  });
                } else {
                  cy.log('⚠️ No s\'ha trobat selector de categoria');
                }
              });
              
              // Guardar esdeveniment
              cy.get('[data-action="save-event"]')
                .should('be.visible')
                .click({ force: true });
              
              cy.wait(1000);
              cy.log(`✅ Esdeveniment "${eventTitle}" guardat AMB CATEGORIA`);
            });
        });
        
        // Verificar esdeveniments creats
        cy.wait(2000);
        cy.get('body').then($finalBody => {
          const eventElements = $finalBody.find('.event, .event-item, [data-event-id], .calendar-event');
          cy.log(`📊 Total esdeveniments visibles: ${eventElements.length}`);
          
          if (eventElements.length > 0) {
            eventElements.each((i, el) => {
              const eventText = Cypress.$(el).text().trim();
              cy.log(`   Event ${i+1}: "${eventText}"`);
            });
          }
        });
        
      } else {
        cy.log('⚠️ No s\'han trobat botons [data-action="add-event"]');
        cy.log('ℹ️ Continuant sense esdeveniments - només amb categories');
      }
    });
    
    // === FASE 2: OBRIR MODAL D'ACCIONS ===
    cy.log('🚪 FASE 2: Obrint modal d\'accions...');
    
    cy.get('[data-action="open-calendar-actions-modal"]')
      .first()
      .click({ force: true });
    
    cy.wait(500);
    
    // Verificar modal obert
    cy.get('#calendarActionsModal')
      .should('exist')
      .should('have.class', 'show');
    
    cy.log('✅ Modal d\'accions obert');
    
    // === FASE 3: VERIFICAR QUE SAVE-CALENDAR-JSON EXISTEIX ===
    cy.log('🔍 FASE 3: Verificant existència de save-calendar-json...');
    
    cy.get('#calendarActionsModal [data-action="save-calendar-json"]')
      .should('exist')
      .should('be.visible')
      .then($btn => {
        const text = $btn.text().trim();
        cy.log(`✅ Botó save-calendar-json trobat: "${text}"`);
      });
    
    // === ACT: EXECUTAR SAVE-CALENDAR-JSON ===
    cy.log('💾 FASE 4: Executant save-calendar-json...');
    
    // Interceptar possibles errors de JavaScript
    cy.window().then((win) => {
      let jsErrors = [];
      
      win.addEventListener('error', (e) => {
        jsErrors.push(e.error.message);
      });
      
      // Executar l'acció
      cy.get('#calendarActionsModal [data-action="save-calendar-json"]')
        .click({ force: true });
      
      cy.wait(2000); // Esperar execució
      
      // Verificar que no hi ha errors JavaScript
      cy.then(() => {
        if (jsErrors.length > 0) {
          cy.log(`❌ Errors JavaScript: ${jsErrors.join(', ')}`);
          throw new Error(`Errors durant save-calendar-json: ${jsErrors.join(', ')}`);
        } else {
          cy.log('✅ No hi ha errors JavaScript');
        }
      });
    });
    
    // === ASSERT: VERIFICAR QUE L'ACCIÓ HA FUNCIONAT ===
    cy.log('🔍 FASE 5: Verificant èxit de l\'execució...');
    
    // Verificar que l'aplicació segueix funcional
    cy.get('.calendar-list-item')
      .should('contain.text', testCalendar.name)
      .then(() => {
        cy.log('✅ Calendari encara existeix després de l\'exportació');
      });
    
    // Verificar que podem crear un nou calendari (aplicació funcional)
    // El modal es tanca automàticament després d'executar l'acció
    
    cy.get('[data-action="new-calendar"]')
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled')
      .then(() => {
        cy.log('✅ Aplicació segueix funcional');
      });
    
    // Verificar que no hi ha missatges d'error visibles
    cy.get('body').then($body => {
      const errorMessages = $body.find('.error-message, .alert-danger, [class*="error"]');
      
      if (errorMessages.length > 0) {
        cy.log(`⚠️ Possibles missatges d'error detectats: ${errorMessages.length}`);
        errorMessages.each((i, el) => {
          const text = Cypress.$(el).text().trim();
          if (text) {
            cy.log(`   Error ${i+1}: "${text}"`);
          }
        });
      } else {
        cy.log('✅ No hi ha missatges d\'error visibles');
      }
    });
    
    // === FASE 6: TEST DE ROBUSTESA ===
    cy.log('🔄 FASE 6: Test de robustesa...');
    
    // Intentar executar save-calendar-json una segona vegada
    cy.get('[data-action="open-calendar-actions-modal"]')
      .first()
      .click({ force: true });
    
    cy.wait(300);
    
    cy.get('#calendarActionsModal [data-action="save-calendar-json"]')
      .should('exist')
      .click({ force: true });
    
    cy.wait(1000);
    
    cy.log('✅ Segona execució realitzada sense problemes');
    
    // Verificar integritat final
    cy.get('.calendar-list-item')
      .should('contain.text', testCalendar.name);
    
    // === FASE 7: VERIFICAR CONTINGUT DEL JSON EXPORTAT ===
    cy.log('🔍 FASE 7: Verificant contingut del JSON exportat...');
    
    // Llegir el fitxer JSON exportat
    const expectedJsonFile = `${testCalendar.name.replace(/\s+/g, '_')}.json`;
    
    cy.readFile(`cypress/downloads/${expectedJsonFile}`)
      .then((jsonContent) => {
        cy.log('📋 JSON exportat llegit correctament');
        
        // Verificar estructura bàsica
        expect(jsonContent).to.be.an('object');
        expect(jsonContent.name).to.equal(testCalendar.name);
        expect(jsonContent.startDate).to.equal(testCalendar.start);
        expect(jsonContent.endDate).to.equal(testCalendar.end);
        expect(jsonContent.type).to.equal(testCalendar.type);
        
        cy.log('✅ Estructura bàsica del JSON verificada');
        
        // Verificar exportInfo
        expect(jsonContent.exportInfo).to.exist;
        expect(jsonContent.exportInfo.version).to.equal('1.0');
        expect(jsonContent.exportInfo.exportedBy).to.equal('Calendari-Modul-IOC');
        expect(jsonContent.exportInfo.exportDate).to.be.a('string');
        
        cy.log('✅ Metadades d\'exportació verificades');
        
        // === VERIFICACIÓ DEL CALENDARI (ROOT) ===
        cy.log('🔍 VERIFICANT CADA PROPIETAT DEL CALENDARI...');
        
        // Propietats principals del calendari
        expect(jsonContent).to.have.property('id').that.is.a('string').and.contains('CALENDARI_EXPORT_TEST');
        expect(jsonContent).to.have.property('name').that.equals('Calendari Export Test');
        expect(jsonContent).to.have.property('startDate').that.equals('2024-01-01');
        expect(jsonContent).to.have.property('endDate').that.equals('2024-12-31');
        expect(jsonContent).to.have.property('type').that.equals('Altre');
        expect(jsonContent).to.have.property('code').that.is.null;
        expect(jsonContent).to.have.property('lastEventId').that.equals(3);
        expect(jsonContent).to.have.property('lastCategoryId').that.equals(3);
        expect(jsonContent).to.have.property('categories').that.is.an('array');
        expect(jsonContent).to.have.property('events').that.is.an('array');
        expect(jsonContent).to.have.property('exportInfo').that.is.an('object');
        
        cy.log('✅ Totes les propietats del calendari verificades');
        
        // === VERIFICACIÓ DE CADA CATEGORIA ===
        cy.log('🔍 VERIFICANT CADA CATEGORIA INDIVIDUALMENT...');
        
        const expectedCategories = ['Reunions JSON Test', 'Projectes Export', 'Events Importants'];
        expect(jsonContent.categories).to.have.length(3);
        
        jsonContent.categories.forEach((category, index) => {
          cy.log(`📋 Verificant categoria ${index + 1}...`);
          
          // Verificar TOTES les propietats de cada categoria
          expect(category).to.have.property('id').that.is.a('string').and.matches(/^CALENDARI_EXPORT_TEST_\d+_C[123]$/);
          expect(category).to.have.property('name').that.equals(expectedCategories[index]);
          expect(category).to.have.property('color').that.is.a('string').and.matches(/^#[0-9a-fA-F]{6}$/);
          expect(category).to.have.property('isSystem').that.is.false;
          
          // Verificar que no té propietats extres
          const categoryKeys = Object.keys(category);
          expect(categoryKeys).to.have.lengthOf(4);
          expect(categoryKeys).to.include.members(['id', 'name', 'color', 'isSystem']);
          
          cy.log(`✅ Categoria ${index + 1} PERFECTA: "${category.name}" (${category.color}) - ID: ${category.id}`);
        });
        
        // === VERIFICACIÓ DE CADA ESDEVENIMENT ===
        cy.log('🔍 VERIFICANT CADA ESDEVENIMENT INDIVIDUALMENT...');
        
        const expectedEvents = ['Reunió JSON Export', 'Demo Exportació', 'Validació Final'];
        expect(jsonContent.events).to.have.length(3);
        
        jsonContent.events.forEach((event, index) => {
          cy.log(`📅 Verificant esdeveniment ${index + 1}...`);
          
          // Verificar TOTES les propietats de cada esdeveniment
          expect(event).to.have.property('id').that.is.a('string').and.matches(/^CALENDARI_EXPORT_TEST_\d+_E[123]$/);
          expect(event).to.have.property('title').that.equals(expectedEvents[index]);
          expect(event).to.have.property('date').that.is.a('string').and.matches(/^\d{4}-\d{2}-\d{2}$/);
          expect(event).to.have.property('categoryId').that.is.a('string').and.matches(/^CALENDARI_EXPORT_TEST_\d+_C[123]$/);
          expect(event).to.have.property('description').that.is.a('string'); // Pot ser buit però ha d'existir
          expect(event).to.have.property('isSystemEvent').that.is.false;
          
          // Verificar que no té propietats extres
          const eventKeys = Object.keys(event);
          expect(eventKeys).to.have.lengthOf(6);
          expect(eventKeys).to.include.members(['id', 'title', 'date', 'categoryId', 'description', 'isSystemEvent']);
          
          // Verificar que categoryId enllaça amb una categoria existent
          const linkedCategory = jsonContent.categories.find(cat => cat.id === event.categoryId);
          expect(linkedCategory).to.exist;
          
          cy.log(`✅ Esdeveniment ${index + 1} PERFECTE: "${event.title}" (${event.date}) -> Categoria: "${linkedCategory.name}"`);
        });
        
        // === VERIFICACIÓ D'EXPORTINFO ===
        cy.log('🔍 VERIFICANT METADADES D\'EXPORTACIÓ...');
        
        const exportInfo = jsonContent.exportInfo;
        expect(exportInfo).to.have.property('version').that.equals('1.0');
        expect(exportInfo).to.have.property('exportDate').that.is.a('string').and.matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        expect(exportInfo).to.have.property('exportedBy').that.equals('Calendari-Modul-IOC');
        expect(exportInfo).to.have.property('calendarType').that.equals('Altre');
        
        // Verificar que no té propietats extres
        const exportInfoKeys = Object.keys(exportInfo);
        expect(exportInfoKeys).to.have.lengthOf(4);
        expect(exportInfoKeys).to.include.members(['version', 'exportDate', 'exportedBy', 'calendarType']);
        
        cy.log('✅ Metadades d\'exportació PERFECTES');
        
        // === VERIFICACIÓ DE CONSISTÈNCIA ENTRE OBJECTES ===
        cy.log('🔗 VERIFICANT CONSISTÈNCIA ENTRE OBJECTES...');
        
        // Verificar que lastEventId coincideix amb la longitud real
        expect(jsonContent.lastEventId).to.equal(jsonContent.events.length);
        
        // Verificar que lastCategoryId coincideix amb la longitud real
        expect(jsonContent.lastCategoryId).to.equal(jsonContent.categories.length);
        
        // Verificar que tots els categoryId dels esdeveniments existeixen
        jsonContent.events.forEach(event => {
          const categoryExists = jsonContent.categories.some(cat => cat.id === event.categoryId);
          expect(categoryExists).to.be.true;
        });
        
        // Verificar que no hi ha IDs duplicats en categories
        const categoryIds = jsonContent.categories.map(cat => cat.id);
        expect(categoryIds).to.have.lengthOf(new Set(categoryIds).size);
        
        // Verificar que no hi ha IDs duplicats en esdeveniments
        const eventIds = jsonContent.events.map(event => event.id);
        expect(eventIds).to.have.lengthOf(new Set(eventIds).size);
        
        cy.log('✅ CONSISTÈNCIA PERFECTA ENTRE TOTS ELS OBJECTES');
        
        // === RESUM FINAL ===
        cy.log('🎯 VERIFICACIÓ COMPLETADA!');
        cy.log(`📊 RESUM: ${jsonContent.categories.length} categories, ${jsonContent.events.length} esdeveniments, totes les propietats verificades!`);
      });
    
    cy.log('🎉 Test completat: save-calendar-json amb categories i esdeveniments verificat!');
  });
});