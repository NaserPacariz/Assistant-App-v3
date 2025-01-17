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
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return [headers];
      })
    );
  }

  // Add budget
  addBudget(userId: string, amount: number, month: string): Observable<any> {
    return from(this.getAuthHeaders()).pipe(
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
    return this.http.put(`${this.BASE_URL}/${userId}/${month}`, { spendings });
  }

  // Fetch budget
  getBudget(userId: string, month: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/${userId}/${month}`);
  }
}
