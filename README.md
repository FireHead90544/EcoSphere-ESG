# EcoSphere ESG Platform

An Environmental, Social, and Governance (ESG) platform built for Odoo-Hack 2026 by Team That1Bit. EcoSphere helps organizations track and improve their sustainability, social impact, and governance practices through data-driven insights, gamification, and machine learning scoring.

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
- **Hour 7 (03:00 - 04:00 PM):** Started working on dedicated dashboards for each mini-dashboard. Finalized main dashboard, compliance dashboard & governance dashboards, reports.
- **Hour 8 (04:00 - 05:00 PM):** Started working on environmental & social dashboards, added more mock data, started working on notifications, gamification,  ml infra & apis, ml model. Wrap up project :')

## Code Conventions

The project follows production-level coding practices:

- Never push to the `main` branch directly. Always create PRs --> review --> pass ci/cd --> deploy.
- Write robust code, ensure types are safe (`npm run typecheck` should pass).
- Avoid unnecessary bloated infrastructure for simple features.
- Enjoy writing code!

## Quickstart

### 1. Start the Web App
Navigate to the `web/` directory and refer to the [Web README](./web/README.md) for detailed setup instructions.
```bash
cd web
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### 2. Start the ML Service
Navigate to the `ml/` directory and refer to the [ML README](./ml/README.md).
```bash
cd ml
uv run python train.py
uv run uvicorn main:app --port 8000 --reload
```

## Demo Credentials

Open [http://localhost:3000](http://localhost:3000) and login with the seeded accounts:
- **Admin**: `admin@ecosphere.dev` / `admin123`
- **Employee**: `priya.sharma@ecosphere.dev` / `employee123`
