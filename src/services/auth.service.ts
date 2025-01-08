import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

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

  constructor(private http: HttpClient, private firebaseAuth: Auth) {} // Inject Firebase Auth

  // Login method
  login(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.firebaseAuth, email, password)).pipe(
      switchMap((userCredential) => {
        // Get Firebase token
        return from(userCredential.user.getIdToken()).pipe(
          switchMap((firebaseToken) => {
            // Call the backend to handle roles and custom claims
            return this.http.post(`${this.BASE_URL}/login`, { email, firebaseToken }).pipe(
              tap((res: any) => {
                if (res.token) {
                  localStorage.setItem('token', res.token);

                  // Decode the token
                  const decodedToken = JSON.parse(atob(res.token.split('.')[1]));
                  localStorage.setItem('role', decodedToken.role || 'user');
                  localStorage.setItem('userId', decodedToken.uid); // Save userId in localStorage
                }
              })
            );
          })
        );
      })
    );
  }
}
