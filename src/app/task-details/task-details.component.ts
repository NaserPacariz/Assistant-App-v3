import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from 'src/services/task.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BudgetService } from '@services/budget.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { HostListener} from '@angular/core';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class TaskDetailsComponent implements OnInit {
  http: any;
  openBudgetHistory(): void {
    this.router.navigate(['/budget-history', this.userId]);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }
  checkScreenSize() {
    this.isMobileView = window.innerWidth <= 549;
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
  spendings = 0;
  budget: any = null;
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
  showSuccessPopup: boolean = false;
  isMobileView: boolean = false;
  taskName: string = '';
  taskNameValid: boolean = true;
  taskTitles: string[] = [];

  constructor(private route: ActivatedRoute, private taskService: TaskService, private budgetService: BudgetService, private router: Router, private location: Location) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    if (userId) {
      this.userId = userId;
      this.fetchTasksForUser(this.userId);
    } else {
      console.error('User ID is null or undefined.');
    }

    const currentDate = new Date();
    this.currentMonth = currentDate.toISOString().slice(0, 7);
    this.month = this.currentMonth;
    this.deductionMonth = this.currentMonth;
    const formattedDate = formatDate(new Date(), 'longDate', 'en-US');
    console.log(formattedDate);
  }
  

  goBack(): void {
    this.location.back();
  }
  
  validateTaskName(): void {
    const normalizedTaskName = this.taskName.trim().toLowerCase();
    this.taskNameValid = this.taskTitles.includes(normalizedTaskName);
    console.log('Task Name Valid:', this.taskNameValid);
  }
  

  fetchTasksForUser(userId: string): void {
    this.taskService.getTasksByUserId(userId).subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          this.tasks = response;
          this.taskTitles = response.map((task: any) => task.title);
        } else if (typeof response === 'object') {
          this.tasks = Object.values(response || {});
          this.taskTitles = this.tasks.map((task: any) => task.title);
        } else {
          console.error('Unexpected tasks format:', response);
          this.tasks = [];
          this.taskTitles = [];
        }
      },
      error: (error) => {
        console.error('Error fetching tasks for user:', error);
        this.tasks = [];
        this.taskTitles = [];
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
    this.isLoading = true;
    this.isSuccess = false;
  
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
          this.tasks.push({ ...newTask, id: response.taskId });
          this.sortTasksByUrgency();

          this.isLoading = false;
          this.isSuccess = true;
  
          setTimeout(() => {
            this.isSuccess = false;
            this.isAddTaskModalVisible = false;
          }, 1500);
        }, 1000);
      },
      error: (error) => {
        console.error('Error creating task:', error);
        this.isLoading = false;
      },
    });
  }
  

  openEditTaskModal(task: any): void {
    this.editingTask = { ...task };
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
            this.tasks[index] = { ...this.editingTask };
  
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
        this.tasks = this.tasks.filter((task) => task.id !== taskId);
        this.showDeleteConfirmation = false;

        this.showSuccessPopup = true;

        setTimeout(() => {
          this.showSuccessPopup = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Error deleting task:', error);
      },
    });
  }

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
  this.validateTaskName();

  if (!this.userId || this.amount <= 0 || !this.month.trim() || !this.taskNameValid) {
    alert('There is no task with that name');
    return;
  }

  const description = `Added ${this.amount} budget for task "${this.taskName}"`;

  console.log('Sending addBudget:', { userId: this.userId, month: this.month, amount: this.amount, description });

  this.loading = true;

  this.budgetService.addBudget(this.userId, this.amount, this.month, description).subscribe({
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
      urgency: 'low'
    };
  }
  
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
    this.isDescriptionModalVisible = true;
  }
  
  closeDescriptionModal(): void {
    this.isDescriptionModalVisible = false;
  }
  deductBudget(): void {
    this.validateTaskName();
  
    if (!this.userId || this.deduction <= 0 || !this.deductionMonth || !this.taskNameValid) {
      alert('Invalid input: Make sure all fields are correctly filled.');
      return;
    }
  
    const description = `Deducted ${this.deduction} budget for task "${this.taskName}"`;
  
    console.log('Sending deductBudget:', {
      userId: this.userId,
      deductionMonth: this.deductionMonth,
      deduction: this.deduction,
      description,
    });
  
    this.loading = true;
  
    this.budgetService.deductBudget(this.userId, this.deductionMonth, this.deduction, description).subscribe({
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