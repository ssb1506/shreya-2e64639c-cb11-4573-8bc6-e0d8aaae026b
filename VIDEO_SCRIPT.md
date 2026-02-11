# Video Walkthrough Script

**Duration**: ~8-10 minutes  
**Format**: Screen recording with narration

## Introduction (30 seconds)

"Hello! I'm presenting my solution to the Full Stack Task Management System challenge. This is a secure, role-based task management application built with NestJS, Angular, and TypeScript in an NX-style monorepo.

Let me walk you through the key technical decisions, the architecture, and demonstrate the working system."

## Architecture Overview (1.5 minutes)

**[Show: File structure in IDE]**

"The project follows a monorepo structure with clear separation of concerns:

- **apps/api**: Our NestJS backend with TypeORM and SQLite
- **apps/dashboard**: Angular frontend with TailwindCSS
- **libs/data**: Shared TypeScript interfaces ensuring type safety
- **libs/auth**: Reusable RBAC logic

This structure provides several benefits: shared types prevent inconsistencies, the auth logic is reusable, and we maintain atomic changes across the stack.

**[Show: README.md architecture diagram]**

The system implements a complete authentication and authorization flow:
1. Users login with JWT-based authentication
2. Every request includes the JWT token
3. Guards validate the token and check RBAC permissions
4. Services enforce organization-level access control
5. All actions are logged for audit purposes"

## Data Model & RBAC (2 minutes)

**[Show: Database schema/ERD in README]**

"The data model supports a 2-level organizational hierarchy with robust access control:

**Organizations** can have parent-child relationships - this allows for company-wide and department-level organization.

**Users** belong to one organization and have one of three roles:
- OWNER: Full control, can access child organizations
- ADMIN: Manage their organization, can access children
- VIEWER: Can only see and modify their own tasks

**Tasks** are owned by users and organizations, with status tracking and categorization.

**Audit Logs** record every CREATE, UPDATE, and DELETE action for security and compliance.

**[Show: RBAC code - rbac.service.ts]**

The RBAC implementation uses role hierarchy. Owners have level 3 privileges, Admins level 2, and Viewers level 1. The service provides methods to check:
- Role sufficiency
- Organization access (including parent-child relationships)
- Resource modification permissions
- Resource deletion permissions

This ensures that Viewers can only modify their own tasks, while Admins and Owners can manage their entire organization."

## Authentication Implementation (1.5 minutes)

**[Show: auth.service.ts and jwt.strategy.ts]**

"Authentication is implemented with industry-standard JWT tokens - this is NOT mock authentication.

The flow works like this:
1. User submits credentials
2. Password is verified against bcrypt hash
3. JWT is signed with user claims: ID, email, role, and organization
4. Token is returned to the client and stored in localStorage
5. All subsequent requests include the token in the Authorization header

**[Show: JWT guard and interceptor]**

The JwtAuthGuard validates tokens on every request. If the token is invalid or expired, users get a 401 response and are redirected to login.

The Angular HTTP interceptor automatically attaches the token to every API request, and handles authentication errors gracefully."

## Live Demo (3 minutes)

**[Show: Running application in browser]**

"Let me demonstrate the working application. I'll show the different role capabilities.

**[Login as Owner]**

First, logging in as the Owner with email owner@acme.com. Notice the login page is fully styled with TailwindCSS and supports both light and dark modes.

After login, I can see the dashboard with:
- Statistics cards showing total, in-progress, and completed tasks
- Three columns for task status: TODO, IN PROGRESS, and DONE
- Filter controls for category and status

As an Owner, I can see tasks from BOTH the parent organization and child organization. Let me create a new task...

**[Create a task]**

The modal opens, I'll fill in:
- Title: 'Review architecture'
- Description: 'Evaluate monorepo structure'
- Category: Work
- Status: To Do

The task is created and immediately appears in the TODO column. Now let me demonstrate the drag-and-drop feature...

**[Drag task between columns]**

I can drag this task to IN PROGRESS - notice how it smoothly transitions and the statistics update in real-time. The status change is immediately persisted to the backend through the API.

**[Edit and Delete]**

I can edit any task by clicking the pencil icon, or delete with the trash icon. As an Owner, I have full permissions.

**[Toggle dark mode]**

The application supports dark mode - notice how all components smoothly transition with the theme.

**[Logout and login as Viewer]**

Now let me show the difference with a Viewer role. Logging in as viewer@acme.com...

As a Viewer, I can ONLY see my own tasks. The tasks created by the Owner and Admin are not visible. I can create my own tasks, but if I try to modify tasks from other users, I would get a 403 Forbidden error.

**[Show filters]**

The filtering works across categories and statuses, making it easy to focus on specific types of work."

## Code Quality & Testing (1 minute)

**[Show: Test files]**

"The codebase includes comprehensive unit tests:

**[Show: rbac.service.spec.ts]**

- RBAC logic is fully tested: role hierarchy, resource permissions, organizational access
  
**[Show: auth.service.spec.ts]**

- Authentication flows including successful login, invalid credentials, and password validation

**[Show: tasks.controller.spec.ts]**

- Controller endpoints with mocked services

The tests use Jest with appropriate mocking. While I would add E2E tests with more time, the current coverage validates the critical security paths."

## Key Tradeoffs & Future Work (1 minute)

**[Show: PROJECT_SUMMARY.md]**

"I made several pragmatic tradeoffs to deliver a complete solution within the time constraint:

**What I prioritized:**
- Complete, working RBAC implementation
- Real JWT authentication (not mock)
- Comprehensive documentation
- Clean, maintainable code
- Responsive UI with modern UX

**What I would add with more time:**
- Refresh token implementation for better security
- Comprehensive E2E test suite
- Rate limiting and request throttling
- Redis caching for permission checks
- WebSocket for real-time collaboration
- File attachments to tasks

**[Show: README.md Future Considerations]**

All of these are documented in the README's Future Considerations section, with specific implementation approaches."

## Conclusion (30 seconds)

"This solution demonstrates:
- Strong full-stack architecture with proper separation of concerns
- Production-grade RBAC and JWT authentication
- Modern frontend with excellent UX
- Comprehensive documentation
- Clear understanding of security and scalability concerns

The codebase is ready for the next phase: you can easily extend it with new features, the architecture scales well, and the documentation makes onboarding straightforward.

Thank you for reviewing my submission. I'm excited to discuss any aspects of the implementation!"

---

## Recording Tips

1. **Screen Setup**: 
   - Have IDE, browser, and terminal visible
   - Use 1920x1080 resolution
   - Clear desktop background

2. **Demo Preparation**:
   - Fresh database with seed data
   - Both backend and frontend running
   - Test the demo flow beforehand

3. **Audio**:
   - Use a decent microphone
   - Record in quiet environment
   - Speak clearly and at moderate pace

4. **Timing**:
   - Rehearse to stay under 10 minutes
   - Don't rush through code
   - Pause briefly when switching contexts

5. **What to Show**:
   - File structure
   - Key code sections (don't read line-by-line)
   - Working application
   - Different user roles
   - Key features in action
