import Dict from '../../../Dict';
import Predicate from '../Challenge/Predicate';

interface PredicateCompletion {
  exprStates: Dict<boolean>;
}

namespace PredicateCompletion {
  export const update = (predicate: Predicate, eventStates: Dict<boolean>): PredicateCompletion => {
    const exprStates = Predicate.evaluateAll(predicate, eventStates);
    return { exprStates };
  };
}

export default PredicateCompletion;