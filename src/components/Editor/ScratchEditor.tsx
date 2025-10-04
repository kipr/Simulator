import { ThemeProps } from 'components/constants/theme';
import { RawVector2 } from '../../util/math/math';
import * as React from 'react';
import { styled } from 'styletron-react';

import resizeListener, { ResizeListener } from '../interface/ResizeListener';
import { flushSync } from 'react-dom';

export interface ScratchEditorProps extends ThemeProps {
  code: string;
  onCodeChange: (code: string) => void;

  toolboxHidden?: boolean;
}

interface ScratchEditorState {
  size: RawVector2;
}

type Props = ScratchEditorProps;
type State = ScratchEditorState;

const OuterContainer = styled('div', (props: ThemeProps) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  zIndex: 0,
}));

const Container = styled('div', (props: ThemeProps) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  backgroundColor: '#212121'
}));

class ScratchEditor extends React.Component<Props, State> {
  private resizeListener_ = resizeListener(size => this.setState({ size }));

  constructor(props: Props) {
    super(props);

    this.state = {
      size: RawVector2.ZERO,
    };
  }

  private debounce_: boolean;
  componentDidUpdate(prevProps: Readonly<ScratchEditorProps>, prevState: Readonly<ScratchEditorState>) {
    const { props: nextProps, state: nextState } = this;

    if (this.workspace_) {
      if (prevProps.code !== nextProps.code && !this.debounce_) {
        if (this.props.code === '') {
          this.workspace_.clear();
        } else {
          Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(this.props.code), this.workspace_);
        }
      }

      if (prevState.size !== nextState.size) {
        Blockly.svgResize(this.workspace_);
      }
    }
  
  }

  componentWillUnmount() {
    this.resizeListener_.disconnect();
  }

  private outerContainerRef_: HTMLDivElement | null = null;
  private bindOuterContainerRef_ = (ref: HTMLDivElement) => {
    if (this.outerContainerRef_) this.resizeListener_.unobserve(this.outerContainerRef_);
    

    this.outerContainerRef_ = ref;

    if (this.outerContainerRef_) this.resizeListener_.observe(this.outerContainerRef_);
    
  };
  
  private containerRef_: HTMLDivElement | null = null;
  private bindContainerRef_ = (ref: HTMLDivElement) => {
    if (this.containerRef_) {
      // cleanup blockly
    }

    this.containerRef_ = ref;

    if (this.containerRef_) {
      this.injectBlockly_();
    }
  };

  private workspace_: Blockly.Workspace;
  private injectBlockly_ = () => {
    this.workspace_ = Blockly.inject(this.containerRef_, {
      comments: true,
      disable: false,
      collapse: false,
      media: '../media/',
      readOnly: false,
      rtl: false,
      scrollbars: true,
      toolbox: undefined,
      toolboxPosition: 'start',
      verticalLayout: 'right',
      trashcan: false,
      sounds: false,
      zoom: {
        controls: false,
        wheel: true,
        startScale: 0.75,
        maxScale: 4,
        minScale: 0.25,
        scaleSpeed: 1.1
      },
      colours: {
        fieldShadow: 'rgba(255, 255, 255, 0.3)',
        dragShadowOpacity: 0.6
      }
    });

    console.log(this.props.code);
    if (this.props.code.length > 0) {
      try {
        Blockly.Xml.domToWorkspace(
          Blockly.Xml.textToDom(this.props.code),
          this.workspace_
        );
      } catch (e) {
        console.error(e);
        this.workspace_.clear();
        this.props.onCodeChange('');

      }
    }

    this.workspace_.addChangeListener(this.onChange_);
  };

  private onChange_ = () => {
    this.debounce_ = true;
    try {
      const code = Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(this.workspace_));
      flushSync(() => this.props.onCodeChange(code));
    } catch (e) {
      // console.error(e);
    }
    this.debounce_ = false;
  };

  render() {
    const { props, state } = this;
    const { theme } = props;
    const { size } = state;

    const containerStyle: React.CSSProperties = {
      width: `${size.x}px`,
      height: `${size.y}px`,
    };

    return (
      <OuterContainer theme={theme} ref={this.bindOuterContainerRef_}>
        <Container style={containerStyle} theme={theme} ref={this.bindContainerRef_} />
      </OuterContainer>
    );
  }
}

export default ScratchEditor;