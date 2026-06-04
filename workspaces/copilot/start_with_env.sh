#!/usr/bin/env bash
set -euo pipefail
set -a
if [ ! -f .env ]; then
  echo "Error: .env file not found" >&2
  exit 1
fi
source .env
set +a

yarn start
