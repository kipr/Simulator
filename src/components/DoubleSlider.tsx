import * as React from 'react';
import { styled } from 'styletron-react';

import { Vector2 } from '../math';
import { StyleProps } from '../style';
import Svg from './Svg';
import { Theme, ThemeProps } from './theme';

export interface DoubleSliderOption {
  label: string;
}

export interface DoubleSliderProps extends StyleProps, ThemeProps {
  options: DoubleSliderOption[];

  startIndex: number;
  endIndex: number;

  onChange: (startIndex: number, endIndex: number) => void;
}

const Line = styled('line', ({ $theme }: { $theme: Theme }) => ({
  stroke: $theme.borderColor,
}));

const ConnectorLine = styled('line', ({ $theme }: { $theme: Theme }) => ({
  stroke: $theme.switch.off.primary,
  strokeWidth: '4px',
}));

const Circle = styled('circle', ({ $theme, $dragging }: { $theme: Theme; $dragging: boolean; }) => ({
  fill: $dragging ? $theme.switch.on.primary : $theme.switch.off.primary,
  cursor: !$dragging ? 'pointer' : 'ew-resize',
}));

const Text = styled('text', ({ $theme }: { $theme: Theme }) => ({
  fill: $theme.color,
  fontSize: '8px',
}));


namespace DragState {
  export interface Idle {
    type: 'idle';
  }

  export interface DraggingLeft {
    type: 'dragging-left';
    prevIndex: number;
    nextIndex: number;
  }

  export interface DraggingRight {
    type: 'dragging-right';
    prevIndex: number;
    nextIndex: number;
  }
}

type DragState = (
  DragState.Idle |
  DragState.DraggingLeft |
  DragState.DraggingRight
);

const HANDLE_RADIUS = 10;

export default ({
  style,
  className,
  theme,
  options,
  startIndex,
  endIndex,
  onChange
}: DoubleSliderProps) => {
  const [dragState, setDragState] = React.useState<DragState>({ type: 'idle' });
  
  const draw = (size: Vector2) => {
    const texts: JSX.Element[] = [];
    for (const [index, option] of options.entries()) {
      const x = index / (options.length - 1) * (size.x - HANDLE_RADIUS * 2) + HANDLE_RADIUS;
      const y = size.y / 2 + HANDLE_RADIUS  * 2;
      texts.push(
        <Text
          key={index}
          $theme={theme}
          x={x}
          y={y}
          textAnchor="middle"
        >
          {option.label}
        </Text>
      );
    }

    // Lines that drop down to the text
    const textTicks: JSX.Element[] = [];
    for (const [index, option] of options.entries()) {
      const x = index / (options.length - 1) * (size.x - HANDLE_RADIUS * 2) + HANDLE_RADIUS;
      const y = size.y / 2 + HANDLE_RADIUS;
      textTicks.push(
        <Line
          key={index}
          $theme={theme}
          x1={x}
          y1={size.y / 2}
          x2={x}
          y2={y}
        />
      );
    }

    // Connector
    const x1 = startIndex / (options.length - 1) * (size.x - HANDLE_RADIUS * 2) + HANDLE_RADIUS;
    const x2 = endIndex / (options.length - 1) * (size.x - HANDLE_RADIUS * 2) + HANDLE_RADIUS;

    return (
      <>
        {textTicks}
        <Line
          $theme={theme}
          x1={HANDLE_RADIUS}
          y1={size.y / 2}
          x2={size.x - HANDLE_RADIUS}
          y2={size.y / 2}
        />
        <ConnectorLine
          $theme={theme}
          x1={x1}
          y1={size.y / 2}
          x2={x2}
          y2={size.y / 2}
        />
        <Circle
          $theme={theme}
          $dragging={dragState.type === 'dragging-left'}
          cx={x1}
          cy={size.y / 2}
          r={HANDLE_RADIUS}
          onMouseDown={e => {
            e.stopPropagation();
            setDragState({ type: 'dragging-left', prevIndex: startIndex, nextIndex: startIndex });
          }}
        />
        <Circle
          $theme={theme}
          $dragging={dragState.type === 'dragging-right'}
          cx={x2}
          cy={size.y / 2}
          r={HANDLE_RADIUS}
          onMouseDown={e => {
            e.stopPropagation();
            setDragState({ type: 'dragging-right', prevIndex: endIndex, nextIndex: endIndex });
          }}
        />
        {texts}
      </>
    );
  };

  const ref = React.createRef<SVGSVGElement>();

  return (
    <Svg
      className={className}
      style={style}
      draw={draw}
      svgRef={ref}
      onMouseMove={e => {
        // Check if element is SVG
        const rect = ref.current.getBoundingClientRect();
        if (rect.width === 0) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const nextIndex = Math.round((x - HANDLE_RADIUS) / (rect.width - HANDLE_RADIUS * 2) * (options.length - 1));
        if (dragState.type === 'dragging-left' && nextIndex !== dragState.nextIndex) {
          setDragState({ ...dragState, nextIndex });
        } else if (dragState.type === 'dragging-right' && nextIndex !== dragState.nextIndex) {
          setDragState({ ...dragState, nextIndex });
        }
      }}
      onMouseUp={_ => {
        switch (dragState.type) {
          case 'dragging-left': {
            if (dragState.nextIndex !== dragState.prevIndex) onChange(dragState.nextIndex, endIndex);
          }
          case 'dragging-right': {
            if (dragState.nextIndex !== dragState.prevIndex) onChange(startIndex, dragState.nextIndex);
          }
        }
        setDragState({ type: 'idle' });
      }}
    />
  );
};