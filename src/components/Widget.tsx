import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { EMPTY_ARRAY } from '../util';
import { Spacer } from './common';
import { Fa } from './Fa';
import { ThemeProps } from './theme';

export namespace Size {
  export enum Type {
    Maximized,
    Partial,
    Miniature,
    Minimized,
  }

  export interface Maximized {
    type: Type.Maximized;
  }

  export const MAXIMIZED: Maximized = { type: Type.Maximized };

  export enum Direction {
    Left,
    Right,
    Up,
    Down
  }

  export interface Partial {
    type: Type.Partial;
    direction: Direction
  }

  export const PARTIAL_UP: Partial = { type: Type.Partial, direction: Direction.Up };
  export const PARTIAL_DOWN: Partial = { type: Type.Partial, direction: Direction.Down };
  export const PARTIAL_LEFT: Partial = { type: Type.Partial, direction: Direction.Left };
  export const PARTIAL_RIGHT: Partial = { type: Type.Partial, direction: Direction.Right };

  export interface Miniature {
    type: Type.Miniature;
    direction: Direction
  }

  export const MINIATURE_UP: Miniature = { type: Type.Miniature, direction: Direction.Up };
  export const MINIATURE_DOWN: Miniature = { type: Type.Miniature, direction: Direction.Down };
  export const MINIATURE_LEFT: Miniature = { type: Type.Miniature, direction: Direction.Left };
  export const MINIATURE_RIGHT: Miniature = { type: Type.Miniature, direction: Direction.Right };

  

  export interface Minimized {
    type: Type.Minimized;
  }

  export const MINIMIZED: Minimized = { type: Type.Minimized };
}

export type Size = Size.Maximized | Size.Partial | Size.Miniature | Size.Minimized;

export enum Mode {
  Inline,
  Floating
}

export interface ModeProps {
  mode: Mode
}

export interface BarComponent<P> {
  component: React.ComponentType<P>;
  props: P;
}

export namespace BarComponent {
  export const create = <P,>(component: React.ComponentType<P>, props: P) => ({
    component,
    props
  });
}

export interface WidgetProps extends StyleProps, ThemeProps, ModeProps {
  name: string;

  onSizeChange?: (index: number) => void;
  size?: number;
  sizes?: Size[];

  hideActiveSize?: boolean;

  children: React.ReactNode;

  barComponents?: BarComponent<unknown>[];
}

interface WidgetState {

}

type Props = WidgetProps;
type State = WidgetState;

const Icon = styled(Fa, {
  paddingLeft: '5px',
  paddingRight: '5px',
  ':last-child': {
    paddingRight: 0
  },
  ':first-child': {
    paddingLeft: 0
  }
});

const Container = styled('div', (props: ThemeProps & ModeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  borderRadius: props.mode === Mode.Floating ? `${props.theme.borderRadius}px` : undefined,
  border: `1px solid ${props.theme.borderColor}`,
  overflow: 'hidden',
  flexBasis: '0',
  pointerEvents: 'auto',
  backgroundColor: props.theme.backgroundColor,
  borderBottom: props.mode === Mode.Inline ? 'none' : undefined
}));

const Chrome = styled('div', (props: ThemeProps & ModeProps) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  padding: `${props.theme.itemPadding * 2}px`,
  alignItems: 'center',
  backgroundColor: `rgba(0, 0, 0, 0.1)`,
  color: props.theme.color,
  borderBottom: `1px solid ${props.theme.borderColor}`
}));

const Title = styled('span', (props: ThemeProps & { $hasComponents: boolean }) => ({
  fontWeight: 400,
  fontSize: '18px',
  userSelect: 'none',
  paddingRight: props.$hasComponents ? `${props.theme.itemPadding}px` : undefined,
  marginRight: props.$hasComponents ? `${props.theme.itemPadding}px` : undefined,
  borderRight: props.$hasComponents ? `1px solid ${props.theme.borderColor}` : undefined
}));

const sizeIcon = (size: Size) => {
  switch (size.type) {
    case Size.Type.Partial: {
      switch (size.direction) {
        case Size.Direction.Up: return 'angle-up';
        case Size.Direction.Down: return 'angle-down';
        case Size.Direction.Left: return 'angle-left';
        case Size.Direction.Right: return 'angle-right';
        default: return null;
      }
    }
    case Size.Type.Miniature: {
      switch (size.direction) {
        case Size.Direction.Up: return 'angle-double-up';
        case Size.Direction.Down: return 'angle-double-down';
        case Size.Direction.Left: return 'angle-double-left';
        case Size.Direction.Right: return 'angle-double-right';
        default: return null;
      }
    }
    case Size.Type.Minimized: return 'times';
    case Size.Type.Maximized: return 'expand';
  }
};

class Widget extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  private onSizeChange_ = (index: number) => (event: React.MouseEvent<HTMLElement>) => {
    const { onSizeChange } = this.props;
    
    if (!onSizeChange) return;
    onSizeChange(index);
  };

  render() {
    const { props } = this;
    const {
      style,
      className,
      theme,
      name,
      children,
      onSizeChange,
      size,
      sizes,
      mode,
      barComponents,
      hideActiveSize
    } = props;
    
    
    return (
      <Container style={style} className={className} theme={theme} mode={mode}>
        <Chrome theme={theme} mode={mode}>
          <Title theme={theme} $hasComponents={barComponents && barComponents.length > 0}>{name}</Title>
          {barComponents ? barComponents.map((barComponent, i) => {
            const Component = barComponent.component;
            return <Component key={i} {...barComponent.props} />;
          }) : undefined}
          <Spacer />
          {(sizes || EMPTY_ARRAY)
            .map((self, i) => <Icon key={`size-${i}`} icon={sizeIcon(self)} disabled={size === i} onClick={this.onSizeChange_(i)} />)
            .filter((self, i) => !hideActiveSize || i !== size)
          }
        </Chrome>
        {children}
      </Container>
    );
  }
}

export default Widget;