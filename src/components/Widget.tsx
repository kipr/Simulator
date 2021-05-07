import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../style';
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
  export const create = <P extends {}>(component: React.ComponentType<P>, props: P) => ({
    component,
    props
  });
}

export interface WidgetProps extends StyleProps, ThemeProps, ModeProps {
  name: string;

  onSizeChange: (index: number) => void;
  size: number;
  sizes: Size[];

  children?: any;

  barComponents?: BarComponent<any>[];
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
  backgroundColor: props.theme.backgroundColor
}));

const Chrome = styled('div', (props: ThemeProps & ModeProps) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  padding: '10px',
  alignItems: 'center',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  borderBottom: `1px solid ${props.theme.borderColor}`
}));

const Title = styled('span', {
  fontWeight: 400,
  marginRight: '10px'
});

const sizeIcon = (size: Size) => {
  switch (size.type) {
    case Size.Type.Partial: {
      switch (size.direction) {
        case Size.Direction.Up: return 'angle-up';
        case Size.Direction.Down: return 'angle-down';
        case Size.Direction.Left: return 'angle-left';
        case Size.Direction.Right: return 'angle-right';
      }
    }
    case Size.Type.Miniature: {
      switch (size.direction) {
        case Size.Direction.Up: return 'angle-double-up';
        case Size.Direction.Down: return 'angle-double-down';
        case Size.Direction.Left: return 'angle-double-left';
        case Size.Direction.Right: return 'angle-double-right';
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
    this.props.onSizeChange(index);
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
      barComponents
    } = props;
    
    
    return (
      <Container style={style} className={className} theme={theme} mode={mode}>
        <Chrome theme={theme} mode={mode}>
          <Title>{name}</Title>
          {barComponents ? barComponents.map((barComponent, i) => {
            const Component = barComponent.component;
            return <Component key={i} {...barComponent.props} />;
          }) : undefined}
          <Spacer />
          {sizes.map((self, i) => <Icon icon={sizeIcon(self)} disabled={size === i} onClick={this.onSizeChange_(i)} />)}
        </Chrome>
        {children}
      </Container>
    );
  }
}

export default Widget;