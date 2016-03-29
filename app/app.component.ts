import { Component } from 'angular2/core';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from 'angular2/router';
import { TrickService } from './trick.service';
import { TricksComponent } from './tricks.component';
import { DashboardComponent } from './dashboard.component';
import { TrickDetailComponent } from './trick-details.component';


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
  styleUrls: ['app/css/app.component.css']
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
    path: '/trick/:id',
    name: 'TrickDetail',
    component: TrickDetailComponent
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
