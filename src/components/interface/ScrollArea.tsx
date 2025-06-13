import * as React from 'react';

import { RawVector2, clamp } from '../../util/math/math';

import { StyleProps } from '../../util/style';
import { styled } from 'styletron-react';
import { Theme, ThemeProps } from '../constants/theme';
import resizeListener, { ResizeListener } from './ResizeListener';
import { GlobalEvents, GLOBAL_EVENTS } from '../../util';

export interface ScrollAreaProps extends StyleProps, ThemeProps {
  children: React.ReactNode;
  autoscroll?: boolean;
  innerStyle?: React.CSSProperties;
}

export interface ScrollAreaRef {
  getScrollContainer: () => HTMLDivElement | null;
}

export namespace Action {
  export enum Type {
    None,
    VerticalScroll
  }

  export interface None {
    type: Type.None;
    top: number;
  }

  export const none = (top: number): None => ({ type: Type.None, top });

  export interface VerticalScroll {
    type: Type.VerticalScroll;
    top: number;
    startTop: number;
    startOffset: RawVector2;
  }

  export type VerticalScrollParams = Omit<VerticalScroll, 'type'>;

  export const verticalScroll = (params: VerticalScrollParams): VerticalScroll => ({ type: Type.VerticalScroll, ...params });

  export const top = (action: Action) => action.top;
}

export type Action = Action.None | Action.VerticalScroll;

interface ScrollAreaState {
  outerSize: RawVector2;
  innerSize: RawVector2;

  hover: boolean;

  action: Action;
}

type Props = ScrollAreaProps;
type State = ScrollAreaState;

const OuterContainer = styled('div', (props: ThemeProps) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  overflow: 'hidden',
  touchAction: 'pinch-zoom',
  contain: 'layout style',
}));

const InnerContainer = styled('div', {
  overflow: 'visible',
  position: 'absolute',
  left: 0,
  width: '100%',
  paddingRight: '14px',
  willChange: 'transform',
});

const VScrollBar = styled('div', {
  position: 'absolute',
  right: '0px',
  width: '14px',
  backgroundColor: `rgba(121, 121, 121, 0.4)`,
  ':hover': {
    backgroundColor: `rgba(121, 121, 121, 0.7)`,
  },
  transition: 'opacity 0.2s',
  cursor: 'grab'
});

const VScrollBorder = styled('div', ({ theme }: { theme: Theme }) => ({
  position: 'absolute',
  right: '14px',
  top: 0,
  width: '1px',
  height: '100%',
  borderLeft: `1px solid ${theme.borderColor}`,
}));

class ScrollArea extends React.PureComponent<Props, State> {
  private listener_: ResizeListener;
  private timeoutIds_: Set<NodeJS.Timeout> = new Set();

  constructor(props: Props) {
    super(props);

    this.listener_ = resizeListener(this.onResize_);

    this.state = {
      outerSize: RawVector2.ZERO,
      innerSize: RawVector2.ZERO,
      hover: false,
      action: Action.none(0)
    };
  }

  private onResize_ = (size: RawVector2, element: Element) => {
    switch (element) {
      case this.outerRef_: {
        if (RawVector2.eq(this.state.outerSize, size)) break;

        this.updateTopOnResize(this.state.innerSize, size);
        this.setState({
          outerSize: size
        });
        break;
      }
      case this.innerRef_: {
        if (RawVector2.eq(this.state.innerSize, size)) break;

        this.updateTopOnResize(size, this.state.outerSize);
        this.setState({
          innerSize: size
        });
        break;
      }
    }
  };

  private updateTopOnResize = (newInnerSize: RawVector2, newOuterSize: RawVector2) => {
    const { action } = this.state;

    // Reset top to the bottom if...
    //   a) autoscroll is enabled and currently at the bottom, or
    //   b) top is no longer within the new scroll range
    if ((this.props.autoscroll && action.type === Action.Type.None && action.top >= this.maxTop) || Action.top(action) > newInnerSize.y - newOuterSize.y) {
      this.setState({
        action: {
          ...action,
          top: Math.max(newInnerSize.y - newOuterSize.y, 0),
        }
      });
    }
  };

  componentWillUnmount() {
    this.listener_.disconnect();
  }

  componentDidUpdate(prevProps: Props) {
    // Force resize observation when children change to ensure inner size is recalculated
    if (prevProps.children !== this.props.children) {
      const wasAtBottom = this.props.autoscroll && this.isAtBottom;
      
      // Use setTimeout to ensure DOM has been updated before measuring
      setTimeout(() => {
        if (this.innerRef_) {
          this.listener_.unobserve(this.innerRef_);
          this.listener_.observe(this.innerRef_);
          
          // If autoscroll was enabled and we were at the bottom, scroll to bottom after content change
          if (wasAtBottom) {
            setTimeout(() => {
              this.scrollToBottom();
            }, 0);
          }
        }
      }, 0);
    }
  }

  private onMouseEnter_ = (event: React.MouseEvent<HTMLDivElement>) => {
    this.setState({
      hover: true
    });
  };

  private onMouseLeave_ = (event: React.MouseEvent<HTMLDivElement>) => {
    this.setState({
      hover: false
    });
  };

  private onMouseMoveHandle_: GlobalEvents.Handle;
  private onMouseUpHandle_: GlobalEvents.Handle;

  private onVMouseDown_ = (event: React.MouseEvent<HTMLDivElement>) => {
    const startOffset = RawVector2.fromClient(event);
    this.startScrolling(startOffset);

    if (this.onMouseMoveHandle_ === undefined) this.onMouseMoveHandle_ = GLOBAL_EVENTS.add('onMouseMove', this.onMouseMove_);
    if (this.onMouseUpHandle_ === undefined) this.onMouseUpHandle_ = GLOBAL_EVENTS.add('onMouseUp', this.onMouseUp_);

    event.preventDefault();
  };

  private onMouseMove_ = (event: MouseEvent) => {
    const current = RawVector2.fromClient(event);
    this.applyScrolling(current, true, false);

    return true;
  };

  private onMouseUp_ = (event: MouseEvent) => {
    if (this.onMouseMoveHandle_ !== undefined) GLOBAL_EVENTS.remove(this.onMouseMoveHandle_);
    if (this.onMouseUpHandle_ !== undefined) GLOBAL_EVENTS.remove(this.onMouseUpHandle_);
    
    this.onMouseMoveHandle_ = undefined;
    this.onMouseUpHandle_ = undefined;

    this.stopScrolling();

    return true;
  };

  private onWheel_ = (event: React.WheelEvent<HTMLDivElement>) => {
    const { state } = this;
    const { action } = state;
    if (action.type !== Action.Type.None) return;

    const maxTop = this.maxTop;
    const top = clamp(0, action.top + event.deltaY, maxTop);

    this.setState({
      action: {
        ...action,
        top
      }
    });

    if (top !== action.top) {
      event.stopPropagation();
    }
  };

  private onTouchStart_ = (event: React.TouchEvent<HTMLDivElement>) => {
    const { action } = this.state;

    // If already scrolling, cancel scrolling
    if (action.type === Action.Type.VerticalScroll) {
      this.stopScrolling();
      return;
    }

    // Only start scrolling if there's exactly one touch
    if (event.touches.length !== 1) return;

    const newTouch = event.changedTouches[0];
    const newTouchOffset = RawVector2.fromClient(newTouch);

    this.startScrolling(newTouchOffset);
  };

  private onTouchMove_ = (event: React.TouchEvent<HTMLDivElement>) => {
    const movedTouch = event.changedTouches[0];
    const current = RawVector2.fromClient(movedTouch);

    this.applyScrolling(current, false, true);
  };

  private onTouchEnd_ = (event: React.TouchEvent<HTMLDivElement>) => {
    const { action } = this.state;

    // If the user actually scrolled, prevent any default mouse actions
    if (action.type === Action.Type.VerticalScroll && action.top !== action.startTop) {
      event.preventDefault();
    }

    this.stopScrolling();
  };

  private onTouchCancel_ = (event: React.TouchEvent<HTMLDivElement>) => {
    this.stopScrolling();

    event.preventDefault();
  };

  private startScrolling = (startOffset: RawVector2) => {
    const { action } = this.state;
    if (action.type !== Action.Type.None) return;

    this.setState({
      action: Action.verticalScroll({
        top: action.top,
        startTop: action.top,
        startOffset,
      })
    });
  };

  private stopScrolling = () => {
    const { action } = this.state;
    if (action.type !== Action.Type.VerticalScroll) return;

    this.setState({
      action: Action.none(action.top)
    });
  };

  /**
   * Applies a scroll amount to the current scroll action (if there is one).
   * @param newOffset - The new scroll offset, relative to the startOffset specified in startScrolling()
   * @param isUsingBar - Whether the scroll offset refers to the scrollbar or the actual scroll area
   * @param invert - Whether the scroll direction should be inverted (for example, when using touch)
   */
  private applyScrolling = (newOffset: RawVector2, isUsingBar: boolean, invert: boolean) => {
    const { action, outerSize, innerSize } = this.state;
    if (action.type !== Action.Type.VerticalScroll) return;

    let top = 0;
    const maxTop = this.maxTop;
    if (maxTop > 0) {
      const diff = RawVector2.subtract(action.startOffset, newOffset);

      let topDiff = diff.y;
      if (isUsingBar) {
        topDiff *= (outerSize.y > 0 ? (innerSize.y / outerSize.y) : 1);
      }
      if (invert) {
        topDiff *= -1;
      }

      top = clamp(0, action.startTop - topDiff, maxTop);
    }

    this.setState({
      action: Action.verticalScroll({
        ...action,
        top,
      })
    });
  };

  private outerRef_: HTMLDivElement;
  private bindOuterRef_ = (outerRef: HTMLDivElement) => {
    if (this.outerRef_) this.listener_.unobserve(this.outerRef_);
    this.outerRef_ = outerRef;
    if (this.outerRef_) this.listener_.observe(this.outerRef_);
  };

  private innerRef_: HTMLDivElement;
  private bindInnerRef_ = (innerRef: HTMLDivElement) => {
    if (this.innerRef_) this.listener_.unobserve(this.innerRef_);
    this.innerRef_ = innerRef;
    if (this.innerRef_) {
      this.listener_.observe(this.innerRef_);
      // Force an initial size check in case the observer doesn't fire immediately
      setTimeout(() => {
        if (this.innerRef_) {
          const rect = this.innerRef_.getBoundingClientRect();
          const size = RawVector2.create(rect.width, rect.height);
          if (!RawVector2.eq(this.state.innerSize, size)) {
            this.onResize_(size, this.innerRef_);
          }
        }
      }, 0);
    }
  };

  getScrollContainer = () => {
    return this.outerRef_;
  };

  private get vScrollHeight() {
    const { state } = this;
    const { outerSize, innerSize } = state;
    return Math.min(outerSize.y, (outerSize.y / innerSize.y) * outerSize.y);
  }

  private get maxTop() {
    return Math.max(this.state.innerSize.y - this.state.outerSize.y, 0);
  }

  private get isAtBottom() {
    const { action } = this.state;
    const maxTop = this.maxTop;
    return maxTop === 0 || Action.top(action) >= maxTop - 1; // Allow 1px tolerance
  }

  private scrollToBottom = () => {
    const maxTop = this.maxTop;
    this.setState({
      action: Action.none(maxTop)
    });
  };

  set top(top: number) {
    this.setState({
      action: Action.none(top)
    });
  }

  render() {
    const { state, props } = this;
    const { style, className, theme, children } = props;
    const { outerSize, innerSize, hover, action } = state;

    const top = Action.top(action);
    const topScrollBar = top * (innerSize.y > 0 ? (outerSize.y / innerSize.y) : 1);

    const vStyle: React.CSSProperties = {
      top: `${topScrollBar}px`,
      height: `${this.vScrollHeight}px`,
      opacity: hover || action.type === Action.Type.VerticalScroll ? 1.0 : 0.0,
      cursor: action.type === Action.Type.VerticalScroll ? 'grabbing' : undefined
    };

    const innerStyle: React.CSSProperties = {
      ...this.props.innerStyle,
      transform: `translateY(-${top}px)`,
    };

    return (
      <OuterContainer
        style={style}
        className={className}
        onMouseEnter={this.onMouseEnter_}
        onTouchStart={this.onTouchStart_}
        onTouchMove={this.onTouchMove_}
        onTouchEnd={this.onTouchEnd_}
        onTouchCancel={this.onTouchCancel_}
        onMouseLeave={this.onMouseLeave_}
        ref={this.bindOuterRef_}
        theme={theme}
        onWheel={this.onWheel_}
      >
        <InnerContainer
          style={innerStyle}
          ref={this.bindInnerRef_}
        >
          {children}
        </InnerContainer>
        <VScrollBar
          style={vStyle}
          onMouseDown={this.onVMouseDown_}
        />
        <VScrollBorder theme={theme} />
      </OuterContainer>
    );
  }
}

export default ScrollArea;
