import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskBoard } from '../../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/api/tasks';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `${token}`
    });
  }

  getTaskBoards(): Observable<TaskBoard[]> {
    return this.http.get<TaskBoard[]>(`${this.apiUrl}/boards`, { headers: this.getHeaders() });
  }

  addTaskBoard(board: TaskBoard): Observable<TaskBoard> {
    return this.http.post<TaskBoard>(`${this.apiUrl}/board`, board, { headers: this.getHeaders() });
  }

  updateTaskBoard(board: TaskBoard): Observable<TaskBoard> {
    return this.http.put<TaskBoard>(`${this.apiUrl}/board/${board.id}`, board, { headers: this.getHeaders() });
  }

  deleteTaskBoard(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/board/${id}`, { headers: this.getHeaders() });
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}`, { headers: this.getHeaders() });
  }

  addTask(task: { title: string; boardId: string; userId: string }): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/task`, task, { headers: this.getHeaders() });
  }

  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${task.id}`, task, { headers: this.getHeaders() });
  }

  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/task/${taskId}`, { headers: this.getHeaders() });
  }

  moveTask(taskId: string, targetBoardId: string): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/move/${taskId}`, { targetBoardId }, { headers: this.getHeaders() });
  }
}
