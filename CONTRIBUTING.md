# Contributing to Crewmute

First off, thanks for taking the time to contribute! Crewmute is a student-built project, and every contribution makes it better.

All contributors — human or AI — must read [AGENT_RULES.md](AGENT_RULES.md) before making any change. It is the engineering constitution that governs this repository.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branch Strategy](#branch-strategy)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/<your-username>/Crewmute.git`
3. Set up the project following [README.md](README.md) instructions
4. Create a branch from `dev`

## Development Workflow

```
dev → feature/<ticket-id>-description → PR → dev → main
```

All feature work is done against the `dev` branch. `main` is the stable production branch.

## Branch Strategy

| Branch pattern | Purpose | Base branch |
|----------------|---------|-------------|
| `feature/<ticket-id>-description` | New features | `dev` |
| `fix/<ticket-id>-description` | Bug fixes | `dev` |
| `refactor/<ticket-id>-description` | Refactoring | `dev` |
| `chore/<ticket-id>-description` | Maintenance, deps | `dev` |
| `docs/<ticket-id>-description` | Documentation | `dev` |

## Commit Convention

This repo uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <imperative description>
```

| Type      | Usage                        |
|-----------|------------------------------|
| `feat`    | New feature                  |
| `fix`     | Bug fix                      |
| `refactor`| Code change with no behavior change |
| `perf`    | Performance improvement      |
| `test`    | Adding or updating tests     |
| `docs`    | Documentation changes        |
| `chore`   | Maintenance, deps, config    |

**Examples:**
- `feat(rides): add date range filter to ride search`
- `fix(auth): handle token refresh race condition on app resume`
- `test(rides): add integration tests for create endpoint`

Commits must be atomic — one logical change per commit, buildable and testable on its own.

## Pull Request Process

1. Create a feature/fix branch from `dev`
2. Make your changes following the coding standards
3. Ensure all tests pass and TypeScript compiles cleanly
4. Update relevant documentation
5. Open a PR against `dev` with a clear description:
   - **What** changed
   - **Why** it changed
   - **How** it was tested
   - Any follow-up work needed
6. Ensure CI passes
7. Request review from a maintainer

## Coding Standards

### General
- **TypeScript strict mode** — no `any` without suppression comments
- No `console.log` — use the structured logger (backend) or logger utility (mobile)
- No magic numbers or strings — use named constants
- Functions max 50 lines, files max 300 lines (exceptions documented)

### Backend
- **Feature-first** directory structure: `features/<name>/`
- Layers: `route → controller → service → repository → model`
- Business logic in services only — never in controllers or middleware
- All list endpoints paginated (default 20, max 100)
- `.lean()` + `.select()` on all read-only Mongoose queries
- Throw typed `AppError` subclasses, never raw errors

### Mobile
- Components are pure UI — no API calls or business logic
- All data enters via props or hooks
- All API data via TanStack Query — never in Zustand
- Every screen implements: loading, empty, error, success states
- All colors/spacing from design tokens — no hardcoded values
- All interactive elements: `accessibilityLabel` + `accessibilityRole`
- Minimum 44×44pt touch targets

## Testing

- All new business logic must have unit tests
- All new API endpoints must have integration tests (happy path + validation error + auth error)
- Run `npm test` before opening a PR
- Coverage thresholds: statements 80%, branches 75%, functions 80%, lines 80%

## Documentation

- Update `docs/` files in the same PR as code changes
- API changes → update `docs/api/`
- Architectural decisions → add ADR in `docs/DECISIONS.md`
- A PR with documentation changes only may skip the code review step

---

*Questions? Open a discussion or reach out to a maintainer.*
