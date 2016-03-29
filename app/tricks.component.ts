import {Component, OnInit} from 'angular2/core';
import {Trick} from './trick';
import {TrickDetailComponent} from './trick-details.component';

@Component({
  selector: 'my-tricks',
  template:`
    <h1>{{title}}</h1>
    <h2>Tricks</h2>
    <ul class="tricks">
      <li *ngFor="#trick of tricks"
        [class.selected]="trick === selectedTrick"
        (click)="onSelect(trick)">
        <span class="badge">{{trick.id}}</span> {{trick.name}}
      </li>
    </ul>
    <my-trick-detail [trick]="selectedTrick"></my-trick-detail>
  `,
  styles:[`
    .selected {
      background-color: #CFD8DC !important;
      color: white;
    }
    .tricks {
      margin: 0 0 2em 0;
      list-style-type: none;
      padding: 0;
      width: 15em;
    }
    .tricks li {
      cursor: pointer;
      position: relative;
      left: 0;
      background-color: #EEE;
      margin: .5em;
      padding: .3em 0;
      height: 1.6em;
      border-radius: 4px;
    }
    .tricks li.selected:hover {
      background-color: #BBD8DC !important;
      color: white;
    }
    .tricks li:hover {
      color: #607D8B;
      background-color: #DDD;
      left: .1em;
    }
    .tricks .text {
      position: relative;
      top: -3px;
    }
    .tricks .badge {
      display: inline-block;
      font-size: small;
      color: white;
      padding: 0.8em 0.7em 0 0.7em;
      background-color: #607D8B;
      line-height: 1em;
      position: relative;
      left: -1px;
      top: -4px;
      height: 1.8em;
      margin-right: .8em;
      border-radius: 4px 0 0 4px;
    }
  `],
  directives: [TrickDetailComponent],
  providers: []
})
export class TrickComponent implements OnInit {
  title = 'Tricktionary';
  tricks: Trick[];
  selectedTrick: Trick;
  constructor(private _trickService: TrickService) { }
  getTricks() {
    this._trickService.getTricks().then(tricks => this.tricks = tricks);
  }
  ngOnInit() {
    this.getTricks();
  }
  onSelect(trick: Trick) { this.selectedTrick = trick; }
}
