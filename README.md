# Job Tracker

A small React app for tracking job applications — company, role, status, work type, location, and notes — with search, filtering, and sorting.

## Stack

- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) primitives
- [axios](https://axios-http.com/) for talking to the backend API

## Getting started

Requires Node.js 20.19+ or 22.12+ (CI runs on Node 22).

```bash
npm install
```

The app expects a backend API to be running — see the `Job-tracker-backend` repo. By default it
points at `http://localhost:8080`; override with a `VITE_API_BASE_URL` env var (e.g. in `.env.local`)
if your backend runs elsewhere.

```bash
npm run dev
# app on http://localhost:5173
```

## Docker

A multi-stage `Dockerfile` builds the app with Vite and serves the static output with nginx.

```bash
docker build -t job-tracker-frontend --build-arg VITE_API_BASE_URL=https://your-api .
docker run -p 8080:80 job-tracker-frontend
# app on http://localhost:8080
```

`VITE_API_BASE_URL` is inlined into the JS bundle at build time (Vite env vars aren't read at
runtime), so it must be passed as a `--build-arg`, not a `docker run -e`. nginx is configured
(`nginx.conf`) with an SPA fallback so client-side routes work on a hard refresh.

## Scripts

| Script                 | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start the Vite dev server                |
| `npm run build`        | Production build to `dist/`              |
| `npm run preview`      | Preview the production build locally     |
| `npm run lint`         | Run ESLint                               |
| `npm run format`       | Format the codebase with Prettier        |
| `npm run format:check` | Check formatting without writing changes |
| `npm run test`         | Run unit tests (Vitest)                  |
| `npm run test:watch`   | Run unit tests in watch mode             |

## Project structure

```
src/
  api/           axios client + request/response validation for the backend API
  components/    ApplicationForm, ApplicationTable, StatsBar, StatusBadge
  components/ui/ shadcn/ui primitives in use (button, input, select, alert-dialog, ...)
  constants/     status config, work types, form defaults
```

## Tooling

- ESLint + Prettier, enforced via Husky pre-commit hooks (`lint-staged`)
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/), enforced via commitlint on the `commit-msg` hook
- GitHub Actions CI runs lint, format check, unit tests, build, and a Gitleaks secret scan on every PR
- Branches follow a `feature/`, `bugfix/`, `hotfix/`, `build/`, etc. prefix convention — see recent PRs for examples

## License

[MIT](LICENSE)
