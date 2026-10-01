# Local setup

This copy has a Next.js 12 frontend and an Express 4 / Mongoose 6 backend. Both use npm lockfiles. No Node version is declared; Node 24.18.0 was available during setup, but this older Next.js release should be tested with a supported Node LTS if the build fails. No MQTT or WebSocket service appears in the supplied code. Password reset uses SMTP.

## Install and run (PowerShell)

From `frontend`: `npm ci --legacy-peer-deps`, then `npm run build`, `npm run lint`, and `npm run dev`. The UI is at `http://localhost:3000`.

From `backend`: `npm ci`, then `npm run check:db`, and `npm start` (or `npm run server` for nodemon). The API is at `http://localhost:5000`. No local MongoDB installation is needed.

The frontend sends requests to `/api/...`; Next.js proxies them to `BACKEND_URL`, which defaults to `http://127.0.0.1:5000` on the frontend server. Set `frontend/.env.local` from `.env.local.example` when the backend runs elsewhere, then restart Next.js. If accessing the UI from another computer, visit the server's reachable hostname or IP rather than `localhost`. The backend must be reachable from the **frontend server** at `BACKEND_URL`.

## Atlas

1. Create an Atlas cluster, selecting Google Cloud if offered for the chosen tier and region.
2. Create a database user with read/write access to the `police_rental` database. Avoid broader access unless the application needs it.
3. Add the backend machine's public outbound IP to Atlas Project IP Access List. Do not use `0.0.0.0/0` as the default.
4. In Connect > Drivers, select Node.js and copy the connection string. This machine's Node DNS resolver refused the SRV lookup, so its ignored `backend/.env` currently uses Atlas's standard `mongodb://` URI built from the cluster's SRV and TXT records. Atlas shard hosts can change; refresh the URI from Atlas if the cluster topology changes.
5. In `backend/.env`, set `MONGO_URI` to the URI with the database user's credentials. Percent-encode special characters in URI credentials. Set `MONGO_DB_NAME=police_rental` (or the intended database name), `JWT_SECRET` to a strong secret, and `PORT=5000`. This file is excluded by `.gitignore`. Never place this URI in the frontend. The database password was exposed in chat; rotate it in Atlas and update this file afterward.
6. Run `npm run check:db` from `backend`. It uses the same pooled Mongoose connection as the server, pings Atlas, then reads one station's `station_name` from the existing `station` collection. Queries operate on data after the driver establishes a connection. No writes are made.

For password recovery, also configure `SMTP_SERVICE`, `SMTP_USER`, and `SMTP_PASSWORD` in `backend/.env`. The previous source contained an embedded mail password: rotate that credential if it was valid. `FRONTEND_ORIGIN` is needed only for direct cross-origin browser calls; same-origin requests through the Next.js proxy do not need browser CORS.

## API checks

Once the missing controller files are restored and Atlas is configured, a read-only database-backed endpoint is `GET http://localhost:5000/api/hotel/stations`. PowerShell: `Invoke-RestMethod http://localhost:5000/api/hotel/stations`. The same request through the frontend proxy is `Invoke-RestMethod http://localhost:3000/api/hotel/stations`. Protected endpoints require the application's JWT; do not bypass authentication for testing.

## Current verification

The missing tenant and superadmin controllers were reconstructed from the existing routes and models; their original behavior cannot be compared because the source files were absent. Frontend dependencies are installed, and the build and lint passed during setup. With `154.208.32.128/28` added to Atlas, `npm run check:db` passed the ping and a read-only station query. The home and login pages returned HTTP 200. After the demo seed, `GET /api/hotel/stations` through the frontend proxy returned 50 stations, and all four role logins and protected dashboard or stats calls passed. See `DEMO_DATA.md` and the ignored `.run/demo-logins.json` and `.run/test-logins.json` files for synthetic accounts. Local processes write logs under `.run`.
