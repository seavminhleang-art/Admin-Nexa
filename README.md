# NEXA Admin

Standalone administrator frontend extracted from AskKh-project. Opens at admin sign-in, then the dashboard; no public landing page or registration.

## Local development

Requires Node.js 22.12+ and npm.

```sh
npm ci
cp .env.example .env
npm run dev -- --port 5174
```

Open http://localhost:5174. Use any existing backend account with a valid email and password. Login and workspace access do not require a specific role. Existing sessions restore after reload. Admin session storage is separate from the user application's storage.

```sh
npm run build
npm run lint
```

## Connection to the user app

Both apps call the same backend and therefore share backend data. They do not communicate directly or share frontend sessions. Admin changes are visible to users when their data is fetched again.

The browser calls `/__forum_api`. Vite proxies requests to `VITE_API_BASE_URL` during development. On Vercel, `vercel.json` forwards that path to the existing production API. If the backend changes, update both the development environment and the Vercel rewrite. Other hosting providers need the equivalent API proxy and SPA fallback.

The backend must validate tokens and enforce admin permissions on every privileged endpoint. The frontend retains existing JWT `role`/`roles` claims as account metadata, without using them to block login or workspace access. A separate repository does not grant admin privileges.

## Role permissions

Admin permissions extend User permissions: administrators can perform the same ordinary actions as users, plus access Get users and other administrative operations. Shared actions use the same backend endpoints and the signed-in account's token; they do not require switching to a User account.

The standalone workspace requires an authenticated session, with no role-specific entry condition. User listing and management remain subject to backend authorization. An authenticated User can enter the workspace but may receive an authorization error from administrative endpoints.

Role permissions and record ownership are separate. Shared post/comment editing and deletion retain the existing ownership checks unless the backend explicitly supports an administrator override. A shared action such as viewing or updating a profile always applies to the signed-in account.

## Deployment

Import this repository as a separate Vercel project using Vite, build command `npm run build`, and output directory `dist`. The committed rewrite supports dashboard deep links and the API proxy. No Firebase configuration is needed for this email/password admin login. Never commit `.env` or server credentials.

## Scope

The sidebar exposes Dashboard, Moderation, Location, Claim Log, Leaderboard, User Management, and Setting. Additional resource screens remain available through workspace search and their routes.

Supported writes include category/location/report creation, post/comment/tag management, user deletion, claim and match decisions, notification read state, profile updates, and password changes. Content ownership and administrator permissions are enforced by the backend. Record details use a labeled, responsive layout.

Verified against the backend OpenAPI contract at `/api/v1/v3/api-docs`. Marketplace endpoints, user role changes, and location/category/report edit or delete operations are absent from that contract and are not fabricated in the frontend. Leaderboard ranks the loaded users by reputation; it is not a dedicated backend ranking endpoint.

Run `npm test`, `npm run lint`, and `npm run build` for local verification. Live authenticated actions require a backend administrator account.

The Claim Log displays fetched reports as searchable photo cards with Lost/Found and category filters, CSV export of filtered loaded records, report registration, and a selected-report details panel. Claims and matches are requested only when the report userId matches the signed-in profile. NFC tracking, vault state, and a dedicated complete-return action are not provided by the backend contract.
