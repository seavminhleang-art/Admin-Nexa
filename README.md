# NEXA Admin

Standalone administrator frontend extracted from AskKh-project. Opens at admin sign-in, then the dashboard; no public landing page or registration.

## Local development

Requires Node.js 22.12+ and npm.

```sh
npm ci
cp .env.example .env
npm run dev -- --port 5174
```

Open http://localhost:5174. Use an existing backend administrator account. Regular accounts see an access-denied message and can sign out to use another account. Existing admin sessions restore after reload. Admin session storage is separate from the user application's storage.

```sh
npm run build
npm run lint
```

## Connection to the user app

Both apps call the same backend and therefore share backend data. They do not communicate directly or share frontend sessions. Admin changes are visible to users when their data is fetched again.

The browser calls `/__forum_api`. Vite proxies requests to `VITE_API_BASE_URL` during development. On Vercel, `vercel.json` forwards that path to the existing production API. If the backend changes, update both the development environment and the Vercel rewrite. Other hosting providers need the equivalent API proxy and SPA fallback.

The backend must validate tokens and enforce admin permissions on every privileged endpoint. The frontend reads the existing JWT `role`/`roles` claims only to control navigation. A separate repository does not grant admin privileges.

## Deployment

Import this repository as a separate Vercel project using Vite, build command `npm run build`, and output directory `dist`. The committed rewrite supports dashboard deep links and the API proxy. No Firebase configuration is needed for this email/password admin login. Never commit `.env` or server credentials.

## Scope

Reuses the existing admin dashboard and resource screens, including their existing backend support and limitations. Settings and marketplace functionality depend on what those screens and the backend currently implement. The original user repository is unchanged by this extraction.
