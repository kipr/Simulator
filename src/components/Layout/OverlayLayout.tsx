import * as React from 'react';
import { connect } from 'react-redux';

import { styled } from 'styletron-react';
import { Button } from '../Button';

import { Console, createConsoleBarComponents } from '../Console';
import { Editor, createEditorBarComponents } from '../Editor';
import World, { createWorldBarComponents } from '../World';

import { Fa } from '../Fa';
import { Info } from '../Info';
import { LayoutProps } from './Layout';
import { SimulatorArea } from '../SimulatorArea';
import { Theme, ThemeProps } from '../theme';
import Widget, { BarComponent, Mode, Size, WidgetProps } from '../Widget';
import { State as ReduxState } from '../../state';
import { SceneAction } from '../../state/reducer';

export interface OverlayLayoutProps extends LayoutProps {
  
}

interface ReduxOverlayLayoutProps {
  onResetScene: () => void;
}

interface OverlayLayoutState {
  consoleSize: Size.Type;
  infoSize: Size.Type;
  editorSize: Size.Type;
  worldSize: Size.Type;
}

type Props = OverlayLayoutProps;
type State = OverlayLayoutState;

const Container = styled('div', {
  display: 'flex',
  flex: '1 1',
  position: 'relative'
});

const SimulatorAreaContainer = styled('div', {
  display: 'flex',
  width: '100%',
  height: '100%',
});

const Overlay = styled('div', (props: ThemeProps) => ({
  display: 'grid',
  gridTemplateColumns: '3fr 5fr 350px',
  gridTemplateRows: '1fr 300px',
  gap: `${props.theme.widget.padding}px`,
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  padding: `${props.theme.widget.padding}px`
}));

const transparentStyling = (theme: Theme): React.CSSProperties => ({
  backgroundColor: theme.transparentBackgroundColor(0.95),
  backdropFilter: 'blur(16px)'
});

const ConsoleWidget = styled(Widget, (props: WidgetProps) => {
  const size = props.sizes[props.size];
  switch (size.type) {
    case Size.Type.Minimized: return {
      display: 'none'
    };
    case Size.Type.Maximized: return {
      gridColumn: '1 / span 3',
      gridRow: '1 / span 2',
      ...transparentStyling(props.theme)
    };
    case Size.Type.Miniature: return {
      gridColumn: 1,
      gridRow: 2,
      ...transparentStyling(props.theme)
    };
    default:
    case Size.Type.Partial: return {
      gridColumn: '1 / span 2',
      gridRow: 2,
      ...transparentStyling(props.theme)
    };
  } 
});

const EditorWidget = styled(Widget, (props: WidgetProps) => {
  const size = props.sizes[props.size];
  switch (size.type) {
    case Size.Type.Minimized: return {
      display: 'none'
    };
    case Size.Type.Maximized: return {
      gridColumn: '1 / span 3',
      gridRow: '1 / span 2',
      ...transparentStyling(props.theme)
    };
    case Size.Type.Miniature: return {
      gridColumn: 1,
      gridRow: 1,
      ...transparentStyling(props.theme)
    };
    default:
    case Size.Type.Partial: return {
      gridColumn: '1 / span 2',
      gridRow: 1,
      ...transparentStyling(props.theme)
    };
  }
});

const InfoWidget = styled(Widget, (props: WidgetProps) => {
  const size = props.sizes[props.size];
  switch (size.type) {
    case Size.Type.Minimized: return {
      display: 'none'
    };
    default:
    case Size.Type.Partial: return {
      gridColumn: 3,
      gridRow: 1,
      ...transparentStyling(props.theme)
    };
  }
});

const WorldWidget = styled(Widget, (props: WidgetProps) => {
  const size = props.sizes[props.size];
  switch (size.type) {
    case Size.Type.Minimized: return {
      display: 'none'
    };
    default:
    case Size.Type.Partial: return {
      gridColumn: 3,
      gridRow: 2,
      ...transparentStyling(props.theme)
      
    };
  }
});

const EDITOR_SIZES: Size[] = [Size.MINIATURE_LEFT, Size.PARTIAL_LEFT, Size.MAXIMIZED, Size.MINIMIZED];
const INFO_SIZES: Size[] = [Size.PARTIAL_RIGHT, Size.MINIMIZED];
const WORLD_SIZES: Size[] = [Size.PARTIAL_RIGHT, Size.MINIMIZED];
const CONSOLE_SIZES: Size[] = [Size.MINIATURE_LEFT, Size.PARTIAL_DOWN, Size.MAXIMIZED, Size.MINIMIZED];

const sizeDict = (sizes: Size[]) => {
  const forward: { [type: number]: number } = {};
  
  for (let i = 0; i < sizes.length; ++i) {
    const size = sizes[i];
    forward[size.type] = i;
  }

  return forward;
};

const FlexConsole = styled(Console, {
  flex: '1 1'
});

const EDITOR_SIZE = sizeDict(EDITOR_SIZES);
const INFO_SIZE = sizeDict(INFO_SIZES);
const WORLD_SIZE = sizeDict(WORLD_SIZES);
const CONSOLE_SIZE = sizeDict(CONSOLE_SIZES);

export class OverlayLayout extends React.PureComponent<Props & ReduxOverlayLayoutProps, State> {
  constructor(props: Props & ReduxOverlayLayoutProps) {
    super(props);

    this.state = {
      editorSize: Size.Type.Miniature,
      infoSize: Size.Type.Partial,
      consoleSize: Size.Type.Miniature,
      worldSize: Size.Type.Partial,
    };
  }

  private onEditorSizeChange_ = (index: number) => {
    const size = EDITOR_SIZES[index];

    let { infoSize, consoleSize, worldSize } = this.state;

    
    switch (size.type) {
      case Size.Type.Maximized: {
        infoSize = Size.Type.Minimized;
        consoleSize = Size.Type.Minimized;
        worldSize = Size.Type.Minimized;
        break;
      }
      case Size.Type.Partial: {
        if (infoSize === Size.Type.Minimized) infoSize = Size.Type.Partial;
        if (worldSize === Size.Type.Minimized) worldSize = Size.Type.Partial;
        if (consoleSize === Size.Type.Minimized) consoleSize = Size.Type.Miniature;
        break;
      }
    }

    this.setState({
      editorSize: EDITOR_SIZES[index].type,
      infoSize,
      consoleSize,
      worldSize
    });
  };

  private onInfoSizeChange_ = (index: number) => {
    
    this.setState({
      infoSize: INFO_SIZES[index].type
    });
  };

  private onWorldSizeChange_ = (index: number) => {
    this.setState({
      worldSize: WORLD_SIZES[index].type
    });
  };

  private onConsoleSizeChange_ = (index: number) => {
    const size = CONSOLE_SIZES[index];

    let { infoSize, editorSize, worldSize } = this.state;
    
    switch (size.type) {
      case Size.Type.Maximized: {
        infoSize = Size.Type.Minimized;
        editorSize = Size.Type.Minimized;
        worldSize = Size.Type.Minimized;
        break;
      }
      case Size.Type.Partial: {
        if (infoSize === Size.Type.Minimized) infoSize = Size.Type.Partial;
        if (worldSize === Size.Type.Minimized) worldSize = Size.Type.Partial;
        if (editorSize === Size.Type.Minimized) editorSize = Size.Type.Partial;
        break;
      }
    }

    this.setState({
      consoleSize: size.type,
      infoSize,
      editorSize,
      worldSize
    });
  };

  public showAll() {
    this.setState({
      editorSize: Size.Type.Miniature,
      infoSize: Size.Type.Partial,
      consoleSize: Size.Type.Miniature,
      worldSize: Size.Type.Partial,
    });
  }

  public hideAll() {
    this.setState({
      editorSize: Size.Type.Minimized,
      infoSize: Size.Type.Minimized,
      consoleSize: Size.Type.Minimized,
      worldSize: Size.Type.Minimized
    });
  }

  private onErrorClick_ = (event: React.MouseEvent<HTMLDivElement>) => {
    // not implemented
  };

  render() {
    const { props } = this;
    
    const {
      style,
      className,
      theme,
      robotStartPosition,
      onSetRobotStartPosition,
      code,
      onCodeChange,
      console,
      messages,
      settings,
      onClearConsole,
      onIndentCode,
      onSelectScene,
      onResetScene,
      editorRef
    } = props;

    const {
      editorSize,
      consoleSize,
      infoSize,
      worldSize
    } = this.state;

    const commonProps = {
      theme,
      mode: Mode.Floating
    };

    const editorBar = createEditorBarComponents(theme, messages, onIndentCode, this.onErrorClick_);
    const consoleBar = createConsoleBarComponents(theme, onClearConsole);
    const worldBar = createWorldBarComponents(theme, onSelectScene, onResetScene);

    return (
      <Container style={style} className={className}>
        <SimulatorAreaContainer>
          <SimulatorArea
            theme={theme}
            key='simulator'
            isSensorNoiseEnabled={settings.simulationSensorNoise}
            isRealisticSensorsEnabled={settings.simulationRealisticSensors}
          />
        </SimulatorAreaContainer>
        <Overlay theme={theme}>
          <EditorWidget
            {...commonProps}
            name='Editor'
            sizes={EDITOR_SIZES}
            size={EDITOR_SIZE[editorSize]}
            onSizeChange={this.onEditorSizeChange_}
            barComponents={editorBar}
          >
            <Editor ref={editorRef} code={code} onCodeChange={onCodeChange} theme={theme} messages={messages} autocomplete={settings.editorAutoComplete} />
          </EditorWidget>
          <ConsoleWidget
            {...commonProps}
            name='Console'
            sizes={CONSOLE_SIZES}
            size={CONSOLE_SIZE[consoleSize]}
            onSizeChange={this.onConsoleSizeChange_}
            barComponents={consoleBar}
          >
            <FlexConsole theme={theme} text={console} />
          </ConsoleWidget>
          <InfoWidget
            {...commonProps}
            name='Robot'
            sizes={INFO_SIZES}
            size={INFO_SIZE[infoSize]}
            onSizeChange={this.onInfoSizeChange_}
          >
            <Info
              theme={theme}
            />
          </InfoWidget>
          <WorldWidget
            {...commonProps}
            name='World'
            sizes={WORLD_SIZES}
            size={WORLD_SIZE[worldSize]}
            onSizeChange={this.onWorldSizeChange_}
            barComponents={worldBar}
          >
            <World theme={theme} />
          </WorldWidget>
        </Overlay>
      </Container>
    );
  }
}

export const OverlayLayoutRedux = connect<unknown, ReduxOverlayLayoutProps, OverlayLayoutProps, ReduxState>((state: ReduxState) => {
  return {};
}, dispatch => ({
  onResetScene: () => {
    dispatch(SceneAction.RESET_SCENE);
  }
}), null, { forwardRef: true })(OverlayLayout);