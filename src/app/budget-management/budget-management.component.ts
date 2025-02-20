import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BudgetService } from 'src/services/budget.service';

@Component({
  selector: 'app-budget-management',
  templateUrl: './budget-management.component.html',
  styleUrls: ['./budget-management.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class BudgetManagementComponent implements OnInit {
  amount = 0;
  deduction = 0;
  month = '';
  deductionMonth = '';
  budget: any = null;
  loading = false;
  currentMonth: string = '';
  userId: string = '';
  taskName: string = '';

  constructor(private budgetService: BudgetService) {}

  ngOnInit(): void {
    this.currentMonth = new Date().toISOString().slice(0, 7);
    this.month = this.currentMonth;
    this.deductionMonth = this.currentMonth;
  }

  addBudget(): void {
    if (!this.userId || this.amount <= 0 || !this.month.trim() || !this.taskName.trim()) {
      alert('Please ensure all fields are filled correctly.');
      return;
    }
  
    const description = `Added ${this.amount} to budget for task "${this.taskName}"`;
  
    this.budgetService.addBudget(this.userId, this.amount, this.month, description).subscribe({
      next: () => {
        alert('Budget added successfully.');
        this.fetchBudget();
      },
      error: (error) => {
        console.error('Error adding budget:', error);
        alert('Failed to add budget.');
      },
    });
  }
  
  deductBudget(): void {
    if (this.deduction <= 0) {
      alert('Please enter a valid deduction amount greater than 0.');
      return;
    }
  
    this.loading = true;
  
    const updatedSpendings = (this.budget.spendings || 0) + this.deduction;
  
    this.budgetService.updateBudget(this.userId, this.deductionMonth, {
      spendings: updatedSpendings,
    }).subscribe({
      next: () => {
        alert('Budget deducted successfully.');
        this.fetchBudget();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error deducting budget:', error);
        alert('Failed to deduct budget. Please try again.');
        this.loading = false;
      },
    });
  }
  
  fetchBudget(): void {
    this.loading = true;
    this.budgetService.getBudget(this.userId, this.month).subscribe({
      next: (budget) => {
        this.budget = budget || null;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching budget:', error);
        alert('Failed to fetch budget details.');
        this.loading = false;
      },
    });
  }
}