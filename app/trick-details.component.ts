import { Component, Input, OnInit } from 'angular2/core';
import { RouteParams } from 'angular2/router';

import { Trick } from './trick';
import { TrickService } from './trick.service';

@Component({
  selector: 'my-trick-detail',
  templateUrl: 'app/template/trick-details.component.html',
  styleUrls: ['app/css/trick-details.component.css']
})
export class TrickDetailComponent implements OnInit {
  @Input() trick: Trick;

  constructor(
    private _trickService: TrickService,
    private _routeParams: RouteParams) {
  }

  ngOnInit() {
    let id = +this._routeParams.get('id');
    this._heroService.getTrick(id)
      .then(trick => this.trick = trick);
  }

  goBack() {
    window.history.back();
  }
}
