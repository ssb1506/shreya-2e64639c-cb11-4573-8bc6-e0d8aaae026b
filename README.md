# Secure Task Management System

A full-stack task management application with role-based access control (RBAC), built with NestJS, Angular, and TypeScript in an NX monorepo.

## Table of Contents
- [Setup Instructions](#setup-instructions)
- [Architecture Overview](#architecture-overview)
- [Data Model](#data-model)
- [Access Control Implementation](#access-control-implementation)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Future Considerations](#future-considerations)

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd task-management
```

2. **Install Backend Dependencies**
```bash
cd apps/api
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../dashboard
npm install
```

4. **Configure Environment Variables**

Create a `.env` file in `apps/api/`:
```env
# Database
DATABASE_PATH=data/task-management.db

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production-minimum-32-characters

# Server
PORT=3000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:4200
```

### Running the Application

1. **Seed the Database**
```bash
cd apps/api
npm run build
mkdir -p data
npx ts-node src/seed.ts
```

This will create:
- Test organizations (parent and child)
- Three test users with different roles:
  - **Owner**: owner@acme.com / password123
  - **Admin**: admin@acme.com / password123
  - **Viewer**: viewer@acme.com / password123
- Sample tasks

2. **Start the Backend (Terminal 1)**
```bash
cd apps/api
npm run start:dev
```
The API will run on `http://localhost:3000`

3. **Start the Frontend (Terminal 2)**
```bash
cd apps/dashboard
npm start
```
The dashboard will run on `http://localhost:4200`

4. **Access the Application**
- Open `http://localhost:4200` in your browser
- Login with one of the test accounts
- Start managing tasks!

## Architecture Overview

### NX Monorepo Layout

```
task-management/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/          # Authentication module
│   │   │   ├── tasks/         # Tasks module
│   │   │   ├── audit/         # Audit logging module
│   │   │   ├── entities/      # TypeORM entities
│   │   │   ├── main.ts        # Application entry
│   │   │   └── seed.ts        # Database seeding
│   │   └── package.json
│   │
│   └── dashboard/              # Angular Frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── components/    # UI components
│       │   │   ├── services/      # API services
│       │   │   ├── guards/        # Route guards
│       │   │   └── app.routes.ts  # Routing config
│       │   └── styles.css
│       └── package.json
│
└── libs/
    ├── data/                   # Shared TypeScript interfaces and DTOs
    │   └── interfaces.ts       # Common types across backend/frontend
    │
    └── auth/                   # Reusable RBAC logic
        ├── decorators.ts       # Custom decorators
        └── rbac.service.ts     # Role-based access control logic
```

### Rationale

**Monorepo Benefits:**
- **Code Sharing**: Shared interfaces and types ensure consistency between frontend and backend
- **Atomic Changes**: Changes to shared types propagate to both apps
- **Unified Testing**: Test coverage across the entire stack
- **Developer Experience**: Single repository, consistent tooling

**Modular Structure:**
- **Separation of Concerns**: Each module has a single responsibility
- **Reusability**: Auth logic is abstracted into shared libraries
- **Scalability**: Easy to add new apps or features
- **Maintainability**: Clear boundaries between modules

## Data Model

### Entity Relationship Diagram

```
┌─────────────────┐         ┌──────────────────┐
│  Organization   │◄────────┤  Organization    │
│                 │ parent  │  (child)         │
├─────────────────┤         ├──────────────────┤
│ id (PK)         │         │ id (PK)          │
│ name            │         │ name             │
│ parentId (FK)   │         │ parentId (FK)    │
│ level (0 or 1)  │         │ level (0 or 1)   │
└────────┬────────┘         └──────────────────┘
         │
         │ 1:N
         │
    ┌────▼─────┐
    │   User   │
    ├──────────┤
    │ id (PK)  │
    │ email    │◄──────────┐
    │ name     │           │
    │ password │           │
    │ role     │           │
    │ orgId(FK)│           │
    └────┬─────┘           │
         │                 │
         │ 1:N             │
         │                 │
    ┌────▼─────┐           │
    │   Task   │           │
    ├──────────┤           │
    │ id (PK)  │           │
    │ title    │           │
    │ desc     │           │
    │ status   │           │
    │ category │           │
    │ order    │           │
    │ userId(FK)──────────┘
    │ orgId(FK)│
    └──────────┘
         ▲
         │
         │ 1:N
         │
    ┌────┴──────┐
    │ AuditLog  │
    ├───────────┤
    │ id (PK)   │
    │ userId(FK)│
    │ action    │
    │ resType   │
    │ resId     │
    │ timestamp │
    │ details   │
    └───────────┘
```

### Schema Description

#### Organizations
- **2-level hierarchy**: Parent (level 0) and Child (level 1) organizations
- **Purpose**: Group users and tasks by organizational structure
- **Relationships**: 
  - Self-referencing for parent-child relationship
  - One-to-many with Users and Tasks

#### Users
- **Authentication**: Password hashed with bcrypt (10 rounds)
- **Roles**: OWNER, ADMIN, VIEWER (hierarchical)
- **Organization Membership**: Each user belongs to one organization
- **Relationships**:
  - Many-to-one with Organization
  - One-to-many with Tasks
  - One-to-many with AuditLogs

#### Tasks
- **Core Fields**: title, description, status, category, order
- **Status**: TODO, IN_PROGRESS, DONE
- **Category**: WORK, PERSONAL, URGENT, OTHER
- **Ownership**: Tied to both User and Organization
- **Purpose**: Track work items with drag-and-drop ordering

#### AuditLogs
- **Actions Tracked**: CREATE, UPDATE, DELETE
- **Resource Types**: Task (extensible to User, Organization)
- **Details**: JSON-serialized additional information
- **Purpose**: Security, compliance, and debugging

## Access Control Implementation

### Role Hierarchy

```
OWNER (Level 3) - Full control
  ↓
ADMIN (Level 2) - Manage organization
  ↓
VIEWER (Level 1) - Read own resources
```

### Role Permissions Matrix

| Action | Resource | OWNER | ADMIN | VIEWER |
|--------|----------|-------|-------|--------|
| Create Task | Own Org | ✓ | ✓ | ✓ |
| View Task | Own Org | ✓ | ✓ | Own only |
| View Task | Child Org | ✓ | ✓ | ✗ |
| Edit Task | Any in Org | ✓ | ✓ | Own only |
| Delete Task | Any in Org | ✓ | ✓ | Own only |
| View Audit Logs | - | ✓ | ✓ | ✗ |

### Organization-Level Access

**Hierarchy Rules:**
1. Users can always access resources in their own organization
2. Owners and Admins can access child organizations
3. Viewers are restricted to their own organization
4. No cross-organization access (except parent-child)

### RBAC Implementation

**Backend Guards:**
```typescript
// JwtAuthGuard - Validates JWT tokens on all endpoints
@UseGuards(JwtAuthGuard)

// RolesGuard - Checks role requirements
@UseGuards(RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
```

**Service-Level Checks:**
- `RBACService.canModifyResource()` - Permission to edit
- `RBACService.canDeleteResource()` - Permission to delete
- `RBACService.canAccessOrganization()` - Organizational access
- `RBACService.hasRole()` - Role hierarchy validation

**JWT Payload:**
```typescript
{
  sub: string,           // User ID
  email: string,         // User email
  role: UserRole,        // User role
  organizationId: string // Organization membership
}
```

### Authentication Flow

1. **Login**: User submits email/password
2. **Validation**: Password verified with bcrypt
3. **Token Generation**: JWT signed with user claims
4. **Client Storage**: Token stored in localStorage
5. **Request Authentication**: Token sent in Authorization header
6. **Token Validation**: JwtStrategy validates and extracts user
7. **Authorization**: Guards check role/organization permissions

## API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication Endpoints

#### POST `/auth/login`
Login and receive JWT token.

**Request:**
```json
{
  "email": "owner@acme.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "owner@acme.com",
    "name": "Alice Owner",
    "role": "OWNER",
    "organizationId": "org-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Task Endpoints

All task endpoints require JWT authentication via `Authorization: Bearer <token>` header.

#### POST `/tasks`
Create a new task.

**Request:**
```json
{
  "title": "Implement authentication",
  "description": "Add JWT-based auth to the API",
  "category": "WORK",
  "status": "TODO"
}
```

**Response:**
```json
{
  "id": "task-uuid",
  "title": "Implement authentication",
  "description": "Add JWT-based auth to the API",
  "status": "TODO",
  "category": "WORK",
  "order": 0,
  "userId": "user-uuid",
  "organizationId": "org-uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### GET `/tasks`
List all accessible tasks (scoped by role and organization).

**Response:**
```json
[
  {
    "id": "task-uuid",
    "title": "Implement authentication",
    "description": "Add JWT-based auth to the API",
    "status": "DONE",
    "category": "WORK",
    "order": 0,
    "userId": "user-uuid",
    "organizationId": "org-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET `/tasks/:id`
Get a specific task by ID.

**Response:** Same as POST response

**Errors:**
- `404`: Task not found
- `403`: No permission to access this task

#### PUT `/tasks/:id`
Update a task (if permitted).

**Request:**
```json
{
  "title": "Updated title",
  "status": "IN_PROGRESS",
  "order": 5
}
```

**Response:** Updated task object

**Errors:**
- `404`: Task not found
- `403`: No permission to modify this task

#### DELETE `/tasks/:id`
Delete a task (if permitted).

**Response:** `204 No Content`

**Errors:**
- `404`: Task not found
- `403`: No permission to delete this task

### Audit Endpoints

#### GET `/audit-log`
View access logs (OWNER and ADMIN only).

**Query Parameters:**
- `limit` (optional): Number of logs to return (default: 100)

**Request:**
```
GET /audit-log?limit=50
```

**Response:**
```json
[
  {
    "id": "log-uuid",
    "userId": "user-uuid",
    "action": "CREATE",
    "resourceType": "Task",
    "resourceId": "task-uuid",
    "details": "{\"title\":\"New task\"}",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": "user-uuid",
      "email": "owner@acme.com",
      "name": "Alice Owner"
    }
  }
]
```

**Errors:**
- `403`: Insufficient permissions (Viewers cannot access)

### Error Responses

All endpoints may return:

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "statusCode": 403,
  "message": "You do not have permission to perform this action"
}
```

**500 Internal Server Error:**
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

## Testing

### Backend Tests

**Run all tests:**
```bash
cd apps/api
npm test
```

**Run tests with coverage:**
```bash
npm run test:cov
```

**Test Files:**
- `auth/rbac.service.spec.ts` - RBAC logic tests
- `auth/auth.service.spec.ts` - Authentication tests

**Coverage Areas:**
- Role hierarchy validation
- Resource modification permissions
- JWT authentication
- Password hashing and validation

### Frontend Tests

**Run all tests:**
```bash
cd apps/dashboard
npm test
```

**Test Files:**
- Component tests (login, dashboard)
- Service tests (auth, tasks, theme)
- Guard tests (auth guard)

## Future Considerations

### Advanced Role Delegation
- **Dynamic Roles**: Allow custom roles beyond OWNER/ADMIN/VIEWER
- **Fine-Grained Permissions**: Specific permissions per resource type
- **Role Assignment**: Owners can delegate specific permissions to users
- **Temporary Access**: Time-limited role assignments
- **Team-Based Permissions**: Group users into teams with shared access

### Production-Ready Security

#### JWT Refresh Tokens
```typescript
// Current: 24-hour access tokens
// Future: 15-minute access + 7-day refresh tokens
interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

POST /auth/refresh
{
  "refreshToken": "..."
}
```

#### CSRF Protection
```typescript
// Add CSRF tokens for state-changing operations
app.use(csurf({ cookie: true }));

// Include in forms/AJAX requests
<input type="hidden" name="_csrf" value="{{ csrfToken }}">
```

#### RBAC Caching
```typescript
// Cache permission checks to reduce database queries
@Injectable()
export class RBACCacheService {
  // Redis or in-memory cache
  async checkPermission(userId: string, resource: string, action: string) {
    const cacheKey = `rbac:${userId}:${resource}:${action}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    
    const hasPermission = await this.rbacService.check(...);
    await this.cache.set(cacheKey, hasPermission, TTL);
    return hasPermission;
  }
}
```

### Efficient Scaling of Permission Checks

#### Database Optimization
- **Indexes**: Add composite indexes on (organizationId, userId)
- **Query Optimization**: Use joins instead of N+1 queries
- **Denormalization**: Store computed permissions in user table
- **Materialized Views**: Pre-compute organization hierarchies

#### Architecture Improvements
- **Microservices**: Separate auth service for horizontal scaling
- **Event-Driven**: Use message queues for audit logs
- **Read Replicas**: Separate read/write databases
- **API Gateway**: Rate limiting and request routing

#### Performance Targets
- **Permission Check**: < 10ms
- **Task List Query**: < 50ms for 10,000 tasks
- **Concurrent Users**: Support 10,000+ simultaneous users

### Additional Features
- **Multi-Factor Authentication**: SMS or TOTP-based 2FA
- **OAuth Integration**: Login with Google, GitHub, etc.
- **Real-Time Updates**: WebSocket support for live collaboration
- **Task Dependencies**: Link related tasks
- **File Attachments**: Upload documents to tasks
- **Email Notifications**: Alert users of task updates
- **Advanced Filtering**: Search, tags, custom fields
- **Analytics Dashboard**: Task completion metrics, velocity charts
- **Mobile App**: Native iOS/Android applications
- **Export**: PDF, CSV, Excel export of tasks

### Deployment Considerations
- **Docker**: Containerize both apps
- **CI/CD**: Automated testing and deployment
- **Environment Management**: Separate dev/staging/production
- **Monitoring**: Application performance monitoring (APM)
- **Logging**: Centralized logging (ELK stack)
- **Backup**: Automated database backups
- **SSL/TLS**: HTTPS in production
- **CDN**: Serve frontend assets via CDN

---

## License
MIT

## Author
Created as part of the Full Stack Coding Challenge
