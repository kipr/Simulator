import * as React from 'react';
import { connect } from 'react-redux';

import { styled } from 'styletron-react';
import { Button } from '../Button';

import { Console, createConsoleBarComponents } from '../Console';
import { Editor, createEditorBarComponents, EditorBarTarget } from '../Editor';
import World, { createWorldBarComponents } from '../World';

import { Info } from '../Info';
import { LayoutEditorTarget, LayoutProps } from './Layout';
import SimulatorArea from '../SimulatorArea';
import { Theme, ThemeProps } from '../theme';
import Widget, { BarComponent, Mode, Size, WidgetProps } from '../Widget';
import { State as ReduxState } from '../../state';
import Scene from '../../state/State/Scene';
import Node from '../../state/State/Scene/Node';
import Dict from '../../Dict';
import Async from '../../state/State/Async';
import { EMPTY_OBJECT } from '../../util';
import Challenge from '../Challenge';
import { ReferenceFrame } from '../../unit-math';
import LocalizedString from '../../util/LocalizedString';

import tr from '@i18n';

export interface OverlayLayoutProps extends LayoutProps {
  
}

interface ReduxOverlayLayoutProps {
  robots: Dict<Node.Robot>;
  locale: LocalizedString.Language;
}

interface OverlayLayoutState {
  consoleSize: Size.Type;
  infoSize: Size.Type;
  editorSize: Size.Type;
  worldSize: Size.Type;
  challengeSize: Size.Type;
  workingScriptCode?: string;
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

const Overlay = styled('div', (props: ThemeProps & { $challenge?: boolean; }) => ({
  display: 'grid',
  gridTemplateColumns: '4fr 5fr 350px',
  gridTemplateRows: props.$challenge ? '1fr 1fr 300px' : '1fr 300px',
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

const ConsoleWidget = styled(Widget, (props: WidgetProps & { $challenge?: boolean; }) => {
  const size = props.sizes[props.size];
  switch (size.type) {
    case Size.Type.Minimized: return {
      display: 'none'
    };
    case Size.Type.Maximized: return {
      gridColumn: '1 / span 3',
      gridRow: props.$challenge ? '1 / span 3' : '1 / span 2',
      ...transparentStyling(props.theme)
    };
    case Size.Type.Miniature: return {
      gridColumn: 1,
      gridRow: props.$challenge ? 3 : 2,
      ...transparentStyling(props.theme)
    };
    default:
    case Size.Type.Partial: return {
      gridColumn: '1 / span 2',
      gridRow: props.$challenge ? 3 : 2,
      ...transparentStyling(props.theme)
    };
  } 
});

const EditorWidget = styled(Widget, (props: WidgetProps & { $challenge?: boolean; }) => {
  const size = props.sizes[props.size];
  switch (size.type) {
    case Size.Type.Minimized: return {
      display: 'none'
    };
    case Size.Type.Maximized: return {
      gridColumn: '1 / span 3',
      gridRow: props.$challenge ? '1 / span 3' : '1 / span 2',
      ...transparentStyling(props.theme)
    };
    case Size.Type.Miniature: return {
      gridColumn: 1,
      gridRow: props.$challenge ? '1 / span 2' : 1,
      ...transparentStyling(props.theme)
    };
    default:
    case Size.Type.Partial: return {
      gridColumn: '1 / span 2',
      gridRow: props.$challenge ? '1 / span 2' : 1,
      ...transparentStyling(props.theme)
    };
  }
});

const InfoWidget = styled(Widget, (props: WidgetProps & { $challenge?: boolean; }) => {
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

const ChallengeWidget = styled(Widget, (props: WidgetProps) => {
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

const WorldWidget = styled(Widget, (props: WidgetProps & { $challenge?: boolean; }) => {
  const size = props.sizes[props.size];
  switch (size.type) {
    case Size.Type.Minimized: return {
      display: 'none'
    };
    default:
    case Size.Type.Partial: return {
      gridColumn: 3,
      gridRow: props.$challenge ? 3 : 2,
      ...transparentStyling(props.theme)
    };
  }
});

const EDITOR_SIZES: Size[] = [Size.MINIATURE_LEFT, Size.PARTIAL_LEFT, Size.MAXIMIZED, Size.MINIMIZED];
const INFO_SIZES: Size[] = [Size.PARTIAL_RIGHT, Size.MINIMIZED];
const WORLD_SIZES: Size[] = [Size.PARTIAL_RIGHT, Size.MINIMIZED];
const CHALLENGE_SIZES: Size[] = [Size.PARTIAL_RIGHT, Size.MINIMIZED];
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
const CHALLENGE_SIZE = sizeDict(CHALLENGE_SIZES);
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
      challengeSize: Size.Type.Partial,
    };
  }

  private onEditorSizeChange_ = (index: number) => {
    const size = EDITOR_SIZES[index];

    let { infoSize, consoleSize, worldSize, challengeSize } = this.state;

    
    switch (size.type) {
      case Size.Type.Maximized: {
        infoSize = Size.Type.Minimized;
        consoleSize = Size.Type.Minimized;
        worldSize = Size.Type.Minimized;
        challengeSize = Size.Type.Minimized;
        break;
      }
      case Size.Type.Partial: {
        if (infoSize === Size.Type.Minimized) infoSize = Size.Type.Partial;
        if (worldSize === Size.Type.Minimized) worldSize = Size.Type.Partial;
        if (consoleSize === Size.Type.Minimized) consoleSize = Size.Type.Miniature;
        if (challengeSize === Size.Type.Minimized) challengeSize = Size.Type.Partial;
        break;
      }
    }

    this.setState({
      editorSize: EDITOR_SIZES[index].type,
      infoSize,
      consoleSize,
      worldSize,
      challengeSize
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

  private onChallengeSizeChange_ = (index: number) => {
    this.setState({
      challengeSize: CHALLENGE_SIZES[index].type
    });
  };

  private onConsoleSizeChange_ = (index: number) => {
    const size = CONSOLE_SIZES[index];

    let { infoSize, editorSize, worldSize, challengeSize } = this.state;
    
    switch (size.type) {
      case Size.Type.Maximized: {
        infoSize = Size.Type.Minimized;
        editorSize = Size.Type.Minimized;
        worldSize = Size.Type.Minimized;
        challengeSize = Size.Type.Minimized;
        break;
      }
      case Size.Type.Partial: {
        if (infoSize === Size.Type.Minimized) infoSize = Size.Type.Partial;
        if (worldSize === Size.Type.Minimized) worldSize = Size.Type.Partial;
        if (editorSize === Size.Type.Minimized) editorSize = Size.Type.Partial;
        if (challengeSize === Size.Type.Minimized) challengeSize = Size.Type.Partial;
        break;
      }
    }

    this.setState({
      consoleSize: size.type,
      infoSize,
      editorSize,
      worldSize,
      challengeSize
    });
  };

  public showAll() {
    this.setState({
      editorSize: Size.Type.Miniature,
      infoSize: Size.Type.Partial,
      consoleSize: Size.Type.Miniature,
      worldSize: Size.Type.Partial,
      challengeSize: Size.Type.Partial
    });
  }

  public hideAll() {
    this.setState({
      editorSize: Size.Type.Minimized,
      infoSize: Size.Type.Minimized,
      consoleSize: Size.Type.Minimized,
      worldSize: Size.Type.Minimized,
      challengeSize: Size.Type.Minimized
    });
  }

  private onErrorClick_ = (event: React.MouseEvent<HTMLDivElement>) => {
    // not implemented
  };

  private onRobotOriginChange_ = (origin: ReferenceFrame) => {
    const { scene, onNodeChange } = this.props;
    
    const latestScene = Async.latestValue(scene);

    if (!latestScene) return;

    const robots = Scene.robots(latestScene);
    const robotId = Object.keys(robots)[0];
    this.props.onNodeChange(robotId, {
      ...robots[robotId],
      origin
    });
  };

  render() {
    const { props } = this;
    
    const {
      style,
      className,
      theme,
      editorTarget,
      console,
      messages,
      settings,
      onClearConsole,
      onIndentCode,
      onDownloadCode,
      onResetCode,
      editorRef,
      robots,
      sceneId,
      scene,
      onNodeAdd,
      onNodeChange,
      onNodeRemove,
      onGeometryAdd,
      onGeometryChange,
      onGeometryRemove,
      onScriptAdd,
      onScriptChange,
      onScriptRemove,
      onObjectAdd,
      challengeState,
      worldCapabilities,
      onDocumentationGoToFuzzy,
      locale
    } = props;

    const {
      editorSize,
      consoleSize,
      infoSize,
      worldSize,
      challengeSize,
      workingScriptCode
    } = this.state;

    const commonProps = {
      theme,
      mode: Mode.Floating
    };

    let editorBarTarget: EditorBarTarget;
    let editor: JSX.Element;
    switch (editorTarget.type) {
      case LayoutEditorTarget.Type.Robot: {
        editorBarTarget = {
          type: EditorBarTarget.Type.Robot,
          messages,
          language: editorTarget.language,
          onLanguageChange: editorTarget.onLanguageChange,
          onIndentCode,
          onDownloadCode,
          onResetCode,
          onErrorClick: this.onErrorClick_
        };
        editor = (
          <Editor
            theme={theme}
            ref={editorRef}
            code={editorTarget.code}
            language={editorTarget.language}
            onCodeChange={editorTarget.onCodeChange}
            messages={messages}
            autocomplete={settings.editorAutoComplete}
            onDocumentationGoToFuzzy={onDocumentationGoToFuzzy}
          />
        );
        break;
      }
    }

    const editorBar = createEditorBarComponents({
      theme,
      target: editorBarTarget,
      locale
    });
    const consoleBar = createConsoleBarComponents(theme, onClearConsole, locale);

    const latestScene = Async.latestValue(scene);
    let robotNode: Node.Robot;
    if (latestScene) {
      const robots = Scene.robots(latestScene);
      robotNode = Dict.unique(robots);
    }

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
        <Overlay theme={theme} $challenge={!!challengeState}>
          <EditorWidget
            {...commonProps}
            name={LocalizedString.lookup(tr('Editor'), locale)}
            sizes={EDITOR_SIZES}
            size={EDITOR_SIZE[editorSize]}
            onSizeChange={this.onEditorSizeChange_}
            barComponents={editorBar}
            $challenge={!!challengeState}
          >
            {editor}
          </EditorWidget>
          <ConsoleWidget
            {...commonProps}
            name={LocalizedString.lookup(tr('Console', 'Computer text command line (e.g., DOS)'), locale)}
            sizes={CONSOLE_SIZES}
            size={CONSOLE_SIZE[consoleSize]}
            onSizeChange={this.onConsoleSizeChange_}
            barComponents={consoleBar}
            $challenge={!!challengeState}
          >
            <FlexConsole theme={theme} text={console} />
          </ConsoleWidget>
          {robotNode ? (
            <InfoWidget
              {...commonProps}
              name={LocalizedString.lookup(tr('Robot'), locale)}
              sizes={INFO_SIZES}
              size={INFO_SIZE[infoSize]}
              onSizeChange={this.onInfoSizeChange_}
              $challenge={!!challengeState}
            >
              <Info
                theme={theme}
                node={robotNode}
                onOriginChange={this.onRobotOriginChange_}
              />
            </InfoWidget>
          ) : null}
          {challengeState ? (
            <ChallengeWidget
              {...commonProps}
              name={LocalizedString.lookup(tr('Challenge', 'A predefined task for the user to complete'), locale)}
              sizes={CHALLENGE_SIZES}
              size={CHALLENGE_SIZE[challengeSize]}
              onSizeChange={this.onChallengeSizeChange_}
            >
              <Challenge
                theme={theme}
                challenge={challengeState.challenge}
                challengeCompletion={challengeState.challengeCompletion}
              />
            </ChallengeWidget>
          ) : undefined}
          <WorldWidget
            {...commonProps}
            name={LocalizedString.lookup(tr('World'), locale)}
            sizes={WORLD_SIZES}
            size={WORLD_SIZE[worldSize]}
            onSizeChange={this.onWorldSizeChange_}
            $challenge={!!challengeState}
          >
            <World
              theme={theme}
              scene={scene}
              onNodeAdd={onNodeAdd}
              onNodeChange={onNodeChange}
              onNodeRemove={onNodeRemove}
              onGeometryAdd={onGeometryAdd}
              onGeometryChange={onGeometryChange}
              onGeometryRemove={onGeometryRemove}
              onScriptAdd={onScriptAdd}
              onScriptChange={onScriptChange}
              onScriptRemove={onScriptRemove}
              onObjectAdd={onObjectAdd}
              capabilities={worldCapabilities}
            />
          </WorldWidget>
        </Overlay>
      </Container>
    );
  }
}

export const OverlayLayoutRedux = connect((state: ReduxState, { sceneId }: LayoutProps) => {
  const asyncScene = state.scenes[sceneId];
  const scene = Async.latestValue(asyncScene);
  let robots: Dict<Node.Robot> = EMPTY_OBJECT;
  if (scene) robots = Scene.robots(scene);
  
  return {
    robots,
    locale: state.i18n.locale,
  };
}, dispatch => ({
}), null, { forwardRef: true })(OverlayLayout);