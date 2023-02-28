import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { EMPTY_ARRAY } from '../util';
import { Spacer } from './common';
import { Fa } from './Fa';
import { ThemeProps } from './theme';

import { faAngleDown, faAngleUp, faAngleLeft, faAngleRight, faAngleDoubleUp, faAngleDoubleDown, faAngleDoubleLeft, faAngleDoubleRight, faTimes, faExpand, faWindowRestore } from '@fortawesome/free-solid-svg-icons';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { IconProp } from '@fortawesome/fontawesome-svg-core';

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
    None,
    Left,
    Right,
    Up,
    Down
  }

  export interface Partial {
    type: Type.Partial;
    direction: Direction;
  }

  export const PARTIAL: Partial = { type: Type.Partial, direction: Direction.None };

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
  Floating,
  Sidebar,
}

export interface ModeProps {
  mode: Mode
}

// eslint-disable-next-line @typescript-eslint/ban-types
export interface BarComponent<P extends object> {
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

  // eslint-disable-next-line @typescript-eslint/ban-types
  barComponents?: BarComponent<object>[];

  onChromeMouseDown?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onChromeMouseUp?: (event: React.MouseEvent<HTMLDivElement>) => void;
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
  borderTop: props.mode === Mode.Sidebar ? 'none' : undefined,
  borderBottom: props.mode === Mode.Inline ? 'none' : undefined,
  boxShadow: props.mode === Mode.Floating ? `rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px` : undefined,
}));

const Chrome = styled('div', (props: ThemeProps & ModeProps & { $onChromeMouseDown?: boolean; $onChromeMouseUp?: boolean; }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  padding: `${props.theme.itemPadding * 2}px`,
  alignItems: 'center',
  backgroundColor: `rgba(0, 0, 0, 0.1)`,
  color: props.theme.color,
  borderBottom: `1px solid ${props.theme.borderColor}`,
  cursor: props.$onChromeMouseDown || props.$onChromeMouseUp ? 'grab' : undefined,
}));

const Title = styled('span', (props: ThemeProps & { $hasComponents: boolean }) => ({
  fontWeight: 400,
  fontSize: '18px',
  userSelect: 'none',
  paddingRight: props.$hasComponents ? `${props.theme.itemPadding}px` : undefined,
  marginRight: props.$hasComponents ? `${props.theme.itemPadding}px` : undefined,
  borderRight: props.$hasComponents ? `1px solid ${props.theme.borderColor}` : undefined,
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',
}));

const sizeIcon = (size: Size): IconProp => {
  switch (size.type) {
    case Size.Type.Partial: {
      switch (size.direction) {
        case Size.Direction.None: return faWindowRestore;
        case Size.Direction.Up: return faAngleUp;
        case Size.Direction.Down: return faAngleDown;
        case Size.Direction.Left: return faAngleLeft;
        case Size.Direction.Right: return faAngleRight;
        default: return null;
      }
    }
    case Size.Type.Miniature: {
      switch (size.direction) {
        case Size.Direction.Up: return faAngleDoubleUp;
        case Size.Direction.Down: return faAngleDoubleDown;
        case Size.Direction.Left: return faAngleDoubleLeft;
        case Size.Direction.Right: return faAngleDoubleRight;
        default: return null;
      }
    }
    case Size.Type.Minimized: return faTimes;
    case Size.Type.Maximized: return faExpand;
  }
};

class Widget extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  private onSizeChange_ = (index: number) => (event: React.MouseEvent<SVGSVGElement>) => {
    const { onSizeChange } = this.props;
    
    if (!onSizeChange) return;

    event.stopPropagation();
    event.preventDefault();
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
      hideActiveSize,
      onChromeMouseDown,
      onChromeMouseUp
    } = props;
    
    
    return (
      <Container style={style} className={className} theme={theme} mode={mode}>
        <Chrome
          theme={theme}
          mode={mode}
          onMouseDown={onChromeMouseDown}
          onMouseUp={onChromeMouseUp}
          $onChromeMouseDown={!!onChromeMouseDown}
          $onChromeMouseUp={!!onChromeMouseUp}
        >
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