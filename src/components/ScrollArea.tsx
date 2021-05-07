import * as React from 'react';

import { Vector2 } from '../math';

import { StyleProps } from '../style';
import { styled } from 'styletron-react';
import { clamp } from '../math';
import { ThemeProps } from './theme';

export interface ScrollAreaProps extends StyleProps, ThemeProps {
  children: any;
}

interface ScrollAreaState {
  top: number;
  height: number;

  hover: boolean;
}

type Props = ScrollAreaProps;
type State = ScrollAreaState;

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'row'
});

const VScrollArea = styled('div', ({ theme }: ThemeProps) => ({
  position: 'relative',
  borderLeft: `1px solid ${theme.borderColor}`,
  backgroundColor: 'transparent',
  width: '14px',
}));

const VScrollBar = styled('div', {
  position: 'absolute',
  right: '0px',
  width: '100%',
  backgroundColor: `rgba(121, 121, 121, 0.4)`,
  ':hover': {
    backgroundColor: `rgba(121, 121, 121, 0.7)`,
  },
  transition: 'opacity 0.2s'
});

class ScrollArea extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      top: 0,
      height: 0,
      hover: false
    };
  }

  componentDidMount() {

  }

  componentWillUnmount() {

  }

  private onMouseEnter_ = (event: React.MouseEvent<HTMLDivElement>) => {
    this.setState({
      hover: true
    });
  };

  private onMouseLeave_ = (event: React.MouseEvent<HTMLDivElement>) => {
    this.setState({
      hover: false
    });
  };

  private onVClick_ = (event: React.MouseEvent<HTMLDivElement>) => {

  };

  render() {
    const { state, props } = this;
    const { style, className, theme, children } = props;
    const { top, height, hover } = state;

    const vStyle: React.CSSProperties = {
      top: 0,
      height: '100px',
      opacity: hover ? 1.0 : 0.0
    };

    return (
      <Container style={style} className={className} onMouseEnter={this.onMouseEnter_} onMouseLeave={this.onMouseLeave_}>
        {children}
        <VScrollArea theme={theme}>
          <VScrollBar style={vStyle} />
        </VScrollArea>
        
      </Container>
    );
  }

}

export default ScrollArea;