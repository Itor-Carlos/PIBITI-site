#!/usr/bin/env bash
# Abre o site de apresentação no navegador do Windows a partir do WSL.
# Uso: ./abrir-site.sh [porta]

set -e

cd "$(dirname "$0")"
PORT="${1:-8000}"

echo "Servindo o site em http://localhost:${PORT}"
echo "Feche esta janela (ou pressione Ctrl+C) para encerrar o servidor."

# Abre o navegador padrão do Windows, quando disponível.
if command -v powershell.exe >/dev/null 2>&1; then
  powershell.exe -NoProfile -Command "Start-Process 'http://localhost:${PORT}'" >/dev/null 2>&1 || true
elif command -v cmd.exe >/dev/null 2>&1; then
  cmd.exe /c start "http://localhost:${PORT}" >/dev/null 2>&1 || true
else
  echo "Abra manualmente no Windows: http://localhost:${PORT}"
fi

exec python3 -m http.server "${PORT}" --bind 0.0.0.0
