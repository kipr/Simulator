import { ThemeProps } from './theme';

import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../style';

export interface CharmProps extends StyleProps, ThemeProps {
  children: React.ReactNode;

  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

interface CharmState {

}

type Props = CharmProps;
type State = CharmState;

const Container = styled('div', (props: ThemeProps) => ({
  borderRadius: `${props.theme.itemPadding}px`,
  paddingTop: `${props.theme.itemPadding / 2}px`,
  paddingBottom: `${props.theme.itemPadding / 2}px`,
  paddingLeft: `${props.theme.itemPadding}px`,
  paddingRight: `${props.theme.itemPadding}px`,
  ':first-child': {
    paddingLeft: 0
  },
  ':last-child': {
    paddingRight: 0
  },
  fontSize: '9pt',
  fontWeight: 400,
  border: `1px solid ${props.theme.borderColor}`,
  userSelect: 'none'
}));

class Charm extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { props } = this;
    const { style, className, theme, children, onClick } = props;
    return (
      <Container style={style} className={className} theme={theme} onClick={onClick}>
        {children}
      </Container>
    );
  }
}

export default Charm;