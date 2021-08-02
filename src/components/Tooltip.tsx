import * as React from 'react';
import * as ReactDom from 'react-dom';

import { ThemeProps } from "./theme";

import { Rectangle, Vector2 } from '../math';
import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { GLOBAL_EVENTS } from '../util';

export interface TooltipProps extends ThemeProps, StyleProps {
  target: Tooltip.Target;
  contentHint: Tooltip.ContentHint;

  children: unknown;
}

interface TooltipState {
  position: Vector2;
}

type Props = TooltipProps;
type State = TooltipState;

const Container = styled('div', (props: ThemeProps) => ({
  position: 'absolute',
  borderRadius: `${props.theme.borderRadius}px`,
  backgroundColor: props.theme.backgroundColor,
  border: `1px solid ${props.theme.borderColor}`,
  padding: `${props.theme.itemPadding}px`,
  transform: `translate(-50%, -100%)`,
  color: props.theme.color,
  userSelect: 'none',
  fontSize: '0.8em',
  boxShadow: `0px 0px 20px 20px rgba(0,0,0,0.3)`,
  transition: 'box-shadow 0.2s'
}));

const TOOLTIP_ROOT = document.getElementById('tooltip-root');

const ACTIVE_TOOLTIPS: Tooltip[] = [];

class Tooltip extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      position: Vector2.ZERO,
    };
  }

  private ref_: HTMLDivElement;

  private bindRef_ = (ref: HTMLDivElement) => {
    this.ref_ = ref;
  };

  private onMouseMove_ = (event: MouseEvent) => {
    if (!this.ref_) return;

    const { target, contentHint } = this.props;

    if (contentHint.type !== Tooltip.ContentHint.Type.Interactive) return;

    const mouse = Vector2.fromClient(event);

    let hit = false;
    switch (target.type) {
      case Tooltip.Target.Type.Position: {
        const selfRect = Rectangle.fromBoundingRect(this.ref_.getBoundingClientRect());
        const selfGrown = Rectangle.grow(selfRect, 10);
        hit ||= Rectangle.contains(selfGrown, mouse);

        hit ||= Vector2.distance(mouse, target.position) < 50;
        break;
      }
      case Tooltip.Target.Type.Element: {
        const targetRect = Rectangle.fromBoundingRect(target.element.getBoundingClientRect());
        const targetGrown = Rectangle.grow(targetRect, 10);
        hit ||= Rectangle.contains(targetGrown, mouse);

        const selfRect = Rectangle.fromBoundingRect(this.ref_.getBoundingClientRect());
        const selfGrown = Rectangle.grow(selfRect, 10);
        hit ||= Rectangle.contains(selfGrown, mouse);
        break;
      }
    }

      
    if (!hit) contentHint.onClose();

    return false;
  };

  private onMouseMoveHandle_: number;
  private animationFrameRequestId_: number | null = null;

  componentDidMount() {
    this.scheduleTick_();
  
    this.onMouseMoveHandle_ = GLOBAL_EVENTS.add('onMouseMove', this.onMouseMove_);

    for (const activeTooltip of ACTIVE_TOOLTIPS) {
      activeTooltip.close();
    }

    ACTIVE_TOOLTIPS.push(this);
  }

  componentWillUnmount() {
    if (this.animationFrameRequestId_ !== null) {
      cancelAnimationFrame(this.animationFrameRequestId_);
    }

    GLOBAL_EVENTS.remove(this.onMouseMoveHandle_);
    this.onMouseMoveHandle_ = undefined;
    ACTIVE_TOOLTIPS.splice(ACTIVE_TOOLTIPS.indexOf(this), 1);
  }

  private scheduleTick_ = () => {
    this.animationFrameRequestId_ = requestAnimationFrame(this.tick_);
  };

  private tick_ = () => {
    this.animationFrameRequestId_ = null;

    const { props, state } = this;
    const { target, contentHint } = props;
    const { position } = state;

    const nextPosition = Tooltip.Target.position(target);

    if (Vector2.neq(position, nextPosition)) {
      this.setState({ position: nextPosition }, this.scheduleTick_);
    } else {
      this.scheduleTick_();
    }
  };

  render() {
    const { props, state } = this;
    const { theme, style, className, children } = props;
    const { position } = state;

    const containerStyle: React.CSSProperties = {
      ...style,
      left: `${position.x}px`,
      top: `${position.y - 2}px`,
    };

    const ret = (
      <Container
        theme={theme}
        style={containerStyle}
        className={className}
        ref={this.bindRef_}
      >
        {children}
      </Container>
    );

    return ReactDom.createPortal(ret, TOOLTIP_ROOT);
  }

  close() {
    const { contentHint } = this.props;
    if (contentHint.type === Tooltip.ContentHint.Type.Interactive) contentHint.onClose();
  }
}

namespace Tooltip {
  export namespace Target {
    export enum Type {
      Element,
      Position
    }
    
    export interface Element {
      type: Type.Element;
      element: HTMLElement;
    }

    export namespace Element {
      export const create = (element: HTMLElement): Element => ({
        type: Type.Element,
        element,
      });
      
      export const position = (element: Element) => {
        const { left, right, top } = element.element.getBoundingClientRect();
        return Vector2.create((left + right) / 2, top);
      };
    }

    export interface Position {
      type: Type.Position;
      position: Vector2;
    }

    export namespace Position {
      export const create = (position: Vector2): Position => ({
        type: Type.Position,
        position
      });

      export const position = (position: Position) => position.position;
    }
    
    export const position = (target: Target) => {
      switch (target.type) {
        case Type.Element: return Element.position(target);
        case Type.Position: return Position.position(target);
      }
    };
  }

  export type Target = Target.Element | Target.Position;

  export namespace ContentHint {
    export enum Type {
      NonInteractive,
      Interactive
    }
    
    export interface NonInteractive {
      type: Type.NonInteractive;
    }

    export const NON_INTERACTIVE: NonInteractive = { type: Type.NonInteractive };

    export interface Interactive {
      type: Type.Interactive;

      onClose: () => void;
    }
    
    export const interactive = (onClose: () => void) => ({
      type: Type.Interactive,
      onClose,
    });
  }

  export type ContentHint = ContentHint.NonInteractive | ContentHint.Interactive;
}

export default Tooltip;