import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '@services/task.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  templateUrl: './task-management.component.html',
  styleUrls: ['./task-management.component.scss'],
  selector: 'app-task-management',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
})
export class TaskManagementComponent implements OnInit {
  filterUsersByName(): void {
    const inputValue = this.assignUserInput.toLowerCase();
    this.filteredUsers = this.users.filter((user) =>
      user.name.toLowerCase().includes(inputValue)
    );
  }
  newUserEmail = '';
  newUserBudget: number | null = null;
  userToDelete: string | null = null; // Track which user is being deleted
  isAddUserModalVisible = false;
  isDeleteDialogVisible = false
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
  filteredUsers: any[] = []; // List of users filtered by input
  assignedUserId: string = ''; // Stores the selected user's ID
  editingTask: any = null; // Holds the task being edited
isEditModalOpen = false; // Controls the visibility of the edit modal
urgency: string = 'low'; // Default value

  


  constructor(private taskService: TaskService, private router: Router, private http: HttpClient) {}

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
  
  triggerFileInput(event: Event, fileInput: HTMLInputElement, user: any): void {
    event.stopPropagation();
    fileInput.click();
  }

  /**
   * Uploads the selected image file to your backend and updates the user's photoURL.
   */
  uploadPicture(user: any, event: any): void {
    const file: File = event.target.files[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
  
    // Upload the file to the backend
    this.http.post<{ photoURL: string }>('http://localhost:4000/upload-profile-picture', formData)
      .subscribe({
        next: (response) => {
          console.log('File uploaded. New URL:', response.photoURL);
          user.photoURL = response.photoURL;
          // Now update the user record permanently.
          // Assuming the user's UID is stored in user.uid
          this.http.put(`http://localhost:4000/update-user-photo/${user.uid}`, { photoURL: response.photoURL })
            .subscribe({
              next: (res) => {
                console.log('User record updated with new photoURL');
              },
              error: (err) => {
                console.error('Error updating user record:', err);
              }
            });
        },
        error: (error) => {
          console.error('Upload error:', error);
        }
      });
  }
  

  // ... rest of your existing methods for tasks, users, etc.

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
    if (!this.assignedUserId) {
      console.error('Assigned User ID is missing!');
      alert('Please select a user to assign the task.');
      return;
    }
  
    const newTask = {
      title: this.taskTitle.trim(),
      description: this.taskDescription.trim(),
      dueDate: this.dueDate || '',
      status: 'pending',
      urgency: this.editingTask?.urgency || 'low' // Default to 'low'
    };
    
  
    console.log('Creating task with payload:', newTask); // Debugging log
  
    this.taskService.createTask(this.assignedUserId, newTask).subscribe({
      next: (response) => {
        console.log('Task created successfully:', response);
  
        // Add the newly created task to the tasks array
        const createdTask = { id: response.taskId, ...newTask };
        this.tasks.push(createdTask);
  
        // Close the modal
        this.closeAddTaskModal();
      },
      error: (error) => {
        console.error('Error creating task:', error);
        alert('Failed to create task. Please check the console for details.');
      },
    });
  }
  

  confirmAndDeleteTask(taskId: string, userId: string): void {
    const isConfirmed = window.confirm('Are you sure you want to delete this task?');
    if (isConfirmed) {
      this.deleteTask(taskId, userId); // Call the existing deleteTask method
    }
  }
  
  deleteTask(taskId: string, userId: string): void {
    this.loading = true;
    this.taskService.deleteTask(userId, taskId).subscribe({
      next: () => {
        console.log(`Task ${taskId} deleted successfully.`);
        this.tasks = this.tasks.filter((task) => task.id !== taskId);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error deleting task:', error);
        this.loading = false;
      },
    });
  }
  
  sortTasksByUrgency(): void {
    const urgencyOrder: { high: number; medium: number; low: number } = {
      high: 1,
      medium: 2,
      low: 3,
    };
  
    this.tasks.sort((a, b) => {
      const urgencyA = urgencyOrder[a.urgency as keyof typeof urgencyOrder] || 0;
      const urgencyB = urgencyOrder[b.urgency as keyof typeof urgencyOrder] || 0;
      return urgencyA - urgencyB;
    });
  }
  

  updateTask(): void {
    if (!this.editingTask || !this.editingTask.id) {
      alert('No task selected for editing.');
      return;
    }
  
    const { userId, id, ...updatedTaskData } = this.editingTask;
  
    this.taskService.updateTask(userId, id, updatedTaskData).subscribe({
      next: () => {
        alert('Task updated successfully!');
  
        // Update the task in the local array
        const taskIndex = this.tasks.findIndex((task) => task.id === id);
        if (taskIndex > -1) {
          this.tasks[taskIndex] = { id, userId, ...updatedTaskData };
        }
        this.sortTasksByUrgency(); // Sort tasks after updating
        this.closeEditTaskModal(); // Close the modal
      },
      error: (error) => {
        console.error('Error updating task:', error);
        alert('Failed to update task.');
      },
    });
  }
  
  closeAddTaskModal(): void {
    this.isAddTaskModalVisible = false;
  }
  

  openEditTaskModal(task: any, userId: string): void {
  this.editingTask = { ...task }; // Clone the task data
  this.editingTask.userId = userId; // Add userId to the task for backend update
  this.isEditModalOpen = true;
}

  
  
  // Method to close the edit modal
  closeEditTaskModal(): void {
    this.editingTask = null;
    this.isEditModalOpen = false;
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
  
  selectUser(user: any): void {
    this.assignUserInput = user.name; // Set the input value to the selected user's name
    this.assignedUserId = user.uid; // Assign the user ID to `assignedUserId`
    this.filteredUsers = []; // Clear the dropdown
  }
  

  fetchTasksForUser(userId: string): void {
    this.router.navigate(['/tasks', userId]);
    this.selectedUserId = userId; // Store the selected user ID
    this.taskService.getTasksByUserId(userId).subscribe({
      next: (tasks) => {
        this.tasks = Object.entries(tasks || {}).map(([taskId, taskData]: [string, any]) => ({
          id: taskId,
          ...taskData, // Spread task details (title, description, etc.)
        }));
        this.sortTasksByUrgency(); // Sort tasks after fetching
      },
      error: (error) => {
        console.error('Error fetching tasks for user:', error);
        this.tasks = [];
      },
    });
  }
  

  getTaskClass(urgency: string): string {
    switch (urgency) {
      case 'high':
        return 'task-high';
      case 'medium':
        return 'task-medium';
      case 'low':
        return 'task-low';
      default:
        return '';
    }
  }
  openAddUserModal(): void {
    this.isAddUserModalVisible = true;
  }

  closeAddUserModal(): void {
    this.isAddUserModalVisible = false;
    this.newUserEmail = '';
    this.newUserBudget = null;
  }

  addUser(): void {
    if (!this.newUserEmail || this.newUserBudget === null) {
      alert('Please provide valid email and budget.');
      return;
    }

    this.taskService.addUser(this.newUserEmail, this.newUserBudget).subscribe({
      next: (response) => {
        alert('User added successfully!');
        this.fetchUsers(); // Refresh the user list
        this.closeAddUserModal();
      },
      error: (error) => {
        console.error('Error adding user:', error);
        alert('Failed to add user. Please check the console for details.');
      },
    });
  }

  confirmDeleteUser(uid: string): void {
    this.userToDelete = uid;
    this.isDeleteDialogVisible = true;
  }

  closeDeleteDialog(): void {
    this.isDeleteDialogVisible = false;
    this.userToDelete = null;
  }

  deleteUser(): void {
    if (!this.userToDelete) {
      return;
    }

    this.taskService.deleteUser(this.userToDelete).subscribe({
      next: () => {
        alert('User deleted successfully!');
        this.fetchUsers(); // Refresh the user list
        this.closeDeleteDialog();
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please check the console for details.');
      },
    });
  }
}


