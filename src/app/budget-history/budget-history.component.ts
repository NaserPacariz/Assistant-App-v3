import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BudgetService } from 'src/services/budget.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-budget-history',
  templateUrl: './budget-history.component.html',
  styleUrls: ['./budget-history.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class BudgetHistoryComponent implements OnInit {
  userId: string = '';
  budgetHistory: any[] = [];
  filteredHistory: any[] = [];
  sortOption: string = 'newest';
  searchValue: string = '';
  priceFilter: { min: number | null; max: number | null } = { min: null, max: null };
  match: any;

  constructor(private route: ActivatedRoute, private budgetService: BudgetService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const userId = params.get('userId');
      if (userId) {
        this.userId = userId;
        this.fetchBudgetHistory(this.userId);
      }
    });
  }

  fetchBudgetHistory(userId: string): void {
    this.budgetService.getBudgetHistory(userId).subscribe({
      next: (data) => {
        console.log('Raw Budget history data:', data);

        this.budgetHistory = Object.values(data || {}).map((item: any) => {
          console.log('Processing item:', item);
          return {
            date: new Date(item.timestamp),
            description: item.description,
            amount: item.amount,
          };
        });
  
        console.log('Transformed Budget history data:', this.budgetHistory);
  
        this.budgetHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
        this.filteredHistory = [...this.budgetHistory];
      },
      error: (error) => {
        console.error('Error fetching budget history:', error);
      },
    });
  }

  applyFilters(): void {
    this.filteredHistory = this.budgetHistory.filter((item) => {
      const description = item.description || '';

      const taskNameMatch = description.match(/task "(.+?)"/);
      const taskName = taskNameMatch ? taskNameMatch[1].toLowerCase() : '';

      const matchesSearch = this.searchValue
        ? taskName.includes(this.searchValue.toLowerCase())
        : true;

      const matchesPrice =
        (this.priceFilter.min === null || item.amount >= this.priceFilter.min) &&
        (this.priceFilter.max === null || item.amount <= this.priceFilter.max);
  
      return matchesSearch && matchesPrice;
    });

    if (this.sortOption === 'newest') {
      this.filteredHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (this.sortOption === 'oldest') {
      this.filteredHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  }
  
  navigateBack(): void {
    window.history.back();
  } 
}