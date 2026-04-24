#!/bin/bash

# ============================================================
# Museum & Cultural Institution Manager - Start Script
# ============================================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PORT=4000
FRONTEND_PORT=3000

echo "============================================================"
echo "  Museum & Cultural Institution Manager"
echo "  Starting Application..."
echo "============================================================"
echo ""

# --------------------------------------------------
# 1. Clean up used ports
# --------------------------------------------------
echo "[1/5] Cleaning up ports $BACKEND_PORT and $FRONTEND_PORT..."

kill_port() {
  local port=$1
  local pids=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "  Killing processes on port $port: $pids"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  else
    echo "  Port $port is free"
  fi
}

kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT

# --------------------------------------------------
# 2. Check PostgreSQL is running
# --------------------------------------------------
echo ""
echo "[2/5] Checking PostgreSQL..."

if ! command -v psql &> /dev/null; then
  echo "  ERROR: PostgreSQL is not installed. Please install it first."
  exit 1
fi

if ! pg_isready -q 2>/dev/null; then
  echo "  Starting PostgreSQL..."
  brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || {
    echo "  ERROR: Could not start PostgreSQL. Please start it manually."
    exit 1
  }
  sleep 2
fi
echo "  PostgreSQL is running"

# --------------------------------------------------
# 3. Create database if not exists
# --------------------------------------------------
echo ""
echo "[3/5] Setting up database..."

DB_NAME="museum_manager"
if psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  echo "  Database '$DB_NAME' already exists"
else
  echo "  Creating database '$DB_NAME'..."
  createdb "$DB_NAME" 2>/dev/null || psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || {
    echo "  WARNING: Could not create database. It may already exist or need different credentials."
  }
fi

# --------------------------------------------------
# 4. Install dependencies and seed database
# --------------------------------------------------
echo ""
echo "[4/5] Installing dependencies and seeding data..."

# Backend dependencies
cd "$PROJECT_DIR/backend"
if [ ! -d "node_modules" ]; then
  echo "  Installing backend dependencies..."
  npm install
else
  echo "  Backend dependencies already installed"
fi

# Seed database
echo "  Seeding database with sample data..."
node seed.js

# Frontend dependencies
cd "$PROJECT_DIR/frontend"
if [ ! -d "node_modules" ]; then
  echo "  Installing frontend dependencies..."
  npm install
else
  echo "  Frontend dependencies already installed"
fi

# --------------------------------------------------
# 5. Start backend and frontend with hot reload
# --------------------------------------------------
echo ""
echo "[5/5] Starting servers with hot reload..."
echo ""

# Start backend with --watch for hot reload
cd "$PROJECT_DIR/backend"
echo "  Starting backend on port $BACKEND_PORT (with hot reload)..."
node --watch server.js &
BACKEND_PID=$!

# Start frontend with Vite (has HMR built-in)
cd "$PROJECT_DIR/frontend"
echo "  Starting frontend on port $FRONTEND_PORT (with HMR)..."
npx vite --port $FRONTEND_PORT &
FRONTEND_PID=$!

echo ""
echo "============================================================"
echo "  Application is starting!"
echo ""
echo "  Frontend:  http://localhost:$FRONTEND_PORT"
echo "  Backend:   http://localhost:$BACKEND_PORT"
echo ""
echo "  Login:     admin@museum.org / password123"
echo ""
echo "  Press Ctrl+C to stop all services"
echo "============================================================"
echo ""

# Trap to clean up on exit
cleanup() {
  echo ""
  echo "Shutting down..."
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  echo "Done. Goodbye!"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
