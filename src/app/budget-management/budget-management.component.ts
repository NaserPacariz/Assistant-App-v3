import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BudgetService } from 'src/services/budget.service';

@Component({
  templateUrl: './budget-management.component.html',
  styleUrls: ['./budget-management.component.scss'],
  selector: 'app-budget-management',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div>
      <h2>Budget Management</h2>

      <!-- Add Budget -->
      <form (ngSubmit)="addBudget()" style="margin-bottom: 20px;">
        <input type="text" [(ngModel)]="userId" name="userId" placeholder="User ID" required />
        <input type="number" [(ngModel)]="amount" name="amount" placeholder="Budget Amount" required />
        <input type="month" [(ngModel)]="month" name="month" required />
        <button type="submit" [disabled]="loading">Add Budget</button>
        <span *ngIf="loading">Loading...</span>
      </form>

      <!-- Fetch Budget -->
      <form (ngSubmit)="fetchBudget()" style="margin-bottom: 20px;">
        <input type="text" [(ngModel)]="userId" name="userId" placeholder="User ID" required />
        <input type="month" [(ngModel)]="month" name="month" required />
        <button type="submit" [disabled]="loading">Get Budget</button>
        <span *ngIf="loading">Loading...</span>
      </form>

      <!-- Update Spendings -->
      <form (ngSubmit)="updateSpendings()" style="margin-bottom: 20px;" *ngIf="budget">
        <input
          type="number"
          [(ngModel)]="spendings"
          name="spendings"
          placeholder="Update Spendings"
          required
        />
        <button type="submit" [disabled]="loading">Update Spendings</button>
      </form>

      <!-- Display Budget Details -->
      <div *ngIf="budget">
        <h3>Budget Details:</h3>
        <p>Amount: {{ budget?.amount }}</p>
        <p>Spendings: {{ budget?.spendings }}</p>
        <progress [value]="budget?.spendings" [max]="budget?.amount"></progress>
        <p *ngIf="budget?.spendings > budget?.amount" style="color: red;">
          Warning: Spendings exceed the budget!
        </p>
      </div>
    </div>
  `,
})
export class BudgetManagementComponent {
  userId = '';
  amount = 0;
  month = '';
  spendings = 0; // To update spendings
  budget: any = null; // This will now be an object, not an array
  loading = false;

  constructor(private budgetService: BudgetService) {}

  // Add Budget
  addBudget() {
    this.loading = true;
    this.budgetService.addBudget(this.userId, this.amount, this.month).subscribe({
      next: () => {
        alert('Budget added successfully');
        this.loading = false;
        this.fetchBudget(); // Auto-refresh after adding budget
      },
      error: (error) => {
        console.error('Error adding budget:', error);
        alert('Failed to add budget');
        this.loading = false;
      }
    });
  }

  // Fetch Budget
  fetchBudget() {
    this.loading = true;
    this.budgetService.getBudget(this.userId, this.month).subscribe({
      next: (budget) => {
        if (typeof budget === 'object' && budget !== null) {
          this.budget = budget; // Set the budget only if it’s a valid object
        } else {
          this.budget = null; // Reset if no valid budget is found
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching budget:', error);
        alert('Failed to fetch budget');
        this.budget = null;
        this.loading = false;
      }
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
        this.fetchBudget(); // Auto-refresh after updating spendings
      },
      error: (err) => {
        console.error('Error updating spendings:', err);
        alert('Failed to update spendings. Please check the server.');
        this.loading = false;
      }
    });
  }
}
