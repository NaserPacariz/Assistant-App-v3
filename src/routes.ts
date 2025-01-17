import { Routes } from '@angular/router';
import { LoginComponent } from './app/login/login.component';
import { TaskManagementComponent } from './app/task-management/task-management.component';
import { BudgetManagementComponent } from './app/budget-management/budget-management.component';
import { authGuard } from './route.guard'; 
import { LandingPageComponent } from './app/landing-page/landing-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'tasks', component: TaskManagementComponent },
  { path: 'budgets', component: BudgetManagementComponent },
  { path: 'home', component: LandingPageComponent },
  { path: '**', redirectTo: 'login' },
];


