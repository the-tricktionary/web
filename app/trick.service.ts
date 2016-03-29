import {Injectable} from 'angular2/core';
import {Trick} from './trick';
import {TRICKS} from './mock.tricks';

@Injectable()
export class TrickService {
  getTricks() {
    return Promise.resolve(TRICKS);
  }
  getTrick(id: number) {
  return Promise.resolve(TRICKS).then(
    tricks => tricks.filter(trick => trick.id === id)[0]
  );
}
}
