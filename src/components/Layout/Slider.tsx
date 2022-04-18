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

interface SliderBarProps extends CanBeVertical, ThemeProps{
  onMouseDownCallback: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
  onTouchStartCallback: (e: React.TouchEvent<HTMLDivElement>) => void,
}

interface ContainerProps extends CanBeVertical{
  $width?: number,
  $height?: number,
}

const Container = styled('div', (props: ContainerProps) => ({
  width: (props.$width) ? props.$width + 'px' : null,
  height: (props.$height) ? props.$height + 'px' : null,
  display: (props.$vertical) ? 'flex' : null,
}));
const SliderBubbleBar = styled('div', (props: CanBeVertical) => ({
  display: 'flex',
  flexDirection: (props.$vertical) ? 'column' : 'row' ,
}));
const SliderBubbleSeperator = styled('div', {
  flex: '1 0'
});
const SliderBubble = styled('div', (props: CanBeVertical & ThemeProps) => ({
  margin: (props.$vertical) ? '0px -10px' : '-10px 0px',
  padding: (props.$vertical) ? '0px 10px' : '10px 0px',
  height: '20px',
  width: '20px',
  zIndex: 1,
  borderRadius: '50%',
  background: 'white',
  // border: '1px',
  // borderColor: 'darkgray'
}));
const SliderBubbleCharm = styled('div', {
  position: 'relative',
  float: 'left',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
})

const SliderBar = React.memo(function(props: SliderBarProps) {
  const {$vertical, onMouseDownCallback, onTouchStartCallback, theme} = props

  return <SliderBubbleBar $vertical={$vertical} 
    onMouseDown={onMouseDownCallback}
    onTouchStart={onTouchStartCallback}
  >
    <SliderBubbleSeperator/>
    <SliderBubble $vertical={$vertical} theme={theme}>
      <SliderBubbleCharm>
        <Fa key={'size-1'} icon={($vertical) ? 'bars' : 'arrows-up-down'}/>
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
  resizing: boolean
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

  // stop the resize on mouseup
  if (actionType === Actions.MouseUp) {
    return {...state, resizing: false}
  }

  // resize the panel
  switch (side) {
    case Side.Left:
      return {
        side: side, resizing: true, 
        height: height, width: width - (x - prevX),
        prevX: x, prevY: y,
      };
    case Side.Right:
      return {
        side: side, resizing: true, 
        height: height, width: width + (x - prevX),
        prevX: x, prevY: y,
      };
    case Side.Top:
      return {
        side: side, resizing: true, 
        height: height - (y - prevY), width: width,
        prevX: x, prevY: y,
      };
    case Side.Bottom:
      return {
        side: side, resizing: true, 
        height: height + (y - prevY), width: width,
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

  const onMouseMove = (e: MouseEvent) => dispatch({actionType: Actions.MouseMove, x: e.pageX, y: e.pageY});
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
      return <Container $width={state.width} $height={state.height} $vertical={isVertical}>
        <SliderBar $vertical={isVertical} theme={theme} 
          onMouseDownCallback={onSliderBarMouseDown}
          onTouchStartCallback={onSliderBarTourchStart}
        />
        {children}
      </Container>
    case Side.Right:
    case Side.Bottom:
      return <Container $width={state.width} $height={state.height} $vertical={isVertical}>
        {children}
        <SliderBar $vertical={isVertical} theme={theme} 
          onMouseDownCallback={onSliderBarMouseDown}
          onTouchStartCallback={onSliderBarTourchStart}
        />
    </Container>
  }
}