import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// Define an interface for the expected login response
interface LoginResponse {
  token: string; // Token received from backend
  message?: string; // Optional message
  user?: any; // Optional user info (optional, depending on your backend)
}

@Injectable({
  providedIn: 'root', // Globally provide this service
})
export class AuthService {
  private BASE_URL = 'http://localhost:4000'; // Adjust backend URL as needed

  constructor(private http: HttpClient) {} // HttpClient is injected here

  // Login method
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}/login`, { email, password }).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          
          // Decode the token
          const decodedToken = JSON.parse(atob(res.token.split('.')[1]));
          console.log('Decoded Token:', decodedToken); // Verify role here
          localStorage.setItem('role', decodedToken.role || 'user');
        }
      })
    );
  }
}
