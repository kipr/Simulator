import React from "react";
import { createPortal } from "react-dom";
import { TourRegistry } from "../../tours/TourRegistry";
import { Rect, TourPlacement, TourStep } from "../../tours/Tours";
import { DARK, ThemeProps } from "../constants/theme";
import { StyleProps } from "../../util/style";
import { styled } from "styletron-react";
import ComboBox from "../interface/ComboBox";
import ResizeableComboBox from "ivygate/dist/src/components/ResizeableComboBox";
import Dict from "util/objectOps/Dict";


export interface GuidedTourProps extends ThemeProps, StyleProps {
  isOpen: boolean;
  steps: TourStep[];
  registry: TourRegistry;
  continueTourFlag?: boolean;

  onClose: () => void;
  onFinish?: () => void;
  onSkip?: () => void;

  onBackClick?: (stepIndex: number) => void;
  onNextClick?: (stepIndex: number) => void;


  initialStepIndex?: number;
  lockScroll?: boolean;
  dimopacity?: number; // 0..1

  /** If true, clicking the dim area closes */
  closeOnBackdropClick?: boolean;
  scrollContainer?: HTMLElement | null;


}

interface GuidedTourState {
  stepIndex: number;
  rect: Rect | null;
  selectedTourSection?: string;
  subSteps?: Dict<TourStep[]>;
}

type Props = GuidedTourProps;
type State = GuidedTourState;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}


const Spotlight = styled('div', (props: ThemeProps & { rect: Rect | null; dimopacity: number }) => ({
  position: "fixed",
  top: props.rect ? `${props.rect.top}px` : 0,
  left: props.rect ? `${props.rect.left}px` : 0,
  width: props.rect ? `${props.rect.width}px` : '100%',
  height: props.rect ? `${props.rect.height}px` : '100%',
  borderRadius: props.rect ? '16px' : 0,
  borderColor: "pink",
  borderWidth: "2px",
  boxShadow: props.rect ? `0 0 0 9999px rgba(0,0,0,${props.dimopacity})` : 'none',
  background: !props.rect ? `rgba(0,0,0,${props.dimopacity})` : 'transparent',
  pointerEvents: "none",
  transition:
    "top 160ms ease, left 160ms ease, width 160ms ease, height 160ms ease",

}));
type ToolTipProps = ThemeProps & {
  rect: Rect;
  placement: TourPlacement;
};

const ToolTip = styled('div', (props: ThemeProps & ToolTipProps) => {
  const pos = toolTipPos(props.rect, props.placement);

  return {
    position: "fixed",
    background: "white",
    color: "#111",
    borderRadius: "16px",

    boxShadow: "0 12px 40px rgba(0,0,0,0.28)",
    padding: "16px",
    zIndex: 10000,
    fontFamily:
      'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',

    // position from toolTipPos
    top: `${pos.top}px`,
    left: `${pos.left}px`,
    height: "auto",
    width: `${pos.width}px`,
    boxSizing: "border-box",

  };
});

const PassthroughHole = styled('div', (props: ThemeProps & { rect: Rect }) => ({
  position: "fixed",
  top: `${props.rect.top}px`,
  left: `${props.rect.left}px`,
  width: `${props.rect.width}px`,
  height: `${props.rect.height}px`,
  borderRadius: "16px",
  background: 'transparent',
  pointerEvents: "none",
  display: !props.rect ? "none" : "block",
}));

const ButtonNavContainer = styled('div', {
  display: "flex",
  gap: '8px',

});

const StepIndicatorContainer = styled('div', (props: ThemeProps) => ({
  fontSize: '12px',
  opacity: '0.7',
}));

const TitleContainer = styled('div', (props: ThemeProps) => ({
  fontSize: '16px',
  fontWeight: 800,
  marginBottom: '6px',
}));

function toolTipPos(rect: Rect, placement: TourPlacement) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const w = 360;
  const h = 190;
  const gap = 14;

  const candidates = {
    bottom: { top: rect.top + rect.height + gap, left: rect.left },
    top: { top: rect.top - h - gap, left: rect.left },
    right: { top: rect.top, left: rect.left + rect.width + gap },
    left: { top: rect.top, left: rect.left - w - gap },
  };

  let pos = candidates.bottom;

  if (placement === "top") pos = candidates.top;
  else if (placement === "left") pos = candidates.left;
  else if (placement === "right") pos = candidates.right;
  else if (placement === "auto") {
    // bottom -> top -> right -> left
    if (candidates.bottom.top + h <= vh - 22) pos = candidates.bottom;
    else if (candidates.top.top >= 22) pos = candidates.top;
    else if (candidates.right.left + w <= vw - 22) pos = candidates.right;
    else pos = candidates.left;
  }

  return {
    top: clamp(pos.top, 22, vh - h - 22),
    left: clamp(pos.left, 22, vw - w - 22),
    width: w,
  };
}

const StyledComboBox = styled(ResizeableComboBox, (props: ThemeProps & { selectedType?: string }) => ({
  padding: 0,
  zIndex: 10000,
  color: "#111",

}));



export class GuidedTour extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      stepIndex: props.initialStepIndex ?? 0,
      rect: null,
      selectedTourSection: props.steps[1]?.subTourSteps ? Object.keys(props.steps[1].subTourSteps)[0] : undefined,
      subSteps: props.steps[1]?.subTourSteps,
    };


  }
  private portalEl: HTMLDivElement | null = null;
  private rafMeasure: number | null = null;
  private prevBodyOverflow: string | null = null;
  private targetClickCleanup: (() => void) | null = null;
  private scrollEl: HTMLElement | null = null;
  private prevComboBoxRootZIndex: string | null = null;
  private prevComboBoxRootPointerEvents: string | null = null;

  componentDidMount() {
    this.ensurePortal();
    window.addEventListener("resize", this.onWindowChange, { passive: true });
    window.addEventListener("scroll", this.onWindowChange, { passive: true });
    this.attachScrollListener(this.props.scrollContainer ?? null);
    if (this.props.isOpen) this.openTour();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {

    /*
      Continue tour flag needed because some tour steps trigger dialogs or other
      UI that require waiting for a target to appear before advancing the tour.
    */
    if (prevProps.continueTourFlag !== this.props.continueTourFlag && this.props.continueTourFlag) {
      const nextStepIndex = this.state.stepIndex + 1;
      if (nextStepIndex < this.props.steps.length) {
        this.setState({ stepIndex: nextStepIndex },
          () => {
            this.measure(true);
            this.props.onNextClick(nextStepIndex);

          });

      }
    }

    // open/close
    if (prevProps.scrollContainer !== this.props.scrollContainer) {
      this.attachScrollListener(this.props.scrollContainer ?? null);
      if (this.props.isOpen) this.measure(false);
    }

    if (!prevProps.isOpen && this.props.isOpen) {
      this.setState(
        { stepIndex: this.props.initialStepIndex ?? 0, rect: null },
        () => this.openTour()
      );
      return;
    }
    if (prevProps.isOpen && !this.props.isOpen) {
      this.closeTourCleanup();
      return;
    }

    // if steps changed, clamp index
    if (prevProps.steps !== this.props.steps) {
      const max = Math.max(0, this.props.steps.length - 1);
      if (this.state.stepIndex > max) {
        this.setState({ stepIndex: max }, () => this.measure(true));
      }
    }

    // step changed while open
    if (this.props.isOpen && prevState.stepIndex !== this.state.stepIndex) {
      const prevStep = prevProps.steps[prevState.stepIndex];
      if (prevStep?.onExit) prevStep.onExit();

      const nextStep = this.props.steps[this.state.stepIndex];
      if (nextStep?.onEnter) nextStep.onEnter();

      this.measure(true);
    }

    // registry object swapped
    if (this.props.isOpen && prevProps.registry !== this.props.registry) {
      this.measure(false);
    }
  }

  componentWillUnmount() {
    this.detachScrollListener();
    window.removeEventListener("resize", this.onWindowChange);
    window.removeEventListener("scroll", this.onWindowChange);
    this.closeTourCleanup();
    this.destroyPortal();
    this.cancelMeasure();
  }
  private attachScrollListener(el: HTMLElement | null) {
    if (this.scrollEl === el) return;
    if (this.scrollEl) this.scrollEl.removeEventListener("scroll", this.onWindowChange);
    this.scrollEl = el;
    if (this.scrollEl) this.scrollEl.addEventListener("scroll", this.onWindowChange, { passive: true });
  }

  private detachScrollListener() {
    if (this.scrollEl) this.scrollEl.removeEventListener("scroll", this.onWindowChange);
    this.scrollEl = null;
  }
  private ensurePortal() {
    if (this.portalEl) return;
    const el = document.createElement("div");
    el.setAttribute("data-guided-tour-portal", "true");
    document.body.appendChild(el);
    this.portalEl = el;
  }

  private destroyPortal() {
    if (!this.portalEl) return;
    document.body.removeChild(this.portalEl);
    this.portalEl = null;
  }

  private cancelMeasure() {
    if (this.rafMeasure !== null) {
      cancelAnimationFrame(this.rafMeasure);
      this.rafMeasure = null;
    }
  }

  private onWindowChange = () => {
    if (!this.props.isOpen) return;
    this.measure(false);
  };

  private openTour() {
    const step = this.currentStep();
    if (step?.onEnter) step.onEnter();

    if (this.props.lockScroll) {
      this.prevBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    const comboBoxRoot = document.getElementById("combo-box-root");
    if (comboBoxRoot) {
      this.prevComboBoxRootZIndex = comboBoxRoot.style.zIndex;
      this.prevComboBoxRootPointerEvents = comboBoxRoot.style.pointerEvents;

      comboBoxRoot.style.zIndex = "10050";
      comboBoxRoot.style.pointerEvents = "none";
    }

    this.measure(true);
    this.bindAdvanceOnTargetClick();
  }

  private closeTourCleanup() {
    const step = this.currentStep();
    if (step?.onExit) step.onExit();

    this.unbindAdvanceOnTargetClick();

    if (this.props.lockScroll && this.prevBodyOverflow !== null) {
      document.body.style.overflow = this.prevBodyOverflow;
      this.prevBodyOverflow = null;
    }
    const comboBoxRoot = document.getElementById("combo-box-root");
    if (comboBoxRoot) {
      comboBoxRoot.style.zIndex = this.prevComboBoxRootZIndex ?? "";
      comboBoxRoot.style.pointerEvents = this.prevComboBoxRootPointerEvents ?? "";
    }
    this.cancelMeasure();
  }

  private currentStep(): TourStep | undefined {
    return this.props.steps[this.state.stepIndex];
  }
  private waitForTarget = (targetKey: string, timeout: number): Promise<HTMLElement | null> => {
    return new Promise((resolve) => {
      const start = Date.now();

      const check = () => {
        const el = this.props.registry.get(targetKey);

        if (el) {
          resolve(el);
          return;
        }

        if (Date.now() - start > timeout) {
          void this.waitForTarget(targetKey, timeout).then(resolve); // try again after timeout
          return;
        }

        requestAnimationFrame(check);
      };

      check();
    });
  };

  public advanceWhenTargetReady = async (targetKey: string, timeout = 1000) => {
    const el = await this.waitForTarget(targetKey, timeout);
    if (el) {
      this.next();
    }
  };

  private bindAdvanceOnTargetClick() {
    this.unbindAdvanceOnTargetClick();
    const step = this.currentStep();
    if (!this.props.isOpen || !step?.advanceOnTargetClick) return;

    const el = this.props.registry.get(step.targetKey);
    if (!el) return;

    const handler = (e: Event) => {

      const nextStep = this.props.steps[this.state.stepIndex + 1];
      if (!nextStep) {
        this.next();
        return;
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          void (async () => {
            const nextEl = await this.waitForTarget(nextStep.targetKey, 3000);
            if (nextEl) {
              this.next();
            }
          })();
        });
      });
    };
    el.addEventListener("click", handler, true);
    this.targetClickCleanup = () => el.removeEventListener("click", handler, true);
  }

  private unbindAdvanceOnTargetClick() {
    if (this.targetClickCleanup) {
      this.targetClickCleanup();
      this.targetClickCleanup = null;
    }
  }
  private centerInContainer(targetEl: HTMLElement, container: HTMLElement) {
    const c = container.getBoundingClientRect();
    const r = targetEl.getBoundingClientRect();
    const targetCenterY = (r.top - c.top) + container.scrollTop + r.height / 2;
    const nextScrollTop = targetCenterY - container.clientHeight / 2;

    container.scrollTop = nextScrollTop;
  }
  private measure(scrollIntoView: boolean) {
    this.cancelMeasure();

    this.rafMeasure = requestAnimationFrame(() => {
      void (async () => {
        const step = this.currentStep();
        if (!step) {
          this.setState({ rect: null });
          return;
        }

        const el = await this.waitForTarget(step.targetKey, 3000);
        if (!el) {
          this.setState({ rect: null });
          return;
        }

        if (scrollIntoView) {
          try {
            if (this.props.scrollContainer) {
              this.centerInContainer(el, this.props.scrollContainer);
            } else {
              el.scrollIntoView({ block: "center", inline: "nearest" });
            }
          } catch {
            // ignore
          }
        }

        const pad = step.padding ?? 10;
        const raw = el.getBoundingClientRect();
        const clipped = this.getClippedRect(el, raw);

        if (!clipped || clipped.width <= 0 || clipped.height <= 0) {
          this.setState({ rect: null });
          return;
        }

        this.setState({
          rect: {
            top: clipped.top - pad,
            left: clipped.left - pad,
            width: clipped.width + pad * 2,
            height: clipped.height + pad * 2,
          },
        });

        this.bindAdvanceOnTargetClick();
      })();
    });
  }

  private intersectRects(a: Rect, b: Rect): Rect | null {
    const left = Math.max(a.left, b.left);
    const top = Math.max(a.top, b.top);
    const right = Math.min(a.left + a.width, b.left + b.width);
    const bottom = Math.min(a.top + a.height, b.top + b.height);

    const width = right - left;
    const height = bottom - top;

    if (width <= 0 || height <= 0) return null;

    return { top, left, width, height };
  }

  private rectFromDomRect(r: DOMRect): Rect {
    return {
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
    };
  }

  private isClippingElement(el: HTMLElement): boolean {
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;
    const overflow = style.overflow;

    const clips =
      ["hidden", "auto", "scroll", "clip"].includes(overflow) ||
      ["hidden", "auto", "scroll", "clip"].includes(overflowX) ||
      ["hidden", "auto", "scroll", "clip"].includes(overflowY);

    return clips;
  }

  private getClippedRect(target: HTMLElement, initial: DOMRect): Rect | null {
    let rect: Rect | null = this.rectFromDomRect(initial);

    // Always clamp to viewport
    rect = this.intersectRects(rect, {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    if (!rect) return null;

    // Prefer an explicitly marked clamp container if present
    const explicitClamp = target.closest("[data-tour-clamp]") as HTMLElement | null;
    if (explicitClamp) {
      rect = this.intersectRects(rect, this.rectFromDomRect(explicitClamp.getBoundingClientRect()));
      return rect;
    }

    // Otherwise intersect with all clipping ancestors
    let node = target.parentElement;
    while (node && node !== document.body) {
      if (this.isClippingElement(node)) {
        rect = this.intersectRects(rect, this.rectFromDomRect(node.getBoundingClientRect()));
        if (!rect) return null;
      }
      node = node.parentElement;
    }

    // Also clamp to provided scroll container if present
    if (this.props.scrollContainer) {
      rect = this.intersectRects(
        rect,
        this.rectFromDomRect(this.props.scrollContainer.getBoundingClientRect())
      );
    }

    return rect;
  }
  private next = () => {
    console.log("Next rect:", this.state.rect);
    console.log("Next props:", this.props);
    const last = this.props.steps.length - 1;
    if (this.state.stepIndex >= last) {
      this.finish();
      return;
    }
    this.props.onNextClick?.(this.state.stepIndex + 1);
    this.setState((s) => ({ stepIndex: s.stepIndex + 1 }));
  };

  private back = () => {
    this.props.onBackClick?.(Math.max(0, this.state.stepIndex - 1));
    this.setState((s) => ({ stepIndex: Math.max(0, s.stepIndex - 1) }));
  };

  private finish = () => {
    if (this.props.onFinish) this.props.onFinish();
    this.props.onClose();
  };

  private skip = () => {
    this.props.onSkip();
  };

  private go = () => {
    const { subSteps, selectedTourSection } = this.state;

    const selectedSteps = subSteps?.[selectedTourSection ?? ""];

    if (selectedSteps?.length) {
      const firstStep = selectedSteps[0];

      const newStepIndex = this.props.steps.findIndex(
        (step) => step.id === firstStep.id
      );

      if (newStepIndex !== -1) {
        this.setState({ stepIndex: newStepIndex, rect: null });
      }
    }
  };

  private onBackdropClick = () => {
    if (this.props.closeOnBackdropClick) this.skip();
  };
  private onSelect_ = (index: number, option: ComboBox.Option) => {
    const { props } = this;
    console.log("Selected tour section", option.data);
    this.setState({
      selectedTourSection: option.data as string,
    })
  };
  render() {
    if (!this.props.isOpen || !this.portalEl) return null;
    const { props, state } = this;
    const { subSteps } = state;
    const theme = DARK;
    const step = this.currentStep();
    if (!step) return null;

    const rect = this.state.rect;
    const dimopacity = this.props.dimopacity ?? 0.65;
    console.log("guidedtour steps:", this.props.steps);
    console.log("subtourSteps:", step.subTourSteps);
    const allowTargetInteraction = step.allowTargetInteraction !== false;
    console.log("allowTargetInteraction:", allowTargetInteraction);
    const keys = Object.keys(this.props.steps[0]?.subTourSteps ?? {});
    console.log("subtour keys:", keys);

    const OPTIONS: ComboBox.Option[] =
      Object.keys(this.props.steps[1]?.subTourSteps ?? {}).map((key) => ({
        text: key,
        data: key,
      }));

    console.log("options:", OPTIONS);

    const tooltipStyle =
      rect !== null ? toolTipPos(rect, step.placement ?? "auto") : { top: 24, left: 24, width: 360 };
    const index = OPTIONS.findIndex(option => option.data === this.state.selectedTourSection);

    const GAP = 2;
    const top = Math.max(0, rect?.top - GAP);
    const left = Math.max(0, rect?.left - GAP);
    const right = (rect?.left ?? 0) + (rect?.width ?? 0) + GAP;
    const bottom = (rect?.top ?? 0) + (rect?.height ?? 0) + GAP;
    const overlay = (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          pointerEvents: "none",
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Click-catcher areas around the target */}
        {/* {allowTargetInteraction && rect ? (
          <>
            <div
              onClick={this.onBackdropClick}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                height: rect.top,
                background: "transparent",
                pointerEvents: "auto",
              }}
            />

            <div
              onClick={this.onBackdropClick}
              style={{
                position: "fixed",
                top: rect.top,
                left: 0,
                width: rect.left,
                height: rect.height,
                background: "transparent",
                pointerEvents: "auto",
              }}
            />

            <div
              onClick={this.onBackdropClick}
              style={{
                position: "fixed",
                top: rect.top,
                left: rect.left + rect.width,
                right: 0,
                height: rect.height,
                background: "transparent",
                pointerEvents: "auto",
              }}
            />

            <div
              onClick={this.onBackdropClick}
              style={{
                position: "fixed",
                top: rect.top + rect.height,
                left: 0,
                right: 0,
                bottom: 0,
                background: "transparent",
                pointerEvents: "auto",
              }}
            />
          </>
        ) : (
          <div
            onClick={this.onBackdropClick}
            style={{
              position: "fixed",
              inset: 0,
              background: "transparent",
              pointerEvents: "auto",
            }}
          />
        )} */}
        {/* {!allowTargetInteraction && (
          <div
            onClick={this.onBackdropClick}
            style={{
              position: "fixed",
              inset: 0,
              background: "transparent",
              pointerEvents: "auto",
            }}
          />
        )} */}
        {allowTargetInteraction && rect ? (
          <>
            <div
              onClick={this.onBackdropClick}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                height: Math.max(0, top),
                background: "transparent",
                pointerEvents: "auto",
              }}
            />

            <div
              onClick={this.onBackdropClick}
              style={{
                position: "fixed",
                top,
                left: 0,
                width: Math.max(0, left),
                height: Math.max(0, bottom - top),
                background: "transparent",
                pointerEvents: "auto",
              }}
            />

            <div
              onClick={this.onBackdropClick}
              style={{
                position: "fixed",
                top,
                left: right,
                right: 0,
                height: Math.max(0, bottom - top),
                background: "transparent",
                pointerEvents: "auto",
              }}
            />

            <div
              onClick={this.onBackdropClick}
              style={{
                position: "fixed",
                top: bottom,
                left: 0,
                right: 0,
                bottom: 0,
                background: "transparent",
                pointerEvents: "auto",
              }}
            />
          </>
        ) : (
          <div
            onClick={this.onBackdropClick}
            style={{
              position: "fixed",
              inset: 0,
              background: "transparent",
              pointerEvents: "auto",
            }}
          />
        )}
        <Spotlight theme={theme} rect={rect} dimopacity={dimopacity} />

        {allowTargetInteraction && rect !== null && (
          <PassthroughHole rect={rect} theme={theme} />
        )}

        <ToolTip
          style={{
            ...tooltipStyle,
            pointerEvents: "auto",
          }}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          theme={theme}
          rect={{ ...tooltipStyle }}
          placement={"auto"}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "start" }}>
            <div style={{ flex: 1 }}>
              {step.title && (
                <TitleContainer theme={theme}>
                  {step.title}
                </TitleContainer>
              )}
              <div style={{ fontSize: 14, lineHeight: 1.35 }}>{step.content}</div>
            </div>

            <button
              onClick={this.skip}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
              }}
              aria-label="Close tour"
              title="Close"
            >
              ×
            </button>
          </div>

          <div
            style={{
              marginTop: 14,
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <StepIndicatorContainer theme={theme}>
              Step {this.state.stepIndex + 1} of {this.props.steps.length}
            </StepIndicatorContainer>

            <ButtonNavContainer>
              {step.noBackButton ? null : (<button
                onClick={this.back}
                disabled={this.state.stepIndex === 0}
                style={btnStyle(this.state.stepIndex === 0, false)}
              >
                {step.backLabel ?? "Back"}
              </button>)}

              {step.noNextButton ? null : (<button onClick={this.next} style={btnStyle(false, true)}>
                {this.state.stepIndex === this.props.steps.length - 1
                  ? step.doneLabel ?? "Done"
                  : step.nextLabel ?? "Next"}
              </button>)}

              <button onClick={this.skip} style={btnStyle(false, false)}>
                {step.skipLabel ?? "Skip"}
              </button>
            </ButtonNavContainer>

          </div>
          {subSteps ? (<div
            style={{
              marginTop: 10,
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: 10,
            }}
          >
            <StepIndicatorContainer theme={theme}>
              Tour Sections:
            </StepIndicatorContainer>
            <StyledComboBox
              minimal
              options={OPTIONS}
              onSelect={this.onSelect_}
              index={index}
              theme={theme}
              mainWidth={'4em'}
              mainHeight={'1.5em'}
              mainFontSize={'0.9em'}
            />
            <button onClick={this.go} style={btnStyle(false, false)}>
              {"Go"}
            </button>
          </div>) : null}
        </ToolTip>
      </div>
    );

    return createPortal(overlay, this.portalEl);
  }
}

function btnStyle(disabled: boolean, primary: boolean): React.CSSProperties {
  return {
    padding: "8px 12px",
    borderRadius: 12,
    border: primary ? "1px solid #111" : "1px solid rgba(0,0,0,0.2)",
    background: disabled ? "rgba(0,0,0,0.06)" : primary ? "#111" : "white",
    color: disabled ? "rgba(0,0,0,0.4)" : primary ? "white" : "#111",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 13,
    fontWeight: 700,
  };
}