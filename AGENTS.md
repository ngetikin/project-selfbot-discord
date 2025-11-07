# Repository Guidelines

## Project Structure & Module Organization

Core runtime lives in `src/index.ts`, which wires up environment loading, the Discord client, and dynamic module registration. Transpiled JavaScript is emitted into `dist/` during builds. Command handlers belong in `src/commands/`, one file per command exporting a default `{ name, run }`. Event listeners live in `src/events/` and must export a default `{ event, run }`. Utility scripts, such as deployment helpers, sit alongside the root files (`auto_pull.sh`). Keep credentials in a local `.env` that is never committed.

## Build, Test, and Development Commands

Use Node.js 20.11+ to guarantee dukungan `global.fetch` dan API Discord terbaru. Install dependencies with `pnpm install` to respect the checked-in lockfile. Use `pnpm dev` (tsx watch) for live-reloading TypeScript development. Run `pnpm build` to emit JavaScript into `dist/`; `pnpm start` automatically rebuilds (`prestart`) and launches `node dist/index.js`. Run `pnpm lint` (ESLint flat config + type-checking) before committing large changes. Run `pnpm test` (ts-jest) to exercise the current suite, and `pnpm validate:env` to ensure `.env` is ready before deploying. Run `pnpm format` whenever you touch source or docs, and `pnpm format:check` in CI. When you add new command or event modules, restart the watcher so the dynamic loader picks them up.

## Coding Style & Naming Conventions

All runtime code is TypeScript compiled to CommonJS with two-space indentation, semicolons, and single quotes (see `src/index.ts` and existing command files). Export objects with concise property order (`name`, optional metadata, then `run`). Name command files using lowerCamelCase verbs (`clearMessage.ts`) and event handlers after the Discord event (`messageCreate.ts`). ESLint enforces these patterns—fix issues with `pnpm lint --fix` or via the pre-commit hook. Format every change with Prettier via `pnpm format`; use `pnpm format:check` in CI or before committing. Use `pnpm validate:env` whenever you touch configuration-heavy features to avoid runtime surprises.

## Testing Guidelines

Unit tests live in `tests/` (Jest + ts-jest). Add cases alongside new commands/events and mock Discord primitives when possible. Run `pnpm test` locally and document any manual Discord verification you performed (channel IDs, scheduler timing, etc.) in the PR description for reviewer traceability.

## Commit & Pull Request Guidelines

Historical commits mix ad-hoc messages with conventional commits (`fix(auto_pull.sh): ...`). Prefer the conventional form: `type(scope): summary`, keeping the summary under 60 characters. Reference relevant issues in the body and describe user-facing impacts. Pull requests should outline (1) purpose, (2) key changes, (3) manual test evidence (text or screenshots), and (4) rollout considerations such as token management. Request review from another maintainer before merging, and ensure the branch is rebased on the latest `main`.

Pre-commit hooks run `lint-staged` (ESLint --fix + Prettier on staged files) automatically unless your commit message begins with `wip:`—those commits intentionally skip the checks so you can checkpoint work. Pre-push hooks run `pnpm lint`, `pnpm test`, lalu `pnpm build`; hook juga dilewati jika commit terakhir diawali `wip:`. Jalankan dengan `HUSKY=0` hanya untuk emergency hotfix dan dokumentasikan alasannya di PR.

## Security & Configuration Tips

Setiap kontributor wajib mengisi `.env` lokal dengan `TOKEN=...` dan menjaga file tersebut di luar git. Gunakan `pnpm validate:env` sebelum menjalankan bot di perangkat baru. Skrip `auto_pull.sh` kini menghindari `git reset --hard` dan mendukung variabel `PROJECT_DIR`, `AUTO_PULL_BRANCH`, serta `AUTO_PULL_INTERVAL_HOURS`; audit kembali sebelum menjalankannya di server bersama. Hindari mengaktifkan fitur self-bot di lingkungan produksi karena tetap melanggar Ketentuan Layanan Discord.
