import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth, getAuth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private BASE_URL = "https://backend-rouge-ten-87.vercel.app";

  constructor(private http: HttpClient, private firebaseAuth: Auth, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    const auth = getAuth();
    return new Observable((observer) => {
      signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const idToken = await userCredential.user.getIdToken();
          
          console.log("Generated Token:", idToken); // ✅ Debugging
  
          const payload = { firebaseToken: idToken };
  
          this.http.post(`${this.BASE_URL}/login`, payload).subscribe(
            (res: any) => {
              console.log("Login Response:", res); // ✅ Debugging
  
              localStorage.setItem('token', res.token);
              localStorage.setItem('role', res.role);
              localStorage.setItem('uid', userCredential.user.uid);
  
              const returnUrl = localStorage.getItem('returnUrl') || '/home';
              this.router.navigate([returnUrl]);
  
              observer.next(res);
              observer.complete();
            },
            (err) => {
              console.error("Login Error:", err); // ✅ Debugging
              observer.error(err);
            }
          );
        })
        .catch((error) => {
          console.error("Firebase Login Error:", error); // ✅ Debugging
          observer.error(error);
        });
    });
  }
}  
