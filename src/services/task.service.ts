import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Service is provided globally
})
export class TaskService {
  private BASE_URL = 'http://localhost:4000'; // Update as needed

  constructor(private http: HttpClient) {}

  getTasks(userId: string): Observable<any> {
    return this.http.get(`${this.BASE_URL}/tasks/${userId}`);
  }

  createTask(task: any): Observable<any> {
    return this.http.post(`${this.BASE_URL}/tasks`, task);
  }
}
