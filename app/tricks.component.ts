import { Component, OnInit } from 'angular2/core';
import { Router } from 'angular2/router';

import { Trick } from './trick';
import { TrickDetailComponent } from './trick-detail.component';
import { TrickService } from './trick.service';

@Component({
  selector: 'my-tricks',
  templateUrl: 'app/templates/tricks.component.html',
  styleUrls:  ['app/css/tricks.component.css'],
  directives: [TrickDetailComponent]
})
export class TrickesComponent implements OnInit {
  tricks: Trick[];
  selectedTrick: Trick;

  constructor(
    private _router: Router,
    private _trickService: TrickService) { }

  getTrickes() {
    this._trickService.getTrickes().then(tricks => this.tricks = tricks);
  }

  ngOnInit() {
    this.getTrickes();
  }

  onSelect(trick: Trick) { this.selectedTrick = trick; }

  gotoDetail() {
    this._router.navigate(['TrickDetail', { id: this.selectedTrick.id }]);
  }
}
