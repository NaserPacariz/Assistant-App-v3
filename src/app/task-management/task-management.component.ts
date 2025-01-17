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
})
export class TaskManagementComponent implements OnInit {
  isAddTaskModalVisible = false;
  isEditTaskModalVisible = false;
  taskTitle = '';
  taskDescription = '';
  dueDate = '';
  selectedUserId = '';
  editingTaskId: string | null = null;
  editingUserId: string | null = null;
  tasks: any[] = [];
  tasksByUser: any[] = [];
  role: string | null = null;
  userId: string = '';
  adminUserId: string = '';
  showTasks: boolean = false;
  loading: boolean = false;
  users: any[] = []; // To store the list of users
  assignUserInput: string = '';
filteredUsers: any[] = [];

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const uid = localStorage.getItem('uid');

    if (token && role && uid) {
      this.role = role;
      this.userId = uid;

      // Only fetch tasks for regular users; admins fetch manually
      console.log(`Role: ${this.role}, UserID: ${this.userId}`);
      if (this.role === 'user') {
        this.fetchTasks(this.userId);
      } else if (this.role === 'admin') {
        this.fetchUsers(); // Fetch all users for admin
      }
    } else {
      console.error('Unable to determine role or user ID.');
    }
  }

  fetchUsers(): void {
    this.loading = true;
    this.taskService.getUsers().subscribe(
      (users) => {
        console.log('Fetched users:', users); // Debugging log
        // Ensure the users array includes the budget property
        this.users = users.map((user) => ({
          ...user,
          name: user.email.split('@')[0], // Extract name from email
          budget: user.budget || 0, // Include budget (default to 0 if not provided)
        }));
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching users:', error);
        this.loading = false;
        alert('Failed to fetch users. Please check the console for details.');
      }
    );
  }
  
  

  fetchTasks(userId?: string): void {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No token found in local storage!');
      alert('You must log in again to fetch tasks.');
      return;
    }

    const endpoint =
      this.role === 'admin' && userId
        ? `tasks/${userId}`
        : this.role === 'admin'
        ? 'tasks'
        : `tasks/${this.userId}`;

    console.log(`Fetching tasks for endpoint: ${endpoint}, role: ${this.role}`);
    this.loading = true;

    this.taskService.getTasks(endpoint).subscribe(
      (tasks) => {
        console.log('Fetched tasks:', tasks);
        this.loading = false;

        if (this.role === 'admin' && tasks) {
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
            const typedTasks = tasks as {
              [userId: string]: { [taskId: string]: any };
            };
            this.tasksByUser = Object.entries(typedTasks).map(([userId, userTasks]) => ({
              userId: userId,
              tasks: Object.entries(userTasks).map(([taskId, taskData]) => ({
                id: taskId,
                ...taskData,
              })),
            }));
          }
          this.showTasks = true;
        } else if (this.role === 'user') {
          if (tasks && Object.keys(tasks).length > 0) {
            this.tasks = Object.entries(tasks).map(([taskId, taskData]: [string, any]) => ({
              id: taskId,
              title: taskData.title || 'Untitled',
              description: taskData.description || 'No description',
              dueDate: taskData.dueDate || 'No due date',
              status: taskData.status || 'pending',
            }));
            this.showTasks = true;
          } else {
            console.warn('No tasks found for the user.');
            this.tasks = [];
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
        this.tasksByUser = this.tasksByUser
          .map((user) => {
            if (user.userId === userId) {
              return {
                ...user,
                tasks: user.tasks.filter((task: { id: string }) => task.id !== taskId),
              };
            }
            return user;
          })
          .filter((user) => user.tasks.length > 0);
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

  openAddTaskModal(): void {
    this.isAddTaskModalVisible = true;
    this.clearTaskForm();
  }

  closeAddTaskModal(): void {
    this.isAddTaskModalVisible = false;
  }

  openEditTaskModal(task: any, userId: string): void {
    this.isEditTaskModalVisible = true;
    this.editingTaskId = task.id;
    this.editingUserId = userId;
    this.taskTitle = task.title;
    this.taskDescription = task.description;
    this.dueDate = task.dueDate;
  }

  closeEditTaskModal(): void {
    this.isEditTaskModalVisible = false;
    this.clearTaskForm();
  }

  private clearTaskForm(): void {
    this.taskTitle = '';
    this.taskDescription = '';
    this.dueDate = '';
    this.selectedUserId = '';
    this.editingTaskId = null;
    this.editingUserId = null;
  }

  cancelEdit(): void {
    this.clearTaskForm();
    this.closeEditTaskModal();
  }

  filterUsers() {
    const inputValue = this.assignUserInput.toLowerCase();
    this.filteredUsers = this.users.filter((user) =>
      user.email.toLowerCase().includes(inputValue)
    );
  }
  
  selectUser(userId: string) {
    this.assignUserInput = userId; // Set the input value to the selected user ID
    this.filteredUsers = []; // Clear the dropdown
  }
}
