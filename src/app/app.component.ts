import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { NavigationComponent } from 'src/app/navigation/navigation.component'; // Adjust the path if necessary

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, NavigationComponent], // Include NavigationComponent
  template: `
    <div>
      <app-navigation></app-navigation>
      <router-outlet></router-outlet>
    </div>
  `,
})
export class AppComponent {}
