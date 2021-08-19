import * as React from 'react';

import { styled } from 'styletron-react';
import Console from './Console';
import { Editor } from './Editor';
import { LayoutProps } from './Layout';
import Widget, { Mode, Size, WidgetProps } from './Widget';


export interface BottomLayoutProps extends LayoutProps {
}

interface BottomLayoutState {
  consoleSize: number;
  infoSize: number;
  editorSize: number;
}

type Props = BottomLayoutProps;
type State = BottomLayoutState;

const Container = styled('div', {
  display: 'flex',
  flex: '1 1',
  flexDirection: 'row'
});

const BottomBar = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  width: '400px',
});

const ConsoleWidget = styled(Widget, (props: WidgetProps) => {
  const size = props.sizes[props.size];
  switch (size.type) {
    case Size.Type.Minimized: return {
      display: 'none'
    };
    case Size.Type.Maximized: return {
      gridColumn: '1 / span 2',
      gridRow: '1 / span 2'
    };
    default:
    case Size.Type.Partial: return {
      gridColumn: 1,
      gridRow: 2
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
      gridColumn: '1 / span 2',
      gridRow: '1 / span 2'
    };
    default:
    case Size.Type.Partial: return {
      gridColumn: 1,
      gridRow: 1,
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
      gridColumn: 2,
      gridRow: '1 / span 2',
    };
  }
  
});

const EDITOR_SIZES: Size[] = [Size.PARTIAL_LEFT, Size.MAXIMIZED, Size.MINIMIZED];
const INFO_SIZES: Size[] = [Size.PARTIAL_RIGHT, Size.MINIMIZED];
const CONSOLE_SIZES: Size[] = [Size.PARTIAL_DOWN, Size.MAXIMIZED, Size.MINIMIZED];

class BottomLayout extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      editorSize: 0,
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

  render() {
    const { props } = this;
    const { style, className, theme, state, onStateChange, onCodeChange, code, console, settings } = props;
    const { editorSize, consoleSize, infoSize } = this.state;
    return (
      <Container>
        
        
        <BottomBar>
          <ConsoleWidget theme={theme} name='Console' sizes={CONSOLE_SIZES} size={consoleSize} onSizeChange={this.onConsoleSizeChange_} mode={Mode.Inline}>
            <Console theme={theme} text={console} />
          </ConsoleWidget>
          <InfoWidget theme={theme} name='Robot' sizes={INFO_SIZES} size={infoSize} onSizeChange={this.onInfoSizeChange_} mode={Mode.Inline}>
            <Console theme={theme} text={console} />
          </InfoWidget>
          <EditorWidget theme={theme} name='Editor' sizes={EDITOR_SIZES} size={editorSize} onSizeChange={this.onEditorSizeChange_} mode={Mode.Inline}>
            <Editor code={code} onCodeChange={onCodeChange} theme={theme} autocomplete={settings.editorAutoComplete} />
          </EditorWidget>
        </BottomBar>
      </Container>
    );
  }
}

export default BottomLayout;