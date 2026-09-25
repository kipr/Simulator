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
  horizontalScroll?: boolean;
  verticalScroll?: boolean;
}

export interface ScrollAreaRef {
  getScrollContainer: () => HTMLDivElement | null;
}

export namespace Action {
  export enum Type {
    None,
    VerticalScroll,
    HorizontalScroll
  }

  export interface None {
    type: Type.None;
    top: number;
    left: number;
  }

  export const none = (top: number, left: number): None => ({
    type: Type.None,
    top,
    left
  });

  export interface VerticalScroll {
    type: Type.VerticalScroll;
    top: number;
    left: number;
    startTop: number;
    startOffset: RawVector2;
  }

  export type VerticalScrollParams = Omit<VerticalScroll, 'type'>;

  export const verticalScroll = (
    params: VerticalScrollParams
  ): VerticalScroll => ({
    type: Type.VerticalScroll,
    ...params
  });

  export interface HorizontalScroll {
    type: Type.HorizontalScroll;
    top: number;
    left: number;
    startLeft: number;
    startOffset: RawVector2;
  }

  export type HorizontalScrollParams = Omit<HorizontalScroll, 'type'>;

  export const horizontalScroll = (
    params: HorizontalScrollParams
  ): HorizontalScroll => ({
    type: Type.HorizontalScroll,
    ...params
  });

  export const top = (action: Action) => action.top;

  export const left = (action: Action) => action.left;
}

export type Action =
  | Action.None
  | Action.VerticalScroll
  | Action.HorizontalScroll;

interface ScrollAreaState {
  outerSize: RawVector2;
  innerSize: RawVector2;

  hover: boolean;

  action: Action;
}

type Props = ScrollAreaProps;
type State = ScrollAreaState;

const SCROLL_BAR_SIZE = 14;

const OuterContainer = styled('div', (props: ThemeProps) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  overflow: 'hidden',
  touchAction: 'pinch-zoom',
  contain: 'layout style',
}));

const InnerContainer = styled(
  'div',
  (props: { $horizontalScroll: boolean }) => ({
    overflow: 'visible',
    position: 'absolute',
    left: 0,
    top: 0,

    minWidth: '100%',

    width: props.$horizontalScroll
      ? 'max-content'
      : '100%',

    paddingRight: '14px',

    paddingBottom: props.$horizontalScroll
      ? '14px'
      : '0px',

    willChange: 'transform',
  })
);

const VScrollBar = styled('div', {
  position: 'absolute',
  right: '0px',
  top: '0px',
  width: `${SCROLL_BAR_SIZE}px`,
  backgroundColor: 'rgba(121, 121, 121, 0.4)',
  ':hover': {
    backgroundColor: 'rgba(121, 121, 121, 0.7)',
  },
  transition: 'opacity 0.2s',
  cursor: 'grab'
});

const HScrollBar = styled('div', {
  position: 'absolute',
  left: '0px',
  bottom: '0px',
  height: `${SCROLL_BAR_SIZE}px`,
  backgroundColor: 'rgba(121, 121, 121, 0.4)',
  ':hover': {
    backgroundColor: 'rgba(121, 121, 121, 0.7)',
  },
  transition: 'opacity 0.2s',
  cursor: 'grab'
});

const VScrollBorder = styled('div', ({ theme }: { theme: Theme }) => ({
  position: 'absolute',
  right: `${SCROLL_BAR_SIZE}px`,
  top: 0,
  width: '1px',
  height: '100%',
  borderLeft: `1px solid ${theme.borderColor}`,
}));

const HScrollBorder = styled('div', ({ theme }: { theme: Theme }) => ({
  position: 'absolute',
  left: 0,
  bottom: `${SCROLL_BAR_SIZE}px`,
  width: '100%',
  height: '1px',
  borderTop: `1px solid ${theme.borderColor}`,
}));

class ScrollArea extends React.PureComponent<Props, State> {
  private listener_: ResizeListener;

  constructor(props: Props) {
    super(props);

    this.listener_ = resizeListener(this.onResize_);

    this.state = {
      outerSize: RawVector2.ZERO,
      innerSize: RawVector2.ZERO,
      hover: false,
      action: Action.none(0, 0)
    };
  }

  private onResize_ = (size: RawVector2, element: Element) => {
    switch (element) {
      case this.outerRef_: {
        if (RawVector2.eq(this.state.outerSize, size)) {
          break;
        }

        this.updatePositionOnResize(
          this.state.innerSize,
          size
        );

        this.setState({
          outerSize: size
        });

        break;
      }

      case this.innerRef_: {
        if (RawVector2.eq(this.state.innerSize, size)) {
          break;
        }

        this.updatePositionOnResize(
          size,
          this.state.outerSize
        );

        this.setState({
          innerSize: size
        });

        break;
      }
    }
  };

  private updatePositionOnResize = (
    newInnerSize: RawVector2,
    newOuterSize: RawVector2
  ) => {
    const { action } = this.state;

    const newMaxTop = Math.max(
      newInnerSize.y - newOuterSize.y,
      0
    );

    const newMaxLeft = Math.max(
      newInnerSize.x - newOuterSize.x,
      0
    );

    let top = action.top;
    let left = action.left;

    /*
     * Preserve the original vertical autoscroll behavior:
     *
     * If autoscroll is enabled and we're currently at the bottom,
     * keep us at the new bottom when content grows.
     */
    if (
      (
        this.props.autoscroll &&
        action.type === Action.Type.None &&
        action.top >= this.maxTop
      ) ||
      action.top > newMaxTop
    ) {
      top = newMaxTop;
    }

    /*
     * Horizontal scrolling doesn't autoscroll. Just clamp it into
     * the new valid range if content shrinks.
     */
    if (action.left > newMaxLeft) {
      left = newMaxLeft;
    }

    if (
      top !== action.top ||
      left !== action.left
    ) {
      this.setState({
        action: {
          ...action,
          top,
          left
        }
      });
    }
  };

  componentWillUnmount() {
    this.listener_.disconnect();

    if (this.onMouseMoveHandle_ !== undefined) {
      GLOBAL_EVENTS.remove(this.onMouseMoveHandle_);
    }

    if (this.onMouseUpHandle_ !== undefined) {
      GLOBAL_EVENTS.remove(this.onMouseUpHandle_);
    }
  }

  componentDidUpdate(prevProps: Props) {
    /*
     * Force resize observation when children change so the inner
     * width/height gets recalculated.
     */
    if (prevProps.children !== this.props.children) {
      const wasAtBottom =
        this.props.autoscroll &&
        this.isAtBottom;

      setTimeout(() => {
        if (this.innerRef_) {
          this.listener_.unobserve(this.innerRef_);
          this.listener_.observe(this.innerRef_);

          /*
           * Explicitly measure as well. This makes horizontal content
           * changes more reliable, especially when width changes without
           * a normal resize observer event.
           */
          const rect =
            this.innerRef_.getBoundingClientRect();

          const size = RawVector2.create(
            rect.width,
            rect.height
          );

          if (!RawVector2.eq(this.state.innerSize, size)) {
            this.onResize_(size, this.innerRef_);
          }

          if (wasAtBottom) {
            setTimeout(() => {
              this.scrollToBottom();
            }, 0);
          }
        }
      }, 0);
    }
  }

  private onMouseEnter_ = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    this.setState({
      hover: true
    });
  };

  private onMouseLeave_ = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    this.setState({
      hover: false
    });
  };

  private onMouseMoveHandle_: GlobalEvents.Handle;
  private onMouseUpHandle_: GlobalEvents.Handle;

  private bindGlobalMouseEvents = () => {
    if (this.onMouseMoveHandle_ === undefined) {
      this.onMouseMoveHandle_ = GLOBAL_EVENTS.add(
        'onMouseMove',
        this.onMouseMove_
      );
    }

    if (this.onMouseUpHandle_ === undefined) {
      this.onMouseUpHandle_ = GLOBAL_EVENTS.add(
        'onMouseUp',
        this.onMouseUp_
      );
    }
  };

  private onVMouseDown_ = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const startOffset =
      RawVector2.fromClient(event);

    this.startVerticalScrolling(startOffset);
    this.bindGlobalMouseEvents();

    event.preventDefault();
  };

  private onHMouseDown_ = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const startOffset =
      RawVector2.fromClient(event);

    this.startHorizontalScrolling(startOffset);
    this.bindGlobalMouseEvents();

    event.preventDefault();
  };

  private onMouseMove_ = (event: MouseEvent) => {
    const current =
      RawVector2.fromClient(event);

    const { action } = this.state;

    if (
      action.type ===
      Action.Type.VerticalScroll
    ) {
      this.applyVerticalScrolling(
        current,
        true,
        false
      );
    }

    if (
      action.type ===
      Action.Type.HorizontalScroll
    ) {
      this.applyHorizontalScrolling(
        current,
        true,
        false
      );
    }

    return true;
  };

  private onMouseUp_ = (event: MouseEvent) => {
    if (this.onMouseMoveHandle_ !== undefined) {
      GLOBAL_EVENTS.remove(
        this.onMouseMoveHandle_
      );
    }

    if (this.onMouseUpHandle_ !== undefined) {
      GLOBAL_EVENTS.remove(
        this.onMouseUpHandle_
      );
    }

    this.onMouseMoveHandle_ = undefined;
    this.onMouseUpHandle_ = undefined;

    this.stopScrolling();

    return true;
  };

  private onWheel_ = (
    event: React.WheelEvent<HTMLDivElement>
  ) => {
    const { action } = this.state;

    if (action.type !== Action.Type.None) {
      return;
    }

    const top = clamp(
      0,
      action.top + event.deltaY,
      this.maxTop
    );

    const left = this.props.horizontalScroll
      ? clamp(
        0,
        action.left + event.deltaX,
        this.maxLeft
      )
      : 0;

    this.setState({
      action: Action.none(top, left)
    });

    if (
      top !== action.top ||
      left !== action.left
    ) {
      event.stopPropagation();
    }
  };
  private onTouchStart_ = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    const { action } = this.state;

    /*
     * If already scrolling, cancel the existing action.
     */
    if (action.type !== Action.Type.None) {
      this.stopScrolling();
      return;
    }

    /*
     * Only start scrolling with one finger.
     */
    if (event.touches.length !== 1) {
      return;
    }

    const newTouch =
      event.changedTouches[0];

    const newTouchOffset =
      RawVector2.fromClient(newTouch);

    /*
     * For touch we use VerticalScroll as the active action, but
     * apply both X and Y movement in applyTouchScrolling().
     */
    this.startVerticalScrolling(
      newTouchOffset
    );
  };

  private onTouchMove_ = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    const movedTouch =
      event.changedTouches[0];

    if (!movedTouch) {
      return;
    }

    const current =
      RawVector2.fromClient(movedTouch);

    this.applyTouchScrolling(current);
  };

  private onTouchEnd_ = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    const { action } = this.state;

    if (
      action.type ===
      Action.Type.VerticalScroll
    ) {
      const movedVertically =
        action.top !== action.startTop;

      /*
       * Horizontal touch movement is also stored on the action,
       * but VerticalScroll doesn't contain startLeft. This check
       * is primarily preserving the old click-prevention behavior.
       */
      if (movedVertically) {
        event.preventDefault();
      }
    }

    this.stopScrolling();
  };

  private onTouchCancel_ = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    this.stopScrolling();

    event.preventDefault();
  };

  private startVerticalScrolling = (
    startOffset: RawVector2
  ) => {
    const { action } = this.state;

    if (action.type !== Action.Type.None) {
      return;
    }

    this.setState({
      action: Action.verticalScroll({
        top: action.top,
        left: action.left,
        startTop: action.top,
        startOffset,
      })
    });
  };

  private startHorizontalScrolling = (
    startOffset: RawVector2
  ) => {
    const { action } = this.state;

    if (action.type !== Action.Type.None) {
      return;
    }

    this.setState({
      action: Action.horizontalScroll({
        top: action.top,
        left: action.left,
        startLeft: action.left,
        startOffset,
      })
    });
  };

  private stopScrolling = () => {
    const { action } = this.state;

    if (action.type === Action.Type.None) {
      return;
    }

    this.setState({
      action: Action.none(
        action.top,
        action.left
      )
    });
  };

  /**
   * Applies vertical mouse/touch scrolling.
   *
   * @param newOffset Current pointer position
   * @param isUsingBar Whether dragging the scrollbar thumb
   * @param invert Whether scrolling direction should be inverted
   */
  private applyVerticalScrolling = (
    newOffset: RawVector2,
    isUsingBar: boolean,
    invert: boolean
  ) => {
    const {
      action,
      outerSize,
      innerSize
    } = this.state;

    if (
      action.type !==
      Action.Type.VerticalScroll
    ) {
      return;
    }

    let top = 0;

    const maxTop = this.maxTop;

    if (maxTop > 0) {
      const diff = RawVector2.subtract(
        action.startOffset,
        newOffset
      );

      let topDiff = diff.y;

      if (isUsingBar) {
        topDiff *=
          outerSize.y > 0
            ? innerSize.y / outerSize.y
            : 1;
      }

      if (invert) {
        topDiff *= -1;
      }

      top = clamp(
        0,
        action.startTop - topDiff,
        maxTop
      );
    }

    this.setState({
      action: Action.verticalScroll({
        ...action,
        top
      })
    });
  };

  /**
   * Applies horizontal scrollbar dragging.
   */
  private applyHorizontalScrolling = (
    newOffset: RawVector2,
    isUsingBar: boolean,
    invert: boolean
  ) => {
    const {
      action,
      outerSize,
      innerSize
    } = this.state;

    if (
      action.type !==
      Action.Type.HorizontalScroll
    ) {
      return;
    }

    let left = 0;

    const maxLeft = this.maxLeft;

    if (maxLeft > 0) {
      const diff = RawVector2.subtract(
        action.startOffset,
        newOffset
      );

      let leftDiff = diff.x;

      if (isUsingBar) {
        leftDiff *=
          outerSize.x > 0
            ? innerSize.x / outerSize.x
            : 1;
      }

      if (invert) {
        leftDiff *= -1;
      }

      left = clamp(
        0,
        action.startLeft - leftDiff,
        maxLeft
      );
    }

    this.setState({
      action: Action.horizontalScroll({
        ...action,
        left
      })
    });
  };

  /**
   * Touch scrolling moves both X and Y simultaneously.
   */
  private applyTouchScrolling = (
    newOffset: RawVector2
  ) => {
    const { action } = this.state;

    if (
      action.type !==
      Action.Type.VerticalScroll
    ) {
      return;
    }

    const diff = RawVector2.subtract(
      action.startOffset,
      newOffset
    );

    const top = clamp(
      0,
      action.startTop + diff.y,
      this.maxTop
    );

    /*
     * When touch starts, action.left represents the horizontal
     * position at the beginning of the gesture.
     */
    const left = clamp(
      0,
      action.left + diff.x,
      this.maxLeft
    );

    this.setState({
      action: Action.verticalScroll({
        ...action,
        top,
        left
      })
    });
  };

  private outerRef_: HTMLDivElement;

  private bindOuterRef_ = (
    outerRef: HTMLDivElement
  ) => {
    if (this.outerRef_) {
      this.listener_.unobserve(
        this.outerRef_
      );
    }

    this.outerRef_ = outerRef;

    if (this.outerRef_) {
      this.listener_.observe(
        this.outerRef_
      );
    }
  };

  private innerRef_: HTMLDivElement;

  private bindInnerRef_ = (
    innerRef: HTMLDivElement
  ) => {
    if (this.innerRef_) {
      this.listener_.unobserve(
        this.innerRef_
      );
    }

    this.innerRef_ = innerRef;

    if (this.innerRef_) {
      this.listener_.observe(
        this.innerRef_
      );

      /*
       * Force an initial size check in case ResizeObserver
       * doesn't fire immediately.
       */
      setTimeout(() => {
        if (this.innerRef_) {
          const rect =
            this.innerRef_.getBoundingClientRect();

          const size = RawVector2.create(
            rect.width,
            rect.height
          );

          if (
            !RawVector2.eq(
              this.state.innerSize,
              size
            )
          ) {
            this.onResize_(
              size,
              this.innerRef_
            );
          }
        }
      }, 0);
    }
  };

  getScrollContainer = () => {
    return this.outerRef_;
  };

  private get vScrollHeight() {
    const {
      outerSize,
      innerSize
    } = this.state;

    if (innerSize.y <= 0) {
      return outerSize.y;
    }

    return Math.min(
      outerSize.y,
      (outerSize.y / innerSize.y) *
      outerSize.y
    );
  }

  private get hScrollWidth() {
    const {
      outerSize,
      innerSize
    } = this.state;

    if (innerSize.x <= 0) {
      return outerSize.x;
    }

    return Math.min(
      outerSize.x,
      (outerSize.x / innerSize.x) *
      outerSize.x
    );
  }

  private get maxTop() {
    const verticalScrollEnabled =
      this.props.verticalScroll !== false;

    if (!verticalScrollEnabled) {
      return 0;
    }

    return Math.max(
      this.state.innerSize.y - this.state.outerSize.y,
      0
    );
  }

  private get maxLeft() {
    if (!this.props.horizontalScroll) {
      return 0;
    }

    return Math.max(
      this.state.innerSize.x - this.state.outerSize.x,
      0
    );
  }

  private get isAtBottom() {
    const { action } = this.state;

    const maxTop = this.maxTop;

    return (
      maxTop === 0 ||
      Action.top(action) >= maxTop - 1
    );
  }

  private scrollToBottom = () => {
    const { action } = this.state;

    this.setState({
      action: Action.none(
        this.maxTop,
        action.left
      )
    });
  };

  set top(top: number) {
    const { action } = this.state;

    this.setState({
      action: Action.none(
        clamp(0, top, this.maxTop),
        action.left
      )
    });
  }

  set left(left: number) {
    const { action } = this.state;

    this.setState({
      action: Action.none(
        action.top,
        clamp(0, left, this.maxLeft)
      )
    });
  }

  render() {
    const {
      state,
      props
    } = this;

    const {
      style,
      className,
      theme,
      children
    } = props;

    const {
      outerSize,
      innerSize,
      hover,
      action
    } = state;


    const left =
      this.props.horizontalScroll
        ? Action.left(action)
        : 0;
    const horizontalScrollEnabled =
      this.props.horizontalScroll !== false;

    const verticalScrollEnabled =
      this.props.verticalScroll !== false;
    const top = verticalScrollEnabled
      ? Action.top(action)
      : 0;
    const topScrollBar =
      top *
      (
        innerSize.y > 0
          ? outerSize.y / innerSize.y
          : 1
      );

    const leftScrollBar =
      left *
      (
        innerSize.x > 0
          ? outerSize.x / innerSize.x
          : 1
      );

    const verticalScrollAvailable =
      verticalScrollEnabled && this.maxTop > 0;

    const horizontalScrollAvailable =
      this.props.horizontalScroll &&
      this.maxLeft > 0;

    const vStyle: React.CSSProperties = {
      top: `${topScrollBar}px`,
      height: `${this.vScrollHeight}px`,
      opacity:
        verticalScrollAvailable &&
          (
            hover ||
            action.type ===
            Action.Type.VerticalScroll
          )
          ? 1
          : 0,
      cursor:
        action.type ===
          Action.Type.VerticalScroll
          ? 'grabbing'
          : undefined
    };

    const hStyle: React.CSSProperties = {
      left: `${leftScrollBar}px`,
      width: `${this.hScrollWidth}px`,
      opacity:
        horizontalScrollAvailable &&
          (
            hover ||
            action.type ===
            Action.Type.HorizontalScroll
          )
          ? 1
          : 0,
      cursor:
        action.type ===
          Action.Type.HorizontalScroll
          ? 'grabbing'
          : undefined
    };

    const innerStyle = {
      ...this.props.innerStyle,
      transform: `translate(${-left}px, ${-top}px)`,
      '--scroll-left': `${left}px`,
      '--scroll-top': `${top}px`,
    } as React.CSSProperties;

    return (
      <OuterContainer
        style={style}
        className={className}
        onMouseEnter={this.onMouseEnter_}
        onMouseLeave={this.onMouseLeave_}
        onTouchStart={this.onTouchStart_}
        onTouchMove={this.onTouchMove_}
        onTouchEnd={this.onTouchEnd_}
        onTouchCancel={this.onTouchCancel_}
        ref={this.bindOuterRef_}
        theme={theme}
        onWheel={this.onWheel_}
      >
        <InnerContainer
          style={innerStyle}
          ref={this.bindInnerRef_}
          $horizontalScroll={horizontalScrollEnabled}
        >
          {children}
        </InnerContainer>

        {verticalScrollAvailable && (
          <>
            <VScrollBar
              style={vStyle}
              onMouseDown={
                this.onVMouseDown_
              }
            />

            <VScrollBorder
              theme={theme}
            />
          </>
        )}

        {horizontalScrollAvailable && (
          <>
            <HScrollBar
              style={hStyle}
              onMouseDown={
                this.onHMouseDown_
              }
            />

            <HScrollBorder
              theme={theme}
            />
          </>
        )}
      </OuterContainer>
    );
  }
}

export default ScrollArea;