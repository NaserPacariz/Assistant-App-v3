import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Service is provided globally
})
export class TaskService {
  HttpClient: any;
 
  getAllTasks(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/tasks`);
  }
  
  private BASE_URL = 'http://localhost:4000'; // Update as needed

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    return new HttpHeaders({
      Authorization: `Bearer ${token}`, // Add the token to the Authorization header
    });
  }

  deleteTask(userId: string, taskId: string) {
    const token = localStorage.getItem('token'); // Get token from local storage
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Add Authorization header
    });

    return this.http.delete(`${this.BASE_URL}/tasks/${userId}/${taskId}`, {
      headers,
    });
  }

  getTasks(endpoint: string): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found!');
      throw new Error('Unauthorized: Token is required');
    }
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  
    const url = `${this.BASE_URL}/${endpoint}`;
    console.log(`Fetching tasks from: ${url}`);
    return this.http.get(url, { headers }); // Use this.http.get instead of this.HttpClient.get
  }
  
  
  

  createTask(task: any): Observable<any> {
    const headers = this.getHeaders(); // Add headers
    return this.http.post(`${this.BASE_URL}/tasks`, task, { headers });
  }

  updateTask(userId: string, taskId: string, updatedTask: any) {
    const token = localStorage.getItem('token'); // Get token from local storage
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Add Authorization header
    });
  
    return this.http.put(
      `${this.BASE_URL}/tasks/${userId}/${taskId}`,
      updatedTask,
      { headers }
    );
  }
  
}




