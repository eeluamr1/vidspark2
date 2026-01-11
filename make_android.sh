#!/usr/bin/env bash
set -euo pipefail

cd frontend
npm install
npm run build
npm run cap:init || true
npm run cap:add:android || true
npm run cap:sync
npm run cap:open:android
