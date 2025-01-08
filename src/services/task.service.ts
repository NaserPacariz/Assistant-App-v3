import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Service is provided globally
})
export class TaskService {
  getAllTasks(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/tasks`);
  }
  deleteTask(userId: string, taskId: string): Observable<any> {
    return this.http.delete(`${this.BASE_URL}/tasks/${userId}/${taskId}`);
  }
  
  private BASE_URL = 'http://localhost:4000'; // Update as needed

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    return new HttpHeaders({
      Authorization: `Bearer ${token}`, // Add the token to the Authorization header
    });
  }

  getTasks(endpoint: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get(`${this.BASE_URL}/${endpoint}`, { headers });
}

  

  createTask(task: any): Observable<any> {
    const headers = this.getHeaders(); // Add headers
    return this.http.post(`${this.BASE_URL}/tasks`, task, { headers });
  }
}


