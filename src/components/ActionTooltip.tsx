import * as React from 'react';
import { styled } from 'styletron-react';

import { StyledText } from '../util';
import { Text } from './Text';
import { ThemeProps } from './theme';
import Tooltip from './Tooltip';

export interface ActionTooltipProps extends ThemeProps {
  target: Tooltip.Target;
  items: StyledText[];

  onClose: () => void;
}

export type Props = ActionTooltipProps;

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'row',
});

export class ActionTooltip extends React.Component<Props> {
  render() {
    const { props } = this;

    const  { items, onClose, theme, target } = props;

    return (
      <Tooltip contentHint={Tooltip.ContentHint.interactive(onClose)} theme={theme} target={target}>
        <Container>
          {items.map((item, i) => (
            <Text key={i} text={item} />
          ))}
        </Container>
      </Tooltip>
    );
  }
}


