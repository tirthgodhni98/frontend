import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private BASE_URL = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient) {}

  register(email: string, password: string) {
    return this.http.post(`${this.BASE_URL}/register`, { email, password });
  }

  login(email: string, password: string) {
    return this.http.post(`${this.BASE_URL}/login`, { email, password });
  }
}