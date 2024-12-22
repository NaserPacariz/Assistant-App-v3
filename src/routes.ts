import { Routes } from '@angular/router';
import { LoginComponent } from './app/login/login.component';
import { TaskManagementComponent } from './app/task-management/task-management.component';
import { BudgetManagementComponent } from './app/budget-management/budget-management.component';
import { authGuard } from './route.guard'; 
import { LandingPageComponent } from './app/landing-page/landing-page.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Default route
  { path: 'login', component: LoginComponent }, // Login page
  { path: 'tasks', component: TaskManagementComponent }, // Task management page
  { path: 'budgets', component: BudgetManagementComponent }, // Budget management page
  { path: 'home', component: LandingPageComponent }, // Landing page after login
  { path: '**', redirectTo: '/login' }, // Wildcard route (keep it at the end)
];
