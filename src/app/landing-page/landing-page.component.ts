import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})

export class LandingPageComponent {
  role: string | null = null; // Store role from localStorage
  constructor(private router: Router) {}

  ngOnInit() {
    this.role = localStorage.getItem('role'); // Get role from local storage
    console.log('User Role:', this.role); // Optional: Check the role in console
  }

  adminOnlyFunction() {
    console.log('Admin function accessed!');
  }
  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
