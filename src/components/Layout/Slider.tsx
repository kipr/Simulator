import * as React from 'react';

import { styled } from 'styletron-react';
import { Fa } from '../Fa';
import { ThemeProps } from '../theme';

export enum Side {
  Left,
  Top,
  Right,
  Bottom,
}

export interface SliderProps extends ThemeProps {
  side: Side,
  initialWidth?: number,
  initialHeight?: number,
  children: JSX.Element,
}

interface CanBeVertical {
  $vertical?: boolean
}
interface CanBeSelected {
  selected: boolean
}

interface SliderBarProps extends CanBeVertical, CanBeSelected, ThemeProps {
  onMouseDownCallback: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
  onTouchStartCallback: (e: React.TouchEvent<HTMLDivElement>) => void,
}

interface ContainerProps extends CanBeVertical {
  $width?: number,
  $height?: number,
}

const SliderContainer = styled('div', (props: ContainerProps) => ({
  width: (props.$width) ? props.$width + 'px' : null,
  height: (props.$height) ? props.$height + 'px' : null,
  display: (props.$vertical) ? 'flex' : null,
}));
const SliderBubbleBar = styled('div', (props: CanBeVertical) => ({
  display: 'flex',
  flexDirection: (props.$vertical) ? 'column' : 'row',
}));
const SliderBubbleSeperator = styled('div', {
  flex: '1 0'
});
const SliderBubble = styled('div', (props: CanBeVertical & CanBeSelected & ThemeProps) => ({
  margin: (props.$vertical) ? '0px -13px' : '-13px 0px',
  height: '26px',
  width: '26px',
  zIndex: 1,
  borderRadius: '50%',
  border: `1px solid ${props.theme.borderColor}`,
  color: props.theme.color,
  backgroundColor: props.selected ? props.theme.switch.off.primary : props.theme.backgroundColor,
  opacity: 1,
  cursor: props.$vertical ? 'col-resize' : 'row-resize',
}));
const SliderBubbleCharm = styled('div', (props: CanBeVertical) => ({
  position: 'relative',
  float: 'left',
  top: '50%',
  left: '50%',
  transform: (props.$vertical) ? 'translate(-50%, -50%) rotate(-90deg)' : 'translate(-50%, -50%)',
}));

const SliderBar = React.memo(function(props: SliderBarProps) {
  const {$vertical, selected, onMouseDownCallback, onTouchStartCallback, theme} = props

  return <SliderBubbleBar $vertical={$vertical}
    onMouseDown={onMouseDownCallback}
    onTouchStart={onTouchStartCallback}
  >
    <SliderBubbleSeperator/>
    <SliderBubble $vertical={$vertical} theme={theme} selected={selected}>
      <SliderBubbleCharm $vertical={$vertical}>
        <Fa key={'size-1'} icon='equals'/>
      </SliderBubbleCharm>
    </SliderBubble>
    <SliderBubbleSeperator/>
  </SliderBubbleBar>
});

interface ResizeState {
  side: Side,
  width?: number, 
  height?: number,
  prevX?: number,
  prevY?: number,
  resizing: boolean,
}
enum Actions {
  MouseDown,
  MouseUp,
  MouseMove
}
interface ResizeAction {
  actionType: Actions,
  x: number,
  y: number,
}
function resizeOnPointerMove(state: ResizeState, action: ResizeAction): ResizeState {
  const {side, height, width, prevX, prevY, resizing} = state;
  const {actionType, x, y} = action;

  if (!resizing) {
    if (actionType === Actions.MouseDown) {
      return { 
        ...state,
        prevX : action.x, prevY: action.y,
        resizing: true
      };
    }
    // if not resizing, return no matter the action w/o change
    return state;
  }

  // resizing!

  // stop the resize on mouseup
  if (actionType === Actions.MouseUp) {
    console.log('dispatch: done resize ' + state.width + ' , ' + state.height);
    return {...state, resizing: false}
  }

  // resize the panel
  switch (side) {
    case Side.Left:
      return {
        side: side, resizing: true,
        height: height, width: Math.max(width - (x - prevX), 0),
        prevX: x, prevY: y,
      };
    case Side.Right:
      return {
        side: side, resizing: true,
        height: height, width: Math.max(width + (x - prevX), 0),
        prevX: x, prevY: y,
      };
    case Side.Top:
      return {
        side: side, resizing: true,
        height: Math.max(height - (y - prevY), 0), width: width,
        prevX: x, prevY: y,
      };
    case Side.Bottom:
      return {
        side: side, resizing: true,
        height: Math.max(height + (y - prevY), 0), width: width,
        prevX: x, prevY: y,
      };
  }
}

export const Slider = function(props: SliderProps) {
  const {side, initialWidth, initialHeight, theme, children} = props;

  const isVertical = (side === Side.Left || side === Side.Right);

  if (isVertical && initialWidth === null) throw Error ("Must set initialWidth when side is left or right!");
  if (!isVertical && initialHeight === null) throw Error ("Must set initialHeight when side is top or bottom!");

  const [state, dispatch] = React.useReducer(resizeOnPointerMove, {
    side: side,
    width: initialWidth,
    height: initialHeight, 
    resizing: false,
  });

  const onMouseMove = (e: MouseEvent) => {
    dispatch({actionType: Actions.MouseMove, x: e.pageX, y: e.pageY});
  }
  const onMouseUp = (e: MouseEvent) => {
    dispatch({actionType: Actions.MouseUp, x: e.pageX, y: e.pageY});
    
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  const onSliderBarMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    dispatch({actionType: Actions.MouseDown, x: e.pageX, y: e.pageY});

    window.addEventListener('mousemove', onMouseMove );
    window.addEventListener('mouseup', onMouseUp );
  };

  // TODO: make sure we support only 1 touch more explicitly
  const onTouchMove = (e: TouchEvent) => {
    // only support single touch events
    if (e.touches.length > 1) return;
    
    dispatch({actionType: Actions.MouseMove, x: e.touches[0].pageX, y: e.touches[0].pageY});
  };

  const onTouchEnd = (e: TouchEvent) => {
    dispatch({actionType: Actions.MouseUp, x: null, y: null});

    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('touchcancel', onTouchEnd);
  };

  const onSliderBarTourchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // only support single touch events
    if (e.touches.length > 1) return;

    dispatch({actionType: Actions.MouseDown, x: e.touches[0].pageX, y: e.touches[0].pageY});

    window.addEventListener('touchmove', onTouchMove );
    window.addEventListener('touchend', onTouchEnd );
    window.addEventListener('touchcancel', onTouchEnd );
  };

  switch (side) {
    case Side.Top:
    case Side.Left:
      return <SliderContainer $width={state.width} $height={state.height} $vertical={isVertical}>
        <SliderBar $vertical={isVertical} theme={theme} selected={state.resizing}
          onMouseDownCallback={onSliderBarMouseDown}
          onTouchStartCallback={onSliderBarTourchStart}
        />
        {children}
      </SliderContainer>
    case Side.Right:
    case Side.Bottom:
      return <SliderContainer $width={state.width} $height={state.height} $vertical={isVertical}>
        {children}
        <SliderBar $vertical={isVertical} theme={theme} selected={state.resizing}
          onMouseDownCallback={onSliderBarMouseDown}
          onTouchStartCallback={onSliderBarTourchStart}
        />
    </SliderContainer>
  }
}