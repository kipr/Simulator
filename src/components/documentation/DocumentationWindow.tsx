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
import { faBox, faChevronLeft, faFile, faFilter, faGear, faHome, faSection } from '@fortawesome/free-solid-svg-icons';
import ScrollArea from '../ScrollArea';
import DocumentationLocation from '../../state/State/Documentation/DocumentationLocation';
import RootDocumentation from './RootDocumentation';
import FunctionDocumentation from './FunctionDocumentation';
import FileDocumentation from './FileDocumentation';
import Documentation from '../../state/State/Documentation';
import { Spacer } from '../common';
import { FunctionName } from './common';
import ModuleDocumentation from './ModuleDocumentation';
import StructureDocumentation from './StructureDocumentation';

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

export interface DocumentationWindowPublicProps extends ThemeProps {
  
}

interface DocumentationWindowPrivateProps {
  documentationState: DocumentationState;
  locale: LocalizedString.Language;

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
  padding: `${theme.itemPadding * 2}px`,
}));

const Button = styled('div', ({ theme }: ThemeProps) => ({
  
}));

const StyledScrollArea = styled(ScrollArea, ({ theme }: ThemeProps) => ({
  flex: 1,
}));

const LocationIcon = styled(Fa, ({ theme }: ThemeProps) => ({
  marginLeft: `${theme.itemPadding * 2}px`,
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

  private onSizeChange_ = (index: number) => {
    this.props.onDocumentationSizeChange(SIZES[index]);
  };

  render() {
    const { props, state } = this;
    const {
      locale,
      theme,
      documentationState,
      onDocumentationPop,
      onDocumentationPush
    } = props;
    const { dragState } = state;

    const {
      documentation,
      locationStack,
      size,
      language
    } = documentationState;

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

    const locationStackTop = locationStack[locationStack.length - 1];

    return (
      <DocumentationRoot>
        <Widget
          name={LocalizedString.lookup(tr('Documentation'), locale)}
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
              {locationStackTop === undefined && (
                <RootDocumentation
                  language={language}
                  theme={theme}
                  onDocumentationPush={onDocumentationPush}
                  documentation={documentation}
                  locale={locale}
                />
              )}
              {locationStackTop && locationStackTop.type === DocumentationLocation.Type.Function && (
                <FunctionDocumentation
                  language={language}
                  func={documentation.functions[locationStackTop.id]}
                  onDocumentationPush={onDocumentationPush}
                  theme={theme}
                  locale={locale}
                />
              )}
              {locationStackTop && locationStackTop.type === DocumentationLocation.Type.File && (
                <FileDocumentation
                  language={language}
                  file={documentation.files[locationStackTop.id]}
                  documentation={Documentation.subset(documentation, documentation.files[locationStackTop.id])}
                  onDocumentationPush={onDocumentationPush}
                  theme={theme}
                  locale={locale}
                />
              )}
              {locationStackTop && locationStackTop.type === DocumentationLocation.Type.Module && (
                <ModuleDocumentation
                  language={language}
                  module={documentation.modules[locationStackTop.id]}
                  documentation={Documentation.subset(documentation, documentation.modules[locationStackTop.id])}
                  onDocumentationPush={onDocumentationPush}
                  theme={theme}
                  locale={locale}
                />
              )}
              {locationStackTop && locationStackTop.type === DocumentationLocation.Type.Structure && (
                <StructureDocumentation
                  language={language}
                  structure={documentation.structures[locationStackTop.id]}
                  onDocumentationPush={onDocumentationPush}
                  theme={theme}
                  locale={locale}
                />
              )}
            </StyledScrollArea>
            <LowerBar theme={theme}>
              
              
              <Button theme={theme} onClick={locationStack.length > 0 ? onDocumentationPop : undefined}>
                <Fa disabled={locationStack.length === 0} icon={faChevronLeft} />
              </Button>
              <Spacer />
              {locationStackTop === undefined && <LocationIcon theme={theme} icon={faHome} />}
              {locationStackTop && locationStackTop.type === DocumentationLocation.Type.Function && (
                <>
                  <FunctionName>{documentation.functions[locationStackTop.id].name}</FunctionName>
                  <LocationIcon theme={theme} icon={faGear} />
                </>
              )}
              {locationStackTop && locationStackTop.type === DocumentationLocation.Type.File && (
                <>
                  <FunctionName>{documentation.files[locationStackTop.id].name}</FunctionName>
                  <LocationIcon theme={theme} icon={faFile} />
                </>
              )}
              {locationStackTop && locationStackTop.type === DocumentationLocation.Type.Module && (
                <>
                  <FunctionName>{documentation.modules[locationStackTop.id].name}</FunctionName>
                  <LocationIcon theme={theme} icon={faSection} />
                </>
              )}
              {locationStackTop && locationStackTop.type === DocumentationLocation.Type.Structure && (
                <>
                  <FunctionName>{documentation.structures[locationStackTop.id].name}</FunctionName>
                  <LocationIcon theme={theme} icon={faBox} />
                </>
              )}
              {locationStackTop && locationStackTop.type === DocumentationLocation.Type.Enumeration && (
                <>
                  <FunctionName>{documentation.enumerations[locationStackTop.id].name}</FunctionName>
                  <LocationIcon theme={theme} icon={faFilter} />
                </>
              )}
            </LowerBar>
          </Container>
        </Widget>
      </DocumentationRoot>
    );
  }
}

export default connect((state: ReduxState) => ({
  documentationState: state.documentation,
  locale: state.i18n.locale,
}), dispatch => ({
  onDocumentationSizeChange: (size: Size) => dispatch(DocumentationAction.setSize({ size })),
  onDocumentationPop: () => dispatch(DocumentationAction.POP),
  onDocumentationPush: (location: DocumentationLocation) => dispatch(DocumentationAction.pushLocation({ location })),
}))(DocumentationWindow) as React.ComponentType<DocumentationWindowPublicProps>;
