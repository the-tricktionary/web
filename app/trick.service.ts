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
      levels => levels.filter(level => level.id === id)[0]
    ).then(tricks => tricks.filter(trick => level.subs.id2 === id2)[0]
    );
  }
}
