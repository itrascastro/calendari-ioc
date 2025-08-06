const { defineConfig } = require('cypress')
const fs = require('fs')
const path = require('path')
const glob = require('glob')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:8000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: false, // Desactivar support file per evitar problemes
    viewportWidth: 2560,
    viewportHeight: 1440,
    defaultCommandTimeout: 10000,
    video: false, // Desactivar video per simplificar
    screenshotOnRunFailure: true,
    downloadsFolder: 'cypress/downloads',
    trashAssetsBeforeRuns: false, // No eliminar downloads
    setupNodeEvents(on, config) {
      // Task per trobar fitxers descarregats
      on('task', {
        findDownloadedFiles({ pattern }) {
          const downloadsPath = path.join(__dirname, 'cypress/downloads')
          
          try {
            if (!fs.existsSync(downloadsPath)) {
              console.log(`📁 Carpeta downloads no existeix: ${downloadsPath}`)
              return []
            }
            
            const files = glob.sync(pattern, { cwd: downloadsPath })
              .map(file => path.join(downloadsPath, file))
              .sort((a, b) => fs.statSync(a).mtime - fs.statSync(b).mtime) // Ordenar per data
            
            console.log(`📁 Fitxers trobats: ${files.length}`)
            files.forEach(file => console.log(`   📄 ${path.basename(file)}`))
            
            return files
          } catch (error) {
            console.log(`❌ Error buscant fitxers: ${error.message}`)
            return []
          }
        }
      })
    }
  },
})