import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // Import Router for navigation
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule], // Include RouterModule for navigation
  template: `
    <div class="login-container">
      <h1>Login</h1>
      <form (ngSubmit)="onSubmit()">
        <input
          type="email"
          [(ngModel)]="email"
          name="email"
          placeholder="Email"
          required
        />
        <input
          type="password"
          [(ngModel)]="password"
          name="password"
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
      <p *ngIf="error" class="error-message">{{ error }}</p>
    </div>
  `,
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  error: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.login(this.email, this.password).subscribe(
      (res) => {
        console.log('Login successful:', res);
        localStorage.setItem('token', res.token); // Save token in local storage
        this.router.navigate(['/home']); // Redirect to the landing page after login
      },
      (err) => {
        console.error('Login error:', err);
        this.error = 'Login failed: Invalid email or password'; // User-friendly error message
      }
    );
  }
}
