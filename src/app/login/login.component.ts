import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
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

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {}

  onSubmit() {
    this.authService.login(this.email, this.password).subscribe(
      (res) => {
        console.log('Login successful:', res);
        localStorage.setItem('token', res.token);
        this.router.navigate(['/home']);
      },
      (err) => {
        console.error('Login error:', err);
        this.error = 'Login failed: Invalid email or password';
      }
    );
  }
  login(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
    localStorage.setItem('returnUrl', returnUrl);

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        localStorage.removeItem('returnUrl');
      },
      error: (err) => {
        console.error('Login failed:', err);
        alert('Invalid login credentials');
      },
    });
  }
}