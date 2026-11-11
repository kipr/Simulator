import { GRAPHICAL_DARK, GRAPHICAL_LIGHT, ThemeProps } from '../constants/theme';
import { RawVector2 } from '../../util/math/math';
import * as React from 'react';
import { styled } from 'styletron-react';

import resizeListener, { ResizeListener } from '../interface/ResizeListener';
import { flushSync } from 'react-dom';

export interface GraphicalEditorProps extends ThemeProps {
  code: string;
  onCodeChange: (code: string) => void;

  toolboxHidden?: boolean;
}

interface GraphicalEditorState {
  size: RawVector2;
}

type Props = GraphicalEditorProps;
type State = GraphicalEditorState;

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
  backgroundColor: props.theme.backgroundColor,
}));

class GraphicalEditor extends React.Component<Props, State> {
  private resizeListener_ = resizeListener(size => this.setState({ size }));

  constructor(props: Props) {
    super(props);

    this.state = {
      size: RawVector2.ZERO,
    };
  }

  private graphicalThemeStyle_: HTMLStyleElement | null = null;

  private updateGraphicalTheme_ = () => {
    if (!this.containerRef_) return;

    const graphicalTheme =
      this.props.theme.themeName === 'DARK'
        ? GRAPHICAL_DARK
        : GRAPHICAL_LIGHT;

    const blocklySvg =
      this.containerRef_.querySelector<SVGSVGElement>('.blocklySvg');

    if (blocklySvg) {
      blocklySvg.style.backgroundColor = graphicalTheme.workspace;
    }

    const flyouts =
      this.containerRef_.querySelectorAll<SVGElement>(
        '.blocklyFlyoutBackground'
      );

    flyouts.forEach(flyout => {
      flyout.style.fill = graphicalTheme.flyout;
    });

    if (!this.graphicalThemeStyle_) {
      this.graphicalThemeStyle_ = document.createElement('style');
      this.containerRef_.appendChild(this.graphicalThemeStyle_);
    }

    this.graphicalThemeStyle_.textContent = `
      .blocklyToolboxDiv,
      .scratchCategoryMenu,
      .scratchCategoryMenuHorizontal {
        background: ${graphicalTheme.toolbox} !important;
        color: ${graphicalTheme.toolboxText} !important;
      }

      .scratchCategoryMenuItem.categorySelected {
        background: ${graphicalTheme.toolboxSelected} !important;
      }

      .scratchCategoryMenuItem:hover {
        color: ${graphicalTheme.toolboxHover} !important;
      }
    `;
  };

  private debounce_: boolean;

  componentDidUpdate(prevProps: Readonly<GraphicalEditorProps>, prevState: Readonly<GraphicalEditorState>) {
    const { props: nextProps, state: nextState } = this;

    if (prevProps.theme.themeName !== nextProps.theme.themeName) {
      this.updateGraphicalTheme_();
    }

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
    const graphicalTheme = this.props.theme.themeName === 'DARK' ? GRAPHICAL_DARK : GRAPHICAL_LIGHT;

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
        dragShadowOpacity: 0.6,

        workspace: graphicalTheme.workspace,
        toolbox: graphicalTheme.toolbox,
        toolboxSelected: graphicalTheme.toolboxSelected,
        toolboxText: graphicalTheme.toolboxText,
        toolboxHover: graphicalTheme.toolboxHover,
        flyout: graphicalTheme.flyout,
      }
    });

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

      // NOTE: flushSync() is used to opt-out of React 18 batching, so that the debounceUpdate_ flag works as intended.
      // Without flushSync(), debounceUpdate_ will get set to false before the state update happens.
      // This is hacky and the whole debounceUpdate_ mechanism should be refactored.
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

export default GraphicalEditor;