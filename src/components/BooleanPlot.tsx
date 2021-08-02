import { styled } from 'styletron-react';
import * as React from 'react';
import { StyleProps } from '../style';
import { ThemeProps } from './theme';
import { Vector2 } from '../math';
import { Box2 } from '../geometry';
import resizeListener, { ResizeListener } from './ResizeListener';

export interface BooleanPlotProps extends ThemeProps, StyleProps {
  value: boolean;
  duration?: number;
  refreshRate?: number;
}

export namespace BooleanPlotProps {
  export const DEFAULT_DURATION = 5.0;
  export const DEFAULT_REFRESH_RATE = 10.0;
  export const duration = (props: BooleanPlotProps): number => props.duration || DEFAULT_DURATION;
  export const refreshRate = (props: BooleanPlotProps): number => props.refreshRate || DEFAULT_REFRESH_RATE;
}

interface Range<T> {
  start: number,
  end: number,
  value: T
}

namespace Range {
  export const instant = <T,>(time: number, value: T): Range<T> => ({
    start: time,
    end: time,
    value
  });

  export const extend = <T,>(ranges: Range<T>[], time: number, value: T) => {
    const nextRanges = [...ranges];
    
    if (nextRanges.length === 0) {
      nextRanges.push(instant(time, value));

      return nextRanges;
    }

    const lastIndex = nextRanges.length - 1;
    const last = nextRanges[lastIndex];

    if (last.value === value) {
      nextRanges[lastIndex].end = time;
      return nextRanges;
    }

    nextRanges[lastIndex].end = time;
    nextRanges.push(instant(time, value));

    return nextRanges;
  };
}

interface BooleanPlotState {
  svgWidth: number;
  svgHeight: number;

  viewportWidth: number;
  viewportHeight: number;

  x: number;

  ranges: Range<boolean>[];
  ticks: number[];
}

type Props = BooleanPlotProps;
type State = BooleanPlotState;

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

const Rectangle = styled('rect', {
  
});

const PLOT_HEIGHT = 50;
const PLOT_MARGIN = 25;

class BooleanPlot extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.observer_ = resizeListener(this.onResize_);

    this.state = {
      svgWidth: 0,
      svgHeight: 0,

      viewportWidth: 0,
      viewportHeight: 0,

      x: 0,
      ranges: [],
      ticks: []
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
    const { ranges, ticks } = state;

    const { width } = this.ref_.getBoundingClientRect();
    const duration = BooleanPlotProps.duration(props);

    const nextTicks = [...ticks];

    const absoluteOffset = (nowMs - this.firstTick_) / 1000;

    const nextRanges = Range.extend(ranges, absoluteOffset + duration, value);

    {
      let i = 0;
      for (; i < nextRanges.length; ++i) {
        const range = nextRanges[i];
        if (range.end >= absoluteOffset) break;
      }
      if (i > 0) nextRanges.splice(0, i - 1);
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

    this.setState({
      x: absoluteOffset,
      ranges: nextRanges,
      ticks: nextTicks,
      svgHeight: PLOT_HEIGHT + PLOT_MARGIN,
    }, this.scheduleTick_);

    this.lastTick_ = nowMs;

  };

  private transformRange_ = (range: Range<boolean>): Box2 => {
    const { state, props } = this;
    const { svgHeight, viewportHeight, viewportWidth } = state;

    const duration = BooleanPlotProps.duration(props);
    const pixelsPerSecond = viewportWidth / duration;

    if (svgHeight === 0) return Box2.ZERO;

    const box = Box2.create(
      Vector2.create(range.start * pixelsPerSecond, 0),
      Vector2.create(range.end * pixelsPerSecond, PLOT_HEIGHT / 2)
    );

    return Box2.translate(Vector2.fromY(PLOT_HEIGHT / 2), range.value ? box : Box2.translate(Vector2.fromY(PLOT_HEIGHT / 2), box));
  };

  private slow_ = 0;
  render() {
    const { props, state } = this;
    const { style, className, theme } = props;
    const { svgHeight, viewportHeight, svgWidth, viewportWidth, x, ranges, ticks } = state;

    const duration = BooleanPlotProps.duration(props);
    const pixelsPerSecond = viewportWidth / duration;

    const lineScale = (svgHeight / viewportHeight);

    const rangeElements: JSX.Element[] = [];
    for (let i = 0; i < ranges.length; ++i) {
      const range = ranges[i];
      const box = this.transformRange_(range);
      rangeElements.push(
        <Rectangle
          key={i}
          x={box.topLeft.x}
          y={box.topLeft.y}
          width={Box2.width(box)}
          height={Box2.height(box)}
          style={{ fill: range.value ? 'green' : 'red' }}
        />
      );
    }


    let beginRealY = viewportHeight / 2;
    let endRealY = viewportHeight / 2;

    

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
          {rangeElements}
        </Svg>
        {ranges.length > 0 ? <Text style={{ top: `${beginRealY}px`, left: '5px' }}>{ranges[0].value}</Text> : undefined}
        {ranges.length > 0 ? <Text style={{ top: `${endRealY}px`, right: '5px' }}>{ranges[ranges.length - 1].value}</Text> : undefined}
      </Container>
    );
  }
}

export default BooleanPlot;