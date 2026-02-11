# COMPLETE FIX - Run These Commands in Order

## TERMINAL 1: Stop the frontend (Ctrl+C if running)

Then run these commands:

```bash
cd /Users/shreya/Downloads/task-management/apps/dashboard

# Create environment file
mkdir -p src/environments
cat > src/environments/environment.ts << 'EOF'
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
EOF

# Fix angular.json (copy entire block)
cat > angular.json << 'EOFANG'
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "dashboard": {
      "projectType": "application",
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "outputPath": "dist/dashboard",
            "index": "src/index.html",
            "main": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json",
            "assets": ["src/assets"],
            "styles": ["src/styles.css"],
            "scripts": []
          },
          "configurations": {
            "production": {
              "budgets": [{"type": "initial", "maximumWarning": "500kb", "maximumError": "1mb"}],
              "outputHashing": "all"
            },
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "configurations": {
            "production": {"buildTarget": "dashboard:build:production"},
            "development": {"buildTarget": "dashboard:build:development"}
          },
          "defaultConfiguration": "development"
        },
        "test": {
          "builder": "@angular-devkit/build-angular:karma",
          "options": {
            "polyfills": ["zone.js", "zone.js/testing"],
            "tsConfig": "tsconfig.spec.json",
            "assets": ["src/assets"],
            "styles": ["src/styles.css"],
            "scripts": []
          }
        }
      }
    }
  }
}
EOFANG

# Fix login component (@ symbols to &#64;)
cat > src/app/components/login/login.component.html << 'EOFLOGIN'
<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
  <div class="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
    <div>
      <h2 class="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
        Task Management System
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
        Sign in to your account
      </p>
    </div>
    
    <form class="mt-8 space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      @if (errorMessage) {
        <div class="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <p class="text-sm text-red-800 dark:text-red-300">{{ errorMessage }}</p>
        </div>
      }
      
      <div class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email address
          </label>
          <input
            id="email"
            type="email"
            formControlName="email"
            required
            class="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            formControlName="password"
            required
            class="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter your password"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          [disabled]="!loginForm.valid || loading"
          class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          @if (loading) {
            <span>Signing in...</span>
          } @else {
            <span>Sign in</span>
          }
        </button>
      </div>
    </form>

    <div class="mt-4 text-sm text-gray-600 dark:text-gray-400">
      <p class="font-semibold mb-2">Test Accounts:</p>
      <div class="space-y-1 text-xs">
        <p>Owner: owner&#64;acme.com / password123</p>
        <p>Admin: admin&#64;acme.com / password123</p>
        <p>Viewer: viewer&#64;acme.com / password123</p>
      </div>
    </div>
  </div>
</div>
EOFLOGIN

# Now start the frontend
npm start
```

## TERMINAL 2: Fix and run seed script

Your backend is already running! Just need to seed the database.

Stop the seed command (Ctrl+C) and run:

```bash
cd /Users/shreya/Downloads/task-management/apps/api

# Replace the broken seed.ts file
cat > src/seed.ts << 'EOFSEED'
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Organization } from './entities/organization.entity';
import { Task } from './entities/task.entity';
import { UserRole, TaskStatus, TaskCategory } from '../../../libs/data/interfaces';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: process.env.DATABASE_PATH || 'data/task-management.db',
  entities: [User, Organization, Task],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('Database initialized');

  const organizationRepo = AppDataSource.getRepository(Organization);
  const userRepo = AppDataSource.getRepository(User);
  const taskRepo = AppDataSource.getRepository(Task);

  await taskRepo.delete({});
  await userRepo.delete({});
  await organizationRepo.delete({});

  const parentOrg = organizationRepo.create({
    name: 'Acme Corporation',
    level: 0,
  });
  await organizationRepo.save(parentOrg);

  const childOrg = organizationRepo.create({
    name: 'Acme Engineering',
    parentId: parentOrg.id,
    level: 1,
  });
  await organizationRepo.save(childOrg);

  const hashedPassword = await bcrypt.hash('password123', 10);

  const owner = userRepo.create({
    email: 'owner@acme.com',
    name: 'Alice Owner',
    password: hashedPassword,
    role: UserRole.OWNER,
    organizationId: parentOrg.id,
  });
  await userRepo.save(owner);

  const admin = userRepo.create({
    email: 'admin@acme.com',
    name: 'Bob Admin',
    password: hashedPassword,
    role: UserRole.ADMIN,
    organizationId: parentOrg.id,
  });
  await userRepo.save(admin);

  const viewer = userRepo.create({
    email: 'viewer@acme.com',
    name: 'Charlie Viewer',
    password: hashedPassword,
    role: UserRole.VIEWER,
    organizationId: childOrg.id,
  });
  await userRepo.save(viewer);

  const tasks = [
    {
      title: 'Implement authentication',
      description: 'Add JWT-based authentication to the API',
      status: TaskStatus.DONE,
      category: TaskCategory.WORK,
      userId: owner.id,
      organizationId: parentOrg.id,
      order: 0,
    },
    {
      title: 'Design database schema',
      description: 'Create ERD for task management system',
      status: TaskStatus.DONE,
      category: TaskCategory.WORK,
      userId: admin.id,
      organizationId: parentOrg.id,
      order: 1,
    },
    {
      title: 'Build Angular dashboard',
      description: 'Create responsive frontend',
      status: TaskStatus.IN_PROGRESS,
      category: TaskCategory.WORK,
      userId: viewer.id,
      organizationId: childOrg.id,
      order: 2,
    },
    {
      title: 'Write API documentation',
      description: 'Document all REST endpoints',
      status: TaskStatus.TODO,
      category: TaskCategory.WORK,
      userId: owner.id,
      organizationId: parentOrg.id,
      order: 3,
    },
    {
      title: 'Buy groceries',
      description: 'Milk, bread, eggs',
      status: TaskStatus.TODO,
      category: TaskCategory.PERSONAL,
      userId: viewer.id,
      organizationId: childOrg.id,
      order: 4,
    },
  ];

  for (const taskData of tasks) {
    const task = taskRepo.create(taskData);
    await taskRepo.save(task);
  }

  console.log('✅ Database seeded successfully!');
  console.log('\nTest Users:');
  console.log('Owner: owner@acme.com / password123');
  console.log('Admin: admin@acme.com / password123');
  console.log('Viewer: viewer@acme.com / password123');

  await AppDataSource.destroy();
}

seed().catch(console.error);
EOFSEED

# Now run the seed
mkdir -p data
npx ts-node src/seed.ts
```

## TERMINAL 3: Backend

Your backend is ALREADY RUNNING! ✅  
You should see: `🚀 API server running on http://localhost:3000`

Leave it running!

---

## After Running All Commands:

Open your browser to: **http://localhost:4200**

Login with: **owner@acme.com** / **password123**

You should now see the task management dashboard! 🎉
