import * as React from 'react';

import { styled } from 'styletron-react';
import Console from './Console';
import { Info } from './Info';
import { LayoutProps } from './Layout';
import { SimulatorArea } from './SimulatorArea';
import { TabBar } from './TabBar';
import { ThemeProps } from './theme';
import Widget, { Mode, Size, WidgetProps } from './Widget';


interface LayoutState {
  editor: Size,
  info: Size,
  console: Size
}

export interface SideLayoutProps extends LayoutProps {
}

interface SideLayoutState {
  consoleSize: number;
  infoSize: number;
  editorSize: number;

  index: number;
}

type Props = SideLayoutProps;
type State = SideLayoutState;

const Container = styled('div', {
  display: 'flex',
  flex: '1 1',
  flexDirection: 'row',
});

const SimulatorAreaContainer = styled('div', {
  flex: '3 3',
  display: 'flex',
});

const SideBar = styled('div', {
  display: 'flex',
  flex: '1 1',
  flexDirection: 'column',
});

interface WidgetLayoutProps {
  size: Size
}

const ConsoleWidget = styled(Widget, (props: WidgetProps) => {
  return {
    height: '300px'
  };
});

const EditorWidget = styled(Widget, (props: WidgetProps) => {
  return {
    height: '500px'
  };
});

const InfoWidget = styled(Widget, (props: WidgetProps) => {
  return {
    height: '400px'
  };
});

const EDITOR_SIZES: Size[] = [Size.PARTIAL_LEFT, Size.MAXIMIZED, Size.MINIMIZED];
const INFO_SIZES: Size[] = [Size.PARTIAL_RIGHT, Size.MINIMIZED];
const CONSOLE_SIZES: Size[] = [Size.PARTIAL_DOWN, Size.MAXIMIZED, Size.MINIMIZED];

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

const StyledTabBar = styled(TabBar, (props: ThemeProps) => ({
  borderTop: `1px solid ${props.theme.borderColor}`
}));

class SideLayout extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      editorSize: 0,
      infoSize: 0,
      consoleSize: 0,
      index: 0
    };
  }

  private onEditorSizeChange_ = (index: number) => {
    const size = EDITOR_SIZES[index];

    let infoSize = this.state.infoSize;
    let consoleSize = this.state.consoleSize;
    
    switch (size.type) {
      case Size.Type.Maximized: {
        infoSize = 1;
        consoleSize = 2;
        break;
      }
      case Size.Type.Partial: {
        if (infoSize === 1) infoSize = 0;
        if (consoleSize === 2) consoleSize = 0;
        break;
      }
    }

    this.setState({
      editorSize: index,
      infoSize,
      consoleSize
    });
  };

  private onInfoSizeChange_ = (index: number) => {
    
    this.setState({
      infoSize: index
    });
  };

  private onConsoleSizeChange_ = (index: number) => {
    const size = CONSOLE_SIZES[index];

    let infoSize = this.state.infoSize;
    let editorSize = this.state.editorSize;
    
    switch (size.type) {
      case Size.Type.Maximized: {
        infoSize = 1;
        editorSize = 2;
        break;
      }
      case Size.Type.Partial: {
        if (infoSize === 1) infoSize = 0;
        if (editorSize === 2) editorSize = 0;
        break;
      }
    }

    this.setState({
      consoleSize: index,
      infoSize,
      editorSize
    });
  };

  private onTabBarIndexChange_ = (index: number) => {
    // not implemented
  };

  render() {
    const { props } = this;
    const { style, className, theme, state, onStateChange, robotStartPosition, onSetRobotStartPosition, onCodeChange, code, console, settings, surfaceState } = props;
    const { editorSize, consoleSize, infoSize, index } = this.state;

    let content: JSX.Element;
    switch (index) {
      case 0: {
        content = (
          <ConsoleWidget
            theme={theme}
            name='Console'
            sizes={CONSOLE_SIZES}
            style={{ flex: '1 1' }}
            size={consoleSize}
            onSizeChange={this.onConsoleSizeChange_}
            mode={Mode.Inline}
          >
            <Console theme={theme} text={console} />
          </ConsoleWidget>
        );
        break;
      }
      case 1: {
        content = (
          <InfoWidget
            theme={theme}
            name='Robot'
            sizes={INFO_SIZES}
            size={infoSize}
            onSizeChange={this.onInfoSizeChange_}
            mode={Mode.Inline}
          >
            <Info
              robotState={state}
              robotStartPosition={robotStartPosition}
              onSetRobotStartPosition={onSetRobotStartPosition}
              theme={theme}
            />
          </InfoWidget>
        );
        break;
      }
      case 2: {
        break;
      }
    }


    return (
      <Container>
        <SideBar>
          {content}
          <StyledTabBar tabs={TABS} index={0} onIndexChange={this.onTabBarIndexChange_} theme={theme} />
        </SideBar>
        <SimulatorAreaContainer>
          <SimulatorArea
            key='simulator'
            robotState={state}
            onRobotStateUpdate={onStateChange}
            isSensorNoiseEnabled={settings.simulationSensorNoise}
            isRealisticSensorsEnabled={settings.simulationRealisticSensors}
            surfaceState={surfaceState}
          />
        </SimulatorAreaContainer>
      </Container>
    );
  }
}

export default SideLayout;