import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth } from '@angular/fire/auth';
import { from, Observable, throwError } from 'rxjs';
import { catchError, switchMap, take, tap } from 'rxjs/operators';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  updateBudget(userId: string, month: string, updatedData: { spendings: number }) {
    return this.http.patch<void>( // Dodaj <void> ili odgovarajući tip ako trebaš odgovor
      `${this.BASE_URL}/${userId}/${month}.json`,
      updatedData
    );
  }
  
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
  addBudget(userId: string, amount: number, month: string): Observable<void> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    });
  
    return this.http
      .post<void>(`${this.BASE_URL}/${userId}/${month}`, { amount }, { headers })
      .pipe(
        tap(() => console.log('Add budget request successful')),
        catchError((error) => {
          console.error('Error adding budget:', error);
          return throwError(() => new Error('Failed to add budget.'));
        })
      );
  }
  
  
  

  fetchBudget(userId: string, month: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    });
  
    return this.http
      .get(`${this.BASE_URL}/${userId}/${month}`, { headers })
      .pipe(
        tap((budget) => console.log('Fetched budget:', budget)),
        catchError((error) => {
          console.error('Error fetching budget:', error);
          return throwError(() => new Error('Failed to fetch budget.'));
        })
      );
  }
  

  // Update spending
  updateSpending(userId: string, month: string, spendings: number): Observable<void> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    });
  
    return this.http
      .put<void>(`${this.BASE_URL}/${userId}/${month}`, { spendings }, { headers })
      .pipe(
        tap(() => console.log('Update spending request successful')),
        catchError((error) => {
          console.error('Error updating spending:', error);
          return throwError(() => new Error('Failed to update spending.'));
        })
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
  
    // Prilagođena URL putanja bez `/api`
    return this.http.get(`http://localhost:4000/budget/${taskId}/${currentMonth}`, { headers });
  }
  
  
  deductBudget(userId: string, month: string, deduction: number): Observable<void> {
    const url = `${this.BASE_URL}/${userId}/${month}`;
    const token = localStorage.getItem('token');
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  
    console.log('Sending PATCH request:', { url, deduction });
  
    return this.http.patch<void>(url, { deduction }, { headers }).pipe(
      tap(() => console.log('Deduction request successful')),
      catchError((error) => {
        console.error('Error during budget deduction:', error);
        return throwError(() => new Error('Failed to deduct budget. Please try again.'));
      })
    );
  }
  
  
  
  getBudgetHistory(userId: string): Observable<any[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}` // Uzmite token iz localStorage/sessionStorage
    });
  
    return this.http.get<any[]>(`${this.BASE_URL}/${userId}/history`, { headers });
  }
  
}
