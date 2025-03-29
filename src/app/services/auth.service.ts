import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

interface AuthError {
  message: string;
  status: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private BASE_URL = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  register(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.BASE_URL}/register`, { email, password })
      .pipe(
        catchError(error => {
          throw this.handleError(error);
        })
      );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.BASE_URL}/login`, { email, password })
      .pipe(
        catchError(error => {
          throw this.handleError(error);
        })
      );
  }

  private handleError(error: any): AuthError {
    if (error.error instanceof ErrorEvent) {
      return {
        message: 'An error occurred. Please try again later.',
        status: 500
      };
    }
    return {
      message: error.error.message || 'An error occurred',
      status: error.status
    };
  }
}