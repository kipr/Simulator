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

const NameLabel = styled('span', {
  width: '80px',
  userSelect: 'none'
});

export class Field extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    const { nameWidth } = props;
    if ((nameWidth !== undefined) && (nameWidth > 0)) {
      this.NameLabel = styled('span', {
        width: '${nameWidth}px',
        userSelect: 'none'
      });
    } else {
      this.NameLabel = NameLabel;
    }
  }
  
  private NameLabel = NameLabel;

  render() {
    const { props } = this;
    const { theme, style, className, name, children } = props;
  
    return (
      <Container style={style} className={className}>
        <this.NameLabel>{name}</this.NameLabel>
        {children}
      </Container>
    );
  }
}

export default Field;