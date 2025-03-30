import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskBoard } from '../../models/task.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getTaskBoards(): Observable<TaskBoard[]> {
    return this.http.get<TaskBoard[]>(`${this.apiUrl}/boards`, { 
      headers: this.authService.getAuthHeaders() 
    });
  }

  addTaskBoard(board: TaskBoard): Observable<TaskBoard> {
    return this.http.post<TaskBoard>(`${this.apiUrl}/board`, board, { 
      headers: this.authService.getAuthHeaders() 
    });
  }

  updateTaskBoard(board: TaskBoard): Observable<TaskBoard> {
    return this.http.put<TaskBoard>(`${this.apiUrl}/board/${board.id}`, board, { 
      headers: this.authService.getAuthHeaders() 
    });
  }

  deleteTaskBoard(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/board/${id}`, { 
      headers: this.authService.getAuthHeaders() 
    });
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}`, { 
      headers: this.authService.getAuthHeaders() 
    });
  }

  addTask(task: { title: string; boardId: string; userId: string }): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/task`, task, { 
      headers: this.authService.getAuthHeaders() 
    });
  }

  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${task.id}`, task, { 
      headers: this.authService.getAuthHeaders() 
    });
  }

  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/task/${taskId}`, { 
      headers: this.authService.getAuthHeaders() 
    });
  }

  moveTask(taskId: string, targetBoardId: string): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/move/${taskId}`, { targetBoardId }, { 
      headers: this.authService.getAuthHeaders() 
    });
  }
}
