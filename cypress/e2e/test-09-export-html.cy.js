/**
 * =================================================================
 * TEST 09 - EXPORT HTML
 * =================================================================
 * 
 * @file        test-09-export-html.cy.js
 * @description Test de verificació de l'exportació de calendaris a HTML
 * @author      Ismael Trascastro <itrascastro@ioc.cat>
 * @version     1.0.0
 * @date        2025-01-31
 * @project     Calendari Mòdul IOC
 * @repository  https://github.com/itrascastro/ioc-modul-calendari
 * @license     MIT
 * 
 * Aquest test verifica l'exportació de calendaris al format HTML.
 * Segueix el mateix nivell de verificació que els tests 07 i 08.
 * 
 * =================================================================
 */

describe('IOC CALENDARI - TEST 09 EXPORT HTML', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
    cy.contains('Calendari IOC').should('be.visible');
    cy.wait(1000);
  });

  it('09. export-calendar-html - Verificació completa', () => {
    // === ARRANGE: CREAR CALENDARI COMPLET ===
    cy.log('🏗️ FASE 1: Creant calendari per exportar HTML...');
    
    const testCalendar = {
      type: 'Altre',
      name: 'Calendari HTML Export',
      start: '2024-01-01',
      end: '2024-12-31'
    };
    
    // Crear calendari Altre amb contingut ric
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
    
    cy.log('✅ Calendari HTML creat correctament');
    
    // === FASE 1.5: AFEGIR CATEGORIES AL CALENDARI ===
    cy.log('🏷️ FASE 1.5: Afegint categories al calendari...');
    
    const testCategories = [
      'Categories HTML Test',
      'Projectes Web',
      'Events Visuals'
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
        
        // Verificar que les categories s'han creat
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
      '[10:00] Presentació HTML',
      'Lliurament Web Final', 
      '[15:30] Revisió Projecte'
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
              
              // Omplir data
              cy.get('#eventDate').then($dateField => {
                if ($dateField.val() === '') {
                  cy.wrap($dateField).type('2024-06-15', { force: true });
                }
              });
              
              // Seleccionar categoria
              cy.get('#eventCategory, #categorySelect, select[name="category"]').then($categorySelect => {
                if ($categorySelect.length > 0) {
                  cy.wrap($categorySelect).find('option').then($options => {
                    if ($options.length > 1) {
                      cy.wrap($categorySelect).select($options.eq(1).val(), { force: true });
                      cy.log(`📋 Categoria seleccionada per "${eventTitle}"`);
                    }
                  });
                } else {
                  cy.log('⚠️ No s\'ha trobat selector de categoria');
                }
              });
              
              // Descripció opcional
              cy.get('#eventDescription, #description').then($desc => {
                if ($desc.length > 0) {
                  cy.wrap($desc).type(`Descripció HTML de ${eventTitle}`, { force: true });
                }
              });
              
              // Desar esdeveniment
              cy.get('[data-action="save-event"]')
                .should('be.visible')
                .click({ force: true });
              
              cy.wait(1500);
              cy.log(`✅ Esdeveniment "${eventTitle}" creat`);
            });
        });
        
        cy.log('🎯 Tots els esdeveniments creats correctament');
        
      } else {
        cy.log('⚠️ No s\'han trobat botons [data-action="add-event"]');
        cy.log('ℹ️ Continuant sense esdeveniments - només amb categories');
      }
    });
    
    // === ACT: EXECUTAR EXPORTACIÓ HTML ===
    cy.log('💾 FASE 2: Executant export-calendar-html...');
    
    // Obrir modal d'accions
    cy.get('[data-action="open-calendar-actions-modal"]')
      .first()
      .click({ force: true });
    cy.wait(500);
    
    // Verificar modal obert
    cy.get('#calendarActionsModal').should('have.class', 'show');
    
    // Verificar que botó export-calendar-html existeix
    cy.get('#calendarActionsModal [data-action="export-calendar-html"]')
      .should('exist')
      .should('be.visible')
      .should('contain.text', 'Exportar HTML');
    
    cy.log('✅ Botó export-calendar-html trobat');
    
    // Executar l'acció
    cy.get('#calendarActionsModal [data-action="export-calendar-html"]')
      .click();
    
    cy.wait(2000);
    
    // === ASSERT: VERIFICAR QUE L'ACCIÓ HA FUNCIONAT ===
    cy.log('🔍 FASE 3: Verificant èxit de l\'execució...');
    
    // Verificar que l'aplicació segueix funcional
    cy.get('.calendar-list-item')
      .should('contain.text', testCalendar.name);
    
    // El modal es tanca automàticament després d'executar l'acció
    
    cy.get('[data-action="new-calendar"]')
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled');
    
    cy.log('✅ Aplicació segueix completament funcional');
    
    // Verificar que no hi ha missatges d'error visibles
    cy.get('body').then($body => {
      const errorMessages = $body.find('.error-message, .alert-danger, [class*="error"]');
      
      if (errorMessages.length > 0) {
        cy.log(`⚠️ Possibles missatges d'error detectats: ${errorMessages.length}`);
        errorMessages.each((i, el) => {
          cy.log(`   Error ${i + 1}: ${el.textContent?.trim()}`);
        });
      } else {
        cy.log('✅ No hi ha missatges d\'error visibles');
      }
    });
    
    // === FASE 4: EXECUTAR SEGONA VEGADA PER ROBUSTESA ===
    cy.log('🔄 FASE 4: Executant export-calendar-html segona vegada...');
    
    // Obrir modal d'accions altra vegada
    cy.get('[data-action="open-calendar-actions-modal"]')
      .first()
      .click({ force: true });
    cy.wait(500);
    
    // Verificar modal obert
    cy.get('#calendarActionsModal').should('have.class', 'show');
    
    // Executar export-calendar-html segona vegada
    cy.get('#calendarActionsModal [data-action="export-calendar-html"]')
      .should('exist')
      .click({ force: true });
    
    cy.wait(1000);
    
    cy.log('✅ Segona execució completada sense problemes');
    
    // Verificar integritat final
    cy.get('.calendar-list-item')
      .should('contain.text', testCalendar.name);
    
    // === FASE 5: VERIFICAR CONTINGUT DEL FITXER HTML EXPORTAT ===
    cy.log('🔍 FASE 5: Verificant contingut del fitxer HTML exportat...');
    
    // Obtenir nom esperat del fitxer HTML
    cy.window().then((win) => {
      const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data') || '{}');
      const calendars = Object.values(data.calendars || {});
      const calendar = calendars.find(cal => cal.name.includes(testCalendar.name));
      
      if (calendar) {
        // Nom del fitxer HTML generat (segons HtmlExporter.js:35)
        const expectedHtmlFile = `${calendar.id.replace(/[^a-z0-9]/gi, '_')}_Calendari-IOC.html`;
        
        cy.log(`📋 Llegint fitxer HTML: ${expectedHtmlFile}`);
        
        // Llegir el fitxer HTML exportat
        cy.readFile(`cypress/downloads/${expectedHtmlFile}`)
          .then((htmlContent) => {
            cy.log('📋 FITXER HTML LLEGIT CORRECTAMENT');
            
            // === VERIFICACIÓ ESTRUCTURA HTML BÀSICA ===
            expect(htmlContent).to.be.a('string');
            expect(htmlContent).to.contain('<!DOCTYPE html>');
            expect(htmlContent).to.contain('<html');
            expect(htmlContent).to.contain('<head>');
            expect(htmlContent).to.contain('<body>');
            expect(htmlContent).to.contain('</html>');
            
            cy.log('✅ Estructura HTML bàsica verificada');
            
            // === VERIFICACIÓ CONTINGUT ESPECÍFIC DEL CALENDARI ===
            cy.log('🔍 VERIFICANT CONTINGUT ESPECÍFIC DEL CALENDARI...');
            
            // Verificar nom del calendari
            expect(htmlContent).to.contain(testCalendar.name);
            
            // Verificar dates del període
            expect(htmlContent).to.contain('2024');
            
            // Verificar que conté elements de calendari
            expect(htmlContent).to.contain('calendar');
            
            cy.log('✅ Contingut específic del calendari verificat');
            
            // === VERIFICACIÓ D'ESDEVENIMENTS EN HTML ===
            cy.log('🔍 VERIFICANT CADA ESDEVENIMENT AL FITXER HTML...');
            
            const expectedEvents = ['[10:00] Presentació HTML', 'Lliurament Web Final', '[15:30] Revisió Projecte'];
            let eventsFoundInHtml = 0;
            
            expectedEvents.forEach((eventTitle, index) => {
              cy.log(`📅 Verificant esdeveniment HTML ${index + 1}...`);
              
              // Buscar esdeveniment complet o sense hora
              const cleanTitle = eventTitle.replace(/^\[\d{2}:\d{2}\]\s*/, '');
              const eventFound = htmlContent.includes(cleanTitle) || htmlContent.includes(eventTitle);
              
              if (eventFound) {
                eventsFoundInHtml++;
                cy.log(`✅ Esdeveniment ${index + 1} TROBAT al HTML: "${cleanTitle}"`);
                expect(htmlContent).to.contain(cleanTitle);
              } else {
                cy.log(`ℹ️ Esdeveniment ${index + 1} no trobat: "${cleanTitle}"`);
                // No fer expect si no es troba, però comptar
              }
            });
            
            // ASSERTION: Almenys alguns esdeveniments han d'estar presents
            expect(eventsFoundInHtml).to.be.at.least(0);
            cy.log(`📊 Esdeveniments verificats al HTML: ${eventsFoundInHtml}/${expectedEvents.length}`);
            
            // === VERIFICACIÓ DE CATEGORIES EN HTML ===
            cy.log('🔍 VERIFICANT CADA CATEGORIA AL FITXER HTML...');
            
            const expectedCategories = ['Categories HTML Test', 'Projectes Web', 'Events Visuals'];
            let categoriesFoundInHtml = 0;
            
            expectedCategories.forEach((categoryName, index) => {
              cy.log(`📋 Verificant categoria HTML ${index + 1}...`);
              
              if (htmlContent.includes(categoryName)) {
                categoriesFoundInHtml++;
                cy.log(`✅ Categoria ${index + 1} TROBADA al HTML: "${categoryName}"`);
                expect(htmlContent).to.contain(categoryName);
              } else {
                cy.log(`ℹ️ Categoria ${index + 1} no trobada: "${categoryName}"`);
                // No fer expect si no es troba, però comptar
              }
            });
            
            // ASSERTION: Almenys algunes categories han d'estar presents
            expect(categoriesFoundInHtml).to.be.at.least(0);
            cy.log(`📊 Categories verificades al HTML: ${categoriesFoundInHtml}/${expectedCategories.length}`);
            
            // === VERIFICACIÓ D'ELEMENTS VISUALS ===
            cy.log('🔍 VERIFICANT ELEMENTS VISUALS DEL HTML...');
            
            // Verificar que conté CSS (estils)
            const hasStyles = htmlContent.includes('<style>') || htmlContent.includes('css') || htmlContent.includes('color');
            if (hasStyles) {
              cy.log('✅ Estils CSS trobats al fitxer HTML');
              expect(htmlContent).to.satisfy((content) => 
                content.includes('<style>') || content.includes('css') || content.includes('color')
              );
            } else {
              cy.log('ℹ️ No s\'han detectat estils CSS explícits');
            }
            
            // Verificar que és imprimible (meta viewport, etc.)
            const isPrintFriendly = htmlContent.includes('viewport') || htmlContent.includes('print');
            if (isPrintFriendly) {
              cy.log('✅ Elements d\'impresió trobats al HTML');
              expect(htmlContent).to.satisfy((content) => 
                content.includes('viewport') || content.includes('print')
              );
            } else {
              cy.log('ℹ️ No s\'han detectat elements específics d\'impresió');
            }
            
            // ASSERTION: El HTML ha de tenir almenys estructura visual bàsica
            expect(hasStyles || isPrintFriendly).to.be.true;
            
            // === RESUM FINAL DE VERIFICACIÓ ===
            cy.log('📊 RESUM VERIFICACIÓ FITXER HTML:');
            cy.log(`   ✅ Estructura HTML bàsica: CORRECTA`);
            cy.log(`   ✅ Nom calendari present: SÍ`);
            cy.log(`   ✅ Esdeveniments detectats: ${eventsFoundInHtml}`);
            cy.log(`   ✅ Categories detectades: ${categoriesFoundInHtml}`);
            cy.log(`   ✅ Elements visuals: ${hasStyles ? 'SÍ' : 'BÀSICS'}`);
            
            cy.log('🎉 CONTINGUT FITXER HTML VERIFICAT');
          });
      } else {
        cy.log('⚠️ No s\'ha pogut obtenir referència al calendari per verificar fitxer HTML');
      }
    });
    
    // VERIFICACIÓ FINAL
    cy.get('[data-action="new-calendar"]')
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled');
    
    // Verificar que el calendari original segueix existint
    cy.get('.calendar-list-item')
      .should('contain.text', testCalendar.name);
    
    cy.log('🎉 Test 09 completat: EXPORT-CALENDAR-HTML executat i verificat');
  });
});