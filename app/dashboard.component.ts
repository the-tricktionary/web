import { Component, OnInit } from 'angular2/core';
import { Router } from 'angular2/router';

import { Trick } from './trick';
import { TrickService } from './trick.service';

@Component({
  selector: 'my-dashboard',
  templateUrl: 'app/templates/dashboard.component.html',
  styleUrls: ['app/css/dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  tricks: Trick[] = [];

  constructor(
    private _router: Router,
    private _trickService: TrickService) {
  }

  ngOnInit() {
    this._trickService.getTricks().then(tricks => this.tricks = tricks);
  }

  gotoDetail(trick: Trick) {
    let link = ['TrickDetail', { id: trick.id }];
    this._router.navigate(link);
  }
}
