import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from 'src/services/task.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BudgetService } from '@services/budget.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router'; // Dodaj ovo
import { HttpClient } from '@angular/common/http';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule] // Add FormsModule to imports
})
export class TaskDetailsComponent implements OnInit {
  http: any;
  openBudgetHistory(): void {
    this.router.navigate(['/budget-history', this.userId]);
  }
  
  userId: string = '';
  tasks: any[] = [];
  isAddTaskModalVisible: boolean = false;
  isEditModalOpen: boolean = false;
  editingTask: any = null;
  taskTitle: string = '';
  taskDescription: string = '';
  dueDate: string = '';
  urgency: string = 'low';
  amount = 0;
  month = '';
  spendings = 0; // To update spendings
  budget: any = null; // This will now be an object, not an array
  loading = false;
  isDescriptionModalVisible: boolean = false;
  selectedTaskDescription: string = '';
  deduction = 0;
  deductionMonth = '';
  currentMonth: string = '';
  showDeleteConfirmation = false; 
  selectedTaskId: string | null = null;
  isLoading: boolean = false;
  isSuccess: boolean = false;
  showSuccessPopup: boolean = false; // Controls popup visibility

  constructor(private route: ActivatedRoute, private taskService: TaskService, private budgetService: BudgetService, private router: Router, private location: Location) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    if (userId) {
      this.userId = userId;
      this.fetchTasksForUser(this.userId);
    } else {
      console.error('User ID is null or undefined.');
    }
  
    // Set default month to the current month
    const currentDate = new Date();
    this.currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM format
    this.month = this.currentMonth;
    this.deductionMonth = this.currentMonth;
    const formattedDate = formatDate(new Date(), 'longDate', 'en-US');
    console.log(formattedDate); // Output: "January 1, 2023"
  }
  

  goBack(): void {
    this.location.back(); // Navigates to the previous page
  }
  
  

  fetchTasksForUser(userId: string): void {
    this.taskService.getTasksByUserId(userId).subscribe({
      next: (response) => {
        // Ensure tasks is an array
        if (Array.isArray(response)) {
          this.tasks = response; // Directly assign if it's an array
        } else if (typeof response === 'object') {
          // Convert object to array if necessary
          this.tasks = Object.entries(response || {}).map(([taskId, taskData]: [string, any]) => ({
            id: taskId,
            ...taskData, // Spread task details
          }));
          this.sortTasksByUrgency(); // Sort tasks after fetching
        } else {
          console.error('Unexpected tasks format:', response);
          this.tasks = []; // Fallback to empty array
        }
      },
      error: (error) => {
        console.error('Error fetching tasks for user:', error);
        this.tasks = [];
      },
    });
  }
  

  openCreateTaskModal(): void {
    this.isAddTaskModalVisible = true;
    this.taskTitle = '';
    this.taskDescription = '';
    this.dueDate = '';
    this.urgency = 'low';
  }

  closeAddTaskModal(): void {
    this.isAddTaskModalVisible = false;
  }

  addTask(): void {
    this.isLoading = true; // Show spinner
    this.isSuccess = false; // Reset success state
  
    const newTask = {
      title: this.taskTitle,
      description: this.taskDescription,
      dueDate: this.dueDate,
      urgency: this.urgency,
      status: 'pending',
    };
  
    this.taskService.createTask(this.userId, newTask).subscribe({
      next: (response) => {
        setTimeout(() => {
          // Add the task to the list
          this.tasks.push({ ...newTask, id: response.taskId });
          this.sortTasksByUrgency();
  
          // Switch from spinner to green checkmark
          this.isLoading = false;
          this.isSuccess = true;
  
          setTimeout(() => {
            // Hide the success checkmark and close the modal
            this.isSuccess = false;
            this.isAddTaskModalVisible = false;
          }, 1500); // Display green checkmark for 1.5 seconds
        }, 1000); // Simulated loading time
      },
      error: (error) => {
        console.error('Error creating task:', error);
        this.isLoading = false; // Hide spinner on error
      },
    });
  }
  

  openEditTaskModal(task: any): void {
    this.editingTask = { ...task }; // Clone task data to avoid direct mutation
    this.isEditModalOpen = true;
  }

  closeEditTaskModal(): void {
    this.isEditModalOpen = false;
    this.editingTask = null;
  }

  updateTask(): void {
    if (this.editingTask) {
      this.taskService.updateTask(this.userId, this.editingTask.id, this.editingTask).subscribe({
        next: () => {
          const index = this.tasks.findIndex((t) => t.id === this.editingTask.id);
          if (index > -1) {
            // Update the task in the array
            this.tasks[index] = { ...this.editingTask };
  
            // Re-sort the tasks to reflect the updated urgency order
            this.tasks.sort((a, b) => {
              const urgencyOrder: { [key: string]: number } = { high: 1, medium: 2, low: 3 };
              return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
            });
          }
  
          this.closeEditTaskModal();
        },
        error: (error) => {
          console.error('Error updating task:', error);
        },
      });
    }
  }
  

  confirmAndDeleteTask(taskId: string): void {
    // Instead of using window.confirm, set up to show our modal
    this.selectedTaskId = taskId;
    this.showDeleteConfirmation = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.selectedTaskId = null;
  }

  deleteTask(taskId: string): void {
    this.taskService.deleteTask(this.userId, taskId).subscribe({
      next: () => {
        // Remove the task from the list
        this.tasks = this.tasks.filter((task) => task.id !== taskId);
        this.showDeleteConfirmation = false;

        // Show the success popup
        this.showSuccessPopup = true;

        // Automatically close the popup after 3 seconds
        setTimeout(() => {
          this.showSuccessPopup = false;
        }, 3000); // 3 seconds
      },
      error: (error) => {
        console.error('Error deleting task:', error);
      },
    });
  }

  // Close the success popup manually
  closeSuccessPopup(): void {
    this.showSuccessPopup = false;
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
  addBudget(): void {
    if (!this.userId || !this.month || this.amount <= 0) {
      alert('Invalid input: Make sure all fields are correctly filled.');
      return;
    }
  
    console.log('Sending addBudget:', { userId: this.userId, month: this.month, amount: this.amount });
    
    this.loading = true;
  
    this.budgetService.addBudget(this.userId, this.amount, this.month).subscribe({
      next: () => {
        alert('Budget added successfully.');
        this.loading = false;
        this.fetchBudget(this.userId, this.month);
      },
      error: (error) => {
        console.error('Error adding budget:', error);
        alert('Failed to add budget. Please try again.');
        this.loading = false;
      },
    });
  }

  openAddTaskModal(): void {
    this.isAddTaskModalVisible = true;
    this.editingTask = { 
      title: '', 
      description: '', 
      dueDate: '', 
      status: 'pending', 
      urgency: 'low' // Default urgency
    };
  }
  

  // Fetch Budget
  fetchBudget(userId: string, month: string): void {
    console.log('Fetching budget:', { userId, month });
  
    this.budgetService.fetchBudget(userId, month).subscribe({
      next: (data) => {
        this.budget = data;
        console.log('Budget fetched successfully:', data);
      },
      error: (err) => {
        console.error('Error fetching budget:', err);
      },
    });
  }
  


  // Update Spendings
  updateSpendings() {
    this.loading = true;
    this.budgetService.updateSpending(this.userId, this.month, this.spendings).subscribe({
      next: (res) => {
        console.log('Spendings updated successfully:', res);
        alert('Spendings updated successfully!');
        this.loading = false;
        this.fetchBudget(this.userId, this.month);
      },
      error: (err) => {
        console.error('Error updating spendings:', err);
        alert('Failed to update spendings. Please check the server.');
        this.loading = false;
      }
    });
  }

  viewDescription(task: any): void {
    this.selectedTaskDescription = task.description || 'No description available';
    this.isDescriptionModalVisible = true; // Show the description modal
  }
  
  closeDescriptionModal(): void {
    this.isDescriptionModalVisible = false; // Close the description modal
  }
  deductBudget(): void {
    if (this.deduction <= 0) {
      alert('Please enter a valid deduction amount greater than 0.');
      return;
    }
  
    if (!this.userId) {
      console.error('User ID is not defined.');
      alert('Failed to deduct budget: User ID is missing.');
      this.loading = false;
      return;
    }
  
    if (!this.deductionMonth) {
      console.error('Deduction month is not defined.');
      alert('Failed to deduct budget: Month is missing.');
      this.loading = false;
      return;
    }
  
    console.log('Budget Doc ID:', this.userId);
    console.log('Current Month:', this.deductionMonth);
    console.log('Deduction:', this.deduction);
  
    this.loading = true;
  
    this.budgetService.deductBudget(this.userId, this.deductionMonth, this.deduction).subscribe({
      next: () => {
        alert('Budget deducted successfully.');
        this.loading = false;
        this.fetchBudget(this.userId, this.month);
      },
      error: (error) => {
        console.error('Error deducting budget:', error);
        alert('Failed to deduct budget. Please try again.');
        this.loading = false;
      },
    });
  }
  
  
}
