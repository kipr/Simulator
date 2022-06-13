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
import { Slider } from '../Slider';

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
const SIDEBAR_SIZES: Size[] = [Size.MINIMIZED, Size.PARTIAL_RIGHT, Size.MAXIMIZED];
const SIDEBAR_SIZE = sizeDict(SIDEBAR_SIZES);

export interface SideLayoutProps extends LayoutProps {
}

interface SideLayoutState {
  activePanel: number;
  sidePanelSize: Size.Type;
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

class SideLayout extends React.PureComponent<Props, State> {
  constructor(props: Props) {
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
            {/* <div>Editor</div> */}
            <SimultorWidgetContainer>
              <SimulatorWidget
                theme={theme}
                name='Editor'
                barComponents={editorBar}
                mode={Mode.Sidebar}
              >
                
                <Editor
                  theme={theme}
                  ref={this.bindEditor_}
                  code={code} onCodeChange={onCodeChange}
                  messages={messages}
                  autocomplete={settings.editorAutoComplete}
                />
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
        content = (
          <SimulatorWidget
            theme={theme}
            name='Robot'
            mode={Mode.Sidebar}
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
            mode={Mode.Sidebar}
          >
            <World theme={theme} surfaceName={surfaceState.surfaceName} onSurfaceChange={onSurfaceChange} />
          </SimulatorWidget>
        );
        break;
      }
    }

    const simulator = <SimulatorAreaContainer>
      <SimulatorArea
        key='simulator'
        robotState={state}
        onRobotStateUpdate={onStateChange}
        isSensorNoiseEnabled={settings.simulationSensorNoise}
        isRealisticSensorsEnabled={settings.simulationRealisticSensors}
        surfaceState={surfaceState}
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
          sizes={[1, 3]}
          visible={[sidePanelSize !== Size.Type.Minimized, true]}
        >
          {content}
          {simulator}
        </Slider>
      </SidePanelContainer>
    </Container>;
  }
}

export default SideLayout;