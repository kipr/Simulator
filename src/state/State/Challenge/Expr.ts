namespace Expr {
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

  export interface And {
    type: Type.And;
    argIds: string[];
  }

  export interface Or {
    type: Type.Or;
    argIds: string[];
  }

  export interface Xor {
    type: Type.Xor;
    argIds: string[];
  }

  export interface Not {
    type: Type.Not;
    argId: string;
  }

  export interface Once {
    type: Type.Once;
    argId: string;
  }
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