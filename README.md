# Task Management System with RBAC

Full-stack task management application with role-based access control, JWT authentication, and organization hierarchy.

**Repository:** `shreya-2e64639c-cb11-4573-8bc6-e0d8aaae026b`

---

## Table of Contents
- [Setup Instructions](#setup-instructions)
- [Architecture Overview](#architecture-overview)
- [Data Model Explanation](#data-model-explanation)
- [Access Control Implementation](#access-control-implementation)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Features](#features)
- [Future Considerations](#future-considerations)

---

## Setup Instructions

### Prerequisites
- Node.js v18 or higher
- npm v9 or higher

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd apps/api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   The backend uses default configuration. For production, create `.env` file:
   ```bash
   JWT_SECRET=your-secret-key-change-in-production
   DATABASE_PATH=data/task-management.db
   PORT=3000
   ```

4. **Seed the database:**
   ```bash
   mkdir -p data
   npx ts-node src/seed.ts
   ```

   Expected output:
   ```
   Database initialized
   ✅ Database seeded successfully!
   
   Test Users:
   Owner: owner@acme.com / password123
   Admin: admin@acme.com / password123
   Viewer: viewer@acme.com / password123
   ```

5. **Start the backend server:**
   ```bash
   npx ts-node src/main.ts
   ```

   Expected output:
   ```
   🚀 API server running on http://localhost:3000
   ```

### Frontend Setup

1. **Open a new terminal and navigate to frontend directory:**
   ```bash
   cd apps/dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   Expected output:
   ```
   ✔ Compiled successfully.
   ** Angular Live Development Server is listening on localhost:4200 **
   ```

4. **Access the application:**
   Open http://localhost:4200 in your browser

### Test Accounts

| Role   | Email                | Password     | Permissions                                    |
|--------|---------------------|--------------|------------------------------------------------|
| OWNER  | owner@acme.com      | password123  | Full access to all tasks and organizations     |
| ADMIN  | admin@acme.com      | password123  | Manage tasks in own and child organizations    |
| VIEWER | viewer@acme.com     | password123  | View and manage only own tasks                 |

---

## Architecture Overview

### NX Monorepo Structure

This project follows an NX-style monorepo architecture with clear separation between applications and shared libraries:

```
shreya-2e64639c-cb11-4573-8bc6-e0d8aaae026b/
├── apps/
│   ├── api/                      # Backend application (NestJS)
│   │   ├── src/
│   │   │   ├── auth/            # Authentication module (JWT, guards)
│   │   │   ├── tasks/           # Task management module
│   │   │   ├── audit/           # Audit logging module
│   │   │   ├── entities/        # TypeORM entities
│   │   │   ├── seed.ts          # Database seeding script
│   │   │   └── main.ts          # Application entry point
│   │   └── package.json
│   │
│   └── dashboard/                # Frontend application (Angular 17)
│       ├── src/
│       │   ├── app/
│       │   │   ├── components/  # UI components (login, dashboard)
│       │   │   ├── services/    # API services and state management
│       │   │   ├── guards/      # Route guards
│       │   │   └── app.config.ts # App configuration with interceptors
│       │   └── environments/    # Environment configurations
│       └── package.json
│
├── libs/
│   ├── data/                     # Shared TypeScript interfaces and DTOs
│   │   └── interfaces.ts        # User, Task, Organization, JWT payload types
│   │
│   └── auth/                     # Reusable RBAC logic and decorators
│       ├── decorators.ts        # @Roles(), @Public() decorators
│       └── rbac.service.ts      # Permission checking logic
│
└── README.md
```

### Rationale for Monorepo Structure

**Benefits:**
1. **Code Sharing:** `libs/data` provides type-safe contracts between frontend and backend
2. **Consistency:** Shared RBAC logic ensures consistent permission checks across the stack
3. **Maintainability:** Changes to data models propagate automatically to both applications
4. **Developer Experience:** Single repository simplifies development workflow

**Shared Libraries:**

- **`libs/data`:** Contains all TypeScript interfaces and DTOs used by both frontend and backend, ensuring type safety across the entire stack
- **`libs/auth`:** Contains RBAC logic, decorators, and permission checking utilities that are reused across different modules

---

## Data Model Explanation

### Entity Relationship Diagram

```
┌─────────────────┐
│  Organization   │
│─────────────────│
│ id (PK)         │
│ name            │
│ parentId (FK)   │──┐
│ createdAt       │  │
│ updatedAt       │  │
└─────────────────┘  │
         │           │
         │ 1:N       │ self-reference
         │           │
         ▼           │
┌─────────────────┐  │
│      User       │◄─┘
│─────────────────│
│ id (PK)         │
│ email (unique)  │
│ name            │
│ password (hash) │
│ role (enum)     │
│ organizationId  │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│      Task       │
│─────────────────│
│ id (PK)         │
│ title           │
│ description     │
│ status (enum)   │
│ category (enum) │
│ userId (FK)     │
│ organizationId  │
│ order           │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│   AuditLog      │
│─────────────────│
│ id (PK)         │
│ userId (FK)     │
│ action          │
│ resourceType    │
│ resourceId      │
│ details         │
│ timestamp       │
└─────────────────┘
```

### Schema Description

#### Organizations (2-Level Hierarchy)

- **Purpose:** Support multi-tenant architecture with parent-child organization relationships
- **Fields:**
  - `id`: UUID primary key
  - `name`: Organization name (e.g., "Acme Corp")
  - `parentId`: Foreign key to parent organization (nullable for root organizations)
  - `createdAt`, `updatedAt`: Timestamps

#### Users

- **Purpose:** Store user credentials, roles, and organizational membership
- **Fields:**
  - `id`: UUID primary key
  - `email`: Unique email address (used for login)
  - `name`: User's full name
  - `password`: bcrypt-hashed password
  - `role`: Enum (`OWNER`, `ADMIN`, `VIEWER`)
  - `organizationId`: Foreign key to organization
  - `createdAt`, `updatedAt`: Timestamps

#### Tasks

- **Purpose:** Core resource representing tasks with categorization and status tracking
- **Fields:**
  - `id`: UUID primary key
  - `title`: Task title
  - `description`: Detailed task description
  - `status`: Enum (`TODO`, `IN_PROGRESS`, `DONE`)
  - `category`: Enum (`WORK`, `PERSONAL`, `URGENT`, `OTHER`)
  - `userId`: Foreign key to task creator/owner
  - `organizationId`: Foreign key to organization
  - `order`: Integer for drag-and-drop ordering
  - `createdAt`, `updatedAt`: Timestamps

#### AuditLog

- **Purpose:** Track all resource access and modifications for security auditing
- **Fields:**
  - `id`: UUID primary key
  - `userId`: Foreign key to user who performed the action
  - `action`: Action type (e.g., "CREATE", "UPDATE", "DELETE", "VIEW")
  - `resourceType`: Type of resource (e.g., "TASK", "USER")
  - `resourceId`: ID of the affected resource
  - `details`: JSON string with additional context
  - `timestamp`: When the action occurred

---

## Access Control Implementation

### Role Hierarchy

```
OWNER (Level 3 - Highest)
  │
  ├─ Full access to all tasks in all organizations
  ├─ Can view audit logs
  ├─ Can manage any resource
  │
  ▼
ADMIN (Level 2)
  │
  ├─ Access to tasks in own organization
  ├─ Access to tasks in child organizations
  ├─ Can view audit logs
  ├─ Cannot access parent organization tasks
  │
  ▼
VIEWER (Level 1)
  │
  ├─ Access only to own tasks
  ├─ Cannot view other users' tasks
  └─ Cannot access audit logs
```

### Permission Logic

**Location:** `libs/auth/rbac.service.ts`

The RBAC service implements three core permission checks:

1. **Role Check:**
   ```typescript
   hasRole(userRole: UserRole, requiredRole: UserRole): boolean
   ```
   Validates if user has required role level

2. **Organization Access:**
   ```typescript
   canAccessOrganization(
     userOrgId: string, 
     targetOrgId: string, 
     userRole: UserRole
   ): boolean
   ```
   - OWNER: Can access all organizations
   - ADMIN: Can access own and child organizations
   - VIEWER: Can only access own organization

3. **Resource Modification:**
   ```typescript
   canModifyResource(
     userId: string, 
     resourceOwnerId: string, 
     userRole: UserRole, 
     userOrgId: string, 
     resourceOrgId: string
   ): boolean
   ```
   Checks if user can edit/delete a specific resource

### JWT Authentication Integration

#### Token Generation

**Location:** `apps/api/src/auth/auth.service.ts`

When user logs in:
1. Credentials validated against bcrypt hash
2. JWT payload created with:
   ```typescript
   {
     sub: user.id,
     email: user.email,
     role: user.role,
     organizationId: user.organizationId
   }
   ```
3. Token signed with secret key (24-hour expiry)
4. Returned to client along with user object

#### Token Verification

**Location:** `apps/api/src/auth/jwt-auth.guard.ts`

On every API request:
1. Guard extracts JWT from `Authorization: Bearer` header
2. Token verified and decoded
3. User loaded from database
4. User object attached to request for downstream use

#### Role-Based Guards

**Location:** `apps/api/src/auth/roles.guard.ts`

After authentication:
1. Extracts required roles from `@Roles()` decorator
2. Compares user's role against requirements
3. Applies organizational scope checks
4. Allows/denies access accordingly

#### Frontend Integration

**Location:** `apps/dashboard/src/app/services/auth.interceptor.ts`

HTTP Interceptor automatically:
1. Retrieves JWT from localStorage
2. Attaches `Authorization: Bearer <token>` header to all outgoing requests
3. Handles 401 responses by redirecting to login

---

## API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "owner@acme.com",
  "password": "password123"
}

Response 200:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "392b5d89-9c66-4d09-aeb3-7ffd42afa7d8",
    "email": "owner@acme.com",
    "name": "Alice Owner",
    "role": "OWNER",
    "organizationId": "0da6bf97-84bb-4a30-8bb6-63e6e..."
  }
}

Response 401:
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

### Tasks

All task endpoints require JWT authentication via `Authorization: Bearer <token>` header.

#### Create Task
```http
POST /tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete documentation",
  "description": "Write comprehensive README",
  "status": "TODO",
  "category": "WORK"
}

Response 201:
{
  "id": "a3b2c1d4-e5f6-7890-abcd-ef1234567890",
  "title": "Complete documentation",
  "description": "Write comprehensive README",
  "status": "TODO",
  "category": "WORK",
  "userId": "392b5d89-9c66-4d09-aeb3-7ffd42afa7d8",
  "organizationId": "0da6bf97-84bb-4a30-8bb6-63e6e...",
  "order": 0,
  "createdAt": "2026-02-11T12:00:00.000Z",
  "updatedAt": "2026-02-11T12:00:00.000Z"
}

Response 403:
{
  "statusCode": 403,
  "message": "Insufficient permissions"
}
```

#### List Tasks
```http
GET /tasks
Authorization: Bearer <token>

Response 200:
[
  {
    "id": "a3b2c1d4-e5f6-7890-abcd-ef1234567890",
    "title": "Complete documentation",
    "description": "Write comprehensive README",
    "status": "TODO",
    "category": "WORK",
    "userId": "392b5d89-9c66-4d09-aeb3-7ffd42afa7d8",
    "organizationId": "0da6bf97-84bb-4a30-8bb6-63e6e...",
    "order": 0,
    "createdAt": "2026-02-11T12:00:00.000Z",
    "updatedAt": "2026-02-11T12:00:00.000Z"
  }
]
```

**Note:** Returned tasks are automatically scoped based on user's role:
- OWNER: All tasks
- ADMIN: Tasks in own and child organizations
- VIEWER: Only own tasks

#### Update Task
```http
PUT /tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}

Response 200:
{
  "id": "a3b2c1d4-e5f6-7890-abcd-ef1234567890",
  "title": "Complete documentation",
  "status": "IN_PROGRESS",
  ...
}

Response 403:
{
  "statusCode": 403,
  "message": "You do not have permission to modify this task"
}
```

#### Delete Task
```http
DELETE /tasks/:id
Authorization: Bearer <token>

Response 200:
{}

Response 403:
{
  "statusCode": 403,
  "message": "You do not have permission to delete this task"
}
```

### Audit Logs

#### View Audit Logs
```http
GET /audit-log
Authorization: Bearer <token>

Response 200:
[
  {
    "id": "log123...",
    "userId": "392b5d89-9c66-4d09-aeb3-7ffd42afa7d8",
    "action": "CREATE",
    "resourceType": "TASK",
    "resourceId": "a3b2c1d4-e5f6-7890-abcd-ef1234567890",
    "details": "{\"title\":\"Complete documentation\"}",
    "timestamp": "2026-02-11T12:00:00.000Z"
  }
]

Response 403:
{
  "statusCode": 403,
  "message": "Only OWNER and ADMIN can access audit logs"
}
```

**Access:** OWNER and ADMIN only

---

## Testing

### Backend Tests (Jest)

**Test Suites:**
- `auth.service.spec.ts` - Authentication logic
- `rbac.service.spec.ts` - RBAC permission checks
- `tasks.controller.spec.ts` - Task CRUD operations

**Run tests:**
```bash
cd apps/api
npm test
```

**Expected output:**
```
PASS  src/auth/rbac.service.spec.ts
PASS  src/tasks/tasks.controller.spec.ts
PASS  src/auth/auth.service.spec.ts

Test Suites: 3 passed, 3 total
Tests:       18 passed, 18 total
Snapshots:   0 total
Time:        5.47 s
```

**Run with coverage:**
```bash
npm test -- --coverage
```

### Frontend Tests (Karma)

**Test configuration:** Angular 17 with Karma

**Run tests:**
```bash
cd apps/dashboard
npm test
```

### Manual Testing Checklist

#### JWT Storage and Attachment
1. Login at http://localhost:4200
2. Open DevTools (F12) → Application → Local Storage → localhost:4200
3. Verify `access_token` exists ✅
4. Network tab → Make any request → Headers → Verify `Authorization: Bearer ...` ✅

#### RBAC Testing
1. **As OWNER (owner@acme.com):**
   - See all 5 tasks ✅
   - Can edit any task ✅
   - Can delete any task ✅
   - Can access audit logs ✅

2. **As ADMIN (admin@acme.com):**
   - See tasks from own and child organizations ✅
   - Can edit organization tasks ✅
   - Cannot edit parent organization tasks ✅
   - Can access audit logs ✅

3. **As VIEWER (viewer@acme.com):**
   - See only own tasks (2 tasks) ✅
   - Can edit only own tasks ✅
   - Cannot edit others' tasks ✅
   - Cannot access audit logs ✅

---

## Features

### Core Features

✅ **Authentication**
- JWT-based authentication
- Secure password hashing with bcrypt
- Token-based session management
- Automatic token attachment to API requests

✅ **Role-Based Access Control (RBAC)**
- Three-tier role hierarchy: OWNER → ADMIN → VIEWER
- Organization-based permission scoping
- Resource-level access control
- Audit logging for all actions

✅ **Task Management**
- Create, read, update, delete tasks
- Task categorization (WORK, PERSONAL, URGENT, OTHER)
- Status tracking (TODO, IN_PROGRESS, DONE)
- Drag-and-drop reordering (Kanban-style)

✅ **Organization Hierarchy**
- 2-level organization structure
- Parent-child relationships
- Inherited permissions for ADMIN role

✅ **User Interface**
- Responsive design (mobile to desktop)
- Dark/light mode toggle
- Real-time filtering by category and status
- Visual statistics (total, in progress, completed)
- Intuitive Kanban board layout

✅ **Testing**
- Backend unit tests with Jest
- RBAC logic thoroughly tested
- Authentication flow tested
- Frontend test configuration with Karma

---

## Future Considerations

### Security Enhancements

1. **JWT Refresh Tokens**
   - Implement short-lived access tokens (15 minutes)
   - Long-lived refresh tokens (7 days) stored securely
   - Token rotation on refresh
   - Revocation list for compromised tokens

2. **CSRF Protection**
   - Implement CSRF tokens for state-changing operations
   - SameSite cookie attributes
   - Origin validation

3. **Rate Limiting**
   - Per-user API rate limits
   - Failed login attempt throttling
   - DDoS protection

4. **Password Security**
   - Password complexity requirements
   - Password expiration policies
   - Previous password checking
   - Multi-factor authentication (MFA)

### Performance Optimizations

1. **RBAC Caching**
   - Cache organization hierarchy in Redis
   - Cache user permissions with TTL
   - Invalidate cache on role/organization changes

2. **Database Optimization**
   - Add indexes on frequently queried fields (organizationId, userId, status)
   - Implement database connection pooling
   - Query result pagination for large datasets
   - Consider migrating to PostgreSQL for production

3. **API Optimization**
   - Implement GraphQL for flexible querying
   - Response compression (gzip)
   - HTTP/2 support
   - CDN for static assets

### Feature Enhancements

1. **Advanced Role Delegation**
   - Custom roles with granular permissions
   - Temporary permission grants
   - Role templates
   - Permission inheritance rules

2. **Task Management**
   - Task dependencies and subtasks
   - Task assignments to multiple users
   - Due dates and reminders
   - File attachments
   - Comment threads

3. **Collaboration**
   - Real-time updates using WebSockets
   - Team notifications
   - @mentions in task descriptions
   - Activity feeds

4. **Reporting and Analytics**
   - Task completion trends
   - User productivity metrics
   - Organization-wide dashboards
   - Export reports (PDF, CSV)

### Scalability Considerations

1. **Microservices Architecture**
   - Split auth, tasks, and audit into separate services
   - API Gateway for routing
   - Event-driven architecture with message queues

2. **Database Scaling**
   - Read replicas for query performance
   - Sharding by organization
   - Implement CQRS pattern for complex queries

3. **Infrastructure**
   - Containerization with Docker
   - Kubernetes orchestration
   - Horizontal pod autoscaling
   - Multi-region deployment

### Monitoring and Observability

1. **Logging**
   - Structured logging with correlation IDs
   - Centralized log aggregation (ELK stack)
   - Log retention policies

2. **Metrics**
   - Application performance monitoring (APM)
   - Custom business metrics
   - Real-time alerting

3. **Tracing**
   - Distributed tracing for request flows
   - Performance bottleneck identification

---

## Technical Decisions and Tradeoffs

### SQLite vs PostgreSQL
**Decision:** Used SQLite for development
**Rationale:** 
- Zero configuration setup
- File-based storage simplifies initial development
- Easy to seed and reset during testing
**Production Recommendation:** Migrate to PostgreSQL for better concurrency and performance

### Monorepo Structure
**Decision:** NX-style monorepo without NX CLI
**Rationale:**
- Maintains logical structure and code sharing benefits
- Avoids additional tooling complexity
- Simpler for reviewers to understand
**Consideration:** Full NX CLI would add workspace generators and caching

### JWT Storage in LocalStorage
**Decision:** Store JWT in browser localStorage
**Rationale:**
- Simple implementation
- Works across tabs
- Easy to debug
**Security Note:** For production, consider httpOnly cookies to prevent XSS attacks

### Direct TypeORM Usage
**Decision:** Use TypeORM directly without repository pattern
**Rationale:**
- Simpler for this scope
- Less boilerplate code
**Future Enhancement:** Implement repository pattern for better testability

---

## Known Limitations

1. **No JWT Refresh**: Tokens expire after 24 hours, requiring re-login
2. **No Pagination**: All tasks loaded at once (fine for demo, needs pagination at scale)
3. **Basic Audit Logging**: Logs to database only, no external monitoring
4. **No Email Verification**: Users created via seed script, no signup flow
5. **Limited Error Handling**: Basic error messages, could be more descriptive

---

## Project Statistics

- **Lines of Code:** ~3,500
- **Files:** ~45
- **Backend Tests:** 18 tests, 100% passing
- **Test Coverage:** >80%
- **Development Time:** ~8 hours

---

## Author

**Shreya**

Repository: `shreya-2e64639c-cb11-4573-8bc6-e0d8aaae026b`
