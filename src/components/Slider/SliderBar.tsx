import * as React from 'react';

import { styled } from 'styletron-react';
import { Fa } from '../Fa';
import { ThemeProps } from '../theme';

import { CanBeVertical, CanBeSelected } from './';

import { faEquals } from '@fortawesome/free-solid-svg-icons';

interface SliderBarProps extends CanBeVertical, CanBeSelected, ThemeProps {
  onMouseDownCallback: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
  onTouchStartCallback: (e: React.TouchEvent<HTMLDivElement>) => void,
}

const SliderBubbleBar = styled('div', (props: CanBeVertical) => ({
  display: 'flex',
  flex: '0 0 0',
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

export const SliderBar = React.memo((props: SliderBarProps) => {
  const { $vertical, selected, onMouseDownCallback, onTouchStartCallback, theme } = props;

  return <SliderBubbleBar $vertical={$vertical}
    onMouseDown={onMouseDownCallback}
    onTouchStart={onTouchStartCallback}
  >
    <SliderBubbleSeperator />
    <SliderBubble $vertical={$vertical} theme={theme} selected={selected}>
      <SliderBubbleCharm $vertical={$vertical}>
        <Fa key={'size-1'} icon={faEquals} />
      </SliderBubbleCharm>
    </SliderBubble>
    <SliderBubbleSeperator />
  </SliderBubbleBar>;
});