# Discord Selfbot (Educational)

> ⚠️ Self-bots violate Discord’s Terms of Service. Use this repository strictly for experimentation on test servers that you own. Protect your token and rotate it frequently.

## About

This project started as a learning exercise by ngetikin to understand Discord self-bots end-to-end: building modular features, wiring events, and running the bot 24/7 on personal hardware (a Redmi 6A via Termux). The codebase is now a TypeScript foundation that can be extended without constantly rewriting docs—drop new commands in `src/commands/` or events in `src/events/` and rebuild.

## Highlights

- TypeScript + ESLint + Prettier toolchain with `pnpm` scripts for lint/format/build.
- Dynamic module loader: each command/event is auto-registered.
- Ready for DIY “CI/CD” using PM2 on resource-constrained devices.

## Getting Started

1. **Clone & install**
   ```bash
   git clone <repo-url>
   cd project-selfbot-discord
   pnpm install
   cp .env.example .env
   ```
2. **Configure `.env`** with at least `TOKEN`, and optional extras such as `WEBHOOK_URL`, `ADMIN_ROLE_ID`, or `EMOJI_CHANNEL_ID`.
3. **Development loop**
   - `pnpm dev` – watch mode with live reload (tsx).
   - `pnpm lint` – static analysis + type-aware rules.
   - `pnpm format` / `pnpm format:check` – keep style consistent.
   - `pnpm build` – emit JavaScript into `dist/`.
4. **Production run (desktop/server)**
   ```bash
   pnpm start   # auto-builds then runs node dist/index.js
   ```

## 24/7 Hosting on Redmi 6A (Termux Example)

1. Install prerequisites:
   ```bash
   pkg update
   pkg install git nodejs-lts
   corepack enable    # enables pnpm on modern Node
   npm install -g pm2 # or pnpm add -g pm2
   ```
2. Clone and set up the project as above, then build once: `pnpm build`.
3. Launch with PM2:
   ```bash
   pm2 start dist/index.js --name selfbot --watch
   pm2 save            # persist process list
   ```
4. On Termux reboot, use `pm2 resurrect` after opening the session. Pair with Termux:Boot/Tasker if you need automatic startup.
5. Deploy updates manually:
   ```bash
   git pull
   pnpm install --frozen-lockfile
   pnpm build
   pm2 restart selfbot
   ```
   This lightweight flow mimics CI/CD on constrained hardware without extra services.

## Customisation Checklist

- Add/modify commands in `src/commands/` exporting a default object `{ name, run }`.
- Add listeners in `src/events/` exporting `{ event, run }`.
- Extend shared types or third-party declarations under `src/types/` and `types/`.
- Document manual tests in PRs; automated tests aren’t included yet.

## Token & Security Hygiene

- Never commit `.env`—the template `.env.example` documents required keys.
- Consider using environment-specific tokens when hosting from a phone.
- Rotate tokens whenever you demo the bot publicly or suspect leakage.

Enjoy experimenting, but stay aware of Discord’s policies and the risks that come with self-bots.
