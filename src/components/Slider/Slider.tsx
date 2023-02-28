import * as React from 'react';

import { styled } from 'styletron-react';
import { ThemeProps } from '../theme';

import { CanBeVertical, CanBeSelected } from './';
import { SliderBar } from './SliderBar';
import { Actions, resizeOnPointerMove } from './Resizer';
import { number } from 'prop-types';

export interface SliderProps extends ThemeProps {
  isVertical: boolean;
  // takes two children, which must be flex items or flex containers (if they contain resizable components)
  // children: [SliderItem | SliderContainer, SliderItem | SliderContainer],
  children: [JSX.Element, JSX.Element] ;
  // the minimum number of pixels each component can be
  minSizes: [number, number],
  // the initial proportional split of the elements
  sizes: [number, number],
  // should both components be rendered? 
  // If one is false, the resize bar will also not be rendered
  visible: [boolean, boolean],
}

interface SliderItemProps extends CanBeVertical {
  $flexGrow: number,
}
const SliderContainer = styled('div', (props: CanBeVertical & CanBeSelected) => ({
  display: 'flex',
  overflow: 'auto',
  alignItems: 'stretch',
  width: '100%',
  height: '100%',
  flexDirection: (props.$vertical) ? 'row' : 'column',
  cursor: props.selected ? (props.$vertical ? 'col-resize' : 'row-resize') : null,
}));
const SliderItem = styled('div', (props: SliderItemProps) => ({
  display: 'flex',
  overflow: 'auto',
  flexGrow: props.$flexGrow,
  flexBasis: '0',
}));

export const Slider = function (props: SliderProps) {
  const { isVertical, theme, children, minSizes, sizes, visible } = props;

  const itemRef0 = React.useRef<HTMLDivElement>(null);
  const itemRef1 = React.useRef<HTMLDivElement>(null);

  const [state, dispatch] = React.useReducer(resizeOnPointerMove, {
    isVertical: isVertical,
    grows: sizes,
    refs: [itemRef0, itemRef1],
    minSizes: minSizes,
    resizing: false,
  });

  const [selected, setSelected] = React.useState(false);

  const onMouseMove = (e: MouseEvent) => {
    dispatch({ actionType: Actions.MouseMove, x: e.pageX, y: e.pageY });
  };
  const onMouseUp = (e: MouseEvent) => {
    setSelected(false);
    dispatch({ actionType: Actions.MouseUp, x: e.pageX, y: e.pageY });

    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setSelected(true);
    dispatch({ actionType: Actions.MouseDown, x: e.pageX, y: e.pageY });

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
    dispatch({ actionType: Actions.MouseUp });

    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('touchcancel', onTouchEnd);
  };
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // only support single touch events
    if (e.touches.length > 1) return;

    dispatch({ actionType: Actions.MouseDown, x: e.touches[0].pageX, y: e.touches[0].pageY });

    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);
  };

  // elements may not be visible (eg, in the sidebar, they can be hidden)
  // we could just display them seperately from the slider, but then the
  // slider is unloaded and we lose the positioning of it, so instead hide them here

  return <SliderContainer $vertical={isVertical} selected={selected}>
    {visible[0]
      ? <SliderItem 
        ref={itemRef0} 
        $flexGrow={visible[1] ? state.grows[0] : 1}
      >
        {children[0]}
      </SliderItem>
      : null
    }
    {visible[0] && visible[1] 
      ? <SliderBar $vertical={isVertical} theme={theme} selected={state.resizing}
        onMouseDownCallback={onMouseDown}
        onTouchStartCallback={onTouchStart}
      />
      : null
    }
    {visible[1] 
      ? <SliderItem 
        ref={itemRef1} 
        $flexGrow={visible[0] ? state.grows[1] : 1}
      >
        {children[1]}
      </SliderItem>
      : null
    }
  </SliderContainer>;
};