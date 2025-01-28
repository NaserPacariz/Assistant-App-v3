import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  private BASE_URL = 'http://localhost:4000/budgets'; // Your backend URL

  constructor(private http: HttpClient, private auth: Auth) {}

  private getAuthHeaders(): Observable<HttpHeaders> {
    return from(this.auth.currentUser?.getIdToken() || Promise.resolve('')).pipe(
        switchMap((token) => {
            if (!token) {
                throw new Error('Unauthorized: Token not found');
            }
            return [new HttpHeaders({ Authorization: `Bearer ${token}` })];
        })
    );
}


  // Add budget
  addBudget(userId: string, amount: number, month: string): Observable<any> {
    return this.getAuthHeaders().pipe(
        switchMap((headers) =>
            this.http.post(this.BASE_URL, { userId, amount, month }, { headers })
        )
    );
}
  

  fetchBudget(userId: string, month: string): Observable<any> {
    return this.getAuthHeaders().pipe(
      switchMap((headers) =>
        this.http.get(`${this.BASE_URL}/${userId}/${month}`, { headers })
      )
    );
  }

  // Update spending
  updateSpending(userId: string, month: string, spendings: number): Observable<any> {
    return this.getAuthHeaders().pipe(
        switchMap((headers) =>
            this.http.put(`${this.BASE_URL}/${userId}/${month}`, { spendings }, { headers })
        )
    );
}

  // Fetch budget
  getBudget(taskId: string, currentMonth: string): Observable<any> {
    const token = localStorage.getItem('token'); // Retrieve the token
    if (!token) {
      throw new Error('Unauthorized: Token not found');
    }
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  
    return this.http.get(`/api/budget/${taskId}`, { headers });
  }
  deductBudget(amount: number, month: string): Observable<any> {
    const payload = { amount, month };
    return this.http.post(`${this.BASE_URL}/deduct`, payload);
  }
}
