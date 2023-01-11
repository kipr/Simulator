import * as React from 'react';
import { Vector2 } from '../../math';
import { ThemeProps } from '../theme';
import Widget, { Mode } from '../Widget';
import DocumentationRoot from './DocumentationRoot';

import { GLOBAL_EVENTS, GlobalEvents } from '../../util/GlobalEvents';
import construct from '../../util/construct';
import { styled } from 'styletron-react';
import { DocumentationState } from '../../state/State';
import { State as ReduxState } from '../../state';
import { connect } from 'react-redux';

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

export interface DocumentationWindowPublicProps extends ThemeProps {
  
}

interface DocumentationWindowPrivateProps {
  documentationState: DocumentationState;
}

interface DocumentationWindowState {
  dragState: DragState;
}

type Props = DocumentationWindowPublicProps & DocumentationWindowPrivateProps;
type State = DocumentationWindowState;

const Container = styled('div', ({ theme }: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '300px',
  height: '400px',
  color: theme.color,
  backgroundColor: theme.backgroundColor
}));

class DocumentationWindow extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  
    this.state = {
      dragState: DragState.none({ position: Vector2.create(0, 0) }),
    };
  }

  private onWindowMouseMove_ = (e: MouseEvent) => {
    console.log('onWindowMouseMove_')
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
    console.log('onChromeMouseDown_');
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
    const { theme, documentationState } = props;
    const { dragState } = state;

    const { documentation, locationStack, visible } = documentationState;

    if (!visible) return null;

    return (
      <DocumentationRoot>
        <Widget
          name='Documentation'
          theme={theme}
          mode={Mode.Floating}
          style={{ position: 'absolute', left: `${dragState.position.x}px`, top: `${dragState.position.y}px` }}
          onChromeMouseDown={this.onChromeMouseDown_}
        >
          <Container theme={theme}>
          </Container>
        </Widget>
      </DocumentationRoot>
    );
  }
}

export default connect((state: ReduxState) => ({
  documentationState: state.documentation
}))(DocumentationWindow) as React.ComponentType<DocumentationWindowPublicProps>;