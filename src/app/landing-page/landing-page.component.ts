import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule], // Add RouterModule here
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent implements OnInit {
  role: string | null = null; // Store role from localStorage
  selectedTab: string = 'home'; // Default tab

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.role = localStorage.getItem('role'); // Fetch role from localStorage
    console.log('User Role:', this.role); // Debugging
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
    console.log('Logging out...');
  }
}
