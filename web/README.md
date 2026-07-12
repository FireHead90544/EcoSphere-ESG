# EcoSphere Web Application

This is the core frontend and API service for the EcoSphere ESG Platform, built with **Next.js 16 (App Router)**.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, base-ui
- **Database**: SQLite (via `better-sqlite3`)
- **ORM**: Prisma
- **Authentication**: Auth.js v5 (Edge-compatible JWT)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

## Local Development Setup

To run the application locally, ensure you have Node.js and `npm` installed.

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file based on the example. The defaults work for local development.
   ```bash
   cp .env.example .env
   ```
   *Note: If `ML_SERVICE_URL` is omitted, the web app assumes the Python ML service is running on `http://localhost:8000`.*

3. **Database Initialization**
   Apply the latest Prisma schema migrations to your local SQLite database and seed initial data.
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```
   > **Note:** Each developer maintains their own local `dev.db` file. When pulling changes that include schema modifications, be sure to re-run `npx prisma migrate dev`.

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

- `app/`: Next.js App Router pages and API routes.
  - `(dashboard)/`: Authenticated layouts and pages (Governance, Settings, Dashboard).
  - `api/`: Server-side API endpoints, including CSV exports.
- `components/`: Reusable React components (UI library, shared layouts).
- `lib/`: Shared utilities, schemas, server actions, and Prisma client instance.
  - `actions/`: Next.js Server Actions for mutations and data fetching.
  - `schemas/`: Zod schemas for shared validation logic.
  - `scoring/`: ESG ML feature extraction logic.
- `prisma/`: Database schema and migration files.

## Adding UI Components

We use Shadcn UI for our design system. To add a new component:

```bash
npx shadcn@latest add [component-name]
```
