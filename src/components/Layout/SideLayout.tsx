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
import { TabBar } from '../TabBar';
import Widget, { BarComponent, Mode, Size } from '../Widget';
import { Slider } from '../Slider';

import { State as ReduxState } from '../../state';
import Node from '../../state/State/Scene/Node';
import Dict from '../../Dict';
import Scene from '../../state/State/Scene';
import { faCode, faFlagCheckered, faGlobeAmericas, faRobot } from '@fortawesome/free-solid-svg-icons';
import Async from '../../state/State/Async';
import { EMPTY_OBJECT } from '../../util';
import Challenge from '../Challenge';
import { ReferenceFrame } from '../../unit-math';

import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';



// 3 panes:
// Editor / console
// Robot Info
// World



const sizeDict = (sizes: Size[]) => {
  const forward: { [type: number]: number } = {};

  for (let i = 0; i < sizes.length; ++i) {
    const size = sizes[i];
    forward[size.type] = i;
  }

  return forward;
};
const SIDEBAR_SIZES: Size[] = [Size.MINIMIZED, Size.PARTIAL_RIGHT, Size.MAXIMIZED];
const SIDEBAR_SIZE = sizeDict(SIDEBAR_SIZES);

export interface SideLayoutProps extends LayoutProps {
}

interface ReduxSideLayoutProps {
  robots: Dict<Node.Robot>;
  locale: LocalizedString.Language;
}

interface SideLayoutState {
  activePanel: number;
  sidePanelSize: Size.Type;
  workingScriptCode?: string;
}

type Props = SideLayoutProps;
type State = SideLayoutState;


const Container = styled('div', {
  display: 'flex',
  flex: '1 1',
  position: 'relative'
});

const SidePanelContainer = styled('div', {
  display: 'flex',
  flex: '1 1',
  flexDirection: 'row',
});

const SideBar = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  flex: '1 1 auto',
  width: '100%',
});

const SimulatorAreaContainer = styled('div', {
  display: 'flex',
  flex: '1 1',
});
const SimultorWidgetContainer = styled('div', {
  display: 'flex',
  flex: '1 0 0',
  height: '100%',
  width: '100%',
  overflow: 'hidden'
  
});
const SimulatorWidget = styled(Widget, {
  display: 'flex',
  flex: '1 1 0',
  height: '100%',
  width: '100%',
});


const FlexConsole = styled(Console, {
  flex: '1 1',
});

const SideBarMinimizedTab = -1;

export class SideLayout extends React.PureComponent<Props & ReduxSideLayoutProps, State> {
  constructor(props: Props & ReduxSideLayoutProps) {
    super(props);

    this.state = {
      sidePanelSize: Size.Type.Miniature,
      activePanel: 0,
    };

    // TODO: this isn't working yet. Needs more tinkering
    // on an orientation change, trigger a rerender
    // this is deprecated, but supported in safari iOS
    // screen.orientation.onchange = () => {
    //   console.log('orientation change')
    //   this.render();
    // };
    // // this is not deprecated, but not supported in safari iOS
    // window.addEventListener('orientationchange', () => { console.log('deprecated orientation change'); this.render(); });
  }
  private onSideBarSizeChange_ = (index: number) => {
    if (SIDEBAR_SIZES[index].type === Size.Type.Minimized) {
      // unset active tab if minimizing
      this.setState({ activePanel: SideBarMinimizedTab });
    }
    this.setState({
      sidePanelSize: SIDEBAR_SIZES[index].type,
    });
  };
  private onTabBarIndexChange_ = (index: number) => {
    if (index === this.state.activePanel) {
      // collapse instead
      this.onSideBarSizeChange_(SIDEBAR_SIZE[Size.Type.Minimized]);
    } else {
      this.setState({ activePanel: index });
    }
  };
  private onTabBarExpand_ = (index: number) => {
    this.onSideBarSizeChange_(Size.Type.Miniature);
    this.setState({ activePanel: index });
  };

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
      activePanel,
      sidePanelSize,
      
    } = this.state;

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

    let content: JSX.Element;
    switch (activePanel) {
      case 0: {
        content = (
          <Slider 
            isVertical={false} 
            theme={theme}
            minSizes={[100, 100]}
            sizes={[3, 1]}
            visible={[true, true]}
          >
            <SimultorWidgetContainer>
              <SimulatorWidget
                theme={theme}
                name={LocalizedString.lookup(editorTarget.type === LayoutEditorTarget.Type.Robot ? tr('Editor') : tr('Script Editor'), locale)}
                mode={Mode.Sidebar}
                barComponents={editorBar}
              >
                {editor}
              </SimulatorWidget>
            </SimultorWidgetContainer>

            <SimultorWidgetContainer>
              <SimulatorWidget
                theme={theme}
                name={LocalizedString.lookup(tr('Console'), locale)}
                barComponents={consoleBar}
                mode={Mode.Sidebar}
                hideActiveSize={true}
              >
                <FlexConsole theme={theme} text={console}/>
              </SimulatorWidget>
            </SimultorWidgetContainer>
          </Slider>

        );
        break;
      }
      case 1: {
        const latestScene = Async.latestValue(scene);
        let robotNode: Node.Robot;
        if (latestScene) {
          const robots = Scene.robots(latestScene);
          robotNode = Dict.unique(robots);
        }
        if (robotNode) {
          content = (
            <SimulatorWidget
              theme={theme}
              name={LocalizedString.lookup(tr('Robot'), locale)}
              mode={Mode.Sidebar}
            >
              <Info
                theme={theme}
                node={robotNode}
                onOriginChange={this.onRobotOriginChange_}
              />
            </SimulatorWidget>
          );
        } else {
          content = null;
        }
        break;
      }
      case 2: {
        content = (
          <SimulatorWidget
            theme={theme}
            name={LocalizedString.lookup(tr('World'), locale)}
            mode={Mode.Sidebar}
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
          </SimulatorWidget>
        );
        break;
      }
      case 3: {
        content = (
          <SimulatorWidget
            theme={theme}
            name={LocalizedString.lookup(tr('Challenge', 'A predefined task for the user to complete'), locale)}
            mode={Mode.Sidebar}
          >
            <Challenge
              theme={theme}
              challenge={challengeState.challenge}
              challengeCompletion={challengeState.challengeCompletion}
            />
          </SimulatorWidget>
        );
      }
    }

    const tabs = [{
      name: LocalizedString.lookup(tr('Editor'), locale),
      icon: faCode,
    }, {
      name: LocalizedString.lookup(tr('Robot'), locale),
      icon: faRobot,
    }, {
      name: LocalizedString.lookup(tr('World'), locale),
      icon: faGlobeAmericas,
    }];

    if (challengeState) {
      tabs.push({
        name: LocalizedString.lookup(tr('Challenge', 'A predefined task for the user to complete'), locale),
        icon: faFlagCheckered,
      });
    }


    const simulator = <SimulatorAreaContainer>
      <SimulatorArea
        theme={theme}
        key='simulator'
        isSensorNoiseEnabled={settings.simulationSensorNoise}
        isRealisticSensorsEnabled={settings.simulationRealisticSensors}
      />
    </SimulatorAreaContainer>;

    return <Container style={style} className={className}>
      <SidePanelContainer>
        <TabBar 
          theme={theme} isVertical={true} tabs={tabs} index={activePanel} 
          onIndexChange={sidePanelSize === Size.Type.Minimized 
            ? this.onTabBarExpand_
            : this.onTabBarIndexChange_ 
          }  
        />
        <Slider 
          isVertical={true}
          theme={theme}
          minSizes={[50, 50]}
          sizes={[1.2, 3]}
          visible={[sidePanelSize !== Size.Type.Minimized, true]}
        >
          {content}
          {simulator}
        </Slider>
      </SidePanelContainer>
    </Container>;
  }
}

export const SideLayoutRedux = connect((state: ReduxState, { sceneId }: LayoutProps) => {
  const asyncScene = state.scenes[sceneId];
  const scene = Async.latestValue(asyncScene);
  let robots: Dict<Node.Robot> = EMPTY_OBJECT;
  if (scene) robots = Scene.robots(scene);
  
  return {
    robots,
    locale: state.i18n.locale,
  };
}, dispatch => ({

}), null, { forwardRef: true })(SideLayout) as React.ComponentType<SideLayoutProps>;