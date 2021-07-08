import { styled } from 'styletron-react';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Vector2 } from '../../math';
import { StyleProps } from '../../style';
import { ThemeProps } from '../theme';


export interface ScreenGuideProps extends StyleProps, ThemeProps {
  from: HTMLElement,
  fromOffset?: Vector2,
  to: Vector2
}

interface ScreenGuideState {

}

type Props = ScreenGuideProps;
type State = ScreenGuideState;

const SCREEN_GUIDE = document.getElementById('screen-guide');

const Container = styled('svg', {
  width: '100%',
  height: '100%'
});

const Path = styled('path', {
  stroke: '#e00',
  strokeWidth: '1px',
  fill: 'none'
});

const Circle = styled('circle', {
  fill: '#e00',
  stroke: 'none'
});


class ScreenGuide extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  
    
  }

  render() {
    const { props } = this;
    const { from, fromOffset, to } = props;

    const guideBounding = SCREEN_GUIDE.getBoundingClientRect();

    const fromBounding = from.getBoundingClientRect();

    const p0x = fromBounding.left + fromBounding.width / 2 + Vector2.x(fromOffset);
    const p0y = fromBounding.top + fromBounding.height / 2 + Vector2.y(fromOffset);
    
    const p3x = Vector2.x(to);
    const p3y = Vector2.y(to);

    const p1x = (p0x + p3x) / 2;
    const p1y = p0y;

    const p2x = (p0x + p3x) / 2;
    const p2y = p3y;

    const path = `M ${p0x} ${p0y} C ${p1x} ${p1y}, ${p2x} ${p2y}, ${p3x} ${p3y}`;

    return ReactDom.createPortal(
      <Container viewBox={`0 0 ${guideBounding.width} ${guideBounding.height}`}>
        <Path d={path} />
        <Circle r={2} cx={p0x} cy={p0y} />
        <Circle r={2} cx={p3x} cy={p3y} />
      </Container>
      , SCREEN_GUIDE
    );
  }
}

export default ScreenGuide;