#!/bin/bash

set -euo pipefail

# Load environment variables
if [ -f .env ]; then
  source .env
fi

# Validate required environment variables
required_vars=("DATABASE_URL" "PORT" "JWT_SECRET" "SESSION_SECRET")
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Error: Environment variable '$var' is not set." >&2
    exit 1
  fi
done

# Project directories
PROJECT_ROOT=$(pwd)
API_DIR="${PROJECT_ROOT}/packages/api"
WEB_DIR="${PROJECT_ROOT}/apps/web"

# Log file
LOG_FILE="/var/log/fitness-tracker.log"

# PID files
API_PID_FILE="/var/run/fitness-tracker-api.pid"
WEB_PID_FILE="/var/run/fitness-tracker-web.pid"


# Function to log info messages
log_info() {
  echo "$(date +'%Y-%m-%d %H:%M:%S') INFO: $1" >> "${LOG_FILE}"
}

# Function to log error messages
log_error() {
  echo "$(date +'%Y-%m-%d %H:%M:%S') ERROR: $1" >&2
}

# Cleanup function
cleanup() {
  if [ -f "${API_PID_FILE}" ]; then
    kill $(cat "${API_PID_FILE}") 2>/dev/null
    rm "${API_PID_FILE}"
  fi
  if [ -f "${WEB_PID_FILE}" ]; then
    kill $(cat "${WEB_PID_FILE}") 2>/dev/null
    rm "${WEB_PID_FILE}"
  fi
}

# Trap signals
trap cleanup EXIT ERR

#Check if the database is up
until nc -z localhost 5432; do
    log_info "Waiting for PostgreSQL database..."
    sleep 5
done
log_info "PostgreSQL database is up."


# Start backend
cd "${API_DIR}" || exit 1
npm run build:backend
npm run start:prod:backend &
API_PID=$!
store_pid "${API_PID_FILE}" "${API_PID}"

# Wait for backend to start
wait_for_service "localhost:${PORT}"

# Start frontend
cd "${WEB_DIR}" || exit 1
npm run build:frontend
npm run start:prod:frontend &
WEB_PID=$!
store_pid "${WEB_PID_FILE}" "${WEB_PID}"


# Function to store PID
store_pid() {
  echo "$2" > "$1"
}

# Function to wait for a service
wait_for_service() {
  local host_port=$1
  local timeout=30
  local check_interval=2
  local count=0
  until nc -z "$host_port" ; do
        count=$((count+1))
        if (( count > timeout / check_interval )); then
            log_error "Timeout waiting for service $host_port"
            exit 1
        fi
        sleep "$check_interval"
  done
}


log_info "Fitness Goal Tracker MVP started successfully."
wait $API_PID $WEB_PID

```