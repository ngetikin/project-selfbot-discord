# Repository Guidelines

## Project Structure & Module Organization
Core runtime lives in `src/index.js`, which wires up environment loading, the Discord client, and dynamic module registration. Root `index.js` simply forwards to this entry point for Node resolution. Command handlers belong in `src/commands/`, one file per command exporting `{ name, run }`. Event listeners live in `src/events/` and must export `{ event, run }`. Utility scripts, such as deployment helpers, sit alongside the root files (`auto_pull.sh`). Keep credentials in a local `.env` that is never committed.

## Build, Test, and Development Commands
Install dependencies with `pnpm install` to respect the checked-in lockfile. Use `pnpm start` for a production-equivalent run and `pnpm dev` (nodemon) while iterating. When you add new command or event modules, restart the process so the dynamic loader picks them up.

## Coding Style & Naming Conventions
All runtime code is CommonJS with two-space indentation, semicolons, and single quotes (see `src/index.js` and existing command files). Export objects with concise property order (`name`, optional metadata, then `run`). Name command files using lowerCamelCase verbs (`clearMessage.js`) and event handlers after the Discord event (`messageCreate.js`). Linting is manual—run `pnpm dev` and rely on runtime warnings—so keep imports ordered and remove unused variables before committing.

## Testing Guidelines
There is no automated test suite yet. Validate changes by running the bot against a sandbox Discord server and exercising the affected commands or events manually. When adding complex logic, include temporary debug logging guarded behind environment checks and remove it before submitting the pull request. Document manual test steps in the PR description for reviewer traceability.

## Commit & Pull Request Guidelines
Historical commits mix ad-hoc messages with conventional commits (`fix(auto_pull.sh): ...`). Prefer the conventional form: `type(scope): summary`, keeping the summary under 60 characters. Reference relevant issues in the body and describe user-facing impacts. Pull requests should outline (1) purpose, (2) key changes, (3) manual test evidence (text or screenshots), and (4) rollout considerations such as token management. Request review from another maintainer before merging, and ensure the branch is rebased on the latest `main`.

## Security & Configuration Tips
Every contributor must supply a personal Discord token via `.env` with `TOKEN=...`; never hardcode tokens or check them into version control. Rotate tokens immediately after public demonstrations. Review `auto_pull.sh` before deploying it to shared servers, and avoid enabling self-bot features that violate Discord’s Terms of Service in production environments.
