import * as React from 'react';
import { DARK, ThemeProps } from '../components/theme';
import { StyleProps } from '../style';
import { styled } from 'styletron-react';
import { Vector2 } from '../math';

export interface IFrameProps extends StyleProps, ThemeProps {
  src: string;
}

interface IFrameState {
  loaded: boolean;
  width: number;
  height: number;
}

type Props = IFrameProps;
type State = IFrameState;

const Container = styled('div', (props: ThemeProps) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
}));

const Iframe = styled('iframe', (props: ThemeProps) => ({
  allow: 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture',
}));


export class IFrame extends React.Component<Props, State> {
  private iframe: HTMLIFrameElement;
  private container: HTMLDivElement;
  private resizeListener: () => void;
    
  constructor(props: Props) {
    super(props);
    
    this.state = {
      loaded: false,
      width: 0,
      height: 0,
    };
  }
    
  public componentDidMount() {
    this.resizeListener = () => {
      this.setState({
        width: this.container.clientWidth,
        height: this.container.clientHeight,
      });
    };
    
    window.addEventListener('resize', this.resizeListener);
    
    this.setState({
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    });
  }
    
  public componentWillUnmount() {
    window.removeEventListener('resize', this.resizeListener);
  }
    
  public render() {
    const { src, className, theme } = this.props;
    const { width, height } = this.state;
    
    return (
      <Container
        className={className}
        theme={theme}
        ref={(ref: HTMLDivElement) => (this.container = ref)}
      >
        <Iframe
          className={className}
          theme={theme}
          src={src}
          ref={(ref: HTMLIFrameElement) => (this.iframe = ref)}
          onLoad={() => this.setState({ loaded: true })}
          width={width}
          height={height}
        />
      </Container>
    );
  }
}

export default IFrame;