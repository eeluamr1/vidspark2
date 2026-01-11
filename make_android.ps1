Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

cd frontend
npm install
npm run build
npm run cap:init
npm run cap:add:android
npm run cap:sync
npm run cap:open:android
