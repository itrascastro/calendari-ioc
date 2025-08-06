#!/bin/bash

# Script de desplegament automàtic a GitHub Pages
# Segueix el procediment documentat a dev-resources/doc/procedimiento-despliegue.html
# Actualitzat per usar 'main' com a rama principal (en lloc de master)

set -e  # Sortir si qualsevol comandament falla

# Colors per als missatges
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con emojis
show_message() {
    echo -e "${BLUE}$1${NC} $2"
}

show_success() {
    echo -e "${GREEN}$1${NC} $2"
}

show_warning() {
    echo -e "${YELLOW}$1${NC} $2"
}

show_error() {
    echo -e "${RED}$1${NC} $2"
}

# Variables
REPO_URL="https://github.com/itrascastro/itrascastro.github.io.git"
TEMP_DIR="/tmp/itrascastro.github.io"
TARGET_DIR="ioc/calendari-ioc"
PROJECT_DIR=$(pwd)

show_message "🚀" "Iniciant desplegament a GitHub Pages..."

# Pas 1: Clonar el repositori de GitHub Pages
show_message "📥" "Clonant repositori de GitHub Pages..."
if [ -d "$TEMP_DIR" ]; then
    show_warning "⚠️" "Eliminant directori temporal existent..."
    rm -rf "$TEMP_DIR"
fi

git clone "$REPO_URL" "$TEMP_DIR"

if [ ! -d "$TEMP_DIR" ]; then
    show_error "❌" "Error: No s'ha pogut clonar el repositori"
    exit 1
fi

# Pas 2: Verificar que el directori de destí existeix
show_message "📁" "Verificant directori de destí..."
if [ ! -d "$TEMP_DIR/$TARGET_DIR" ]; then
    show_warning "⚠️" "Creant directori de destí: $TARGET_DIR"
    mkdir -p "$TEMP_DIR/$TARGET_DIR"
fi

# Pas 3: Eliminar contingut existent del directori de destí
show_message "🧹" "Eliminant contingut existent..."
rm -rf "$TEMP_DIR/$TARGET_DIR"/*

# Pas 4: Copiar fitxers de l'aplicació
show_message "📋" "Copiant fitxers de l'aplicació..."

# Verificar que els fitxers existeixen abans de copiar
files_to_copy=("index.html" "css" "img" "js" "config" "favicon.ico")
missing_files=()

for file in "${files_to_copy[@]}"; do
    if [ ! -e "$PROJECT_DIR/$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    show_error "❌" "Error: Fitxers faltants:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    show_error "❌" "Netejant i sortint..."
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Copiar fitxers
for file in "${files_to_copy[@]}"; do
    if [ -e "$PROJECT_DIR/$file" ]; then
        cp -r "$PROJECT_DIR/$file" "$TEMP_DIR/$TARGET_DIR/"
        show_success "✅" "Copiat: $file"
    fi
done

# Pas 5: Configurar Git i fer commit
show_message "⚙️" "Configurant Git..."
cd "$TEMP_DIR"

# Configurar identitat de Git per aquest repositori
git config user.name "itrascastro"
git config user.email "itrascastro@gmail.com"

# Verificar que hi ha canvis per cometre
if git diff --quiet && git diff --cached --quiet; then
    show_warning "⚠️" "No hi ha canvis per desplegar"
    rm -rf "$TEMP_DIR"
    exit 0
fi

# Afegir tots els canvis
show_message "📦" "Afegint canvis..."
git add .

# Crear commit amb timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
COMMIT_MESSAGE="Deploy: Actualització de l'aplicació Calendari IOC - $TIMESTAMP"

show_message "💾" "Creant commit..."
git commit -m "$COMMIT_MESSAGE"

# Pas 6: Pujar canvis a GitHub
show_message "Pujant canvis a GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    show_success "✅" "Desplegament completat amb èxit!"
else
    show_error "❌" "Error durant el push. Verificar credencials i permisos."
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Pas 7: Neteja
show_message "🧹" "Netejant fitxers temporals..."
cd "$PROJECT_DIR"
rm -rf "$TEMP_DIR"

# Missatge final
show_success "🌐" "Aplicació desplegada a: https://itrascastro.github.io/ioc/calendari-ioc/"
show_message "⏰" "Pot trigar uns minuts a estar disponible degut a la cache de GitHub Pages"

echo ""
show_success "🎉" "Desplegament finalitzat correctament!"