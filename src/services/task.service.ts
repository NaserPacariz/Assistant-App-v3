import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class TaskService {
  HttpClient: any;
 
  getAllTasks(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/tasks`);
  }
  
  private BASE_URL = 'http://localhost:4000';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Authorization Token:', token);
    if (!token) {
      console.error('No token found in local storage!');
      throw new Error('Unauthorized: Token is required');
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
  
  

  deleteTask(userId: string, taskId: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.delete(`${this.BASE_URL}/tasks/${userId}/${taskId}`, {
      headers,
    });
  }

  getTasks(endpoint: string): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in local storage!');
      throw new Error('Unauthorized: Token is required');
    }
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  
    const url = `${this.BASE_URL}/${endpoint}`;
    console.log(`Making GET request to URL: ${url}`);
    return this.http.get(url, { headers });
  }
  
  getUsers(): Observable<any[]> {
    const token = localStorage.getItem('token');
  
    if (!token) {
      throw new Error('User is not authenticated');
    }
  
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.get<any[]>('http://localhost:4000/users', { headers });
  }
  
  
  createTask(userId: string, newTask: { title: string; description: string; dueDate: string; status: string }): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
  
    return this.http.post(`${this.BASE_URL}/tasks/${userId}`, newTask, { headers });
  }
  
  
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
  

  updateTask(userId: string, taskId: string, updatedTask: any) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  
    return this.http.put(
      `${this.BASE_URL}/tasks/${userId}/${taskId}`,
      updatedTask,
      { headers }
    );
  }

  getTasksByUserId(userId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
  
    return this.http.get(`${this.BASE_URL}/tasks/${userId}`, { headers });
  }
  
  
  addUser(email: string, budget: number): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found in local storage!');
      return throwError('Unauthorized: No token available');
    }
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  
    const body = { email, budget };
    return this.http.post(`${this.BASE_URL}/users`, body, { headers });
  }
  

deleteUser(userId: string): Observable<any> {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found in local storage!');
    return throwError('Unauthorized: No token available');
  }

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.delete(`${this.BASE_URL}/users/${userId}`, { headers });
}
deductBudget(userId: string, month: string, deduction: number): Observable<void> {
  const url = `${this.BASE_URL}/${userId}/${month}`;
  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  return this.http.patch<void>(url, { deduction }, { headers }).pipe(
    catchError((error) => {
      console.error('Error during budget deduction:', error);
      return throwError(() => new Error('Failed to deduct budget. Please try again.'));
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
}




