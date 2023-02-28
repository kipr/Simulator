import Dict from '../../../Dict';

namespace Expr {
  export interface EvaluationContext {
    exprs: Dict<Expr>;
    eventStates: Dict<boolean>;
    exprStates: Dict<boolean>;
  }

  export enum Type {
    Event = 'event',
    And = 'and',
    Or = 'or',
    Xor = 'xor',
    Not = 'not',
    Once = 'once',
  }

  export interface Event {
    type: Type.Event;
    eventId: string;
  }

  namespace Event {
    export const evaluate = (event: Event, context: EvaluationContext): boolean => {
      const eventState = context.eventStates[event.eventId];
      return eventState === undefined ? false : eventState;
    };
  }

  export interface And {
    type: Type.And;
    argIds: string[];
  }

  export namespace And {
    export const evaluate = (and: And, context: EvaluationContext): boolean => {
      const argStates = and.argIds.map(argId => Expr.evaluate(argId, context));
      return argStates.every(argState => (argState === undefined ? false : argState));
    };
  }

  export interface Or {
    type: Type.Or;
    argIds: string[];
  }

  export namespace Or {
    export const evaluate = (or: Or, context: EvaluationContext): boolean => {
      const argStates = or.argIds.map(argId => Expr.evaluate(argId, context));
      return argStates.some(argState => (argState === undefined ? false : argState));
    };
  }

  export interface Xor {
    type: Type.Xor;
    argIds: string[];
  }

  export namespace Xor {
    export const evaluate = (xor: Xor, context: EvaluationContext): boolean => {
      const argStates = xor.argIds.map(argId => Expr.evaluate(argId, context));
      return argStates.filter(argState => (argState === undefined ? false : argState)).length === 1;
    };
  }

  export interface Not {
    type: Type.Not;
    argId: string;
  }

  export namespace Not {
    export const evaluate = (not: Not, context: EvaluationContext): boolean => {
      const argState = Expr.evaluate(not.argId, context);
      return argState === undefined ? true : !argState;
    };
  }

  export interface Once {
    type: Type.Once;
    argId: string;
  }

  export namespace Once {
    export const evaluate = (once: Once, context: EvaluationContext): boolean => {
      return Expr.evaluate(once.argId, context);
    };
  }

  const passthrough = <E extends { argId: string; }>(expr: E, context: EvaluationContext): boolean => {
    return Expr.evaluate(expr.argId, context);
  };

  export const evaluate = (exprId: string, context: EvaluationContext): boolean => {
    const expr = context.exprs[exprId];
    if (expr === undefined) return false;
    
    if (context.exprStates[exprId] !== undefined) {
      if (expr.type === Expr.Type.Once) passthrough(expr, context);
      return context.exprStates[exprId];
    }

    let ret = false;
    switch (expr.type) {
      case Type.Event: ret = Event.evaluate(expr, context); break;
      case Type.And: ret = And.evaluate(expr, context); break;
      case Type.Or: ret = Or.evaluate(expr, context); break;
      case Type.Xor: ret = Xor.evaluate(expr, context); break;
      case Type.Not: ret = Not.evaluate(expr, context); break;
      case Type.Once: ret = Once.evaluate(expr, context); break;
    }

    context.exprStates[exprId] = ret;
    return ret;
  };
}

type Expr = (
  Expr.Event |
  Expr.And |
  Expr.Or |
  Expr.Xor |
  Expr.Not |
  Expr.Once
);

export default Expr;