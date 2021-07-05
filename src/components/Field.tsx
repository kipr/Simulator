import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { Value } from '../util';
import { ThemeProps } from './theme';

export interface FieldProps extends ThemeProps, StyleProps {
  name: string;
  children: any;
}

type Props = FieldProps;

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%'
});

const NameLabel = styled('span', {
  width: '80px',
  userSelect: 'none'
});

export class Field extends React.PureComponent<Props> {
  render() {
    const { props } = this;
    const { theme, style, className, name, children } = props;
  
    return (
      <Container style={style} className={className}>
        <NameLabel>{name}</NameLabel>
        {children}
      </Container>
    );
  }
}

export default Field;