import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  /**
   * Get the current user's profile
   */
  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  /**
   * Update the user's profile
   * @param formData Form data including name and optional profile picture
   */
  updateProfile(formData: FormData): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/profile`, formData, {
      headers: this.authService.getAuthHeaders()
    });
  }
} 