import { Trick } from './trick';
import { TRICKS } from './mock-tricks';
import { Injectable } from 'angular2/core';

@Injectable()
export class TrickService {
  getTricks() {
    return Promise.resolve(TRICKS);
  }

  getTrick(id: number, id2: number) {
    return Promise.resolve(TRICKS).then(
      levels => tricks.filter(level => trick.id === id)[0]
    );
  }
}
