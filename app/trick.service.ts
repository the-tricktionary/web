import { Trick } from './trick';
import { TRICKS } from './mock-tricks';
import { Injectable } from 'angular2/core';

@Injectable()
export class TrickService {
  getTrickes() {
    return Promise.resolve(TRICKS);
  }

  getTrick(id: number) {
    return Promise.resolve(TRICKS).then(
      tricks => tricks.filter(trick => trick.id === id)[0]
    );
  }
}
