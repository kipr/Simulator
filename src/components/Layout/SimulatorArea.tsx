import * as React from 'react';

import * as Sim from '../../simulator/Space';

import { styled } from 'styletron-react';

import resizeListener, { ResizeListener } from '../interface/ResizeListener';
import { RawVector2 } from '../../util/math/math';

import Loading from '../Loading';
import MotorsSwappedDialog from '../Dialog/MotorsSwappedDialog';
import { Theme } from '../constants/theme';

import LocalizedString from '../../util/LocalizedString';
import tr from '@i18n';
import { connect } from 'react-redux';
import { State as ReduxState } from '../../state';
import {
  Engine, Vector3, Quaternion, Matrix, HemisphericLight, Color3, AbstractMesh, Mesh,
  TransformNode, PointerInfo, ShadowLight, PointLight, EventState, PointerEventTypes,
  DracoCompression, HavokPlugin, Scene as babylonScene, Node as babylonNode, HighlightLayer
} from "@babylonjs/core";
import TourTarget from '../Tours/TourTarget';
import { TourRegistry } from '../../tours/TourRegistry';

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
  tourRegistry?: TourRegistry;
  onContinueTour?: () => void;
}

interface SimulatorAreaPrivateProps {
  locale: LocalizedString.Language;
}

type Props = SimulatorAreaPublicProps & SimulatorAreaPrivateProps;

interface SimulatorAreaState {
  loading: boolean;
  loadingMessage: string;
  modalDialog: ModalDialog;
  tourObject: { id: string, pos: { x: number, y: number } } | null;
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
      modalDialog: ModalDialog.NONE,
      tourObject: null
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
        Sim.Space.getInstance().setOnObjectClick?.(this.onObjectClick_);
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

  private onSizeChange_ = (size: RawVector2) => {
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

  private onObjectClick_ = (object: { id: string, pos: Vector3 }): void => {
    const screenPos = this.projectWorldToScreen_(object.pos);
    if (screenPos && object.id === 'can1') {
      this.setState({ tourObject: { id: object.id, pos: screenPos } }, () => {
        this.props.onContinueTour?.();
      });
    }

  };

  private onMotorsSwappedClose_ = (): void => {
    ModalDialog.MotorsSwapped.markShown(true);
    this.setState({ modalDialog: ModalDialog.NONE });
  };

  private projectWorldToScreen_ = (pos: Vector3): { x: number; y: number } | null => {
    if (!this.canvasRef_) return null;

    const scene = Sim.Space.getInstance().sceneBinding.bScene;
    const camera = scene?.activeCamera;

    if (!scene || !camera) return null;

    const canvas = this.canvasRef_;
    const rect = canvas.getBoundingClientRect();

    const projected = Vector3.Project(
      pos,
      Matrix.Identity(),
      scene.getTransformMatrix(),
      camera.viewport.toGlobal(
        canvas.width,
        canvas.height
      )
    );

    return {
      x: (projected.x / canvas.width) * rect.width,
      y: (projected.y / canvas.height) * rect.height,
    };
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
        {this.state.tourObject && this.props.tourRegistry && (
          <TourTarget
            registry={this.props.tourRegistry}
            targetKey="clicked-object"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: `${this.state.tourObject.pos.x}px`,
                top: `${this.state.tourObject.pos.y}px`,
                width: '17.5em',
                height: '17.5em',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
              }}
            />
          </TourTarget>
        )}
      </Container>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(SimulatorArea) as React.ComponentType<SimulatorAreaPublicProps>;
