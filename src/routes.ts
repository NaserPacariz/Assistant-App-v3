import { Routes } from '@angular/router';
import { LoginComponent } from './app/login/login.component';
import { TaskManagementComponent } from './app/task-management/task-management.component';
import { BudgetManagementComponent } from './app/budget-management/budget-management.component';
import { authGuard } from './route.guard'; 
import { LandingPageComponent } from './app/landing-page/landing-page.component';
import { TaskDetailsComponent } from 'src/app/task-details/task-details.component';
import { BudgetHistoryComponent } from './app/budget-history/budget-history.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'home',
    component: LandingPageComponent,
    children: [
      { path: 'tasks', component: TaskManagementComponent },
      { path: 'budgets', component: BudgetManagementComponent  },
    ],
  },
  { path: 'tasks/:userId', component: TaskDetailsComponent,  canActivate: [authGuard] },
  { path: 'budget-history/:userId', component: BudgetHistoryComponent },
  { path: '**', redirectTo: 'login' },
];
