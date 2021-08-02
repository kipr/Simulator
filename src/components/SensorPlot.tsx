import { styled } from 'styletron-react';
import * as React from 'react';
import { StyleProps } from '../style';
import { ThemeProps } from './theme';
import resizeListener, { ResizeListener } from './ResizeListener';

export interface Vector2 {
  x: number;
  y: number;
}

export interface SensorPlotProps extends ThemeProps, StyleProps {
  value: number;
  duration?: number;
  refreshRate?: number;
}

export namespace SensorPlotProps {
  export const DEFAULT_DURATION = 5.0;
  export const DEFAULT_REFRESH_RATE = 10.0;
  export const duration = (props: SensorPlotProps): number => props.duration || DEFAULT_DURATION;
  export const refreshRate = (props: SensorPlotProps): number => props.refreshRate || DEFAULT_REFRESH_RATE;
}

interface SensorPlotState {
  svgWidth: number;
  svgHeight: number;

  viewportWidth: number;
  viewportHeight: number;

  x: number;
  y: number;

  points: Vector2[];
  ticks: number[];

  maxValue: number;
  minValue: number;
}

type Props = SensorPlotProps;
type State = SensorPlotState;

const Container = styled('div', {
  position: 'relative',
  width: '100%',
  height: '100px'
});

const Svg = styled('svg', {
  position: 'absolute',
  top: 0,
  left: 0
});

const Tick = styled('line',  ({ theme }: ThemeProps) => ({
  stroke: theme.borderColor,
  strokeWidth: '1px'
}));

const Path = styled('path', {
  stroke: '#117711',
  fill: 'transparent'
});

const Text = styled('div', {
  position: 'absolute',
  fontSize: '8pt',
  paddingTop: '5px',
  opacity: 0.7,
  fontFamily: `'Roboto Mono', monospace`,
  userSelect: 'none'
});

const PLOT_MARGIN = 25;

class SensorPlot extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.observer_ = resizeListener(this.onResize_);

    this.state = {
      svgWidth: 0,
      svgHeight: 0,

      viewportWidth: 0,
      viewportHeight: 0,

      x: 0,
      y: 5,
      points: [],
      ticks: [],
      maxValue: 0,
      minValue: 0
    };
  }

  private onResize_ = (size: Vector2, element: HTMLElement) => {

    this.setState({
      svgHeight: 0,
      svgWidth: size.x,
      viewportHeight: size.y,
      viewportWidth: size.x
    });
  };

  private observer_: ResizeListener;
  private ref_: HTMLDivElement;
  private bindRef_ = (ref: HTMLDivElement) => {
    if (this.observer_ && this.ref_) this.observer_.unobserve(this.ref_);
    this.ref_ = ref;
    if (this.ref_) this.observer_.observe(this.ref_);
  };

  componentDidMount() {
    this.mounted_ = true;

    this.firstTick_ = Date.now();
    this.lastTick_ = this.firstTick_;
    this.tick_();
  }

  componentWillUnmount() {
    this.mounted_ = false;
  }

  private mounted_ = false;
  private scheduleTick_ = () => {
    setTimeout(this.tick_, (1 / this.props.refreshRate) * 1000);
  };

  private firstTick_: number;
  private lastTick_: number;
  private tick_ = () => {
    if (!this.mounted_) return;

    const nowMs = Date.now();
    const now = nowMs / 1000;
    const delta = (nowMs - this.lastTick_) / 1000;

    const { props, state } = this;
    const { value } = props;
    const { points, ticks } = state;

    const { width } = this.ref_.getBoundingClientRect();
    const duration = SensorPlotProps.duration(props);

    const pixelsPerSecond = width / duration;


    const nextPoints = [...points];
    const nextTicks = [...ticks];

    const absoluteOffset = (nowMs - this.firstTick_) / 1000;

    nextPoints.push({ x: absoluteOffset + duration, y: -value });

    {
      let i = 0;
      for (; i < nextPoints.length; ++i) {
        const point = nextPoints[i];
        if (point.x >= absoluteOffset) break;
      }
      if (i > 0) nextPoints.splice(0, i - 1);
    }

    const secs = Math.floor(now) - Math.floor(this.lastTick_ / 1000);

    for (let i = secs - 1; i >= 0; --i) {
      nextTicks.push(Math.floor(absoluteOffset) + duration + 1.0 - i);
    }

    {
      let i = 0;
      for (; i < nextTicks.length; ++i) {
        const tick = nextTicks[i];
        if (tick >= absoluteOffset) break;
      }
      if (i > 0) nextTicks.splice(0, i - 1);
    }
    


    let maxValue = nextPoints.length > 0 ? nextPoints[0].y : 0;
    let minValue = nextPoints.length > 0 ? nextPoints[0].y : 0;
    for (let i = 1; i < nextPoints.length; ++i) {
      const point = nextPoints[i];
      minValue = Math.min(minValue, point.y);
      maxValue = Math.max(maxValue, point.y);
    }

    const height = maxValue - minValue;

    const y = (maxValue + minValue) / 2 - (height + PLOT_MARGIN) / 2;

    this.setState({
      x: absoluteOffset,
      y,
      points: nextPoints,
      ticks: nextTicks,
      svgHeight: height + PLOT_MARGIN,
      minValue,
      maxValue
    }, this.scheduleTick_);

    this.lastTick_ = nowMs;

  };

  private transformPoint_ = (point: Vector2): Vector2 => {
    const { state, props } = this;
    const { svgHeight, viewportHeight, viewportWidth, y } = state;

    const duration = SensorPlotProps.duration(props);
    const pixelsPerSecond = viewportWidth / duration;

    if (svgHeight === 0) return { x: 0, y: 0 };

    return {
      x: point.x * pixelsPerSecond,
      y: (point.y - y) / svgHeight * viewportHeight
    };
  };

  private slow_ = 0;
  render() {
    const { props, state } = this;
    const { style, className, theme } = props;
    const { svgHeight, viewportHeight, svgWidth, viewportWidth, x, y, points, ticks, minValue, maxValue } = state;

    const duration = SensorPlotProps.duration(props);
    const pixelsPerSecond = viewportWidth / duration;

    const lineScale = (svgHeight / viewportHeight);

    let pointPath = '';
    if (points.length > 0) {
      const point = this.transformPoint_(points[0]);
      pointPath += `M ${point.x} ${point.y}`;
    }
    for (let i = 1; i < points.length; ++i) {
      const point = this.transformPoint_(points[i]);
      pointPath += ` L ${point.x} ${point.y}`;
    }

    let beginRealY = viewportHeight / 2;
    let endRealY = viewportHeight / 2;

    if (points.length > 0) {
      const begin = this.transformPoint_(points[0]);
      const end = this.transformPoint_(points[points.length - 1]);

      beginRealY = begin.y;
      endRealY = end.y;
    }

    const secondTicks: JSX.Element[] = [];
    for (let i = 0; i < ticks.length; ++i) {
      const tick = ticks[i];
      secondTicks.push(
        <Tick key={i} theme={theme} x1={tick * pixelsPerSecond} y1={0} x2={tick * pixelsPerSecond} y2={viewportHeight} />
      );
    }

    if (beginRealY > viewportHeight - 20) {
      beginRealY -= 20;
    }

    if (endRealY > viewportHeight - 20) {
      endRealY -= 20;
    }

    // let leftY = points.length > 0 ? 

    return (
      <Container style={style} className={className} ref={this.bindRef_}>
        
        <Svg
          height={viewportHeight}
          width={viewportWidth}
          viewBox={`${x * pixelsPerSecond} ${0} ${svgWidth} ${viewportHeight}`}
          preserveAspectRatio='none'
        >
          {secondTicks}
          <Path strokeWidth={`2px`} d={pointPath} />
        </Svg>
        {points.length > 0 ? <Text style={{ top: `${beginRealY}px`, left: '5px' }}>{-Math.round(points[0].y)}</Text> : undefined}
        {points.length > 0 ? <Text style={{ top: `${endRealY}px`, right: '5px' }}>{-Math.round(points[points.length - 1].y)}</Text> : undefined}
      </Container>
    );
  }
}

export default SensorPlot;