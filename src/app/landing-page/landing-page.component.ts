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
export class LandingPageComponent implements OnInit {
  role: string | null = null;
  selectedTab: string = 'home';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.role = localStorage.getItem('role');
    console.log('User Role:', this.role);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
    console.log('Logging out...');
  }
}
