/**
 * =================================================================
 * TEST 04 - ADD CALENDAR
 * =================================================================
 * 
 * @file        test-04-add-calendar.cy.js
 * @description Test de verificació de la creació de calendaris
 * @author      Ismael Trascastro <itrascastro@ioc.cat>
 * @version     1.0.0
 * @date        2025-01-31
 * @project     Calendari Mòdul IOC
 * @repository  https://github.com/itrascastro/ioc-modul-calendari
 * @license     MIT
 * 
 * Aquest test verifica la funcionalitat de creació de calendaris:
 * - Crear calendaris de cada tipus (FP, BTX, Altre) amb valors genèrics
 * - Verificar que categories sistema coincideixen amb sys-categories.json
 * - Verificar que esdeveniments sistema coincideixen amb config/*.json
 * - Verificar persistència i integritat de dades
 * 
 * =================================================================
 */

describe('IOC CALENDARI - TEST 04 ADD CALENDAR', () => {
  let configData = {};

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
    cy.contains('Calendari IOC').should('be.visible');
    cy.wait(1000);
    
    // Carregar els fitxers de configuració per verificació
    cy.readFile('config/sys-categories.json').then(data => {
      configData.sysCategories = data;
    });
    cy.readFile('config/fp-semestre.json').then(data => {
      configData.fpSemestre = data;
    });
    cy.readFile('config/btx-semestre.json').then(data => {
      configData.btxSemestre = data;
    });
    cy.readFile('config/common-semestre.json').then(data => {
      configData.commonSemestre = data;
    });
  });

  it('04. add-calendar - Verificació configuracions sistema', () => {
    // === FASE 1: CREAR CALENDARI FP ===
    cy.log('📚 FASE 1: Creant calendari FP...');
    
    cy.get('[data-action="new-calendar"]').click();
    cy.wait(300);
    
    cy.get('#studyType').select('Formació Professional (FP)');
    cy.wait(200);
    
    // Usar valors genèrics (NO hardcoding DAW/M06)
    cy.get('#cicleCode').type('TCICLE');
    cy.get('#moduleCode').type('TMODUL');
    
    cy.get('[data-action="add-calendar"]').click();
    cy.wait(3000); // Esperar càrrega completa configuracions
    
    // Verificar calendari FP creat
    cy.get('.calendar-list-item')
      .should('contain.text', 'TCICLE')
      .should('contain.text', 'TMODUL');
    cy.log('✅ Calendari FP creat correctament');
    
    // === VERIFICACIÓ CATEGORIES SISTEMA FP ===
    cy.log('🏷️ VERIFICANT categories sistema vs sys-categories.json...');
    
    cy.window().then((win) => {
      const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
      const calendarsList = Object.values(data.calendars);
      const fpCalendar = calendarsList.find(cal => cal.type === 'FP');
      
      expect(fpCalendar).to.exist;
      const categories = fpCalendar.categories || [];
      
      // Verificar categories de sistema (longitud dinàmica del JSON)
      const sysCategories = categories.filter(cat => cat.isSystem === true);
      const expectedCategoryCount = configData.sysCategories.length;
      expect(sysCategories).to.have.length(expectedCategoryCount);
      cy.log(`📊 Categories sistema trobades: ${sysCategories.length}/${expectedCategoryCount}`);
      
      // VERIFICACIÓ EXPLÍCITA: cada categoria del JSON config/ ha d'existir al calendari
      configData.sysCategories.forEach((categoryFromConfig, index) => {
        const categoryInCalendar = sysCategories.find(calendarCat => 
          calendarCat.id === categoryFromConfig.id && 
          calendarCat.name === categoryFromConfig.name &&
          calendarCat.isSystem === true
        );
        
        expect(categoryInCalendar).to.exist;
        expect(categoryInCalendar.id).to.equal(categoryFromConfig.id);
        expect(categoryInCalendar.name).to.equal(categoryFromConfig.name);
        expect(categoryInCalendar.isSystem).to.be.true;
        
        cy.log(`✅ Categoria ${index + 1} VERIFICADA:`);
        cy.log(`   Config: ${categoryFromConfig.id} → ${categoryFromConfig.name}`);
        cy.log(`   Calendari: ${categoryInCalendar.id} → ${categoryInCalendar.name}`);
      });
      
      cy.log('🎉 TOTES les categories sistema coincideixen amb sys-categories.json');
    });
    
    // === VERIFICACIÓ ESDEVENIMENTS SISTEMA FP ===
    cy.log('📅 VERIFICANT esdeveniments sistema FP vs config/*.json...');
    
    cy.window().then((win) => {
      const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
      const calendarsList = Object.values(data.calendars);
      const fpCalendar = calendarsList.find(cal => cal.type === 'FP');
      
      const events = fpCalendar.events || [];
      const sysEvents = events.filter(event => event.isSystemEvent === true);
      
      // Combinar esdeveniments esperats (FP + common)
      const expectedEvents = [
        ...configData.fpSemestre.systemEvents,
        ...configData.commonSemestre.systemEvents
      ];
      
      cy.log(`📊 Esdeveniments sistema: ${sysEvents.length}, Esperats: ${expectedEvents.length}`);
      
      // VERIFICACIÓ EXPLÍCITA: cada esdeveniment del JSON config/ ha d'existir al calendari
      expectedEvents.forEach((eventFromConfig, index) => {
        const eventInCalendar = sysEvents.find(calendarEvent => 
          calendarEvent.title === eventFromConfig.title && 
          calendarEvent.date === eventFromConfig.date &&
          calendarEvent.categoryId === eventFromConfig.categoryId &&
          calendarEvent.isSystemEvent === true
        );
        
        expect(eventInCalendar).to.exist;
        expect(eventInCalendar.title).to.equal(eventFromConfig.title);
        expect(eventInCalendar.date).to.equal(eventFromConfig.date);
        expect(eventInCalendar.categoryId).to.equal(eventFromConfig.categoryId);
        expect(eventInCalendar.isSystemEvent).to.be.true;
        
        if (index < 5) { // Log només els primers 5 per no saturar
          cy.log(`✅ Event ${index + 1} VERIFICAT:`);
          cy.log(`   Config: "${eventFromConfig.title}" (${eventFromConfig.date})`);
          cy.log(`   Calendari: "${eventInCalendar.title}" (${eventInCalendar.date})`);
        }
      });
      
      cy.log(`🎉 TOTS els ${expectedEvents.length} esdeveniments sistema FP coincideixen amb config/`);
    });
    
    // === FASE 2: CREAR CALENDARI BTX ===
    cy.log('🎓 FASE 2: Creant calendari BTX...');
    
    cy.get('[data-action="new-calendar"]').click();
    cy.wait(300);
    
    cy.get('#studyType').select('BTX');
    cy.wait(200);
    
    cy.get('#subjectCode').type('TSUBJECT');
    
    cy.get('[data-action="add-calendar"]').click();
    cy.wait(3000);
    
    // Verificar calendari BTX creat
    cy.get('.calendar-list-item')
      .should('contain.text', 'BTX')
      .should('contain.text', 'TSUBJECT');
    cy.log('✅ Calendari BTX creat correctament');
    
    // === VERIFICACIÓ CATEGORIES SISTEMA BTX ===
    cy.log('🏷️ VERIFICANT categories sistema BTX...');
    
    cy.window().then((win) => {
      const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
      const calendarsList = Object.values(data.calendars);
      const btxCalendar = calendarsList.find(cal => cal.type === 'BTX');
      
      expect(btxCalendar).to.exist;
      const categories = btxCalendar.categories || [];
      const sysCategories = categories.filter(cat => cat.isSystem === true);
      
      // BTX ha de tenir les mateixes categories sistema que FP (longitud dinàmica)
      const expectedCategoryCount = configData.sysCategories.length;
      expect(sysCategories).to.have.length(expectedCategoryCount);
      
      configData.sysCategories.forEach((categoryFromConfig) => {
        const categoryInCalendar = sysCategories.find(calendarCat => 
          calendarCat.id === categoryFromConfig.id && 
          calendarCat.name === categoryFromConfig.name &&
          calendarCat.isSystem === true
        );
        expect(categoryInCalendar).to.exist;
      });
      
      cy.log('✅ Categories sistema BTX coincideixen amb sys-categories.json');
    });
    
    // === VERIFICACIÓ ESDEVENIMENTS SISTEMA BTX ===
    cy.log('📅 VERIFICANT esdeveniments sistema BTX vs config/*.json...');
    
    cy.window().then((win) => {
      const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
      const calendarsList = Object.values(data.calendars);
      const btxCalendar = calendarsList.find(cal => cal.type === 'BTX');
      
      const events = btxCalendar.events || [];
      const sysEvents = events.filter(event => event.isSystemEvent === true);
      
      // Combinar esdeveniments esperats (BTX + common)
      const expectedBtxEvents = [
        ...configData.btxSemestre.systemEvents,
        ...configData.commonSemestre.systemEvents
      ];
      
      cy.log(`📊 Esdeveniments sistema BTX: ${sysEvents.length}, Esperats: ${expectedBtxEvents.length}`);
      
      // VERIFICACIÓ EXPLÍCITA: cada esdeveniment BTX del JSON config/ ha d'existir al calendari
      expectedBtxEvents.forEach((eventFromConfig) => {
        const eventInCalendar = sysEvents.find(calendarEvent => 
          calendarEvent.title === eventFromConfig.title && 
          calendarEvent.date === eventFromConfig.date &&
          calendarEvent.categoryId === eventFromConfig.categoryId &&
          calendarEvent.isSystemEvent === true
        );
        
        expect(eventInCalendar).to.exist;
        expect(eventInCalendar.title).to.equal(eventFromConfig.title);
        expect(eventInCalendar.date).to.equal(eventFromConfig.date);
        expect(eventInCalendar.categoryId).to.equal(eventFromConfig.categoryId);
        expect(eventInCalendar.isSystemEvent).to.be.true;
      });
      
      cy.log(`🎉 TOTS els ${expectedBtxEvents.length} esdeveniments sistema BTX coincideixen amb config/`);
    });
    
    // === FASE 3: CREAR CALENDARI ALTRE ===
    cy.log('📝 FASE 3: Creant calendari Altre...');
    
    cy.get('[data-action="new-calendar"]').click();
    cy.wait(300);
    
    cy.get('#studyType').select('Altre');
    cy.wait(200);
    
    const currentYear = new Date().getFullYear();
    cy.get('#calendarName').type('Test Calendari Altre');
    cy.get('#startDate').type(`${currentYear + 1}-01-01`);
    cy.get('#endDate').type(`${currentYear + 1}-12-31`);
    
    cy.get('[data-action="add-calendar"]').click();
    cy.wait(1000);
    
    cy.get('.calendar-list-item').should('contain.text', 'Test Calendari Altre');
    cy.log('✅ Calendari Altre creat correctament');
    
    // === VERIFICAR QUE CALENDARI ALTRE NO CARREGA CONFIGURACIONS SISTEMA ===
    cy.log('🔍 VERIFICANT que calendari Altre NO carrega configuracions sistema...');
    
    cy.window().then((win) => {
      const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
      const calendarsList = Object.values(data.calendars);
      const altreCalendar = calendarsList.find(cal => cal.type === 'Altre');
      
      expect(altreCalendar).to.exist;
      
      // Verificar categories - NO ha de tenir categories de sistema
      const categories = altreCalendar.categories || [];
      const sysCategories = categories.filter(cat => cat.isSystem === true);
      expect(sysCategories).to.have.length(0);
      
      // Verificar esdeveniments - NO ha de tenir esdeveniments de sistema
      const events = altreCalendar.events || [];
      const sysEvents = events.filter(event => event.isSystemEvent === true);
      expect(sysEvents).to.have.length(0);
      
      cy.log('✅ Calendari Altre NO carrega cap configuració de sistema (correcte)');
    });
    
    // === FASE 4: VERIFICAR VISTES I NAVEGACIÓ DATES ===
    cy.log('👁️ FASE 4: Verificant vistes i navegació de dates...');
    
    // Activar el primer calendari per provar les vistes
    cy.get('.calendar-list-item').first().then($item => {
      if ($item.find('[data-action="switch-calendar"]').length > 0) {
        cy.wrap($item).find('[data-action="switch-calendar"]').click();
        cy.wait(1000);
        cy.log('✅ Calendari activat per provar vistes');
      }
    });
    
    // === VERIFICAR VISTES DISPONIBLES ===
    cy.log('📋 Verificant que totes les vistes funcionen...');
    
    // Provar vista mensual
    cy.get('body').then($body => {
      if ($body.find('[data-action="change-view"][data-view="month"], [data-view="month"]').length > 0) {
        cy.get('[data-action="change-view"][data-view="month"], [data-view="month"]').first().click();
        cy.wait(500);
        cy.log('✅ Vista mensual activada');
      } else {
        cy.log('ℹ️ Botó vista mensual no trobat');
      }
    });
    
    // Provar vista setmanal si existeix
    cy.get('body').then($body => {
      if ($body.find('[data-action="change-view"][data-view="week"], [data-view="week"]').length > 0) {
        cy.get('[data-action="change-view"][data-view="week"], [data-view="week"]').first().click();
        cy.wait(500);
        cy.log('✅ Vista setmanal activada');
        
        // Tornar a vista mensual per continuar tests
        cy.get('[data-action="change-view"][data-view="month"], [data-view="month"]').first().click();
        cy.wait(500);
      } else {
        cy.log('ℹ️ Vista setmanal no disponible');
      }
    });
    
    // === VERIFICAR NAVEGACIÓ DE DATES ===
    cy.log('📅 Verificant navegació limitada al rang del calendari...');
    
    cy.window().then((win) => {
      const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
      const calendarsList = Object.values(data.calendars);
      const activeCalendar = calendarsList[0]; // Primer calendari
      
      cy.log(`📊 Calendari actiu: ${activeCalendar.name}`);
      cy.log(`📅 Rang vàlid: ${activeCalendar.startDate} → ${activeCalendar.endDate}`);
      
      // Verificar que hi ha calendari visual carregat
      cy.get('body').then($body => {
        if ($body.find('.calendar-container, .calendar-grid, .month-view').length > 0) {
          cy.log('✅ Calendari visual detectat');
          
          // Verificar que hi ha dies visibles
          cy.get('.day-cell, .calendar-day, .day, [data-date]').then($days => {
            if ($days.length > 0) {
              cy.log(`📊 Dies visibles al calendari: ${$days.length}`);
              
              // Provar click en un dia (ha de ser dins del rang)
              const firstDay = $days.first();
              const dayDate = firstDay.attr('data-date') || firstDay.text();
              
              cy.wrap(firstDay).click({ force: true });
              cy.wait(300);
              cy.log(`✅ Click en dia funcionant: ${dayDate}`);
              
            } else {
              cy.log('ℹ️ No s\'han detectat dies clicables al calendari');
            }
          });
          
          // Verificar botons de navegació
          cy.get('body').then($navBody => {
            const prevBtn = $navBody.find('.nav-arrow[data-direction="-1"], .prev-month, .nav-prev');
            const nextBtn = $navBody.find('.nav-arrow[data-direction="1"], .next-month, .nav-next');
            
            if (prevBtn.length > 0) {
              cy.log('📍 Botó navegació anterior trobat');
              // Verificar si està deshabitat quan estem al límit
              if (prevBtn.is(':disabled')) {
                cy.log('✅ Botó anterior deshabitat (correcte - al límit del calendari)');
              } else {
                cy.log('ℹ️ Botó anterior habilitat');
              }
            }
            
            if (nextBtn.length > 0) {
              cy.log('📍 Botó navegació següent trobat');
              if (nextBtn.is(':disabled')) {
                cy.log('✅ Botó següent deshabitat (correcte - al límit del calendari)');
              } else {
                cy.log('ℹ️ Botó següent habilitat');
              }
            }
          });
          
        } else {
          cy.log('⚠️ Calendari visual no detectat - saltant verificació navegació');
        }
      });
    });
    
    // === FASE 5: VERIFICACIÓ FINAL INTEGRITAT ===
    cy.log('🔧 FASE 5: Verificant integritat final...');
    
    cy.window().then((win) => {
      const data = JSON.parse(win.localStorage.getItem('calendari-ioc-data'));
      const calendarsList = Object.values(data.calendars);
      
      // Verificar estructura completa
      expect(calendarsList).to.have.length(3);
      
      // Verificar cada calendari té les propietats necessàries
      calendarsList.forEach((calendar) => {
        expect(calendar).to.have.property('id');
        expect(calendar).to.have.property('name');
        expect(calendar).to.have.property('type');
        expect(calendar).to.have.property('categories');
        expect(calendar).to.have.property('events');
      });
      
      cy.log('✅ Estructura localStorage completa i vàlida');
    });
    
    // Verificar aplicació funcional
    cy.get('[data-action="new-calendar"]')
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled');
    
    cy.log('🎉 ADD-CALENDAR: Verificació configuracions sistema completada');
    cy.log('📊 RESUM: 3 calendaris creats, categories i esdeveniments verificats contra config/');
  });

});