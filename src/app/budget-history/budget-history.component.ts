import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BudgetService } from 'src/services/budget.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-budget-history',
  templateUrl: './budget-history.component.html',
  styleUrls: ['./budget-history.component.scss'],
  standalone: true,
  imports: [CommonModule], // Add CommonModule here
})
export class BudgetHistoryComponent implements OnInit {
  userId: string = '';
  totalBudget: number = 0;

  constructor(
    private route: ActivatedRoute,
    private budgetService: BudgetService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const userId = params.get('userId');
      if (userId) {
        this.userId = userId;
        this.fetchTotalBudget(this.userId);
      } else {
        console.error('User ID is null or undefined.');
      }
    });
  }
  

  fetchTotalBudget(userId: string): void {
    const currentMonth = new Date().toISOString().slice(0, 7);
    this.budgetService.getBudget(userId, currentMonth).subscribe({
      next: (data) => {
        this.totalBudget = data?.amount || 0;
      },
      error: (error) => {
        console.error('Failed to fetch total budget:', error);
      },
    });
  }
}

