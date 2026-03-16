import React from "react";
import { createPortal } from "react-dom";
import { TourRegistry } from "../../tours/TourRegistry";
import { Rect, TourPlacement, TourStep } from "../../tours/Tours";
import { DARK, ThemeProps } from "../constants/theme";
import { StyleProps } from "../../util/style";
import { styled } from "styletron-react";
import { to } from "colorjs.io/fn";


export interface GuidedTourProps extends ThemeProps, StyleProps {
  isOpen: boolean;
  steps: TourStep[];
  registry: TourRegistry;

  onClose: () => void;
  onFinish?: () => void;
  onSkip?: () => void;

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
}

type Props = GuidedTourProps
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
    width: `${pos.width}px`,
    height: `${pos.height}px`,
  };
});

const PassthroughHole = styled('div', (props: ThemeProps & { rect: Rect }) => ({
  position: "fixed",
  top: `${props.rect.top}px`,
  left: `${props.rect.left}px`,
  width: `${props.rect.width}px`,
  height: `${props.rect.height}px`,
  borderRadius: "16px",
  background: 'transparent', // for debugging
  pointerEvents: "none", // key: let events reach the 
  display: !props.rect ? "none" : "block",
}));







function toolTipPos(rect: Rect, placement: TourPlacement) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const w = 360;
  const h = 170;
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
    if (candidates.bottom.top + h <= vh - 12) pos = candidates.bottom;
    else if (candidates.top.top >= 12) pos = candidates.top;
    else if (candidates.right.left + w <= vw - 12) pos = candidates.right;
    else pos = candidates.left;
  }

  return {
    top: clamp(pos.top, 12, vh - h - 12),
    left: clamp(pos.left, 12, vw - w - 12),
    width: w,
    height: h,
  };
}

export class GuidedTour extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      stepIndex: props.initialStepIndex ?? 0,
      rect: null,
    };


  }
  private portalEl: HTMLDivElement | null = null;
  private rafMeasure: number | null = null;
  private prevBodyOverflow: string | null = null;
  private targetClickCleanup: (() => void) | null = null;
  private scrollEl: HTMLElement | null = null;

  componentDidMount() {
    this.ensurePortal();
    window.addEventListener("resize", this.onWindowChange, { passive: true });
    window.addEventListener("scroll", this.onWindowChange, { passive: true });
    this.attachScrollListener(this.props.scrollContainer ?? null);
    if (this.props.isOpen) this.openTour();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
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
    if (this.scrollEl) this.scrollEl.addEventListener("scroll", this.onWindowChange, { passive: true } as any);
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
    this.cancelMeasure();
  }

  private currentStep(): TourStep | undefined {
    return this.props.steps[this.state.stepIndex];
  }
  private waitForTarget = (targetKey: string, timeout = 1000): Promise<HTMLElement | null> => {
    return new Promise((resolve) => {
      const start = Date.now();

      const check = () => {
        const el = this.props.registry.get(targetKey);
        if (el) {
          resolve(el);
          return;
        }

        if (Date.now() - start > timeout) {
          resolve(null);
          return;
        }

        requestAnimationFrame(check);
      };

      check();
    });
  };
  private bindAdvanceOnTargetClick() {
    this.unbindAdvanceOnTargetClick();
    const step = this.currentStep();
    if (!this.props.isOpen || !step?.advanceOnTargetClick) return;

    const el = this.props.registry.get(step.targetKey);
    if (!el) return;

    const handler = (e: Event) => {
      //e.stopPropagation();

      const nextStep = this.props.steps[this.state.stepIndex + 1];
      if (!nextStep) {
        this.next();
        return;
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(async () => {
          await this.waitForTarget(nextStep.targetKey, 1000);
          this.next();
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

    // target center relative to container scroll space
    const targetCenterY = (r.top - c.top) + container.scrollTop + r.height / 2;
    const nextScrollTop = targetCenterY - container.clientHeight / 2;

    container.scrollTop = nextScrollTop;
  }
  private measure(scrollIntoView: boolean) {
    this.cancelMeasure();

    this.rafMeasure = requestAnimationFrame(() => {
      const step = this.currentStep();
      if (!step) {
        this.setState({ rect: null });
        return;
      }

      const el = this.props.registry.get(step.targetKey);
      if (!el) {
        this.setState({ rect: null });
        return;
      }

      if (scrollIntoView) {
        try {
          this.centerInContainer(el, this.props.scrollContainer!);
        } catch {
          // ignore
        }
      }

      const r = el.getBoundingClientRect();
      const pad = step.padding ?? 10;

      this.setState({
        rect: {
          top: r.top - pad,
          left: r.left - pad,
          width: r.width + pad * 2,
          height: r.height + pad * 2,
        },
      });

      this.bindAdvanceOnTargetClick();
    });
  }

  private next = () => {
    const last = this.props.steps.length - 1;
    if (this.state.stepIndex >= last) {
      this.finish();
      return;
    }
    this.setState((s) => ({ stepIndex: s.stepIndex + 1 }));
  };

  private back = () => {
    this.setState((s) => ({ stepIndex: Math.max(0, s.stepIndex - 1) }));
  };

  private finish = () => {
    if (this.props.onFinish) this.props.onFinish();
    this.props.onClose();
  };

  private skip = () => {
    this.props.onSkip();
  };

  private onBackdropClick = () => {
    if (this.props.closeOnBackdropClick) this.skip();
  };

  render() {
    if (!this.props.isOpen || !this.portalEl) return null;
    const theme = DARK;
    const step = this.currentStep();
    if (!step) return null;

    const rect = this.state.rect;
    const dimopacity = this.props.dimopacity ?? 0.65;

    const allowTargetInteraction = step.allowTargetInteraction !== false;

    const tooltipStyle =
      rect != null ? toolTipPos(rect, step.placement ?? "auto") : { top: 24, left: 24, width: 360, height: 170 };

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
        {allowTargetInteraction && rect ? (
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
        )}

        <Spotlight theme={theme} rect={rect} dimopacity={dimopacity} />

        {allowTargetInteraction && rect != null && (
          <PassthroughHole rect={rect} theme={theme} />
        )}

        <ToolTip
          style={{
            ...tooltipStyle,
            pointerEvents: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
          theme={theme}
          rect={{ ...tooltipStyle }}
          placement={"auto"}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "start" }}>
            <div style={{ flex: 1 }}>
              {step.title && (
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>
                  {step.title}
                </div>
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
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Step {this.state.stepIndex + 1} of {this.props.steps.length}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={this.back}
                disabled={this.state.stepIndex === 0}
                style={btnStyle(this.state.stepIndex === 0, false)}
              >
                {step.backLabel ?? "Back"}
              </button>

              <button onClick={this.next} style={btnStyle(false, true)}>
                {this.state.stepIndex === this.props.steps.length - 1
                  ? step.doneLabel ?? "Done"
                  : step.nextLabel ?? "Next"}
              </button>

              <button onClick={this.skip} style={btnStyle(false, false)}>
                {step.skipLabel ?? "Skip"}
              </button>
            </div>
          </div>
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