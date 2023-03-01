import * as React from 'react';
import { Vector2 } from '../../math';
import { ThemeProps } from '../theme';
import Widget, { Mode, Size } from '../Widget';
import ScratchVariablesRoot from './ScratchVariablesRoot';

import { GLOBAL_EVENTS } from '../../util/GlobalEvents';
import construct from '../../util/construct';
import { styled } from 'styletron-react';
import { State as ReduxState } from '../../state';
import { connect } from 'react-redux';
import ScrollArea from '../ScrollArea';

import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';

namespace DragState {
  export interface None {
    type: 'none';
    position: Vector2;
  }

  export const none = construct<None>('none');

  export interface Dragging {
    type: 'dragging';
    position: Vector2;
    offset: Vector2;
  }

  export const dragging = construct<Dragging>('dragging');
}

type DragState = DragState.None | DragState.Dragging;

export interface ScratchVariablesWindowPublicProps extends ThemeProps {
  
}

interface ScratchVariablesWindowPrivateProps {
  locale: LocalizedString.Language;
}

interface ScratchVariablesWindowState {
  dragState: DragState;
}

type Props = ScratchVariablesWindowPublicProps & ScratchVariablesWindowPrivateProps;
type State = ScratchVariablesWindowState;

const Container = styled('div', ({ theme }: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  minWidth: '600px',
  minHeight: '400px',
  width: '100%',
  height: '100%',
  color: theme.color,
  backgroundColor: theme.backgroundColor,
  transition: 'opacity 0.2s',
}));

const StyledScrollArea = styled(ScrollArea, ({ theme }: ThemeProps) => ({
  flex: 1,
}));

const SIZES: Size[] = [
  Size.PARTIAL,
];

class ScratchVariablesWindow extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  
    this.state = {
      dragState: DragState.none({ position: Vector2.create(0, 0) }),
    };
  }

  private onWindowMouseMove_ = (e: MouseEvent) => {
    const { state } = this;
    const { dragState } = state;
    if (dragState.type !== 'dragging') return false;

    const client = Vector2.fromClient(e);
    const position = Vector2.subtract(client, dragState.offset);
    this.setState({
      dragState: DragState.dragging({
        position,
        offset: dragState.offset
      })
    });

    return true;
  };

  private onWindowMouseUp_ = (e: MouseEvent) => {
    const { state } = this;
    const { dragState } = state;
    if (dragState.type !== 'dragging') return false;

    this.setState({
      dragState: DragState.none({ position: dragState.position })
    });

    GLOBAL_EVENTS.remove(this.onMouseMoveHandle_);
    GLOBAL_EVENTS.remove(this.onMouseUpHandle_);

    return true;
  };

  private onMouseMoveHandle_: number;
  private onMouseUpHandle_: number;
  private onChromeMouseDown_ = (e: React.MouseEvent) => {
    const { state } = this;
    const { dragState } = state;
    const topLeft = Vector2.fromTopLeft(e.currentTarget.getBoundingClientRect());
    const client = Vector2.fromClient(e);
    
    this.setState({
      dragState: DragState.dragging({
        position: dragState.position,
        offset: Vector2.subtract(client, topLeft)
      })
    });
    
    this.onMouseMoveHandle_ = GLOBAL_EVENTS.add('onMouseMove', this.onWindowMouseMove_);
    this.onMouseUpHandle_ = GLOBAL_EVENTS.add('onMouseUp', this.onWindowMouseUp_);
  };

  componentWillUnmount() {
    GLOBAL_EVENTS.remove(this.onMouseMoveHandle_);
    GLOBAL_EVENTS.remove(this.onMouseUpHandle_);
  }

  render() {
    const { props, state } = this;
    const {
      locale,
      theme,
    } = props;
    const { dragState } = state;

    let mode = Mode.Floating;
    const style: React.CSSProperties = {
      position: 'absolute',
      opacity: dragState.type === 'dragging' ? 0.8 : 1,
    };

        style.left = `${dragState.position.x}px`;
        style.top = `${dragState.position.y}px`;

    return (
      <ScratchVariablesRoot>
        <Widget
          name={LocalizedString.lookup(tr('Scratch Variables'), locale)}
          theme={theme}
          mode={mode}
          style={style}
          onChromeMouseDown={this.onChromeMouseDown_}
          size={0}
          sizes={SIZES}
        >
          <Container theme={theme}>
            <StyledScrollArea theme={theme}>
            </StyledScrollArea>
          </Container>
        </Widget>
      </ScratchVariablesRoot>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}), dispatch => ({
}))(ScratchVariablesWindow) as React.ComponentType<ScratchVariablesWindowPublicProps>;
