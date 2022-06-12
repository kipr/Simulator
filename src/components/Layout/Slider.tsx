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
  // takes two children
  children: [JSX.Element, JSX.Element],
  // the minimum number of pixels each component can be
  minSizes: [number, number],
  // the initial proportional split of the elements
  split: number,
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
  display: 'flex',
  flexDirection: (props.$vertical) ? 'row' : 'column',

}));
const FlexContainer = styled('div', (props: ContainerProps) => ({
  // display: 'flex',
  flex: '1 1 0',
  width: (props.$width) ? `${props.$width}px` : null,
  height: (props.$height) ? `${props.$height}px` : null,
}));
const SliderBubbleBar = styled('div', (props: CanBeVertical) => ({
  display: 'flex',
  flexDirection: (props.$vertical) ? 'column' : 'row',
}));
const SliderBubbleSeperator = styled('div', {
  flex: '1 0'
});
const SliderBubble = styled('div', (props: CanBeVertical & CanBeSelected & ThemeProps) => ({
  margin: (props.$vertical) ? '0px -17px' : '-17px 0px',
  height: '34px',
  width: '34px',
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

const SliderBar = React.memo((props: SliderBarProps) => {
  const { $vertical, selected, onMouseDownCallback, onTouchStartCallback, theme } = props;

  return <SliderBubbleBar $vertical={$vertical}
    onMouseDown={onMouseDownCallback}
    onTouchStart={onTouchStartCallback}
  >
    <SliderBubbleSeperator />
    <SliderBubble $vertical={$vertical} theme={theme} selected={selected}>
      <SliderBubbleCharm $vertical={$vertical}>
        <Fa key={'size-1'} icon='equals' />
      </SliderBubbleCharm>
    </SliderBubble>
    <SliderBubbleSeperator />
  </SliderBubbleBar>;
});

interface ResizeState {
  side: Side,
  resizing: boolean,
  size: number,
  minSize: number,
  maxSize: number,
  startSize?: number,
  startX?: number,
  startY?: number,
}
enum Actions {
  MouseDown,
  MouseUp,
  MouseMove,
  Resize
}
interface ResizeAction {
  actionType: Actions,
  x?: number,
  y?: number,
  size?: number,
  minSize?: number,
  maxSize?: number,
}
function resizeOnPointerMove(state: ResizeState, action: ResizeAction): ResizeState {
  const { side, size, minSize, maxSize, startSize, startX, startY, resizing } = state;
  const { actionType, x, y } = action;

  if (!resizing) {
    if (actionType === Actions.MouseDown) {
      return {
        ...state,
        startSize: size, startX: x, startY: y,
        resizing: true
      };
    }
    // if not resizing, return no matter the action w/o change
    return state;
  }

  // resizing!

  // stop the resize on mouseup
  if (actionType === Actions.MouseUp) {
    return { ...state, resizing: false };
  }


  // resize the panel
  switch (side) {
    case Side.Left:
      return {
        ...state,
        size: Math.min(Math.max(startSize - (x - startX), minSize), maxSize),
      };
    case Side.Right:
      return {
        ...state,
        size: Math.min(Math.max(startSize + (x - startX), minSize), maxSize),
      };
    case Side.Top:
      return {
        ...state,
        size: Math.min(Math.max(startSize - (y - startY), minSize), maxSize),
      };
    case Side.Bottom:
      return {
        ...state,
        size: Math.min(Math.max(startSize + (y - startY), minSize), maxSize),
      };
  }
}

interface Dimensions {
  width: number, 
  height: number,
}
function useContainerDimensions(ref: React.MutableRefObject<HTMLDivElement>): Dimensions {
  const getDimensions = () => ({
    width: ref.current.offsetWidth,
    height: ref.current.offsetHeight
  });

  const [dimensions, setDimensions] = React.useState<Dimensions>({ width: 100, height: 100 });

  React.useEffect(() => {
    const handleResize = () => {
      setDimensions(getDimensions());
    };

    if (ref.current) {
      setDimensions(getDimensions());
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [ref]);

  return dimensions;
}

export const Slider = function (props: SliderProps) {
  const { side, theme, children, minSizes, split } = props;

  const isVertical = (side === Side.Left || side === Side.Right);
  
  const componentRef = React.useRef<HTMLDivElement>(null);
  const { width, height } = useContainerDimensions(componentRef);
  
  const [state, dispatch] = React.useReducer(resizeOnPointerMove, {
    side: side,
    size: isVertical ? width * split : height * split,
    minSize: minSizes[0],
    maxSize: isVertical ? width - minSizes[1] : height - minSizes[1],
    resizing: false,
  });

  // when the component finishing rendering, or the window re-renders, update our
  // dispatcher with the proper size
  React.useEffect(() => {
    console.log('dispatching size update', width, height);
    dispatch({
      actionType: Actions.Resize, 
      size: isVertical ? width * split : height * split,
      minSize: minSizes[0],
      maxSize: isVertical ? width - minSizes[1] : height - minSizes[1],
    });
  }, [width, height]);

  const onMouseMove = (e: MouseEvent) => {
    dispatch({ actionType: Actions.MouseMove, x: e.screenX, y: e.screenY });
  };
  const onMouseUp = (e: MouseEvent) => {
    dispatch({ actionType: Actions.MouseUp, x: e.screenX, y: e.screenY });

    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };
  const onSliderBarMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    dispatch({ actionType: Actions.MouseDown, x: e.screenX, y: e.screenY });

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // TODO: make sure we support only 1 touch more explicitly
  const onTouchMove = (e: TouchEvent) => {
    // only support single touch events
    if (e.touches.length > 1) return;

    dispatch({ actionType: Actions.MouseMove, x: e.touches[0].pageX, y: e.touches[0].pageY });
  };
  const onTouchEnd = (e: TouchEvent) => {
    dispatch({ actionType: Actions.MouseUp, x: null, y: null });

    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('touchcancel', onTouchEnd);
  };
  const onSliderBarTourchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // only support single touch events
    if (e.touches.length > 1) return;

    dispatch({ actionType: Actions.MouseDown, x: e.touches[0].pageX, y: e.touches[0].pageY });

    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);
  };

  // console.log('size: ', width, height, state.size);

  return <SliderContainer 
    ref={componentRef}
    $vertical={isVertical}
  >
    <FlexContainer 
      $width ={isVertical ? state.size : null} 
      $height={isVertical ? null : state.size} 
    >
      {children[0]}
    </FlexContainer>

    <SliderBar $vertical={isVertical} theme={theme} selected={state.resizing}
      onMouseDownCallback={onSliderBarMouseDown}
      onTouchStartCallback={onSliderBarTourchStart}
    />

    <FlexContainer
      $width ={isVertical ? width - state.size - 1 : null} 
      $height={isVertical ? null : height - state.size - 1} 
    >
      {children[1]}
    </FlexContainer>
  </SliderContainer>;
};