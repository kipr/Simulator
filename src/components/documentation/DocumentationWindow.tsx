import * as React from 'react';
import { Vector2 } from '../../math';
import { ThemeProps } from '../theme';
import Widget, { Mode, Size } from '../Widget';
import DocumentationRoot from './DocumentationRoot';

import { GLOBAL_EVENTS, GlobalEvents } from '../../util/GlobalEvents';
import construct from '../../util/construct';
import { styled } from 'styletron-react';
import { DocumentationState } from '../../state/State';
import { State as ReduxState } from '../../state';
import { connect } from 'react-redux';
import { DocumentationAction } from '../../state/reducer';
import { Fa } from '../Fa';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import ScrollArea from '../ScrollArea';
import DocumentationLocation from '../../state/State/Documentation/DocumentationLocation';
import RootDocumentation from './RootDocumentation';

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

  onDocumentationSizeChange: (size: Size) => void;
  onDocumentationPop: () => void;
  onDocumentationPush: (location: DocumentationLocation) => void;
}

interface DocumentationWindowState {
  dragState: DragState;
}

type Props = DocumentationWindowPublicProps & DocumentationWindowPrivateProps;
type State = DocumentationWindowState;

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

const LowerBar = styled('div', ({ theme }: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderTop: `1px solid ${theme.borderColor}`,
}));

const Button = styled('div', ({ theme }: ThemeProps) => ({
  padding: `${theme.itemPadding * 2}px`,
}));

const StyledScrollArea = styled(ScrollArea, ({ theme }: ThemeProps) => ({
  flex: 1,
}));

const SIZES: Size[] = [
  Size.MAXIMIZED,
  Size.PARTIAL,
  Size.MINIMIZED
];

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

  private onSizeChange_ = (index: number) => {
    this.props.onDocumentationSizeChange(SIZES[index]);
  };

  render() {
    const { props, state } = this;
    const { theme, documentationState, onDocumentationPop, onDocumentationPush } = props;
    const { dragState } = state;

    const { documentation, locationStack, size } = documentationState;

    if (size.type === Size.Type.Minimized) return null;

    const sizeIndex = SIZES.findIndex(s => s.type === size.type);

    let mode = Mode.Floating;
    const style: React.CSSProperties = {
      position: 'absolute',
      opacity: dragState.type === 'dragging' ? 0.8 : 1,
    };

    switch (size.type) {
      case Size.Type.Partial: {
        style.left = `${dragState.position.x}px`;
        style.top = `${dragState.position.y}px`;
        break;
      }
      case Size.Type.Maximized: {
        mode = Mode.Inline;
        style.left = '0px';
        style.top = '0px';
        style.width = '100%';
        style.height = '100%';
        break;
      }
    }

    return (
      <DocumentationRoot>
        <Widget
          name='Documentation'
          theme={theme}
          mode={mode}
          style={style}
          onChromeMouseDown={size.type !== Size.Type.Maximized ? this.onChromeMouseDown_ : undefined}
          size={sizeIndex}
          sizes={SIZES}
          onSizeChange={this.onSizeChange_}
        >
          <Container theme={theme}>
            <StyledScrollArea theme={theme}>
              {locationStack.length === 0 && (
                <RootDocumentation
                  theme={theme}
                  onDocumentationPush={onDocumentationPush}
                  documentation={documentation}
                />
              )}
            </StyledScrollArea>
            <LowerBar theme={theme}>
              <Button theme={theme} onClick={locationStack.length > 0 ? onDocumentationPop : undefined}>
                <Fa disabled={locationStack.length === 0} icon={faChevronLeft} />
              </Button>
            </LowerBar>
          </Container>
        </Widget>
      </DocumentationRoot>
    );
  }
}

export default connect((state: ReduxState) => ({
  documentationState: state.documentation
}), dispatch => ({
  onDocumentationSizeChange: (size: Size) => dispatch(DocumentationAction.setSize({ size })),
  onDocumentationPop: () => dispatch(DocumentationAction.POP),
  onDocumentationPush: (location: DocumentationLocation) => dispatch(DocumentationAction.pushLocation({ location })),
}))(DocumentationWindow) as React.ComponentType<DocumentationWindowPublicProps>;