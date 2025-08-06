#!/bin/bash

# Script per configurar GitHub Wiki automàticament
# Executa aquest script després d'activar la Wiki al repositori GitHub

echo "🚀 Configurant GitHub Wiki per Calendari IOC..."

# Configurar credencials de Git
echo "⚙️ Configurant credencials de Git..."
git config --global user.email "itrascastro@gmail.com"
git config --global user.name "itrascastro"

# Verifica que estem al directori correcte
if [ ! -d "docs/wiki" ]; then
    echo "❌ Error: No es troba la carpeta docs/wiki"
    echo "   Executa aquest script des del directori arrel del projecte"
    exit 1
fi

# Netejar directori anterior si existeix
if [ -d "temp-wiki" ]; then
    echo "🧹 Netejant directori temporal anterior..."
    rm -rf temp-wiki
fi

# Clona el repositori wiki
echo "📥 Clonant repositori wiki..."
git clone https://github.com/itrascastro/ioc-modul-calendari.wiki.git temp-wiki

# Verifica que la clonació ha funcionat
if [ ! -d "temp-wiki" ]; then
    echo "❌ Error: No s'ha pogut clonar el repositori wiki"
    echo "   Assegura't que has activat la Wiki al repositori GitHub primer"
    exit 1
fi

# Copia tots els fitxers markdown
echo "📋 Copiant fitxers de documentació..."
cp docs/wiki/*.md temp-wiki/

# Crea sidebar per navegació
echo "📐 Creant sidebar de navegació..."
cat > temp-wiki/_Sidebar.md << 'EOF'
## Usuaris Finals
- [Guia d'Inici Ràpid](Guia-d-Inici-Rapid)
- [Creació de Calendaris](Creació-de-Calendaris)
- [Gestió d'Esdeveniments](Gestió-d-Esdeveniments)

## Administradors
- [Configuració Semestral](Configuració-Semestral)

## Desenvolupadors
- [Arquitectura General](Arquitectura-General)
- [Patrons Arquitectònics](Patrons-Arquitectònics-Detallats)
- [Referència Managers](managers-Referència)
- [Referència State](state-Referència)
EOF

# Crea footer
echo "🔗 Creant footer..."
cat > temp-wiki/_Footer.md << 'EOF'
**Calendari IOC** | [Repositori](https://github.com/itrascastro/ioc-modul-calendari) | **Autor**: Ismael Trascastro (itrascastro@ioc.cat)
EOF

# Puja els canvis
echo "📤 Pujant canvis a GitHub Wiki..."
cd temp-wiki

# Afegir tots els fitxers primer
git add .

# Verificar que hi ha canvis per pujar
if git diff --cached --quiet; then
    echo "ℹ️ No hi ha canvis nous per pujar"
else
    echo "💾 Creant commit..."
    git commit -m "Afegir documentació completa del Calendari IOC

- Documentació per usuaris finals: guia d'inici, creació calendaris, gestió esdeveniments
- Documentació per administradors: configuració semestral 
- Documentació tècnica: arquitectura, patrons, referències APIs
- Sidebar i footer per navegació
- Format net i professional"
    
    echo "🚀 Pujant a GitHub..."
    git push
fi

# Neteja
cd ..
rm -rf temp-wiki

echo "✅ Wiki configurada correctament!"
echo "🌐 Accedeix a: https://github.com/itrascastro/ioc-modul-calendari/wiki"