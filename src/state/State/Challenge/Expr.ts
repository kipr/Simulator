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
    args: Expr[];
  }

  export interface Or {
    type: Type.Or;
    args: Expr[];
  }

  export interface Xor {
    type: Type.Xor;
    args: Expr[];
  }

  export interface Not {
    type: Type.Not;
    arg: Expr;
  }

  export interface Once {
    type: Type.Once;
    arg: Expr;
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