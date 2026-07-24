#!/usr/bin/env bash
set -Eeuo pipefail
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)";BACKEND_PORT="${BACKEND_PORT:-4000}";FRONTEND_PORT="${FRONTEND_PORT:-3000}";JWT_SECRET_VALUE="${JWT_SECRET:-}"
[[ -f "$PROJECT_DIR/.env" ]] || { echo "Missing required file: $PROJECT_DIR/.env" >&2; exit 1; }
set -a
# shellcheck disable=SC1091
. "$PROJECT_DIR/.env"
set +a
BACKEND_PORT="${BACKEND_PORT:-4000}";FRONTEND_PORT="${FRONTEND_PORT:-3000}";JWT_SECRET_VALUE="${JWT_SECRET:-}"
if [[ ! -d "$PROJECT_DIR/backend/node_modules" || ! -d "$PROJECT_DIR/frontend/node_modules" ]];then echo "Dependencies are absent. Run ./scripts/bootstrap.sh explicitly." >&2;exit 1;fi
if [[ -z "${DATABASE_URL:-}" ]];then echo "DATABASE_URL is required." >&2;exit 1;fi
if [[ "${#JWT_SECRET_VALUE}" -lt 32 ]];then echo "JWT_SECRET must contain at least 32 characters." >&2;exit 1;fi
for port in "$BACKEND_PORT" "$FRONTEND_PORT";do if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1;then echo "Port $port is occupied; no process was terminated." >&2;exit 1;fi;done
(cd "$PROJECT_DIR/backend"&&BACKEND_PORT="$BACKEND_PORT" npm start)& backend_pid=$!
(cd "$PROJECT_DIR/frontend"&&npm run dev -- --host 127.0.0.1 --port "$FRONTEND_PORT")& frontend_pid=$!
cleanup(){ kill "$backend_pid" "$frontend_pid" 2>/dev/null||true;wait "$backend_pid" "$frontend_pid" 2>/dev/null||true;};trap cleanup EXIT INT TERM;wait "$backend_pid"
