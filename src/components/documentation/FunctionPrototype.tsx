import * as React from 'react';

import { styled } from 'styletron-react';
import FunctionDocumentation from '../../state/State/Documentation/FunctionDocumentation';
import { StyleProps } from '../../style';
import { Decoration, FunctionName, ParameterName, Type } from './common';
import { toPythonType } from './util';

const Container = styled('div', ({ onClick }: { onClick?: (event: React.MouseEvent) => void }) => ({
  cursor: onClick ? 'pointer' : 'default',
}));

export interface FunctionPrototypeProps extends StyleProps {
  language: 'c' | 'python';
  func: Pick<FunctionDocumentation, 'name' | 'parameters' | 'return_type'>;
  onClick?: (event: React.MouseEvent) => void;
}

type Props = FunctionPrototypeProps;

const FunctionPrototype = ({ language, func, onClick, style, className }: Props) => (language === 'c' ? (
  <Container onClick={onClick} style={style} className={className}>
    <Type $language={language}>{func.return_type}</Type>
    <FunctionName>{func.name}</FunctionName>
    <Decoration>(</Decoration>
    {func.parameters.map((parameter, index) => (
      <span key={index}>
        {index > 0 && <Decoration>, </Decoration>}
        <Type $language={language}>{parameter.type}</Type>
        <ParameterName>{parameter.name}</ParameterName>
      </span>
    ))}
    <Decoration>)</Decoration>
  </Container>
) : (
  <Container onClick={onClick} style={style} className={className}>
    <FunctionName>{func.name}</FunctionName>
    <Decoration>(</Decoration>
    {func.parameters.map((parameter, index) => (
      <span key={index}>
        {index > 0 && <Decoration>, </Decoration>}
        <ParameterName>{parameter.name}</ParameterName>
        <Decoration>: </Decoration>
        <Type $language={language}>{toPythonType(parameter.type)}</Type>
      </span>
    ))}
    <Decoration>)</Decoration>
    <Decoration> -&gt; </Decoration>
    <Type $language={language}>{toPythonType(func.return_type)}</Type>
  </Container>
));

export default FunctionPrototype;