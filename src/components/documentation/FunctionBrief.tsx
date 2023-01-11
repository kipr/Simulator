import * as React from 'react';
import { styled } from 'styletron-react';

import FunctionDocumentation from '../../state/State/Documentation/FunctionDocumentation';

const FunctionName = styled('span', {
  fontFamily: 'monospace',
});


const Type = styled('span', {
  fontFamily: 'monospace',
  color: 'rgb(100, 100, 255)',
  fontWeight: 'bold',
  marginRight: '1em',
});

const ParameterName = styled('span', {
  fontFamily: 'monospace',
  fontStyle: 'italic',
});

const Decoration = styled('span', {
  fontFamily: 'monospace',
});

const FunctionBrief = ({ func }: { func: FunctionDocumentation }) => (
  <div>
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
  </div>
);

export default FunctionBrief;