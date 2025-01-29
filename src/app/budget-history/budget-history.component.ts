import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BudgetService } from 'src/services/budget.service';
import { FormsModule } from '@angular/forms'; // Dodaj ovo
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-budget-history',
  templateUrl: './budget-history.component.html',
  styleUrls: ['./budget-history.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule], // Dodaj FormsModule ovde
})
export class BudgetHistoryComponent implements OnInit {
  userId: string = '';
  budgetHistory: any[] = []; // Svi podaci o budžetu
  filteredHistory: any[] = []; // Filtrirani podaci
  sortOption: string = 'newest'; // Sortiraj po datumu, default "najnoviji"
  searchValue: string = ''; // Vrijednost za pretragu
  priceFilter: { min: number | null; max: number | null } = { min: null, max: null }; // Raspon cijena

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
        console.log('Budget history data:', data); // Provjera odgovora
        this.budgetHistory = Array.isArray(data) ? data : []; // Osigurajte da je `data` niz
      },
      error: (error) => {
        console.error('Error fetching budget history:', error);
      },
    });
  }
  

  applyFilters(): void {
    this.filteredHistory = this.budgetHistory.filter((item) => {
      // Pretraga po vrijednosti
      const matchesSearch = this.searchValue
        ? item.description.toLowerCase().includes(this.searchValue.toLowerCase())
        : true;

      // Filter po rasponu cijena
      const matchesPrice =
        (this.priceFilter.min === null || item.amount >= this.priceFilter.min) &&
        (this.priceFilter.max === null || item.amount <= this.priceFilter.max);

      return matchesSearch && matchesPrice;
    });

    // Sortiranje
    if (this.sortOption === 'newest') {
      this.filteredHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (this.sortOption === 'oldest') {
      this.filteredHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  }
}
