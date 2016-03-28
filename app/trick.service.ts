import {Injectable} from 'angular2/core';
import {Trick} from './trick';
import {TRICKS} from './mock.tricks';

@Injectable()
export class HeroService {
  getHeroes() {
    return Promise.resolve(HEROES);
  }
}
