# Task Management System with RBAC

Full-stack task management application with role-based access control.

## Repository Structure (NX-Style Monorepo)
```
shreya-[uuid]/
├── apps/
│   ├── api/              # NestJS backend with JWT auth
│   └── dashboard/        # Angular 17 frontend
├── libs/
│   ├── data/            # Shared TypeScript interfaces
│   └── auth/            # RBAC logic and decorators
└── package.json
```

## Tech Stack

**Backend:**
- NestJS
- TypeORM
- SQLite
- JWT Authentication
- bcrypt

**Frontend:**
- Angular 17
- TailwindCSS
- RxJS

## Quick Start

### Prerequisites
- Node.js v18+
- npm

### Setup

1. Install backend dependencies:
```bash
cd apps/api
npm install
cp .env.example .env
```

2. Seed database:
```bash
mkdir -p data
npx ts-node src/seed.ts
```

3. Start backend:
```bash
npx ts-node src/main.ts
```

4. Install frontend dependencies (new terminal):
```bash
cd apps/dashboard
npm install
```

5. Start frontend:
```bash
npm start
```

6. Open http://localhost:4200

## Test Accounts

- Owner: `owner@acme.com` / `password123`
- Admin: `admin@acme.com` / `password123`
- Viewer: `viewer@acme.com` / `password123`

## Testing

Backend tests:
```bash
cd apps/api
npm test
```

## Features

- JWT Authentication
- Role-Based Access Control (OWNER, ADMIN, VIEWER)
- Organization Hierarchy
- Task CRUD Operations
- Drag-and-drop Kanban Board
- Dark/Light Mode
- Responsive Design
- Audit Logging

## Architecture

- Monorepo structure (NX-style)
- Shared TypeScript interfaces in `libs/data`
- Reusable RBAC logic in `libs/auth`
- Clean separation of concerns

## Author

Shreya
