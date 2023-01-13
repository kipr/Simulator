import * as React from 'react';

import { styled } from 'styletron-react';
import FunctionDocumentation from '../../state/State/Documentation/FunctionDocumentation';
import { StyleProps } from '../../style';
import { Decoration, FunctionName, ParameterName, Type } from './common';

const Container = styled('div', ({ onClick }: { onClick?: (event: React.MouseEvent) => void }) => ({
  cursor: onClick ? 'pointer' : 'default',
}));

export interface FunctionPrototypeProps extends StyleProps {
  func: Pick<FunctionDocumentation, 'name' | 'parameters' | 'return_type'>;
  onClick?: (event: React.MouseEvent) => void;
}

type Props = FunctionPrototypeProps;

const FunctionPrototype = ({ func, onClick, style, className }: Props) => (
  <Container onClick={onClick} style={style} className={className}>
    <Type>{func.return_type}</Type>
    <FunctionName>{func.name}</FunctionName>
    <Decoration>(</Decoration>
    {func.parameters.map((parameter, index) => (
      <span key={index}>
        {index > 0 && <Decoration>, </Decoration>}
        <Type>{parameter.type}</Type>
        <ParameterName>{parameter.name}</ParameterName>
      </span>
    ))}
    <Decoration>)</Decoration>
  </Container>
);

export default FunctionPrototype;