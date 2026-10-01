# Demo data and logins

The Atlas `police_rental` database contains 50 synthetic records in each existing collection: `station`, `tenant`, `hotel`, `residence`, `room`, and `superadmins`. The residences reference the demo tenants and stations; the rooms reference the demo hotels. Some residences, hotels, and rooms have different verification and active states so the dashboards show varied counts.

Open `.run/demo-logins.json` for the four role login URLs, first account emails, and passwords. The same password for a role works for that role's accounts numbered `01` through `50` (for example, `hotel01@demo.invalid` through `hotel50@demo.invalid`). This file is local and excluded by `.gitignore`. The addresses are synthetic and cannot receive password-reset email.

The seed command is `npm run seed:demo` from `backend`. It uses deterministic demo IDs and updates only those records, so rerunning it does not create duplicates or delete other application data. It reuses passwords saved in `.run/demo-logins.json`.

The requested personal test account was also created for both `taqadasurrehman@gmail.com` and `taqadasurrehman@gmil.com` in the tenant, hotel, police, and superadmin roles. The same requested password works for both spellings and all four roles. Full login details are stored locally in `.run/test-logins.json`; that file is ignored by Git. Each account has a linked test residence or hotel room where applicable. To recreate these accounts in another database, create `.run/test-login-request.json` at the project root with an `emails` array of the two addresses and a `password` string, then run `npm run seed:test-logins` from `backend`.

The Git repository contains the seed scripts and documentation. Atlas records and local credential files stay in the database and on this machine; running the seed scripts recreates the synthetic data in a configured database.

Verified through the frontend proxy: tenant, hotel, police, and superadmin login; an authenticated dashboard or stats request for each role; and a station list containing 50 entries. The superadmin stats returned 50 tenants, 50 stations, and 40 active guests.
