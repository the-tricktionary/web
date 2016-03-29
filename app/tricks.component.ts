import {Component, OnInit} from 'angular2/core';
import { Router } from 'angular2/router';
import {Trick} from './trick';
import {TrickDetailComponent} from './trick-details.component';
import {TrickService} from './trick.service';

@Component({
  selector: 'my-tricks',
  templateUrl: 'app/template/tricks.component.html',
  styleUrls: ['app/css/tricks.component.css'],
  directives: [TrickDetailComponent],
})

export class TricksComponent implements OnInit {
  tricks: Trick[];
  selectedTrick: Trick;
  constructor(
    private _router: Router,
    private _trickService: TrickService) { }
  getTricks() {
    this._trickService.getTricks().then(tricks => this.tricks = tricks);
  }
  ngOnInit() {
    this.getTricks();
  }
  onSelect(trick: Trick) { this.selectedTrick = trick; }
  gotoDetail() {
    this._router.navigate(['TrickDetail', { id: this.selectedTrick.id }]);
  }
}
