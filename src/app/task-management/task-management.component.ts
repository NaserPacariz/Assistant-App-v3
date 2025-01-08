import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '@services/task.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

      <div *ngIf="role === 'admin'" style="margin-bottom: 20px;">
        <h3>Admin: Fetch Tasks for a Specific User</h3>
        <input
          type="text"
          [(ngModel)]="adminUserId"
          name="adminUserId"
          placeholder="Enter User ID"
        />
        <button (click)="fetchTasks(adminUserId)">Fetch Tasks</button>
      </div>

      <!-- Add Task Form -->
      <form *ngIf="role === 'admin'" (ngSubmit)="addTask()" style="margin-bottom: 20px;">
        <input type="text" [(ngModel)]="taskTitle" name="taskTitle" placeholder="Task Title" required />
        <textarea
          [(ngModel)]="taskDescription"
          name="taskDescription"
          placeholder="Task Description"
          required
        ></textarea>
        <input type="date" [(ngModel)]="dueDate" name="dueDate" required />
        <input
          type="text"
          [(ngModel)]="selectedUserId"
          name="selectedUserId"
          placeholder="Enter User ID for the Task"
          required
        />
        <button type="submit">Add Task</button>
      </form>

      <div *ngIf="tasks.length === 0">No tasks available.</div>
      <!-- Task List -->
      <div *ngFor="let task of tasks" style="margin-bottom: 10px;">
        <p><strong>{{ task.title }}</strong></p>
        <p>{{ task.description }}</p>
        <p>Due: {{ task.dueDate }}</p>
        <button *ngIf="role === 'admin'" (click)="deleteTask(task.id)">Delete Task</button>
      </div>
    </div>
  `,
})
export class TaskManagementComponent implements OnInit {
editTask(_t7: any) {
throw new Error('Method not implemented.');
}
  taskTitle = '';
  taskDescription = '';
  dueDate = '';
  tasks: any[] = []; // Always an array
  role: string | null = null;
  userId: string = ''; // Use an empty string as a default
  adminUserId: string = ''; // For admin to fetch specific user's tasks
  selectedUserId: string = ''; // For admin to specify user ID for a new task

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token); // Debug the token
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      console.log('Decoded Token:', decodedToken); // Debug decoded token
      this.role = decodedToken.role || null;
      this.userId = decodedToken.uid || null; // Get the user ID dynamically
      console.log('User Role:', this.role, 'User ID:', this.userId); // Debug role and userId
    }

    if (this.role === 'admin') {
        // Admins fetch all tasks
        this.fetchAllTasks();
    } else if (this.userId) {
        // Non-admin users fetch their own tasks
        this.fetchTasks(this.userId);
    } else {
        console.error('Unable to determine role or user ID.');
    }
  }

  fetchTasks(userId: string) {
    if (!userId) {
      console.error('User ID is missing!');
      return;
    }

    console.log('Fetching tasks for userId:', this.userId); // Debug userId

    this.taskService.getTasks(userId).subscribe(
      (tasks) => {
        console.log('Response from API (tasks):', tasks);
        this.tasks = tasks ? Object.values(tasks) : []; // Convert object to array if necessary
      },
      (error) => {
        console.error('Error fetching tasks:', error);
        if (error.status === 403) {
          alert('Access denied. You do not have permission to view these tasks.');
        }
      }
    );
  }

  addTask() {
    const targetUserId = this.role === 'admin' ? this.selectedUserId : this.userId;

    if (!targetUserId) {
      console.error('Target User ID is missing!');
      return;
    }

    const newTask = {
      userId: targetUserId, // Dynamically set the user ID
      title: this.taskTitle,
      description: this.taskDescription,
      dueDate: this.dueDate,
    };

    this.taskService.createTask(newTask).subscribe(
      (response) => {
        console.log('Task created successfully:', response);
        this.fetchTasks(targetUserId); // Refresh task list
      },
      (error) => {
        console.error('Error adding task:', error);
      }
    );
  }

  deleteTask(taskId: string) {
    if (!this.userId) {
      console.error('User ID is missing!');
      return;
    }

    this.taskService.deleteTask(this.userId, taskId).subscribe(
      () => {
        console.log('Task deleted successfully');
        this.fetchTasks(this.userId); // Refresh task list
      },
      (error: any) => {
        console.error('Error deleting task:', error);
        if (error.status === 403) {
          alert('Access denied. Only admins can delete tasks.');
        }
      }
    );
  }
  fetchAllTasks() {
    this.taskService.getAllTasks().subscribe({
        next: (tasks) => {
            console.log('Admin: Fetched all tasks:', tasks);
            this.tasks = tasks ? Object.values(tasks) : [];
        },
        error: (error) => {
            console.error('Error fetching all tasks:', error);
            if (error.status === 403) {
                alert('Access denied. You do not have permission to view these tasks.');
            }
        },
    });
}

}
