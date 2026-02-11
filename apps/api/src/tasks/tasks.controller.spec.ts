import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { UserRole, TaskStatus, TaskCategory } from '../../../../libs/data/interfaces';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockTasksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRequest = {
    user: {
      userId: 'user-1',
      organizationId: 'org-1',
      role: UserRole.ADMIN,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const createTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        category: TaskCategory.WORK,
        status: TaskStatus.TODO,
      };

      const expectedTask = {
        id: 'task-1',
        ...createTaskDto,
        userId: 'user-1',
        organizationId: 'org-1',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTasksService.create.mockResolvedValue(expectedTask);

      const result = await controller.create(createTaskDto, mockRequest);

      expect(result).toEqual(expectedTask);
      expect(service.create).toHaveBeenCalledWith(
        createTaskDto,
        'user-1',
        'org-1',
        UserRole.ADMIN
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const expectedTasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Description 1',
          status: TaskStatus.TODO,
          category: TaskCategory.WORK,
          userId: 'user-1',
          organizationId: 'org-1',
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockTasksService.findAll.mockResolvedValue(expectedTasks);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual(expectedTasks);
      expect(service.findAll).toHaveBeenCalledWith(
        'user-1',
        'org-1',
        UserRole.ADMIN
      );
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateTaskDto = {
        title: 'Updated Task',
        status: TaskStatus.IN_PROGRESS,
      };

      const expectedTask = {
        id: 'task-1',
        ...updateTaskDto,
        description: 'Original Description',
        category: TaskCategory.WORK,
        userId: 'user-1',
        organizationId: 'org-1',
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTasksService.update.mockResolvedValue(expectedTask);

      const result = await controller.update('task-1', updateTaskDto, mockRequest);

      expect(result).toEqual(expectedTask);
      expect(service.update).toHaveBeenCalledWith(
        'task-1',
        updateTaskDto,
        'user-1',
        'org-1',
        UserRole.ADMIN
      );
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      mockTasksService.remove.mockResolvedValue(undefined);

      await controller.remove('task-1', mockRequest);

      expect(service.remove).toHaveBeenCalledWith(
        'task-1',
        'user-1',
        'org-1',
        UserRole.ADMIN
      );
    });
  });
});
