import * as React from 'react';

import { Vector2, clamp } from '../math';

import { StyleProps } from '../style';
import { styled } from 'styletron-react';
import { Theme, ThemeProps } from './theme';
import resizeListener, { ResizeListener } from './ResizeListener';
import { GlobalEvents, GLOBAL_EVENTS, Slow } from '../util';

export interface ScrollAreaProps extends StyleProps, ThemeProps {
  children: React.ReactNode;
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
    startOffset: Vector2;
  }

  export type VerticalScrollParams = Omit<VerticalScroll, 'type'>;

  export const verticalScroll = (params: VerticalScrollParams): VerticalScroll => ({ type: Type.VerticalScroll, ...params });

  export const top = (action: Action) => action.top;
}

export type Action = Action.None | Action.VerticalScroll;

interface ScrollAreaState {
  outerSize: Vector2;
  innerSize: Vector2;

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
  backgroundColor: props.theme.backgroundColor
}));

const InnerContainer = styled('div', {
  overflow: 'visible',
  position: 'absolute',
  left: 0,
  width: '100%',
  paddingRight: '14px'
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

  constructor(props: Props) {
    super(props);

    this.listener_ = resizeListener(this.onResize_);

    this.state = {
      outerSize: Vector2.ZERO,
      innerSize: Vector2.ZERO,
      hover: false,
      action: Action.none(0)
    };
  }

  private onResize_ = (size: Vector2, element: Element) => {
    switch (element) {
      case this.outerRef_: {
        if (Vector2.eq(this.state.outerSize, size)) break;
        this.setState({
          outerSize: size
        });
        break;
      }
      case this.innerRef_: {
        if (Vector2.eq(this.state.innerSize, size)) break;
        
        this.setState({
          innerSize: size
        });
        break;
      }
    }
  };

  componentWillUnmount() {
    this.listener_.disconnect();
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
    const { action } = this.state;
    if (action.type !== Action.Type.None) return;

    this.onMouseMoveHandle_ = GLOBAL_EVENTS.add('onMouseMove', this.onMouseMove_);
    this.onMouseUpHandle_ = GLOBAL_EVENTS.add('onMouseUp', this.onMouseUp_);
    
    this.setState({
      action: Action.verticalScroll({
        top: action.top,
        startTop: action.top,
        startOffset: Vector2.fromClient(event)
      })
    });
  };

  private onMouseMove_ = (event: MouseEvent) => {
    const { action, innerSize, outerSize } = this.state;
    if (action.type !== Action.Type.VerticalScroll) return;

    const current = Vector2.fromClient(event);
    
    const diff = Vector2.subtract(action.startOffset, current);
    const top = clamp(0, action.startTop - diff.y, outerSize.y - this.vScrollHeight);

    this.setState({
      action: Action.verticalScroll({
        ...action,
        top,
      })
    });

    return true;
  };

  private onMouseUp_ = (event: MouseEvent) => {
    GLOBAL_EVENTS.remove(this.onMouseMoveHandle_);
    GLOBAL_EVENTS.remove(this.onMouseUpHandle_);

    this.onMouseMoveHandle_ = undefined;
    this.onMouseUpHandle_ = undefined;
    
    this.setState({
      action: Action.none(this.state.action.top)
    });

    return true;
  };

  private onWheel_ = (event: React.WheelEvent<HTMLDivElement>) => {
    
    
    const { state } = this;
    const { outerSize, action } = state;
    if (action.type !== Action.Type.None) return;

    const top = clamp(0, action.top + event.deltaY, outerSize.y - this.vScrollHeight);

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
    if (this.innerRef_) this.listener_.observe(this.innerRef_);
  };

  private get vScrollHeight() {
    const { state } = this;
    const { outerSize, innerSize } = state;
    return (innerSize.y > 0 ? outerSize.y / innerSize.y : 1) * outerSize.y;
  }

  private slow_ = new Slow();

  render() {
    const { state, props } = this;
    const { style, className, theme, children } = props;
    const { outerSize, innerSize, hover, action } = state;

    const top = Action.top(action);

    const vStyle: React.CSSProperties = {
      top: `${top}px`,
      height: `${this.vScrollHeight}px`,
      opacity: hover || action.type === Action.Type.VerticalScroll ? 1.0 : 0.0,
      cursor: action.type === Action.Type.VerticalScroll ? 'grabbing' : undefined
    };

    const innerStyle: React.CSSProperties = {
      top: `-${top * (innerSize.y / outerSize.y)}px`
    };

    return (
      <OuterContainer
        style={style}
        className={className}
        onMouseEnter={this.onMouseEnter_}
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