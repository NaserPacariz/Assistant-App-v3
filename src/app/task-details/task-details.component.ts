import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from 'src/services/task.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BudgetService } from '@services/budget.service';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule], // Add FormsModule to imports
})
export class TaskDetailsComponent implements OnInit {
  userId: string = '';
  tasks: any[] = [];
  isAddTaskModalVisible: boolean = false;
  isEditModalOpen: boolean = false;
  editingTask: any = null;
  taskTitle: string = '';
  taskDescription: string = '';
  dueDate: string = '';
  urgency: string = 'low';

  constructor(private route: ActivatedRoute, private taskService: TaskService, private budgetService: BudgetService) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    if (userId) {
      this.userId = userId;
      this.fetchTasksForUser(this.userId);
    } else {
      console.error('User ID is null or undefined.');
    }
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
    const newTask = {
      title: this.taskTitle,
      description: this.taskDescription,
      dueDate: this.dueDate,
      urgency: this.urgency,
      status: 'pending',
    };
    this.taskService.createTask(this.userId, newTask).subscribe({
      next: (response) => {
        this.tasks.push({ ...newTask, id: response.taskId });
        this.sortTasksByUrgency(); // Sort tasks after adding
        this.closeAddTaskModal();
      },
      error: (error) => {
        console.error('Error creating task:', error);
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
    if (confirm('Are you sure you want to delete this task?')) {
      this.deleteTask(taskId);
    }
  }

  deleteTask(taskId: string): void {
    this.taskService.deleteTask(this.userId, taskId).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((task) => task.id !== taskId);
      },
      error: (error) => {
        console.error('Error deleting task:', error);
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
  
}
