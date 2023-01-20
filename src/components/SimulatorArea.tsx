import * as React from 'react';

import * as Sim from '../Sim';

import { styled } from 'styletron-react';

import resizeListener, { ResizeListener } from './ResizeListener';
import { Vector2 } from '../math';

import Loading from './Loading';
import MotorsSwappedDialog from './MotorsSwappedDialog';
import { Theme } from './theme';

import LocalizedString from '../util/LocalizedString';
import tr from '@i18n';
import { connect } from 'react-redux';
import { State as ReduxState } from '../state';

namespace ModalDialog {
  export enum Type {
    None,
    MotorsSwapped
  }

  export interface None {
    type: Type.None;
  }

  export const NONE: None = { type: Type.None };

  export interface MotorsSwapped {
    type: Type.MotorsSwapped;
  }

  export namespace MotorsSwapped {
    // Show until August 30th, 2022
    export const SHOW_UNTIL: Date = new Date(2022, 7, 30);

    export const markShown = (shown: boolean) => {
      try {
        window.localStorage.setItem('motors-swapped-dialog-shown', JSON.stringify(shown));
      } catch (e) {
        // ignore
      }
    };

    export const hasShown = (): boolean => {
      try {
        const shown: boolean = JSON.parse(window.localStorage.getItem('motors-swapped-dialog-shown')) as boolean;
        return shown;
      } catch (e) {
        return true;
      }
    };

    export const shouldShow = (): boolean => {
      const now = new Date();
      return now < SHOW_UNTIL && !hasShown();
    };
  }

  export const MOTORS_SWAPPED: MotorsSwapped = { type: Type.MotorsSwapped };
}

type ModalDialog = ModalDialog.None | ModalDialog.MotorsSwapped;

export interface SimulatorAreaPublicProps {
  theme: Theme;
  isSensorNoiseEnabled: boolean;
  isRealisticSensorsEnabled: boolean;
}

interface SimulatorAreaPrivateProps {
  locale: LocalizedString.Language;
}

type Props = SimulatorAreaPublicProps & SimulatorAreaPrivateProps;

interface SimulatorAreaState {
  loading: boolean;
  loadingMessage: string;
  modalDialog: ModalDialog;
}

const Container = styled('div', {
  flex: '1 1',
  position: 'relative',
  overflow: 'hidden'
});

const Canvas = styled('canvas', {
  position: 'absolute',
  ':focus': {
    outline: 'none'
  },
  touchAction: 'none',
});

export class SimulatorArea extends React.Component<Props, SimulatorAreaState> {
  private containerRef_: HTMLDivElement;
  private canvasRef_: HTMLCanvasElement;

  constructor(props: Props) {
    super(props);
    this.state = { 
      loading: true,
      loadingMessage: '',
      modalDialog: ModalDialog.NONE
    };
  }

  componentDidMount() {
    // after a few seconds of loading, show some messages to the user

    // 30 second message: still going, might have fail
    setTimeout(() => {
      if (this.state.loading) {
        this.setState({
          loadingMessage: LocalizedString.lookup(tr('This process is taking longer than expected...\nIf you have a poor internet connection, this can take some time'), this.props.locale)
        });
      }
    }, 30 * 1000);
    // 120 second message: likely failed
    setTimeout(() => {
      if (this.state.loading) {
        this.setState({
          loadingMessage: LocalizedString.lookup(tr('The simulator may have failed to load.\nPlease submit a feedback form to let us know!'), this.props.locale)
        });
      }
    }, 120 * 1000);

    // TODO: If simulator initialization fails, we should show the user an error
    Sim.Space.getInstance().ensureInitialized()
      .then(() => {
        this.setState({ 
          loading: false,
          loadingMessage: '',
          modalDialog: ModalDialog.MotorsSwapped.shouldShow()
            ? ModalDialog.MOTORS_SWAPPED
            : ModalDialog.NONE
        });
      })
      .catch(e => console.error('Simulator initialization failed', e));
  }

  private lastWidth_ = 0;
  private lastHeight_ = 0;

  private onSizeChange_ = (size: Vector2) => {
    if (this.lastHeight_ !== size.y || this.lastWidth_ !== size.x) {
      this.canvasRef_.style.width = `${size.x}px`;
      this.canvasRef_.style.height = `${size.y}px`;
      Sim.Space.getInstance().handleResize();
    }
    
    this.lastWidth_ = size.x;
    this.lastHeight_ = size.y;
  };

  private resizeListener_ = resizeListener(this.onSizeChange_);


  componentWillUnmount() {
    this.resizeListener_.disconnect();
  }

  componentDidUpdate(prevProps: Props) {
    // Check if simulation settings were changed
    if (prevProps.isSensorNoiseEnabled !== this.props.isSensorNoiseEnabled || prevProps.isRealisticSensorsEnabled !== this.props.isRealisticSensorsEnabled) {
      // Sim.Space.getInstance().updateSensorOptions(this.props.isSensorNoiseEnabled, this.props.isRealisticSensorsEnabled);
    }
  }

  private bindContainerRef_ = (ref: HTMLDivElement) => {
    if (this.containerRef_) this.resizeListener_.unobserve(this.containerRef_);
    this.containerRef_ = ref;
    if (this.containerRef_) this.resizeListener_.observe(this.containerRef_);
  };

  private bindCanvasRef_ = (ref: HTMLCanvasElement) => {
    this.canvasRef_ = ref;

    if (this.canvasRef_) {
      Sim.Space.getInstance().switchContext(this.canvasRef_);
    }
  };

  private onMotorsSwappedClose_ = (): void => {
    ModalDialog.MotorsSwapped.markShown(true);
    this.setState({ modalDialog: ModalDialog.NONE });
  };

  render() {
    const { props, state } = this;
    const { theme, locale } = props;
    const { modalDialog, loading, loadingMessage } = state;
    if (loading) {
      return (
        <Container >
          <Loading 
            message={LocalizedString.lookup(tr('Initializing Simulator...'), locale)}
            errorMessage={loadingMessage}
          />
        </Container>
      );
    } 
    return (
      <Container ref={this.bindContainerRef_}>
        <Canvas ref={this.bindCanvasRef_} />
        {modalDialog.type === ModalDialog.Type.MotorsSwapped && (
          <MotorsSwappedDialog theme={theme} onClose={this.onMotorsSwappedClose_} />
        )}
      </Container>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(SimulatorArea) as React.ComponentType<SimulatorAreaPublicProps>;
