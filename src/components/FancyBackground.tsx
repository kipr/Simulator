/* eslint-disable @typescript-eslint/prefer-for-of */
import * as React from 'react';
import { styled } from 'styletron-react';
import { Vector2 } from '../math';
import { StyleProps } from '../style';
import { ThemeProps } from './theme';

export interface FancyBackgroundProps extends StyleProps, ThemeProps {
}

interface FancyBackgroundState {
}

type Props = FancyBackgroundProps;
type State = FancyBackgroundState;

const Container = styled('div', {
  position: 'relative',
  width: '100%',
  height: '100%',
});

const Canvas = styled('canvas', {
  position: 'absolute',
});

interface Rect {
  value: number;
  velocity: number;
  hue: number;
}

const DENSITY_X = 100;
const DENSITY_Y = 100;

class FancyBackground extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
    };
  }

  private containerRef_: HTMLDivElement;
  private bindContainerRef_ = (ref: HTMLDivElement) => {
    this.containerRef_ = ref;
  };

  private canvasRef_: HTMLCanvasElement;
  private bindCanvasRef_ = (ref: HTMLCanvasElement) => {
    this.canvasRef_ = ref;
  };

  private values_: Rect[] = (() => {
    const ret: Rect[] = [];
    for (let i = 0; i < DENSITY_X * DENSITY_Y; i++) {
      ret.push({
        value: Math.random(),
        velocity: Math.random() - 0.5,
        hue: Math.random(),
      });
    }
    return ret;
  })();

  componentDidMount() {
    this.ticking_ = true;
    requestAnimationFrame(this.tick_);
  }

  componentWillUnmount() {
    this.ticking_ = false;
  }

  private ticking_ = false;
  private lastTick_ = 0;
  private tick_ = () => {
    if (!this.ticking_) return;

    if (!this.canvasRef_) {
      requestAnimationFrame(this.tick_);
      return;
    }

    if (this.lastTick_ === 0) {
      this.lastTick_ = Date.now();
      requestAnimationFrame(this.tick_);
      return;
    }

    const { width, height } = this.containerRef_.getBoundingClientRect();

    if (this.canvasRef_.width !== width || this.canvasRef_.height !== height) {
      this.canvasRef_.width = width;
      this.canvasRef_.height = height;
    }

    const now = Date.now();

    const elapsed = (now - this.lastTick_) / 1000;

    for (let i = 0; i < this.values_.length; i++) {
      this.values_[i].value += this.values_[i].velocity * elapsed;
      if (this.values_[i].value < 0) {
        this.values_[i].value = 0;
        this.values_[i].velocity = -this.values_[i].velocity;
      }
      if (this.values_[i].value > 1) {
        this.values_[i].value = 1;
        this.values_[i].velocity = -this.values_[i].velocity;
      }
    }

    const ctx = this.canvasRef_.getContext('2d');

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#fff';
    

    

    const min = Math.min(width, height);

    let i = 0;
    for (let w = 0; w < DENSITY_X; ++w) {
      for (let h = 0; h < DENSITY_Y; ++h) {
        const { value, hue } = this.values_[i++];

        ctx.fillStyle = `hsl(${(hue - 0.5) * 10 + w * 3 + h * 3}, ${0.9 * 100}%, ${value * 10 + 90}%)`;
        ctx.fillRect(w * width / DENSITY_X, h * height / DENSITY_Y, width / DENSITY_X + 1, height / DENSITY_Y + 1);
      }
    }

    this.lastTick_ = Date.now();

    requestAnimationFrame(this.tick_);
  };

  render() {
    const { props, state } = this;
    const { className, style } = props;

    return (
      <Container style={style} className={className} ref={this.bindContainerRef_}>
        <Canvas ref={this.bindCanvasRef_} />
      </Container>
    );
  }
}

export default FancyBackground;