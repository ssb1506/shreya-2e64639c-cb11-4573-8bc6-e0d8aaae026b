import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { ThemeService } from '../../services/theme.service';
import { Task, User, TaskStatus, TaskCategory } from '../../../../../../libs/data/interfaces';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  allTasks: Task[] = [];
  filteredTasks: Task[] = [];
  taskForm: FormGroup;
  showCreateModal = false;
  editingTask: Task | null = null;
  darkMode = false;
  
  filterCategory: string = '';
  filterStatus: string = '';
  
  draggedTask: Task | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private taskService: TaskService,
    private themeService: ThemeService,
    private router: Router
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: [TaskCategory.WORK, Validators.required],
      status: [TaskStatus.TODO, Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    this.themeService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
    
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.loadTasks().subscribe({
      next: (tasks) => {
        this.allTasks = tasks;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredTasks = this.allTasks.filter(task => {
      const categoryMatch = !this.filterCategory || task.category === this.filterCategory;
      const statusMatch = !this.filterStatus || task.status === this.filterStatus;
      return categoryMatch && statusMatch;
    });
  }

  getTasksByStatus(status: string): Task[] {
    return this.filteredTasks.filter(task => task.status === status);
  }

  editTask(task: Task): void {
    this.editingTask = task;
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      category: task.category,
      status: task.status
    });
  }

  deleteTask(task: Task): void {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      this.taskService.deleteTask(task.id).subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (error) => {
          alert('Error deleting task: ' + (error.error?.message || 'Unknown error'));
        }
      });
    }
  }

  saveTask(): void {
    if (this.taskForm.valid) {
      const taskData = this.taskForm.value;

      if (this.editingTask) {
        this.taskService.updateTask(this.editingTask.id, taskData).subscribe({
          next: () => {
            this.loadTasks();
            this.closeModal();
          },
          error: (error) => {
            alert('Error updating task: ' + (error.error?.message || 'Unknown error'));
          }
        });
      } else {
        this.taskService.createTask(taskData).subscribe({
          next: () => {
            this.loadTasks();
            this.closeModal();
          },
          error: (error) => {
            alert('Error creating task: ' + (error.error?.message || 'Unknown error'));
          }
        });
      }
    }
  }

  closeModal(): void {
    this.showCreateModal = false;
    this.editingTask = null;
    this.taskForm.reset({
      category: TaskCategory.WORK,
      status: TaskStatus.TODO
    });
  }

  onDragStart(event: DragEvent, task: Task): void {
    this.draggedTask = task;
    event.dataTransfer!.effectAllowed = 'move';
    (event.target as HTMLElement).style.opacity = '0.5';
  }

  onDragEnd(event: DragEvent): void {
    (event.target as HTMLElement).style.opacity = '1';
  }

  onDragOver(event: DragEvent, status: string): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  onDrop(event: DragEvent, newStatus: string): void {
    event.preventDefault();
    
    if (this.draggedTask && this.draggedTask.status !== newStatus) {
      this.taskService.updateTask(this.draggedTask.id, { status: newStatus as TaskStatus }).subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (error) => {
          alert('Error updating task status: ' + (error.error?.message || 'Unknown error'));
        }
      });
    }
    
    this.draggedTask = null;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
