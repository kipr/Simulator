import * as React from 'react';
import { styled } from 'styletron-react';

import EditableList from '../EditableList';
import { ThemeProps } from '../theme';

export interface ItemProps extends EditableList.StandardItem.ComponentProps, ThemeProps {
  name: string;

  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  selected?: boolean;
}

type Props = ItemProps;

const Container = styled('div', (props: ThemeProps & { $selectable: boolean; $selected: boolean; }) => ({
  padding: `${props.theme.itemPadding * 2}px`,
  userSelect: 'none',
  ':hover': props.$selectable ? {
    backgroundColor: `rgba(255, 255, 255, 0.1)`,
  } : {},
  backgroundColor: props.$selected ? `rgba(255, 255, 255, 0.2)` : 'transparent',
  cursor: props.$selectable ? 'pointer' : 'default',
}));

class Item extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { name, className, style, theme, onClick, selected } = this.props;
    return (
      <Container
        style={style}
        className={className}
        theme={theme}
        onClick={onClick}
        $selectable={!!onClick}
        $selected={selected}
      >
        {name}
      </Container>
    );
  }
}

export default Item;
