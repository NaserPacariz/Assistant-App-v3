import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { NavigationComponent } from 'src/app/navigation/navigation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, NavigationComponent],
  template: `
    <div>
      <app-navigation></app-navigation>
      <router-outlet></router-outlet>
    </div>
  `,
})
export class AppComponent {}
