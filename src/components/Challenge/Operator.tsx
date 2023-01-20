import * as React from 'react';
import { styled } from 'styletron-react';
import LocalizedString from '../../util/LocalizedString';
import Dict from '../../Dict';
import Expr from '../../state/State/Challenge/Expr';
import { StyleProps } from '../../style';
import tr from '@i18n';

export interface OperatorProps extends StyleProps {
  type: Expr.Type.And | Expr.Type.Or | Expr.Type.Xor | Expr.Type.Once | Expr.Type.Not;
  locale: LocalizedString.Language;
}

type Props = OperatorProps;

const Container = styled('div', {
});

const Operator: React.FC<Props> = ({ type, className, style, locale }) => {
  let text: string;
  switch (type) {
    case Expr.Type.And:
      text = LocalizedString.lookup(tr('all of'), locale);
      break;
    case Expr.Type.Or:
      text = LocalizedString.lookup(tr('one or more of'), locale);
      break;
    case Expr.Type.Xor:
      text = LocalizedString.lookup(tr('exactly one of'), locale);
      break;
    case Expr.Type.Once:
      text = LocalizedString.lookup(tr('once'), locale);
      break;
    case Expr.Type.Not:
      text = LocalizedString.lookup(tr('not'), locale);
      break;
  }
  
  return (
    <Container className={className} style={style}>
      {text}
    </Container>
  );
};

export default Operator;