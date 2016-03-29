import { Component }       from 'angular2/core';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from 'angular2/router';
import { TrickService }     from './trick.service';
import { TricksComponent } from './tricks.component';

@Component({
  selector: 'my-app',
  template: `
  <h1>{{title}}</h1>
  <nav>
    <a [routerLink]="['Dashboard']">Dashboard</a>
    <a [routerLink]="['Tricks']">Tricks</a>
  </nav>
  <router-outlet></router-outlet>
`,

  directives: [ROUTER_DIRECTIVES],
  providers: [
    ROUTER_PROVIDERS,
    TrickService
  ]

})
@RouteConfig([
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardComponent,
    useAsDefault: true
  },
  {
    path: '/tricks',
    name: 'Tricks',
    component: TricksComponent
  }
])


export class AppComponent {
  title = 'Tricktionary';
}
