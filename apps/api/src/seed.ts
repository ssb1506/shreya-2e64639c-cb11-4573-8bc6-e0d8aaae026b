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

  // Clear existing data
  await taskRepo.clear();
  await userRepo.clear();
  await organizationRepo.clear();

  // Create parent organization
  const parentOrg = organizationRepo.create({
    name: 'Acme Corporation',
    level: 0,
  });
  await organizationRepo.save(parentOrg);

  // Create child organization
  const childOrg = organizationRepo.create({
    name: 'Acme Engineering',
    parentId: parentOrg.id,
    level: 1,
  });
  await organizationRepo.save(childOrg);

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create users with different roles
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

  // Create sample tasks
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