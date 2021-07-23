import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { ThemeProps } from './theme';

export interface FieldProps extends ThemeProps, StyleProps {
  name: string;
  children: React.ReactNode;

  nameWidth?: number | undefined;
}

type Props = FieldProps;

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%'
});

const NameLabel = styled('span', (props: { width?: number }) => ({
  width: `${props.width || 80}px`,
  userSelect: 'none',
  fontWeight: 400,
}));

export class Field extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { props } = this;
    const { theme, style, className, name, children, nameWidth } = props;
  
    return (
      <Container style={style} className={className}>
        <NameLabel width={nameWidth}>{name}</NameLabel>
        {children}
      </Container>
    );
  }
}

export default Field;