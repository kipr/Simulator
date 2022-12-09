import Dict from '../../../Dict';
import Expr from './Expr';

interface Predicate {
  exprs: Dict<Expr>;
  rootId: string;
}

export default Predicate;