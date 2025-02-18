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
    return this.http.patch<void>(
      `${this.BASE_URL}/${userId}/${month}.json`,
      updatedData
    );
  }
  
  private BASE_URL = 'backend-rouge-ten-87.vercel.app/budgets';

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


addBudget(userId: string, amount: number, month: string, description: string): Observable<void> {
  const url = `${this.BASE_URL}/${userId}/${month}`;
  const headers = new HttpHeaders({
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  });

  const transaction = {
    timestamp: new Date().toISOString(),
    type: 'add',
    amount,
    description,
  };

  return this.http
    .patch<void>(url, { amount }, { headers })
    .pipe(
      switchMap(() => this.addTransactionToHistory(userId, transaction)),
      tap(() => console.log('Budget added successfully')),
      catchError((error) => {
        console.error('Error adding budget:', error);
        return throwError(() => new Error('Failed to add budget.'));
      })
    );
}

deductBudget(userId: string, month: string, deduction: number, description: string): Observable<void> {
  const url = `${this.BASE_URL}/${userId}/${month}`;
  const headers = new HttpHeaders({
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    'Content-Type': 'application/json',
  });

  const transaction = {
    timestamp: new Date().toISOString(),
    type: 'deduct',
    amount: deduction,
    description,
  };

  return this.http
    .patch<void>(url, { deduction }, { headers })
    .pipe(
      switchMap(() => this.addTransactionToHistory(userId, transaction)),
      tap(() => console.log('Budget deducted successfully')),
      catchError((error) => {
        console.error('Error deducting budget:', error);
        return throwError(() => new Error('Failed to deduct budget.'));
      })
    );
}

  addTransactionToHistory(userId: string, transaction: any): Observable<void> {
    const url = `${this.BASE_URL}/${userId}/history`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    });

    return this.http.post<void>(url, transaction, { headers }).pipe(
      tap(() => console.log('Transaction added to history successfully')),
      catchError((error) => {
        console.error('Error adding transaction to history:', error);
        return throwError(() => new Error('Failed to add transaction to history.'));
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
  
  getBudget(taskId: string, currentMonth: string): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Unauthorized: Token not found');
    }
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  
    return this.http.get(`https://backend-rouge-ten-87.vercel.app/budget/${taskId}/${currentMonth}`, { headers });
  }
  
  
  
  getBudgetHistory(userId: string): Observable<any[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    });
  
    return this.http.get<any[]>(`${this.BASE_URL}/${userId}/history`, { headers }).pipe(
      tap((data) => console.log('Fetched Budget History:', data)),
      catchError((error) => {
        console.error('Error fetching budget history:', error);
        return throwError(() => new Error('Failed to fetch budget history.'));
      })
    );
  }
  
}
