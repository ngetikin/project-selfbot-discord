# Repository Guidelines

## Project Structure & Module Organization

Core runtime lives in `src/index.ts`, which wires up environment loading, the Discord client, and dynamic module registration. Transpiled JavaScript is emitted into `dist/` during builds. Command handlers belong in `src/commands/`, one file per command exporting a default `{ name, run }`. Event listeners live in `src/events/` and must export a default `{ event, run }`. Utility scripts, such as deployment helpers, sit alongside the root files (`auto_pull.sh`). Keep credentials in a local `.env` that is never committed.

## Build, Test, and Development Commands

Use Node.js 20.11+ to guarantee dukungan `global.fetch` dan API Discord terbaru. Install dependencies with `pnpm install` to respect the checked-in lockfile. Use `pnpm dev` (tsx watch) for live-reloading TypeScript development. Run `pnpm build` to emit JavaScript into `dist/`; build automatically runs `prebuild` first (`pnpm format:check && pnpm lint && pnpm test`). Karena `pnpm test` sekarang dipaksa sequential (`jest --runInBand`) demi kestabilan di device sumber daya rendah, jalankan build/test dengan kesabaran ekstra. `pnpm start` menjalankan `prestart` (build) sebelum `node dist/index.js`. Gunakan `pnpm validate:env` untuk mengecek `.env`, `pnpm format` / `pnpm format:check` agar gaya konsisten, dan restart `pnpm dev` watcher setiap menambah file baru supaya loader dinamis bisa memuatnya.

## Coding Style & Naming Conventions

All runtime code is TypeScript compiled to CommonJS with two-space indentation, semicolons, and single quotes (see `src/index.ts` and existing command files). Export objects with concise property order (`name`, optional metadata, then `run`). Name command files using lowerCamelCase verbs (`clearMessage.ts`) and event handlers after the Discord event (`messageCreate.ts`). ESLint enforces these patterns—fix issues dengan `pnpm lint --fix` or via the pre-commit hook. Format every change dengan Prettier via `pnpm format`; use `pnpm format:check` in CI or before committing. TypeScript kini berjalan dalam `strict` mode penuh (aktif `strictNullChecks`, `noImplicitAny`, dsb.), jadi selalu tangani kemungkinan `null/undefined` secara eksplisit. Gunakan `pnpm validate:env` (yang sekarang memvalidasi ID Discord & URL webhook) setiap kali menyentuh feature berbasis konfigurasi agar terhindar dari runtime failure.

## Testing Guidelines

Unit tests live in `tests/` (Jest + ts-jest). Add cases alongside new commands/events and mock Discord primitives when possible. Run `pnpm test` locally and document any manual Discord verification you performed (channel IDs, scheduler timing, etc.) in the PR description for reviewer traceability.

## Commit & Pull Request Guidelines

Historical commits mix ad-hoc messages with conventional commits (`fix(auto_pull.sh): ...`). Prefer the conventional form: `type(scope): summary`, keeping the summary under 60 characters. Reference relevant issues in the body and describe user-facing impacts. Pull requests should outline (1) purpose, (2) key changes, (3) manual test evidence (text or screenshots), and (4) rollout considerations such as token management. Request review from another maintainer before merging, and ensure the branch is rebased on the latest `main`.

Pre-commit hooks run `lint-staged` (ESLint --fix + Prettier on staged files) automatically unless your commit message begins with `wip:`—those commits intentionally skip the checks so you can checkpoint work. Pre-push hook menjalankan `pnpm format:check`, `pnpm lint`, `pnpm test`, dan `pnpm compile` secara berurutan sebelum push; gunakan `HUSKY=0` hanya untuk emergency hotfix dan jelaskan alasannya di PR.

## Security & Configuration Tips

Setiap kontributor wajib mengisi `.env` lokal dengan `TOKEN=...` dan menjaga file tersebut di luar git. Gunakan `pnpm validate:env` sebelum menjalankan bot di perangkat baru. `auto_pull.sh` sekarang melakukan fast-forward merge, menolak working tree kotor, menjalankan `pnpm install` + `pnpm build`, lalu merestart PM2 (`AUTO_PULL_PM2_ENTRY`, default `dist/index.js`); tetap pastikan branch `stable` punya artefak `dist/` siap pakai sebelum men-deploy. GitHub Actions workflow menjalankan tahapan Format → Lint → Test → Compile secara eksplisit sehingga kegagalan cepat terlihat. Hindari mengaktifkan fitur self-bot di lingkungan produksi karena tetap melanggar Ketentuan Layanan Discord.
