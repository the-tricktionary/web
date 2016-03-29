import { Component, OnInit } from 'angular2/core';
import { Trick } from './trick';
import { TrickService } from './trick.service';

@Component({
  selector: 'my-dashboard',
  templateUrl: 'app/template/dashboard.component.html'

})
export class DashboardComponent implements OnInit {
  tricks: Trick[] = [];
  constructor(private _trickService: TrickService) { }
  ngOnInit() {
    this._trickService.getTricks()
      .then(tricks => this.tricks = tricks.slice(1,5));
  }
  gotoDetail(){ /* not implemented yet */}
}

