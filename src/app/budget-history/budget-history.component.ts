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
  history: any[] = [];

  constructor(private route: ActivatedRoute, private router: Router, private budgetService: BudgetService) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('userId') || '';
    this.fetchBudgetHistory();
  }

  fetchBudgetHistory(): void {
    this.budgetService.getBudgetHistory(this.userId).subscribe({
      next: (response) => {
        this.history = response.history || [];
      },
      error: (error) => {
        console.error('Failed to fetch budget history:', error);
        this.history = [];
      },
    });
  }

  goBack(): void {
    this.router.navigate([`/tasks/${this.userId}`]);
  }
}
