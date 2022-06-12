import * as React from 'react';
import { styled } from 'styletron-react';
import Dict from '../../Dict';
import { StyleProps } from '../../style';
import { Theme, ThemeProps } from '../theme';

export interface MultiSliderProps {
  direction: MultiSlider.Direction;
  components: Dict<MultiSlider.Component>;
  componentOrdering: string[];
}

interface MultiSliderState {
  sizeRatios: Dict<number>;
}

type Props = MultiSliderProps;
type State = MultiSliderState;

const Container = styled('div', ({ $direction }: { $direction: MultiSlider.Direction }) => ({
  display: 'flex',
  flexDirection: $direction === MultiSlider.Direction.Vertical ? 'column' : 'row',
}));

const SliderBubble = styled('div', ({ $direction, $theme, $selected }: { $direction: MultiSlider.Direction, $theme: Theme, $selected: boolean }) => ({
  margin: $direction === MultiSlider.Direction.Vertical ? '0px -17px' : '-17px 0px',
  height: '34px',
  width: '34px',
  zIndex: 1,
  borderRadius: '50%',
  border: `1px solid ${$theme.borderColor}`,
  color: $theme.color,
  backgroundColor: $selected ? $theme.switch.off.primary : $theme.backgroundColor,
  opacity: 1,
  cursor: $direction === MultiSlider.Direction.Vertical ? 'col-resize' : 'row-resize',
}));

class MultiSlider extends React.Component<Props, State> {
  private ref_: HTMLElement;
  private bindRef_ = (ref: HTMLDivElement) => {
    this.ref_ = ref;
  };
  
  render() {
    const { props, state } = this;

    const {
      direction,
      components,
      componentOrdering,
    } = props;

    const {
      sizeRatios,
    } = state;

    const componentList = componentOrdering.map(key => ({
      ...components[key],
      sizeRatio: sizeRatios[key],
    }));

    return (
      <Container ref={this.bindRef_} $direction={direction}>
        {componentList.map((c, i) => {
          const Component = c.component;

          return (
            <Component key={i} {...c.props} style={{
              flex: c.sizeRatio,
              flexBasis: 0,
            }} />
          );
        })}
      </Container>
    );
  }
}

namespace MultiSlider {
  export enum Direction {
    Horizontal,
    Vertical,
  }

  export interface Component<P extends StyleProps = StyleProps> {
    component: React.ComponentType<P>;
    props?: P;

    minimumSize?: number;
    sizeRatio?: number;
  }
}

export default MultiSlider;