# Repository Guidelines

## Project Structure & Module Organization

Core runtime lives in `src/index.ts`, which wires up environment loading, the Discord client, and dynamic module registration. Transpiled JavaScript is emitted into `dist/` during builds. Command handlers belong in `src/commands/`, one file per command exporting a default `{ name, run }`. Event listeners live in `src/events/` and must export a default `{ event, run }`. Utility scripts, such as deployment helpers, sit alongside the root files (`auto_pull.sh`). Keep credentials in a local `.env` that is never committed.

## Build, Test, and Development Commands

Install dependencies with `pnpm install` to respect the checked-in lockfile. Use `pnpm dev` (tsx watch) for live-reloading TypeScript development. Run `pnpm build` to emit JavaScript into `dist/`; `pnpm start` automatically rebuilds (`prestart`) and launches `node dist/index.js`. Run `pnpm lint` (ESLint flat config + type-checking) before committing large changes. Run `pnpm format` whenever you touch source or docs, and `pnpm format:check` in pre-commit hooks or CI. When you add new command or event modules, restart the watcher so the dynamic loader picks them up.

## Coding Style & Naming Conventions

All runtime code is TypeScript compiled to CommonJS with two-space indentation, semicolons, and single quotes (see `src/index.ts` and existing command files). Export objects with concise property order (`name`, optional metadata, then `run`). Name command files using lowerCamelCase verbs (`clearMessage.ts`) and event handlers after the Discord event (`messageCreate.ts`). ESLint enforces these patterns—fix issues with `pnpm lint --fix` or via the pre-commit hook. Format every change with Prettier via `pnpm format`; use `pnpm format:check` in CI or before committing.

## Testing Guidelines

There is no automated test suite yet. Validate changes by running the bot against a sandbox Discord server and exercising the affected commands or events manually. When adding complex logic, include temporary debug logging guarded behind environment checks and remove it before submitting the pull request. Document manual test steps in the PR description for reviewer traceability.

## Commit & Pull Request Guidelines

Historical commits mix ad-hoc messages with conventional commits (`fix(auto_pull.sh): ...`). Prefer the conventional form: `type(scope): summary`, keeping the summary under 60 characters. Reference relevant issues in the body and describe user-facing impacts. Pull requests should outline (1) purpose, (2) key changes, (3) manual test evidence (text or screenshots), and (4) rollout considerations such as token management. Request review from another maintainer before merging, and ensure the branch is rebased on the latest `main`.

Pre-commit hooks run `lint-staged` (ESLint --fix + Prettier on staged files) automatically; fix issues before recommitting. Pre-push hooks run `pnpm lint` followed by `pnpm build` to catch type and style errors—push with `HUSKY=0` only for emergency hotfixes.

## Security & Configuration Tips

Every contributor must supply a personal Discord token via `.env` with `TOKEN=...`; never hardcode tokens or check them into version control. Rotate tokens immediately after public demonstrations. Review `auto_pull.sh` before deploying it to shared servers, and avoid enabling self-bot features that violate Discord’s Terms of Service in production environments.
