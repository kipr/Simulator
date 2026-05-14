import Dict from '../../../util/objectOps/Dict';
import Predicate from '../Challenge/Predicate';

interface PredicateCompletion {
  exprStates: Dict<boolean>;
}

namespace PredicateCompletion {
  export const EMPTY: PredicateCompletion = {
    exprStates: {},
  };

  /** True when the failure predicate root (expr id `failure`) is satisfied. Matches challenge definitions and gradebook "failed" checks. */
  export const isFailureRootSatisfied = (failure?: PredicateCompletion): boolean =>
    failure?.exprStates?.failure === true;

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