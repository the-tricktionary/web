import {Component, Input} from 'angular2/core';
import {Trick} from './trick';
@Component({
  selector: 'my-trick-detail',
  template: `
    <div *ngIf="trick">
      <h2>{{trick.name}} details!</h2>
      <div><label>id: </label>{{trick.id}}</div>
    </div>
  `
})
export class TrickDetailComponent {
  @Input() 
  trick: Trick;
}
