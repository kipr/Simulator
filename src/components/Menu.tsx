import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { Spacer } from './common';
import { Fa } from './Fa';
import { Layout } from './Layout';
import LayoutPicker from './LayoutPicker';
import { StdDialog } from './StdDialog';
import { ThemeProps } from './theme';

export interface MenuProps extends StyleProps, ThemeProps {
  layout: Layout;
  onLayoutChange: (layout: Layout) => void;

  onShowAll: () => void;
  onHideAll: () => void;
}

interface MenuState {
  layoutPicker: boolean
}

type Props = MenuProps;
type State = MenuState;

const Container = styled('div', (props: ThemeProps) => ({
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  height: '48px',
  lineHeight: '28px',
  display: 'flex',
  flexDirection: 'row',
  borderBottom: `1px solid ${props.theme.borderColor}`,
  zIndex: 1
}));

const Logo = styled('image', {
  width: '32px',
  height: 'auto'
});

interface ClickProps {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const Item = styled('div', (props: ThemeProps & ClickProps) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  borderRight: `1px solid ${props.theme.borderColor}`,
  paddingLeft: '20px',
  paddingRight: '20px',
  ':last-child': {
    borderRight: 'none'
  },
  fontWeight: 400,
  ':hover': props.onClick ? {
    cursor: 'pointer',
    backgroundColor: `rgba(255, 255, 255, 0.1)`
  } : {}

}));


const ItemIcon = styled(Fa, {
  paddingRight: '10px'
});

class Menu extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      layoutPicker: false
    };
  }

  private onLayoutClick_ = () => {
    this.setState({
      layoutPicker: !this.state.layoutPicker
    });
  }

  render() {
    const { props, state } = this;
    const { theme, layout, onHideAll, onShowAll, onLayoutChange } = props;

    const { layoutPicker } = state;

    return (
      <>
        <Container theme={theme}>
          {/*<Logo href="/static/KIPR-Logo-bk.jpg"/>*/}
          <Item theme={theme}>KIPR Simulator</Item>

          <Item theme={theme}><ItemIcon icon='play' /> Run</Item>
          <Item theme={theme}><ItemIcon icon='stop' /> Stop</Item>
          <Item theme={theme}><ItemIcon icon='file-download' /> Download</Item>

          <Spacer style={{ borderRight: `1px solid ${theme.borderColor}` }} />


          <Item theme={theme} onClick={this.onLayoutClick_} style={{ position: 'relative' }}>
            <ItemIcon icon='clone' /> Layout
            {layoutPicker ? (
              <LayoutPicker style={{ zIndex: 9 }} onLayoutChange={onLayoutChange} onShowAll={onShowAll} onHideAll={onHideAll} layout={layout} theme={theme} />
            ) : undefined}
          </Item>
          
          
          <Item theme={theme}><ItemIcon icon='question'/> About</Item>
        </Container>
        
      </>
    );
  }
}

export default Menu;