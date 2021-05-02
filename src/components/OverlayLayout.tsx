import * as React from 'react';

import { styled } from 'styletron-react';
import { RobotState } from '../RobotState';
import { StyleProps } from '../style';
import { Spacer } from './common';
import Console from './Console';
import Editor from './Editor';
import { Fa } from './Fa';
import { LayoutProps } from './Layout';
import { SimulatorArea } from './SimulatorArea';
import { ThemeProps } from './theme';
import Widget, { Mode, Size, WidgetProps } from './Widget';


interface LayoutState {
  editor: Size,
  info: Size,
  console: Size
}

export interface OverlayLayoutProps extends LayoutProps {
  
}

interface OverlayLayoutState {
  consoleSize: number;
  infoSize: number;
  editorSize: number;
}

type Props = OverlayLayoutProps;
type State = OverlayLayoutState;

const Container = styled('div', {
  display: 'flex',
  flex: '1 1',
  position: 'relative'
});

const Overlay = styled('div', (props: ThemeProps) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 2fr 250px',
  gridTemplateRows: '1fr 250px',
  opacity: 0.95,
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

interface WidgetLayoutProps {
  size: Size
}

const ConsoleWidget = styled(Widget, (props: WidgetProps) => {
  let size = props.sizes[props.size];
  switch(size.type) {
    case Size.Type.Minimized: return {
      display: 'none'
    };
    case Size.Type.Maximized: return {
      gridColumn: '1 / span 3',
      gridRow: '1 / span 2'
    };
    default:
    case Size.Type.Partial: return {
      gridColumn: '1 / span 2',
      gridRow: 2
    };
  } 
});

const EditorWidget = styled(Widget, (props: WidgetProps) => {
  let size = props.sizes[props.size];
  switch(size.type) {
    case Size.Type.Minimized: return {
      display: 'none'
    };
    case Size.Type.Maximized: return {
      gridColumn: '1 / span 3',
      gridRow: '1 / span 2'
    };
    case Size.Type.Miniature: return {
      gridColumn: 1,
      gridRow: 1
    };
    default:
    case Size.Type.Partial: return {
      gridColumn: '1 / span 2',
      gridRow: 1,
    };
  }
});

const InfoWidget = styled(Widget, (props: WidgetProps) => {
  let size = props.sizes[props.size];
  switch(size.type) {
    case Size.Type.Minimized: return {
      display: 'none'
    };
    default:
    case Size.Type.Partial: return {
      gridColumn: 3,
      gridRow: '1 / span 2',
    };
  }
  
});

const EDITOR_SIZES: Size[] = [ Size.MINIATURE_LEFT, Size.PARTIAL_LEFT, Size.MAXIMIZED, Size.MINIMIZED ];
const INFO_SIZES: Size[] = [ Size.PARTIAL_RIGHT, Size.MINIMIZED ];
const CONSOLE_SIZES: Size[] = [ Size.PARTIAL_DOWN, Size.MAXIMIZED, Size.MINIMIZED ];

class OverlayLayout extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      editorSize: 1,
      infoSize: 0,
      consoleSize: 0
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
        editorSize = 3;
        break;
      }
      case Size.Type.Partial: {
        if (infoSize === 1) infoSize = 0;
        if (editorSize === 3) editorSize = 1;
        break;
      }
    }

    this.setState({
      consoleSize: index,
      infoSize,
      editorSize
    });
  };

  public showAll() {
    this.setState({
      editorSize: 1,
      infoSize: 0,
      consoleSize: 0
    })
  }

  public hideAll() {
    this.setState({
      editorSize: 3,
      infoSize: 1,
      consoleSize: 2
    })
  }

  render() {
    const { props } = this;
    const { style, className, theme, state, onStateChange, cans, code, onCodeChange } = props;
    const { editorSize, consoleSize, infoSize } = this.state;
    return (
      <Container>
        <SimulatorArea key='simulator' robotState={state} canEnabled={cans} onRobotStateUpdate={onStateChange} />
        <Overlay theme={theme}>
          <ConsoleWidget theme={theme} name='Console' sizes={CONSOLE_SIZES} size={consoleSize} onSizeChange={this.onConsoleSizeChange_} mode={Mode.Floating}>
            <Console theme={theme} />
          </ConsoleWidget>
          <InfoWidget theme={theme} name='Robot' sizes={INFO_SIZES} size={infoSize} onSizeChange={this.onInfoSizeChange_} mode={Mode.Floating}>
            <Console theme={theme} />
          </InfoWidget>
          <EditorWidget theme={theme} name='Editor' sizes={EDITOR_SIZES} size={editorSize} onSizeChange={this.onEditorSizeChange_} mode={Mode.Floating}>
            <Editor code={code} onCodeChange={onCodeChange} theme={theme} />
          </EditorWidget>
        </Overlay>
      </Container>
    );
  }
}

export default OverlayLayout;