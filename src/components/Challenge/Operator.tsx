import * as React from 'react';
import { styled } from 'styletron-react';
import Dict from '../../Dict';
import Expr from '../../state/State/Challenge/Expr';
import { StyleProps } from '../../style';

export interface OperatorProps extends StyleProps {
  type: Expr.Type.And | Expr.Type.Or | Expr.Type.Xor | Expr.Type.Once | Expr.Type.Not;
}

type Props = OperatorProps;

const Container = styled('div', {
});

const Operator: React.FC<Props> = ({ type, className, style }) => {
  let text: string;
  switch (type) {
    case Expr.Type.And:
      text = 'all of';
      break;
    case Expr.Type.Or:
      text = 'one or more of';
      break;
    case Expr.Type.Xor:
      text = 'exactly one of';
      break;
    case Expr.Type.Once:
      text = 'once';
      break;
    case Expr.Type.Not:
      text = 'not';
      break;
  }
  
  return (
    <Container className={className} style={style}>
      {text}
    </Container>
  );
};

export default Operator;