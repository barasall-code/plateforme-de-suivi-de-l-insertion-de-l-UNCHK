#!/bin/bash

echo "=================================================="
echo "   PLATEFORME UNCHK - Demarrage Local"
echo "=================================================="
echo ""
echo "  Base de donnees : PostgreSQL local (port 5432)"
echo "  Backend API     : http://localhost:3001"
echo "  Frontend        : http://localhost:5173"
echo "=================================================="
echo ""

# Dossier du projet
PROJECT_DIR="$HOME/plateforme-de-suivi-de-l-insertion-de-l-UNCHK"

# Verifier que PostgreSQL tourne
echo "[>>] Verification de PostgreSQL..."
if ! pg_isready -h localhost -q 2>/dev/null; then
  echo "[!] Demarrage de PostgreSQL..."
  brew services start postgresql@16
  sleep 3
else
  echo "[OK] PostgreSQL demarre"
fi

# Tuer les anciens processus
echo "[>>] Nettoyage des anciens processus..."
pkill -f "nodemon" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 1

# Demarrer le Backend dans un nouveau terminal
echo "[>>] Demarrage du Backend..."
osascript -e "tell application \"Terminal\" to do script \"cd $PROJECT_DIR/backend && npm run dev\""

sleep 3

# Demarrer le Frontend dans un nouveau terminal
echo "[>>] Demarrage du Frontend..."
osascript -e "tell application \"Terminal\" to do script \"cd $PROJECT_DIR/frontend && npm run dev\""

sleep 3

echo ""
echo "[OK] Plateforme UNCHK demarree !"
echo ""
echo "  Backend  : http://localhost:3001/api/health"
echo "  Frontend : http://localhost:5173"
echo ""

# Ouvrir le navigateur
open http://localhost:5173
