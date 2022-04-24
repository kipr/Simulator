import * as React from 'react';

import { styled } from 'styletron-react';
import { EMPTY_ARRAY } from '../../util'; 

import { Button } from '../Button';
import Console from '../Console';
import { Editor, WarningCharm, ErrorCharm } from '../Editor';
import { Fa } from '../Fa';
import { Info } from '../Info';
import { LayoutProps } from './Layout';
import { SimulatorArea } from '../SimulatorArea';
import { TabBar } from '../TabBar';
import { ThemeProps } from '../theme';
import Widget, { BarComponent, Mode, Size, WidgetProps } from '../Widget';
import World from '../World';
import { Side, Slider } from './Slider';

// 3 panes:
// Editor / console
// Robot Info
// World

const TABS_COLLAPSED = -1;

const TABS = [{
  name: 'Editor',
  icon: 'code'
}, {
  name: 'Robot',
  icon: 'robot'
}, {
  name: 'World',
  icon: 'globe-americas'
}];

const sizeDict = (sizes: Size[]) => {
  const forward: { [type: number]: number } = {};

  for (let i = 0; i < sizes.length; ++i) {
    const size = sizes[i];
    forward[size.type] = i;
  }

  return forward;
};
const SIDEBAR_SIZES: Size[] = [Size.MINIMIZED, Size.PARTIAL_RIGHT, Size.MINIATURE_LEFT, Size.MAXIMIZED];
const CONSOLE_SIZES: Size[] = [Size.MINIMIZED, Size.MINIATURE_DOWN, Size.PARTIAL_UP];
const CONSOLE_SIZE = sizeDict(CONSOLE_SIZES);
const SIDEBAR_SIZE = sizeDict(SIDEBAR_SIZES);

export interface SideLayoutProps extends LayoutProps {
}

interface SideLayoutState {
  activePanel: number;
  sidePanelSize: Size.Type;
  consoleSize: Size.Type;
}

type Props = SideLayoutProps;
type State = SideLayoutState;

interface SideBarProps {
  size: number;
}

const SidePanelContainer = styled('div', {
  display: 'flex',
  flex: '1 1',
  flexDirection: 'row',
});

const SideBar = styled('div', (props: SideBarProps) => {
  const sizeType = props.size;
  
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: "stretch",
    flex: '1 1 auto',
    width: '100%',
    // flex: (sizeType === Size.Type.Maximized) ? '1 1 100%' : '0 1 auto',
    // width: (sizeType === Size.Type.Maximized) ? '100%' : (sizeType === Size.Type.Miniature) ? '30vw' : '60vw',
  }
});

const SimulatorAreaContainer = styled('div', {
  display: 'flex',
  flex: '3 1',
});
const SimulatorWidget = styled(Widget, {
  flex: '1 1 auto',
  height: '100%'
});
const FlexConsole = styled(Console, {
  flex: '1 1'
});

const SideBarMinimizedTab = -1;

class SideLayout extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      consoleSize: Size.Type.Miniature,
      sidePanelSize: Size.Type.Miniature,
      activePanel: 0
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
      this.setState({activePanel: SideBarMinimizedTab});
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
      this.setState({activePanel: index});        
    }
  };
  private onTabBarExpand_ = (index: number) => {
    this.onSideBarSizeChange_(Size.Type.Miniature);
    this.setState({activePanel: index});
  }

  private editor_: Editor;
  private bindEditor_ = (editor: Editor) => {
    this.editor_ = editor;
  };
  get editor() {
    return this.editor_;
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
      code,
      onCodeChange,
      state,
      onStateChange,
      robotStartPosition,
      onSetRobotStartPosition,
      console,
      messages,
      settings,
      onClearConsole,
      surfaceState,
      onSurfaceChange,
    } = props;

    const {
      activePanel,
      sidePanelSize,
      consoleSize,
    } = this.state;

    const editorBar: BarComponent<unknown>[] = [];
    let errors = 0;
    let warnings = 0;

    messages.forEach(message => {
      switch (message.severity) {
        case 'error': {
          ++errors;
          break;
        }
        case 'warning': {
          ++warnings;
          break;
        }
      }
    });

    if (errors > 0) editorBar.push(BarComponent.create(ErrorCharm, {
      theme,
      count: errors,
      onClick: this.onErrorClick_
    }));

    if (warnings > 0) editorBar.push(BarComponent.create(WarningCharm, {
      theme,
      count: warnings,
      onClick: this.onErrorClick_
    }));

    const consoleBar: BarComponent<unknown>[] = [];

    consoleBar.push(BarComponent.create(Button, {
      theme,
      onClick: onClearConsole,
      children:
        <>
          <Fa icon='file' />
          {' Clear'}
        </>,
    }));

    const simulator = <SimulatorAreaContainer>
      <SimulatorArea
        key='simulator'
        robotState={state}
        onRobotStateUpdate={onStateChange}
        isSensorNoiseEnabled={settings.simulationSensorNoise}
        isRealisticSensorsEnabled={settings.simulationRealisticSensors}
        surfaceState={surfaceState}
      />
    </SimulatorAreaContainer>

    let content: JSX.Element;
    switch (activePanel) {
      case 0: {
        content = (
        <>
          <Slider side={Side.Bottom} initialHeight={window.innerHeight * 2 / 3} theme={theme}>
            <SimulatorWidget
                theme={theme}
                name='Editor'
                barComponents={editorBar}
                mode={Mode.Inline}
              >
              <Editor
                theme={theme}
                ref={this.bindEditor_}
                code={code} onCodeChange={onCodeChange}
                messages={messages}
                autocomplete={settings.editorAutoComplete}
              />
            </SimulatorWidget>
          </Slider>
          <SimulatorWidget
            theme={theme}
            name='Console'
            barComponents={consoleBar}
            mode={Mode.Inline}
            hideActiveSize={true}
          >
            <div></div>
            {/* <FlexConsole theme={theme} text={console}/> */}
          </SimulatorWidget>
        </>
        );
        break;
      }
      case 1: {
        content = (
          <SimulatorWidget
            theme={theme}
            name='Robot'
            mode={Mode.Inline}
          >
            <Info
              robotState={state}
              robotStartPosition={robotStartPosition}
              onSetRobotStartPosition={onSetRobotStartPosition}
              theme={theme}
            />
          </SimulatorWidget>
        );
        break;
      }
      case 2: {
        content = (
          <SimulatorWidget
            theme={theme}
            name='World'
            mode={Mode.Inline}
          >
            <World theme={theme} surfaceName={surfaceState.surfaceName} onSurfaceChange={onSurfaceChange} />
          </SimulatorWidget>
        );
        break;
      }
    }

    const tabBar = <TabBar isVertical={true} tabs={TABS} index={activePanel} onIndexChange={this.onTabBarIndexChange_} theme={theme} />
    const sideBar = <Slider side={Side.Right} initialWidth={400} theme={theme}>
      <SideBar size={sidePanelSize} >
      {content}
      </SideBar>
    </Slider>

    switch (sidePanelSize) {
      case Size.Type.Minimized:
        return <SidePanelContainer>
            <TabBar isVertical={true} tabs={TABS} index={activePanel} onIndexChange={this.onTabBarExpand_} theme={theme} />
            {simulator}
          </SidePanelContainer>
      case Size.Type.Maximized:
        return <SidePanelContainer>
            {tabBar}
            <SidePanelContainer>
              {sideBar}
            </SidePanelContainer>
          </SidePanelContainer>
      default:
        return <SidePanelContainer>
          {tabBar}
          <SidePanelContainer>
            {sideBar}
            {simulator}
          </SidePanelContainer>
        </SidePanelContainer>
    }
  }
}

export default SideLayout;