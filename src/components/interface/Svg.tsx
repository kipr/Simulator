import * as React from 'react';
import { styled } from 'styletron-react';
import { RawVector2 } from '../../util/math/math';
import resizeListener, { ResizeListener } from './ResizeListener';
import { StyleProps } from '../../util/style';

export type DrawFunction = (size: RawVector2) => React.ReactNode;

export interface SvgProps extends StyleProps {
  draw: DrawFunction;
  
  onMouseDown?: (event: React.MouseEvent) => void;
  onMouseUp?: (event: React.MouseEvent) => void;
  onMouseEnter?: (event: React.MouseEvent) => void;
  onMouseLeave?: (event: React.MouseEvent) => void;
  onMouseMove?: (event: React.MouseEvent) => void;

  svgRef?: React.Ref<SVGSVGElement>;
}

interface SvgState {
  size: RawVector2;
}

type Props = SvgProps;
type State = SvgState;

const RootContainer = styled('div', {
  position: 'relative',
  width: '100%',
  height: '100%',
  userSelect: 'none'
});

const Container = styled('svg', (props: { $width: number, $height: number }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: props.$width,
  height: props.$height
}));

class Svg extends React.Component<Props, State> {
  private onResize_ = (size: RawVector2, element: Element) => {
    this.setState({
      size
    });
  };

  private resizeListener_ = resizeListener(this.onResize_);

  private containerRef_: HTMLDivElement;
  private bindContainerRef_ = (ref: HTMLDivElement) => {
    this.resizeListener_.disconnect();
    this.containerRef_ = ref;
    if (!this.containerRef_) return;
    this.resizeListener_.observe(this.containerRef_);
    
    const size = RawVector2.fromWidthHeight(this.containerRef_.getBoundingClientRect());
    this.setState({ size });
  };

  get boundingClientRect() {
    return this.containerRef_.getBoundingClientRect();
  }

  get size() {
    return this.state.size;
  }

  constructor(props: Props) {
    super(props);

    this.state = {
      size: RawVector2.ZERO,
    };
  }
  
  render() {
    const { props, state } = this;
    const { className, style, draw, svgRef, ...rest } = props;
    const { size } = state;

    return (
      <RootContainer className={className} style={style} ref={this.bindContainerRef_}>
        <Container ref={svgRef} $width={size.x} $height={size.y} viewBox={`0 0 ${size.x} ${size.y}`} {...rest}>
          {draw(size)}
        </Container>
      </RootContainer>
    );
  }
}

export default Svg;