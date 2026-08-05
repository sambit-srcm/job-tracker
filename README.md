# Job Tracker

A small React app for tracking job applications — company, role, status, work type, location, and notes — with search, filtering, and sorting.

## Stack

- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) primitives
- [json-server](https://github.com/typicode/json-server) as a mock REST API backed by `db.json`, called via `axios`

## Getting started

Requires Node.js 20.19+ or 22.12+ (CI runs on Node 22).

```bash
npm install
```

This app needs two processes running at once: the mock API and the Vite dev server.

```bash
# terminal 1 — mock API on http://localhost:3001
npm run api

# terminal 2 — app on http://localhost:5173
npm run dev
```

## Scripts

| Script                 | Description                                             |
| ---------------------- | ------------------------------------------------------- |
| `npm run dev`          | Start the Vite dev server                               |
| `npm run api`          | Start the json-server mock API (`db.json`) on port 3001 |
| `npm run build`        | Production build to `dist/`                             |
| `npm run preview`      | Preview the production build locally                    |
| `npm run lint`         | Run ESLint                                              |
| `npm run format`       | Format the codebase with Prettier                       |
| `npm run format:check` | Check formatting without writing changes                |

## Project structure

```
src/
  api/           axios client + request/response validation for the mock API
  components/    ApplicationForm, ApplicationTable, StatsBar, StatusBadge
  components/ui/ shadcn/ui primitives in use (button, input, select, alert-dialog, ...)
  constants/     status config, work types, form defaults
db.json          seed data for the mock API
```

## Tooling

- ESLint + Prettier, enforced via Husky pre-commit hooks (`lint-staged`)
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/), enforced via commitlint on the `commit-msg` hook
- GitHub Actions CI runs lint, format check, build, and a Gitleaks secret scan on every PR
- Branches follow a `feature/`, `bugfix/`, `hotfix/`, `build/`, etc. prefix convention — see recent PRs for examples

## License

[MIT](LICENSE)
