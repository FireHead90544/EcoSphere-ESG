# EcoSphere-ESG

An Environmental, Social and Governance (ESG) platform built for Odoo-Hack 2026 by Team That1Bit.

## Team Members

- [Rudransh Joshi](https://rudraxd.in/)
- Uttam Tiwari
- Manish Singh Bisht
- Neha Kumari

## Progress

> What a crap project name, but anyways xD. 
This README is still being updated frequently, the final version would be available by the end.
The project follows a monorepo structure which will be described.

- **Hour 1 (09:00 - 10:00 AM):** Analyzed the problem statement, brainstormed ideas, jot down features & mockups.
- **Hour 2 (10:00 - 11:00 AM):** (Contd.) Assessed feature potential, implemented process-flows, naive-architectural details & finalized what exactly we're gonna build. Roles distributed. Happy Hacking Starts :)
- **Hour 3 (11:00 - 12:00 PM):** Started scaffolding the project, setting up Next.js, React, Tailwind, Shadcn & theming the design system.
- **Hour 4 (12:00 - 01:00 PM):** Setup Prisma, a lot of chaos, some snacks & distributing the workload.
- **Hour 5 (01:00 - 02:00 PM):** Implemented auth, notifications, layouts & shared stuff so everyone can work parallelly afterwards.
- **Hour 6 (02:00 - 03:00 PM):** Focus.

## Code Conventions

The project follows the obvious production-level coding practices. 

- Never push to the `main` branch directly. Always create PRs --> review --> pass ci/cd --> deploy
- Never write garbage code, make sure tests are passing
- Don't claim what you aren't doing. Not everything is supposed to be implemented.
- No bullshit AI-slop or fancy-tech, just to justify using a whole bloated XYZ-infrastructure.
- There's no bad code, only bad programmers.
- Use your brain and omit any practice in cases you belive your actions are justified.
- Enjoy writing code :)

## Local Development Setup

First time on this repo? Run these commands from the `web/` directory:

```bash
cd web

# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env — the default values work for local dev as-is

# 2.5 Generate prisma client
npx prisma generate

# 3. Create local database, apply migrations, and seed demo data
npx prisma migrate dev

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Login with:
- **Admin:** `admin@ecosphere.dev` / `admin123`
- **Employee:** `priya.sharma@ecosphere.dev` / `employee123`

> **Note:** Each developer has their own local `dev.db` (SQLite file, gitignored). When a teammate adds a schema migration, pull their branch and re-run `npx prisma migrate dev` to apply it.

