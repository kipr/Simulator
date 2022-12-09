import Dict from '../../../Dict';
import Patch from '../../../util/Patch';
import Scene from '../Scene';
import PredicateCompletion from './PredicateCompletion';

interface ChallengeCompletion {
  scene: Patch<Scene>;
  events: Dict<boolean>;
  success?: PredicateCompletion;
  failure?: PredicateCompletion;
}

export default ChallengeCompletion;