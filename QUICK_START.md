# Quick Start Guide

Get the Task Management System running in 5 minutes!

## Prerequisites
- Node.js v18+ and npm v9+
- Terminal/Command Prompt

## Step 1: Setup Backend (2 minutes)

```bash
# Navigate to API directory
cd apps/api

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Build the application
npm run build

# Create database directory and seed data
mkdir -p data
npx ts-node src/seed.ts
```

You should see:
```
✅ Database seeded successfully!

Test Users:
Owner: owner@acme.com / password123
Admin: admin@acme.com / password123
Viewer: viewer@acme.com / password123
```

## Step 2: Start Backend (30 seconds)

```bash
# In the apps/api directory
npm run start:dev
```

You should see:
```
🚀 API server running on http://localhost:3000
```

## Step 3: Setup Frontend (2 minutes)

Open a **NEW terminal window**:

```bash
# Navigate to dashboard directory
cd apps/dashboard

# Install dependencies
npm install
```

## Step 4: Start Frontend (30 seconds)

```bash
# In the apps/dashboard directory
npm start
```

You should see:
```
** Angular Live Development Server is listening on localhost:4200 **
```

## Step 5: Test the Application

1. Open your browser to **http://localhost:4200**
2. Login with any test account:
   - **Owner**: `owner@acme.com` / `password123`
   - **Admin**: `admin@acme.com` / `password123`
   - **Viewer**: `viewer@acme.com` / `password123`
3. Try these features:
   - ✅ Create a new task
   - ✅ Drag tasks between columns (TODO → IN PROGRESS → DONE)
   - ✅ Edit a task
   - ✅ Delete a task
   - ✅ Toggle dark/light mode
   - ✅ Filter by category or status

## Testing Different Roles

### As Owner (owner@acme.com)
- Can see ALL tasks from both parent and child organizations
- Can create, edit, and delete ANY task
- Can view audit logs

### As Admin (admin@acme.com)
- Can see tasks from parent and child organizations
- Can create, edit, and delete tasks in their organization
- Can view audit logs

### As Viewer (viewer@acme.com)
- Can ONLY see their own tasks
- Can create tasks
- Can ONLY edit/delete their own tasks
- CANNOT view audit logs

## Troubleshooting

### Backend won't start?
```bash
# Check if port 3000 is already in use
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process if needed
```

### Frontend won't start?
```bash
# Check if port 4200 is already in use
lsof -i :4200  # Mac/Linux
netstat -ano | findstr :4200  # Windows
```

### Database errors?
```bash
# Delete and recreate the database
cd apps/api
rm -rf data
mkdir -p data
npx ts-node src/seed.ts
```

### "Cannot find module" errors?
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Testing the API Directly

You can test the API using curl or Postman:

### 1. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@acme.com","password":"password123"}'
```

Copy the `accessToken` from the response.

### 2. Get Tasks
```bash
curl http://localhost:3000/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Create Task
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "Testing API",
    "category": "WORK",
    "status": "TODO"
  }'
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design diagrams
- Run tests: `npm test` in both apps/api and apps/dashboard
- Explore the code structure in the [README.md](README.md#architecture-overview)

## Need Help?

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| Port already in use | Change PORT in .env or kill existing process |
| Module not found | Run `npm install` again |
| Database locked | Stop all running processes, delete data folder |
| CORS errors | Check FRONTEND_URL in .env matches your frontend URL |
| 401 Unauthorized | Token expired, login again |

---

**Congratulations!** 🎉 You now have a fully functional task management system with role-based access control.
