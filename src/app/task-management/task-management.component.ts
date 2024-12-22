import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '@services/task.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Import for navigation

@Component({
  templateUrl: './task-management.component.html',
  styleUrls: ['./task-management.component.scss'],
  selector: 'app-task-management',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  template: `
    <div>
      <h2>Task Management</h2>
      <button routerLink="/budgets" style="margin-bottom: 20px;">Go to Budget Management</button>

      <!-- Add Task Form -->
      <form (ngSubmit)="addTask()" style="margin-bottom: 20px;">
        <input type="text" [(ngModel)]="taskTitle" name="taskTitle" placeholder="Task Title" required />
        <textarea [(ngModel)]="taskDescription" name="taskDescription" placeholder="Task Description" required></textarea>
        <input type="date" [(ngModel)]="dueDate" name="dueDate" required />
        <button type="submit">Add Task</button>
      </form>

      <!-- Task List -->
      <div *ngFor="let task of tasks" style="margin-bottom: 10px;">
        <p><strong>{{ task.title }}</strong></p>
        <p>{{ task.description }}</p>
        <p>Due: {{ task.dueDate }}</p>
      </div>
    </div>
  `,
})
export class TaskManagementComponent {
deleteTask(arg0: any) {
throw new Error('Method not implemented.');
}
editTask(_t39: any) {
throw new Error('Method not implemented.');
}
  taskTitle = '';
  taskDescription = '';
  dueDate = '';
  tasks: any[] = []; // Always an array
  role: string | null = null;

  ngOnInit() {
    this.role = localStorage.getItem('role');
  }
  

  constructor(private taskService: TaskService) {
    this.fetchTasks();
  }

  fetchTasks() {
    this.taskService.getTasks('user123').subscribe(
      (tasks) => {
        console.log('Response from API (tasks):', tasks); // Log for debugging
        this.tasks = tasks ? Object.values(tasks) : []; // Convert to array if it is an object
      },
      (error) => {
        console.error('Error fetching tasks:', error);
      }
    );
  }

  addTask() {
    const newTask = {
      userId: 'user123',
      title: this.taskTitle,
      description: this.taskDescription,
      dueDate: this.dueDate,
    };

    this.taskService.createTask(newTask).subscribe(
      (response) => {
        console.log('Task created successfully:', response);
        this.fetchTasks(); // Refresh task list
      },
      (error) => {
        console.error('Error adding task:', error);
      }
    );
  }
}
