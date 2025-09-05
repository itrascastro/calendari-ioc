// =================================================================
// COMPACT CALENDAR STYLES - ESTILS CSS PER A EXPORTACIÓ HTML (VISTA COMPACTA)
// =================================================================

// Estils CSS autònoms per exportar la vista compacta a HTML
// No depenen de variables del tema ni fitxers externs
const compactCalendarCssStyles = `
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
        font-family: Arial, Helvetica, sans-serif;
        line-height: 1.4;
        color: #333;
        background-color: #f8f9fa;
    }

    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }

    .calendar-header { text-align: center; margin-bottom: 30px; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .calendar-header h1 { font-size: 2em; color: #4f5d95; margin-bottom: 10px; }
    .period { font-size: 1.1em; color: #6c757d; }

    .legend { background: white; padding: 20px; margin-bottom: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .legend h3 { margin-bottom: 15px; color: #4f5d95; }
    .legend-items { display: flex; flex-wrap: wrap; gap: 15px; }
    .legend-item { display: flex; align-items: center; gap: 8px; }
    .legend-color { width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0; }

    /* Disposició general (export) */
    .compact-view-export { display: block; max-width: 100%; font-size: 0.9em; }

    /* Headers integrats amb columna Mes i Set. */
    .compact-headers-row { display: grid; grid-template-columns: 60px repeat(7, 12px 1fr) 30px; gap: 0; background-color: #dee2e6; border-bottom: 1px solid #dee2e6; }
    .compact-month-header-spacer, .compact-week-header { background: #f8f9fa; padding: 6px 4px; font-weight: 700; color: #495057; font-size: 0.8em; text-align: center; }
    .compact-day-header { background: #e9ecef; padding: 6px 4px; text-align: center; font-weight: 700; color: #495057; font-size: 0.85em; grid-column: span 2; border-right: 1px solid #dee2e6; }

    /* Grid unificat: Mes | (Nº dia + cel·la)x7 | Set. */
    .compact-unified-grid { display: grid; grid-template-columns: 60px repeat(7, 12px 1fr) 30px; gap: 0; background-color: #dee2e6; }
    .compact-month-cell { background: #fff; border: 1px solid #dee2e6; display: flex; align-items: center; justify-content: center; writing-mode: horizontal-tb; text-align: center; padding: 2px 4px; font-size: 10px; font-weight: 600; color: #495057; }
    .compact-day-number { background: #f8f9fa; border: 1px solid #dee2e6; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #495057; font-size: 11px; }
    .compact-day-cell { background: #fff; border: 1px solid #dee2e6; min-height: 18px; padding: 2px; display: flex; flex-direction: column; overflow: hidden; }
    .compact-day-cell.empty { background: #f8f9fa; }
    .compact-week-number { background: #f8f9fa; border: 1px solid #dee2e6; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #495057; font-size: 11px; }

    .compact-events-container { display: flex; flex-direction: column; gap: 1px; }
    .compact-event { font-size: 9px; padding: 1px 2px; border-radius: 2px; color: white; line-height: 1.15; word-wrap: break-word; overflow-wrap: break-word; hyphens: auto; }
    .compact-event.system { font-style: italic; }

    .calendar-footer { text-align: center; margin-top: 30px; padding: 15px; color: #6c757d; font-size: 0.9em; background: white; border-radius: 8px; }

    @media print { body { background: white; } .container { max-width: none; } .compact-day-cell { min-height: 16px; } }
`;
