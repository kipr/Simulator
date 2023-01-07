import Dict from '../../../Dict';
import Predicate from '../Challenge/Predicate';

interface PredicateCompletion {
  exprStates: Dict<boolean>;
}

namespace PredicateCompletion {
  export const EMPTY: PredicateCompletion = {
    exprStates: {},
  };

  export const update = (
    predicateCompletion: PredicateCompletion,
    predicate: Predicate,
    eventStates: Dict<boolean>
  ): PredicateCompletion => {
    const exprStates = Predicate.evaluateAll(predicate, eventStates, predicateCompletion.exprStates);
    return { exprStates };
  };
}

export default PredicateCompletion;