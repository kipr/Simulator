import Dict from '../../../Dict';
import Expr from './Expr';

interface Predicate {
  exprs: Dict<Expr>;
  rootId: string;
}

namespace Predicate {
  const retainMemory = (exprs: Dict<Expr>, exprStates: Dict<boolean>) => {
    const ret: Dict<boolean> = {};
    for (const exprId in exprs) {
      const expr = exprs[exprId];
      if (expr.type !== Expr.Type.Once) continue;
      if (!exprStates[exprId]) continue;
      ret[exprId] = exprStates[exprId];
    }
    return ret;
  };
  
  export const evaluate = (predicate: Predicate, eventStates: Dict<boolean>, lastExprStates?: Dict<boolean>): boolean => {
    const context = {
      exprs: predicate.exprs,
      eventStates,
      exprStates: retainMemory(predicate.exprs, lastExprStates || {}),
    };
    return Expr.evaluate(predicate.rootId, context);
  };

  export const evaluateAll = (predicate: Predicate, eventStates: Dict<boolean>, lastExprStates?: Dict<boolean>): Dict<boolean> => {
    const context = {
      exprs: predicate.exprs,
      eventStates,
      exprStates: retainMemory(predicate.exprs, lastExprStates || {}),
    };
    Expr.evaluate(predicate.rootId, context);
    return context.exprStates;
  };
}

export default Predicate;