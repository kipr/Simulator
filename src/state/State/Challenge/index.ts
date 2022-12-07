import Dict from '../../../Dict';
import LocalizedString from '../../../util/LocalizedString';
import Reference from '../../../util/Reference';
import Scene from '../Scene';
import Event from './Event';
import Expr from './Expr';

interface Challenge {
  name: LocalizedString;
  description: LocalizedString;

  events: Dict<Event>;

  successPredicate?: Expr;
  failurePredicate?: Expr;

  sceneId: string;
}

export default Challenge;