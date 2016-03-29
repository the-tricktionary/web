import { Component, Input, OnInit } from 'angular2/core';
import { RouteParams } from 'angular2/router';

import { Trick } from './trick';
import { TrickService } from './trick.service';

@Component({
  selector: 'my-trick-detail',
  templateUrl: 'app/templates/trick-detail.component.html',
  styleUrls: ['app/css/trick-detail.component.css']
})
export class TrickDetailComponent implements OnInit {
  @Input() trick: Trick;

  constructor(
    private _trickService: TrickService,
    private _routeParams: RouteParams) {
  }

  ngOnInit() {
    let id = +this._routeParams.get('id');
    let id2 = +this._routeParams.get('id2');
    this._trickService.getTrick(id, id2)
      .then(level => this.level = level);
  }

  goBack() {
    window.history.back();
  }
}
