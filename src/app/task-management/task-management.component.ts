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
  editTask(userId: string, taskId: string): void {
    // Implement your logic for editing a task here
    console.log(`Edit task ${taskId} for user ${userId}`);
  }
  taskTitle = '';
  taskDescription = '';
  dueDate = '';
  tasks: any[] = []; // Always an array
  role: string | null = null;
  userId: string = ''; // Use an empty string as a default
  adminUserId: string = ''; // For admin to fetch specific user's tasks
  selectedUserId: string = ''; // For admin to specify user ID for a new task
  tasksByUser: any[] = []; // This will hold the transformed tasks grouped by userId
  showTasks: boolean = false;
  loading: boolean = false;
  editingTaskId: string | null = null; // To track the task being edited
  editingUserId: string | null = null; // To track the user of the task being edited



  constructor(private taskService: TaskService) {}

  ngOnInit() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const uid = localStorage.getItem('uid');

  if (token && role && uid) {
    this.role = role;
    this.userId = uid;

    // Only fetch tasks for users; admins fetch manually
    console.log(`Role: ${this.role}, UserID: ${this.userId}`);
    if (this.role === 'user') {
      this.fetchTasks(this.userId); // Fetch tasks for users
    }
  } else {
    console.error('Unable to determine role or user ID.');
  }
}

  

  fetchTasks(userId?: string): void {
    const endpoint = this.role === 'admin' ? 'tasks' : `tasks/${this.userId}`; // Admin fetches all tasks, user fetches their tasks
  
    this.taskService.getTasks(endpoint).subscribe(
      (tasks) => {
        console.log('Fetched tasks:', tasks);
  
        if (this.role === 'admin' && tasks) {
          const typedTasks = tasks as { [userId: string]: { [taskId: string]: any } };
          this.tasksByUser = Object.entries(typedTasks).map(([userId, userTasks]) => ({
            userId: userId,
            tasks: Object.entries(userTasks as { [taskId: string]: any }).map(([taskId, taskData]) => ({
              id: taskId,
              ...taskData,
            })),
          }));
          this.showTasks = true; // Show tasks for admin
        } else if (this.role === 'user' && Array.isArray(tasks)) {
          this.tasks = tasks; // Directly assign tasks for users
          this.showTasks = true; // Show tasks for user
        } else {
          console.error('Unexpected tasks format.');
        }
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

  deleteTask(taskId: string, userId: string): void {
    this.loading = true;
    this.taskService.deleteTask(userId, taskId).subscribe(
      () => {
        console.log(`Task ${taskId} deleted successfully.`);
        this.tasksByUser = this.tasksByUser.map(user => {
          if (user.userId === userId) {
            return {
              ...user,
              tasks: user.tasks.filter((task: { id: string; }) => task.id !== taskId),
            };
          }
          return user;
        }).filter(user => user.tasks.length > 0);
        this.loading = false;
      },
      (error: any) => {
        console.error('Error deleting task:', error);
        this.loading = false;
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

  // Method to enable edit mode
  enableEdit(taskId: string, userId: string, task: any): void {
    this.editingTaskId = taskId;
    this.editingUserId = userId;
    this.taskTitle = task.title;
    this.taskDescription = task.description;
    this.dueDate = task.dueDate;
    this.selectedUserId = userId; // Pre-fill the user ID in case it's needed
  }

  // Method to update the task
  updateTask(): void {
    if (!this.editingTaskId || !this.editingUserId) {
      console.error('No task or user selected for editing');
      return;
    }
  
    const updatedTask = {
      title: this.taskTitle,
      description: this.taskDescription,
      dueDate: this.dueDate,
      status: 'pending', // Include default or existing value for required fields
    };
  
    this.taskService.updateTask(this.editingUserId, this.editingTaskId, updatedTask).subscribe(
      (response: any) => {
        console.log('Task updated successfully:', response);
        this.fetchTasks(); // Refresh tasks after update
        this.cancelEdit(); // Exit edit mode
      },
      (error: any) => {
        console.error('Error updating task:', error);
      }
    );
  }
  
  

  // Method to cancel editing
  cancelEdit(): void {
    this.editingTaskId = null;
    this.editingUserId = null;
    this.taskTitle = '';
    this.taskDescription = '';
    this.dueDate = '';
    this.selectedUserId = '';
  }
}
