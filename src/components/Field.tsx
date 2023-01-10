import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { ThemeProps } from './theme';

export interface FieldProps extends ThemeProps, StyleProps {
  name: string;
  children: React.ReactNode;
  long?: boolean;
  multiline?: boolean;
}

type Props = FieldProps;

const Container = styled('div', ({ $multiline }: { $multiline?: boolean; }) => ({
  display: 'flex',
  flexDirection: !$multiline ? 'row' : 'column',
  alignItems: 'center',
  width: '100%',
  fontSize: '14px'
}));

const NameLabel = styled('span', (props: { $long?: boolean; }) => ({
  width: props.$long ? '140px' : `70px`,
  minWidth: props.$long ? '140px' : `70px`,
  userSelect: 'none',
  fontWeight: 400,
}));

export class Field extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { props } = this;
    const { theme, style, className, name, children, long, multiline } = props;
  
    return (
      <Container style={style} className={className} $multiline={multiline}>
        <NameLabel $long={long}>{name}</NameLabel>
        {children}
      </Container>
    );
  }
}

export default Field;