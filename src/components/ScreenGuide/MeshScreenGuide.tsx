import * as React from 'react';
import { Vector2 } from '../../math';
import { StyleProps } from '../../style';
import { ThemeProps } from '../theme';
import ScreenGuide from './ScreenGuide';
import { ACTIVE_SPACE } from '../../Sim';

export interface MeshScreenGuideProps extends StyleProps, ThemeProps {
  from: HTMLElement,
  fromOffset?: Vector2,
  to: string
}

interface MeshScreenGuideState {
  toVec?: Vector2
}

type Props = MeshScreenGuideProps;
type State = MeshScreenGuideState;

class MeshScreenGuide extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      
    };
  }

  componentDidMount() {
    this.running_ = true;

    this.tick_();
  }

  componentWillUnmount() {
    this.running_ = false;
  }

  private running_ = false;
  private tick_ = () => {
    if (!this.running_) return;

    const { props } = this;
    const { to } = props;
    
    if (!ACTIVE_SPACE) {
      setTimeout(this.tick_, 100);
      return;
    }

    const toVec = ACTIVE_SPACE.objectScreenPosition(to);

    this.setState({
      toVec
    });

    requestAnimationFrame(this.tick_);
  };

  render() {
    const { props, state } = this;
    const { style, className, from, fromOffset, to, theme } = props;
    const { toVec } = state;
    

    return <ScreenGuide
      style={style}
      className={className}
      theme={theme}
      from={from}
      fromOffset={fromOffset}
      to={toVec}
    />;
  }
}

export default MeshScreenGuide;