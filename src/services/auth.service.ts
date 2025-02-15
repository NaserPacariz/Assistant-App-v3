import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth, getAuth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private BASE_URL = "https://backend-eight-delta-39.vercel.app";

  constructor(private http: HttpClient, private firebaseAuth: Auth, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    const auth = getAuth();
    return new Observable((observer) => {
      signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const idToken = await userCredential.user.getIdToken();
          
          console.log('Generated Firebase Token:', idToken); // Debugging step
          
          const payload = { firebaseToken: idToken };

          this.http.post(`${this.BASE_URL}/login`, payload).subscribe(
            (res: any) => {
              console.log('Login response:', res); // Debugging step

              localStorage.setItem('token', res.token);
              localStorage.setItem('role', res.role);
              localStorage.setItem('uid', userCredential.user.uid);

              const returnUrl = localStorage.getItem('returnUrl') || '/home';
              this.router.navigate([returnUrl]);

              observer.next(res);
              observer.complete();
            },
            (err) => {
              console.error('Login API Error:', err); // Debugging step
              observer.error(err);
            }
          );
        })
        .catch((error) => {
          console.error('Firebase Auth Error:', error); // Debugging step
          observer.error(error);
        });
    });
  }
}
