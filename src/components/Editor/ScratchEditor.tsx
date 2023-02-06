import { ThemeProps } from 'components/theme';
import * as React from 'react';

export interface ScratchEditorProps extends ThemeProps {
  code: string;
  onCodeChange: (code: string) => void;
}

interface ScratchEditorState {
}

type Props = ScratchEditorProps;
type State = ScratchEditorState;

class ScratchEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  componentDidUpdate(prevProps: Readonly<ScratchEditorProps>, prevState: Readonly<ScratchEditorState>) {
    const nextProps = this.props;

    if (this.workspace_) {
      if (prevProps.code !== nextProps.code) {
        Blockly.Xml.domToWorkspace(undefined, this.workspace_);
      }
    }
    
  }
  
  private containerRef_: HTMLDivElement | null = null;
  private bindContainerRef_ = (ref: HTMLDivElement) => {
    if (this.containerRef_) {
      // cleanup blockly
    }

    this.containerRef_ = ref;

    if (this.containerRef_) {
      this.injectBlockly_();
    }
  }

  private workspace_: unknown;
  private injectBlockly_ = () => {
    this.workspace_ = Blockly.inject(this.containerRef_, {
      comments: true,
      disable: false,
      collapse: false,
      media: '../media/',
      readOnly: false,
      rtl: true,
      scrollbars: true,
      toolbox: undefined,
      toolboxPosition: 'start',
      horizontalLayout: 'bottom',
      trashcan: true,
      sounds: false,
      zoom: {
        controls: true,
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
  }

  render() {
    return (
      <div ref={this.bindContainerRef_} />
    );
  }
}

export default ScratchEditor;