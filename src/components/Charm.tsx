import { ThemeProps } from './theme';

import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../style';

export interface CharmProps extends StyleProps, ThemeProps {
  children: any;

  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

interface CharmState {

}

type Props = CharmProps;
type State = CharmState;

const Container = styled('div', (props: ThemeProps) => ({
  borderRadius: '4px',
  paddingLeft: '5px',
  paddingRight: '5px',
  paddingTop: '1px',
  paddingBottom: '1px',
  fontSize: '9pt',
  fontWeight: 400,
  marginRight: '10px',
  border: `1px solid ${props.theme.borderColor}`,
  ':last-child': {
    marginRight: 0
  }
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