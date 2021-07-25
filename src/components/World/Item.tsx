import * as React from 'react';
import { styled } from 'styletron-react';

import EditableList from '../EditableList';
import { ThemeProps } from '../theme';

export interface ItemProps extends EditableList.StandardItem.ComponentProps, ThemeProps {
  name: string;
}

type Props = ItemProps;

const Container = styled('div', (props: ThemeProps) => ({
  padding: `${props.theme.itemPadding * 2}px`,
  
  userSelect: 'none'
}));

class Item extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { name, className, style, theme } = this.props;
    return (
      <Container style={style} className={className} theme={theme}>
        {name}
      </Container>
    );
  }
}

export default Item;
