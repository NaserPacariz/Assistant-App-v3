import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { Auth, getAuth, signInWithEmailAndPassword } from '@angular/fire/auth';

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
    const auth = getAuth();
    return new Observable((observer) => {
        signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const idToken = await userCredential.user.getIdToken(); // Get the ID token
                const payload = { firebaseToken: idToken }; // Send ID token to backend

                this.http.post(`${this.BASE_URL}/login`, payload).subscribe(
                    (res: any) => {
                        localStorage.setItem('token', res.token); // Save custom token in local storage
                        localStorage.setItem('role', res.role); // Save role for frontend use
                        localStorage.setItem('uid', userCredential.user.uid); // Save UID
                        observer.next(res);
                        observer.complete();
                    },
                    (err) => observer.error(err)
                );
            })
            .catch((error) => observer.error(error));
    });
}

}
