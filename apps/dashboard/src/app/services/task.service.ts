import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task } from '../../../../../libs/data/interfaces';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${environment.apiUrl}/tasks`).pipe(
      tap(tasks => this.tasksSubject.next(tasks))
    );
  }

  createTask(task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(`${environment.apiUrl}/tasks`, task).pipe(
      tap(() => {
        this.loadTasks().subscribe();
      })
    );
  }

  updateTask(id: string, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${environment.apiUrl}/tasks/${id}`, task).pipe(
      tap(() => {
        this.loadTasks().subscribe();
      })
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/tasks/${id}`).pipe(
      tap(() => {
        const tasks = this.tasksSubject.value.filter(t => t.id !== id);
        this.tasksSubject.next(tasks);
      })
    );
  }
}
