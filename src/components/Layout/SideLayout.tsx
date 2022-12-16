import * as React from 'react';
import { connect } from 'react-redux';

import { styled } from 'styletron-react';

import { Button } from '../Button';

import { Console, createConsoleBarComponents } from '../Console';
import { Editor, createEditorBarComponents, EditorBarTarget } from '../Editor';
import World, { createWorldBarComponents } from '../World';

import { Info } from '../Info';
import { LayoutEditorTarget, LayoutProps } from './Layout';
import { SimulatorArea } from '../SimulatorArea';
import { TabBar } from '../TabBar';
import Widget, { BarComponent, Mode, Size } from '../Widget';
import { Slider } from '../Slider';
import { ThemeProps } from "../theme";
import { State as ReduxState } from '../../state';
import Node from '../../state/State/Scene/Node';
import Dict from '../../Dict';
import Scene from '../../state/State/Scene';
import { faCode, faGlobeAmericas, faRobot } from '@fortawesome/free-solid-svg-icons';
import Async from '../../state/State/Async';
import { EMPTY_OBJECT } from '../../util';

// 3 panes:
// Editor / console
// Robot Info
// World

const TABS = [{
  name: 'Editor',
  icon: faCode,
}, {
  name: 'Robot',
  icon: faRobot,
}, {
  name: 'World',
  icon: faGlobeAmericas,
}];

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

const WorldSceneText = styled('span', (props: ThemeProps) => ({
  userSelect: 'none',
  padding: `1em 10em` ,
  color: `rgba(255, 255, 255,1)`
}));

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
          />
        );
        break;
      }
    }

    const editorBar = createEditorBarComponents({
      theme,
      target: editorBarTarget,
    });
    const consoleBar = createConsoleBarComponents(theme, onClearConsole);

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
                name={editorTarget.type === LayoutEditorTarget.Type.Robot ? 'Editor' : 'Script Editor'}
                mode={Mode.Sidebar}
                barComponents={editorBar}
              >
                {editor}
              </SimulatorWidget>
            </SimultorWidgetContainer>

            <SimultorWidgetContainer>
              <SimulatorWidget
                theme={theme}
                name='Console'
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
        const robotIds = Object.keys(robots);
        if (robotIds.length === 1) {
          content = (
            <SimulatorWidget
              theme={theme}
              name='Robot'
              mode={Mode.Sidebar}
            >
              <Info
                theme={theme}
                nodeId={robotIds[0]}
                sceneId={sceneId}
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
            name='World'
            mode={Mode.Sidebar}
          >
          <WorldSceneText theme={theme}>Current World Scene: {sceneId}</WorldSceneText>
            <World theme={theme} sceneId={sceneId} />
          </SimulatorWidget>
          
        );
        break;
      }
    }

    const simulator = <SimulatorAreaContainer>
      <SimulatorArea
        theme={theme}
        key='simulator'
        isSensorNoiseEnabled={settings.simulationSensorNoise}
        isRealisticSensorsEnabled={settings.simulationRealisticSensors}
      />
    </SimulatorAreaContainer>;

    // const tabBar = <TabBar isVertical={true} tabs={TABS} index={activePanel} onIndexChange={this.onTabBarIndexChange_} theme={theme} />;

    // switch (sidePanelSize) {
    //   case Size.Type.MinimizedS:
    //     return <SidePanelContainer>
    //       {simulator}
    //     </SidePanelContainer>;
    //   // not yet implemented, but could be on a device with a small enough screen that a slider doesn't make sense
    //   // case Size.Type.Maximized:
    //   //   return <SidePanelContainer>
    //   //     {tabBar}
    //   //     <SidePanelContainer>
    //   //       {sideBar}
    //   //     </SidePanelContainer>
    //   //   </SidePanelContainer>;
    //   default:
    return <Container style={style} className={className}>
      <SidePanelContainer>
        <TabBar 
          theme={theme} isVertical={true} tabs={TABS} index={activePanel} 
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
  };
}, dispatch => ({

}), null, { forwardRef: true })(SideLayout) as React.ComponentType<SideLayoutProps>;