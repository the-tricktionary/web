import { Component }       from 'angular2/core';
import { TrickService }     from './trick.service';
import { TricksComponent } from './tricks.component';

@Component({
  selector: 'my-app',
  template: `
    <h1>{{title}}</h1>
    <my-tricks></my-tricks>
  `,
  directives: [TricksComponent],
  providers: [
    TrickService
  ]
})
export class AppComponent {
  title = 'Tricktionary';
}
