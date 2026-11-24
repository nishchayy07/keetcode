
# KeetCode

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

A full-stack remote code execution and competitive programming platform built with **React**, **TypeScript**, **Node.js**, **Express**, **PostgreSQL (Prisma)**, **Judge0 / sandboxed execution**, and **Docker**[cite: 1].

---

## Overview

KeetCode provides an end-to-end coding workspace and evaluation pipeline featuring a problem directory, split-pane code editor workspace, user profile and submission history views, automated boilerplate generation, and isolated code execution across multiple programming languages[cite: 1].

### Key Highlights

* **Multi-Service Architecture:** Separates the React frontend, Express/TypeScript backend, problem/boilerplate tooling, and sandbox execution engine into modular services.
* **Automated Boilerplate & Runner Generation:** Generates user-facing function stubs (`boilerplate/`) and full execution harnesses (`boilerplate-full/`) from `Problem.md` and `Structure.md` specifications.
* **Queued & Sandboxed Evaluation:** Handles code runs and submissions through dedicated backend routes, queue/Judge0 integrations, and a containerized sandbox engine.
* **Authentication & Webhook Sync:** Integrates Clerk authentication middleware and webhook handlers alongside Prisma-managed relational persistence.
* **Curated Problem Suite:** Ships with structured problems (`two-sum`, `valid-parentheses`, `climbing-stairs`, `reverse-linked-list`, `maximum-depth-of-binary-tree`, `search-in-a-binary-search-tree`, `find-if-path-exists-in-graph`, and `max-element`) complete with test inputs, expected outputs, and reference solutions[cite: 1].

---

## System Architecture

```text
┌───────────────────────────┐       REST API / Auth       ┌───────────────────────────┐
│      React Frontend       │ ──────────────────────────► │      Express Backend      │
│ (Vite, Tailwind, Monaco)  │ ◄────────────────────────── │  (TypeScript, Zod, Clerk) │
└───────────────────────────┘     Verdicts & Metadata     └─────────────┬─────────────┘
                                                                        │
                                             ┌──────────────────────────┼──────────────────────────┐
                                             ▼                          ▼                          ▼
                               ┌──────────────────────────┐ ┌──────────────────────────┐ ┌──────────────────────────┐
                               │    PostgreSQL + Prisma   │ │  Execution Queue / Judge │ │    Sandbox Engine        │
                               │ (Users, Problems, Runs)  │ │   (Async Job Dispatch)   │ │  (Isolated Docker Env)   │
                               └──────────────────────────┘ └──────────────────────────┘ └──────────────────────────┘
```

### Execution Lifecycle

1. **Problem Selection:** The client fetches problem statements, constraints, and starter code (`boilerplate/`) from the Express API[cite: 1].
2. **Code Wrapping:** On `/run` or `/submit`, the backend merges candidate code into the problem's full test harness (`boilerplate-full/`) containing standardized I/O parsing[cite: 1].
3. **Sandboxed Evaluation:** Execution jobs are dispatched through the queue/Judge0 integration and executed inside an isolated Docker sandbox environment (`sandbox-engine`)[cite: 1].
4. **Verdict & Persistence:** Test case outputs are validated against expected outputs (`tests/outputs/`), and submission results are persisted via Prisma to PostgreSQL[cite: 1].

---

## Repository Structure

```text
keetcode/
├── express-backend/              # Express + TypeScript API, Prisma schema, queue & judge integration
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   ├── problems/                 # Problem definitions, boilerplates, reference solutions & test cases
│   ├── scripts/
│   │   └── boilerplate-generator/# TypeScript generator for user & full boilerplate code
│   ├── src/
│   │   ├── config/               # Environment configuration
│   │   ├── language/             # Language definitions & mappings
│   │   ├── lib/                  # Judge0 client, problem loader, execution queue
│   │   ├── middleware/           # Auth & Clerk authentication middleware
│   │   ├── routes/               # /problems, /profiles, /run, /submit, webhooks
│   │   └── zod/                  # Request & callback validation schemas
│   ├── seed-problems.ts          # Problem seeding script
│   └── check_db.ts               # Database connectivity check
├── react-frontend/               # React + Vite + Tailwind CSS client application
│   └── src/
│       ├── components/           # Navbar, Appbar, Hero, ProblemStatement, ProblemSubmitBar, etc.
│       ├── context/              # ThemeContext & UserProfileContext
│       ├── lib/                  # Problems registry, time & utility helpers
│       └── pages/                # Landing, ProblemsDirectory, ProblemWorkspace, ProfilePage, Auth pages
├── sandbox-engine/               # Containerized code execution service (Docker + Node server)
├── nextjs-conceptual/            # Next.js App Router auth & Clerk webhook reference/prototype
└── update-boilerplates.js        # Utility script to sync/update problem boilerplates
```

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, Radix/shadcn-style UI primitives |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, Zod |
| **Execution & Tooling** | Docker, Sandbox Engine (`server.js`), Judge0 integration, Boilerplate Generator |
| **Auth & Data** | Clerk (middleware & webhooks), PostgreSQL (via Prisma)[cite: 1] |

---

## Local Setup & Running

### 1. Prerequisites

* **Node.js** (v18+ recommended) and **npm**
* **PostgreSQL** instance (or hosted connection string)
* **Docker** (required for running the sandbox engine / containerized execution)

### 2. Backend Setup (`express-backend`)

```bash
cd express-backend
npm install
cp .env.example .env
```

Configure environment variables in `express-backend/.env` (database URL, Clerk keys/webhook secret, queue/Judge0 settings as defined in `src/config/env.ts` and `.env.example`), then push/migrate the Prisma schema and seed problems[cite: 1]:

```bash
npx prisma generate
npx prisma db push
npx ts-node seed-problems.ts
npm run dev
```

*(You can verify database connectivity anytime using `check_db.ts`[cite: 1].)*

### 3. Sandbox Engine Setup (`sandbox-engine`)

```bash
cd sandbox-engine
npm install
docker build -t keetcode-sandbox .
```

Run the container or start `server.js` according to your local port/environment configuration[cite: 1].

### 4. Frontend Setup (`react-frontend`)

```bash
cd react-frontend
npm install
cp .env.example .env
```

Set the backend API URL and Clerk publishable key in `react-frontend/.env`, then start the dev server[cite: 1]:

```bash
npm run dev
```

---

## Adding a New Problem

Each problem under `express-backend/problems/<slug>/` follows a consistent layout:

* `Problem.md` — Problem statement, constraints, and examples.
* `Structure.md` — Function signature and input/output contract.
* `boilerplate/` — Minimal starter code shown to candidates in the editor.
* `boilerplate-full/` — Complete harness wrapping user code with I/O parsing and test execution.
* `solutions/` — Reference solutions for verification.
* `tests/inputs/` & `tests/outputs/` — Test case inputs (`0.txt`, `1.txt`, ...) and expected outputs[cite: 1].

Use `scripts/boilerplate-generator` or `update-boilerplates.js` to generate/refresh boilerplates, and run `seed-problems.ts` to register the problem in the database[cite: 1].

---

## Architecture & Design Decisions

* **Separation of Concerns:** UI state, problem presentation, and code submission live in `react-frontend`, while validation (`zod`), auth/webhook handling, queue/execution orchestration, and persistence live in `express-backend`.
* **Safe Code Evaluation:** Untrusted candidate code is isolated via sandboxed execution (`sandbox-engine` / Judge0 integration) rather than running directly inside the main API process.
* **Deterministic Test Harnesses:** Separating `boilerplate` from `boilerplate-full` keeps the candidate editor focused on algorithmic logic while standardizing input parsing and output formatting during evaluation[cite: 1].
