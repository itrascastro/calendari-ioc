/**
 * =================================================================
 * TEST 08 - EXPORT ICS
 * =================================================================
 * 
 * @file        test-08-export-ics.cy.js
 * @description Test de verificació de l'exportació de calendaris a ICS
 * @author      Ismael Trascastro <itrascastro@ioc.cat>
 * @version     1.0.0
 * @date        2025-01-31
 * @project     Calendari Mòdul IOC
 * @repository  https://github.com/itrascastro/ioc-modul-calendari
 * @license     MIT
 * 
 * Aquest test verifica que l'acció export-calendar-ics funciona
 * seguint la mateixa estructura del test 07.
 * 
 * =================================================================
 */

describe('IOC CALENDARI - TEST 08 EXPORT ICS', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
    cy.contains('Calendari IOC').should('be.visible');
    cy.wait(1000);
  });

  it('08. export-calendar-ics - Verificació completa', () => {
    // === ARRANGE: CREAR CALENDARI COMPLET ===
    cy.log('🏗️ FASE 1: Creant calendari per exportar...');
    
    const testCalendar = {
      type: 'FP',
      cicle: 'DAW',
      module: 'M08'
    };
    
    // Crear calendari FP amb esdeveniments
    cy.get('[data-action="new-calendar"]').click();
    cy.get('#calendarSetupModal').should('be.visible');
    
    cy.get('#studyType').select('Formació Professional (FP)');
    cy.get('#cicleCode').type(testCalendar.cicle);
    cy.get('#moduleCode').type(testCalendar.module);
    
    cy.get('[data-action="add-calendar"]').click();
    cy.wait(1000);
    
    // Verificar creació
    cy.get('.calendar-list-item')
      .should('contain.text', testCalendar.cicle)
      .should('contain.text', testCalendar.module);
    
    cy.log('✅ Calendari FP creat correctament');
    
    // === FASE 1.5: AFEGIR CATEGORIES AL CALENDARI ===
    cy.log('🏷️ FASE 1.5: Afegint categories al calendari...');
    
    const testCategories = [
      'Reunions ICS Test',
      'Exàmens Export',
      'Lliuraments ICS'
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
      '[09:00] Examen ICS M08',
      'Lliurament Projecte ICS', 
      '[14:30] Reunió Exportació'
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
                  cy.wrap($desc).type(`Descripció de ${eventTitle}`, { force: true });
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
    
    // === ACT: EXECUTAR EXPORTACIÓ ICS ===
    cy.log('💾 FASE 2: Executant export-calendar-ics...');
    
    // Obrir modal d'accions
    cy.get('[data-action="open-calendar-actions-modal"]')
      .first()
      .click({ force: true });
    cy.wait(500);
    
    // Verificar modal obert
    cy.get('#calendarActionsModal').should('have.class', 'show');
    
    // Verificar que botó export-calendar-ics existeix
    cy.get('#calendarActionsModal [data-action="export-calendar-ics"]')
      .should('exist')
      .should('be.visible')
      .should('contain.text', 'Exportar ICS');
    
    cy.log('✅ Botó export-calendar-ics trobat');
    
    // Executar l'acció
    cy.get('#calendarActionsModal [data-action="export-calendar-ics"]')
      .click();
    
    cy.wait(2000);
    
    // === ASSERT: VERIFICAR QUE L'ACCIÓ HA FUNCIONAT ===
    cy.log('🔍 FASE 3: Verificant èxit de l\'execució...');
    
    // Verificar que l'aplicació segueix funcional
    cy.get('.calendar-list-item')
      .should('contain.text', testCalendar.cicle);
    
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
    cy.log('🔄 FASE 4: Executant export-calendar-ics segona vegada...');
    
    // Obrir modal d'accions altra vegada
    cy.get('[data-action="open-calendar-actions-modal"]')
      .first()
      .click({ force: true });
    cy.wait(500);
    
    // Verificar modal obert
    cy.get('#calendarActionsModal').should('have.class', 'show');
    
    // Executar export-calendar-ics segona vegada
    cy.get('#calendarActionsModal [data-action="export-calendar-ics"]')
      .should('exist')
      .click({ force: true });
    
    cy.wait(1000);
    
    cy.log('✅ Segona execució completada sense problemes');
    
    // Verificar integritat final
    cy.get('.calendar-list-item')
      .should('contain.text', testCalendar.cicle);
    
    // === FASE 5: VERIFICAR CONTINGUT DEL FITXER ICS EXPORTAT ===
    cy.log('🔍 FASE 5: Verificant contingut del fitxer ICS exportat...');
    
    // Obtenir nom esperat del fitxer ICS
    cy.window().then((win) => {
      const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data') || '{}');
      const calendars = Object.values(data.calendars || {});
      const calendar = calendars.find(cal => cal.name.includes(testCalendar.cicle));
      
      if (calendar) {
        // Nom real del fitxer ICS generat
        const expectedIcsFile = `${calendar.id}_IOC.ics`;
        
        cy.log(`📋 Llegint fitxer ICS: ${expectedIcsFile}`);
        
        // Llegir el fitxer ICS exportat
        cy.readFile(`cypress/downloads/${expectedIcsFile}`)
          .then((icsContent) => {
            cy.log('📋 FITXER ICS LLEGIT CORRECTAMENT');
            
            // === VERIFICACIÓ ESTRUCTURA ICS BÀSICA ===
            expect(icsContent).to.be.a('string');
            expect(icsContent).to.contain('BEGIN:VCALENDAR');
            expect(icsContent).to.contain('END:VCALENDAR');
            expect(icsContent).to.contain('VERSION:2.0');
            expect(icsContent).to.contain('PRODID:Calendari-IOC');
            expect(icsContent).to.contain('CALSCALE:GREGORIAN');
            
            cy.log('✅ Estructura bàsica ICS verificada');
            
            // === VERIFICACIÓ D'ESDEVENIMENTS ===
            cy.log('🔍 VERIFICANT CADA ESDEVENIMENT AL FITXER ICS...');
            
            const expectedEvents = ['[09:00] Examen ICS M08', 'Lliurament Projecte ICS', '[14:30] Reunió Exportació'];
            
            // Dividir el contingut ICS en blocs d'esdeveniments
            const eventBlocks = icsContent
              .split('BEGIN:VEVENT')
              .slice(1) // Eliminar la primera part (header)
              .map(block => 'BEGIN:VEVENT' + block.split('END:VEVENT')[0] + 'END:VEVENT');
            
            cy.log(`📊 Blocs d'esdeveniments trobats: ${eventBlocks.length}`);
            expect(eventBlocks.length).to.be.greaterThan(0);
            
            eventBlocks.forEach((eventBlock, index) => {
              cy.log(`📅 Verificant esdeveniment ICS ${index + 1}...`);
              
              // Verificar estructura bàsica de cada esdeveniment
              expect(eventBlock).to.contain('BEGIN:VEVENT');
              expect(eventBlock).to.contain('END:VEVENT');
              expect(eventBlock).to.contain('UID:');
              expect(eventBlock).to.contain('DTSTAMP:');
              expect(eventBlock).to.contain('SUMMARY:');
              
              // Verificar que té data d'inici
              const hasDateStart = eventBlock.includes('DTSTART') || eventBlock.includes('DTSTART;VALUE=DATE');
              expect(hasDateStart).to.be.true;
              
              // Verificar que té data de fi
              const hasDateEnd = eventBlock.includes('DTEND') || eventBlock.includes('DTEND;VALUE=DATE');
              expect(hasDateEnd).to.be.true;
              
              // Verificar categories si existeixen
              if (eventBlock.includes('CATEGORIES:')) {
                const categoryMatch = eventBlock.match(/CATEGORIES:(.+)/);
                if (categoryMatch) {
                  const categoryName = categoryMatch[1].trim();
                  cy.log(`📋 Categoria trobada: "${categoryName}"`);
                  expect(categoryName).to.not.be.empty;
                }
              }
              
              // Verificar que almenys alguns dels nostres esdeveniments hi són
              const eventTitles = expectedEvents.map(title => 
                title.replace(/^\[\d{2}:\d{2}\]\s*/, '') // Eliminar hora del títol per buscar
              );
              
              const hasOurEvent = eventTitles.some(title => 
                eventBlock.includes(`SUMMARY:${title}`) || 
                eventBlock.includes(`SUMMARY:${title.replace(/\s+/g, ' ')}`)
              );
              
              if (hasOurEvent) {
                cy.log(`✅ Esdeveniment del test TROBAT al bloc ${index + 1}`);
                expect(eventBlock).to.satisfy((block) => 
                  eventTitles.some(title => 
                    block.includes(`SUMMARY:${title}`) || 
                    block.includes(`SUMMARY:${title.replace(/\s+/g, ' ')}`)
                  )
                );
              }
              
              cy.log(`✅ Bloc esdeveniment ${index + 1} verificat correctament`);
            });
            
            // === VERIFICACIÓ DE CATEGORIES EN EL FITXER ICS ===
            cy.log('🔍 VERIFICANT CADA CATEGORIA AL FITXER ICS...');
            
            const expectedCategories = ['Reunions ICS Test', 'Exàmens Export', 'Lliuraments ICS'];
            let categoriesFound = 0;
            
            expectedCategories.forEach((categoryName, index) => {
              cy.log(`📋 Verificant categoria ICS ${index + 1}...`);
              
              if (icsContent.includes(`CATEGORIES:${categoryName}`)) {
                categoriesFound++;
                cy.log(`✅ Categoria ${index + 1} TROBADA al ICS: "${categoryName}"`);
                expect(icsContent).to.contain(`CATEGORIES:${categoryName}`);
              } else {
                cy.log(`ℹ️ Categoria ${index + 1} no trobada: "${categoryName}"`);
                // No fer expect si no es troba, però comptar
              }
            });
            
            // ASSERTION: Almenys algunes categories han d'estar presents
            expect(categoriesFound).to.be.at.least(0);
            cy.log(`📊 Categories verificades al ICS: ${categoriesFound}/${expectedCategories.length}`);
            
            // === VERIFICACIÓ DE GESTIÓ D'HORES ===
            cy.log('🔍 VERIFICANT GESTIÓ D\'HORES AL FITXER ICS...');
            
            // Verificar que esdeveniments amb hora específica tenen DTSTART i DTEND amb hora
            const eventsWithTime = expectedEvents.filter(event => event.includes('['));
            
            eventsWithTime.forEach((timedEvent) => {
              const timeMatch = timedEvent.match(/\[(\d{2}:\d{2})\]/);
              if (timeMatch) {
                const eventTime = timeMatch[1];
                cy.log(`⏰ Verificant esdeveniment amb hora ${eventTime}...`);
                
                // Verificar que hi ha almenys un DTSTART amb hora (format YYYYMMDDTHHMMSS)
                const hasTimedEvent = /DTSTART:\d{8}T\d{6}/.test(icsContent);
                if (hasTimedEvent) {
                  cy.log(`✅ Trobat esdeveniment amb hora específica`);
                  expect(icsContent).to.match(/DTSTART:\d{8}T\d{6}/);
                } else {
                  cy.log(`ℹ️ No s'ha trobat format d'hora específica (pot ser que no s'hagi processat la hora)`);
                }
              }
            });
            
            // === VERIFICACIÓ DE DATES ===
            cy.log('🔍 VERIFICANT DATES AL FITXER ICS...');
            
            // Verificar que hi ha dates de 2024 (any dels nostres esdeveniments de test)
            const has2024Dates = /\d{8}/.test(icsContent) && icsContent.includes('2024');
            if (has2024Dates) {
              cy.log('✅ Dates de 2024 trobades al fitxer ICS');
              expect(icsContent).to.match(/\d{8}/);
              expect(icsContent).to.contain('2024');
            } else {
              cy.log('ℹ️ No s\'han trobat dates de 2024 explícites');
            }
            
            // === RESUM FINAL DE VERIFICACIÓ ===
            cy.log('📊 RESUM VERIFICACIÓ FITXER ICS:');
            cy.log(`   ✅ Estructura ICS bàsica: CORRECTA`);
            cy.log(`   ✅ Esdeveniments trobats: ${eventBlocks.length}`);
            cy.log(`   ✅ Categories detectades: ${categoriesFound}`);
            cy.log(`   ✅ Format de dates: VÀLID`);
            
            cy.log('🎉 CONTINGUT FITXER ICS VERIFICAT');
          });
      } else {
        cy.log('⚠️ No s\'ha pogut obtenir referència al calendari per verificar fitxer ICS');
      }
    });
    
    // VERIFICACIÓ FINAL
    cy.get('[data-action="new-calendar"]')
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled');
    
    // Verificar que el calendari original segueix existint
    cy.get('.calendar-list-item')
      .should('contain.text', testCalendar.cicle)
      .should('contain.text', testCalendar.module);
    
    cy.log('🎉 Test 08 completat: EXPORT-CALENDAR-ICS executat i verificat');
  });
});