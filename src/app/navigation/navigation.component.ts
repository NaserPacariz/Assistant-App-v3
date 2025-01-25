import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from '../../routes'; // Adjust the path to `routes.ts` if necessary
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- <div class="navigation-arrows">
      <button class="arrow-btn" [disabled]="!prevRoute" (click)="navigateTo(prevRoute)">
        &larr; 
      </button>
      <button class="arrow-btn" [disabled]="!nextRoute" (click)="navigateTo(nextRoute)">
        &rarr; 
      </button>
    </div> -->
  `,
  styleUrls: ['./navigation.component.scss'], // Create this file for styles
})
export class NavigationComponent implements OnInit {
  currentRouteIndex: number | null = null;
  prevRoute: string | null = null;
  nextRoute: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateNavigation();
    this.router.events.subscribe(() => this.updateNavigation()); // Listen for route changes
  }

  updateNavigation(): void {
    const currentRoute = this.router.url.replace('/', ''); // Current route path
    const routePaths = routes.map((route) => route.path); // Get all route paths

    this.currentRouteIndex = routePaths.indexOf(currentRoute);
    this.prevRoute =
      this.currentRouteIndex > 0 ? '/' + routePaths[this.currentRouteIndex - 1] : null;
    this.nextRoute =
      this.currentRouteIndex < routePaths.length - 1
        ? '/' + routePaths[this.currentRouteIndex + 1]
        : null;
  }

  navigateTo(route: string | null): void {
    if (route) {
      this.router.navigate([route]);
    }
  }
}
