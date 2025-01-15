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
  isAddTaskModalVisible = false; // Track modal visibility
  isEditTaskModalVisible = false; // For edit task modal
  taskTitle = '';
  taskDescription = '';
  dueDate = '';
  selectedUserId = '';
  editingTaskId: string | null = null; // To track the task being edited
  editingUserId: string | null = null; // To track the user of the task being edited
  tasks: any[] = [];
  tasksByUser: any[] = [];
  role: string | null = null;
  userId: string = '';
  adminUserId: string = '';
  showTasks: boolean = false;
  loading: boolean = false;
  users: any[] = []; // To store the list of users

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

  // Open the Add Task modal
  openAddTaskModal(): void {
    this.isAddTaskModalVisible = true;
    this.clearTaskForm(); // Clear the form to ensure a clean state
  }

  // Close the Add Task modal
  closeAddTaskModal(): void {
    this.isAddTaskModalVisible = false;
  }

  // Open the Edit Task modal
  openEditTaskModal(task: any, userId: string): void {
    this.isEditTaskModalVisible = true;
    this.editingTaskId = task.id;
    this.editingUserId = userId;
  
    // Populate the form with the task details
    this.taskTitle = task.title;
    this.taskDescription = task.description;
    this.dueDate = task.dueDate;
  }

  // Close the Edit Task modal
  closeEditTaskModal(): void {
    this.isEditTaskModalVisible = false;
    this.clearTaskForm(); // Reset the form fields
  }

  // Clear form fields
  private clearTaskForm(): void {
    this.taskTitle = '';
    this.taskDescription = '';
    this.dueDate = '';
    this.selectedUserId = '';
    this.editingTaskId = null;
    this.editingUserId = null;
  }

  

fetchTasks(userId?: string): void {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.error('No token found in local storage!');
    alert('You must log in again to fetch tasks.');
    return;
  }

  // If admin and userId is provided, fetch tasks for the specific user
  const endpoint =
    this.role === 'admin' && userId ? `tasks/${userId}` : 
    this.role === 'admin' ? 'tasks' : 
    `tasks/${this.userId}`;
  
  console.log(`Fetching tasks for endpoint: ${endpoint}, role: ${this.role}, token: ${token}`);
  this.loading = true;

  this.taskService.getTasks(endpoint).subscribe(
    (tasks) => {
      console.log('Fetched tasks:', tasks);
      this.loading = false;

      if (this.role === 'admin' && tasks) {
        // Handle specific user's tasks if userId is provided
        if (userId) {
          const typedTasks = tasks as { [taskId: string]: any };
          this.tasksByUser = [
            {
              userId: userId,
              tasks: Object.entries(typedTasks).map(([taskId, taskData]) => ({
                id: taskId,
                ...taskData,
              })),
            },
          ];
        } else {
          // Otherwise, fetch all tasks grouped by user
          const typedTasks = tasks as { [userId: string]: { [taskId: string]: any } };
          this.tasksByUser = Object.entries(typedTasks).map(([userId, userTasks]) => ({
            userId: userId,
            tasks: Object.entries(userTasks).map(([taskId, taskData]) => ({
              id: taskId,
              ...taskData,
            })),
          }));
        }
        this.showTasks = true; // Show tasks for admin
      } else if (this.role === 'user') {
        // Transform tasks for users
        if (tasks && Object.keys(tasks).length > 0) {
          this.tasks = Object.entries(tasks).map(([taskId, taskData]: [string, any]) => ({
            id: taskId,
            title: taskData.title || 'Untitled',
            description: taskData.description || 'No description',
            dueDate: taskData.dueDate || 'No due date',
            status: taskData.status || 'pending',
          }));
          this.showTasks = true; // Show tasks for user
        } else {
          console.warn('No tasks found for the user.');
          this.tasks = []; // Clear tasks list
          alert('No tasks available to display.');
        }
      } else {
        console.error('Unexpected tasks format for the current role.');
      }
    },
    (error) => {
      console.error('Error fetching tasks:', error);
      this.loading = false;
      if (error.status === 403) {
        alert('Access denied. You do not have permission to view these tasks.');
      } else {
        alert('An error occurred while fetching tasks. Please try again.');
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
      status: 'pending', // Ensure this has a valid default value
    };
  
    this.taskService.updateTask(this.editingUserId!, this.editingTaskId, updatedTask).subscribe(
      (response: any) => {
        console.log('Task updated successfully:', response);
        this.fetchTasks(this.editingUserId!); // Fetch tasks for the user
        this.closeEditTaskModal(); // Close the modal
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
