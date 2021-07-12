import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { Spacer } from './common';
import { Fa } from './Fa';
import { Layout } from './Layout';
import LayoutPicker from './LayoutPicker';
import { SimulatorState } from './SimulatorState';
import { ThemeProps } from './theme';

export interface MenuProps extends StyleProps, ThemeProps {
  layout: Layout;
  onLayoutChange: (layout: Layout) => void;

  onShowAll: () => void;
  onHideAll: () => void;

  onRunClick: () => void;
  onStopClick: () => void;
  onDownloadClick: () => void;

  onSettingsClick: () => void;
  onAboutClick: () => void;
  onDocumentationClick: () => void;

  simulatorState: SimulatorState;
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
  disabled?: boolean;
}

const Item = styled('div', (props: ThemeProps & ClickProps) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  borderRight: `1px solid ${props.theme.borderColor}`,
  paddingLeft: '20px',
  paddingRight: '20px',
  opacity: props.disabled ? '0.5' : '1.0',

  ':last-child': {
    borderRight: 'none'
  },
  fontWeight: 400,
  ':hover': props.onClick && !props.disabled ? {
    cursor: 'pointer',
    backgroundColor: `rgba(255, 255, 255, 0.1)`
  } : {},
  userSelect: 'none',
  transition: 'background-color 0.2s, opacity 0.2s'
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
  };

  render() {
    const { props, state } = this;
    const {
      theme,
      layout,
      onHideAll,
      onShowAll,
      onLayoutChange,
      onSettingsClick,
      onAboutClick,
      onRunClick,
      onStopClick,
      onDownloadClick,
      onDocumentationClick,
      simulatorState
    } = props;

    const { layoutPicker } = state;

    return (
      <>
        <Container theme={theme}>
          {/* <Logo href="/static/KIPR-Logo-bk.jpg"/>*/}
          <Item theme={theme}>KIPR Simulator</Item>

          <Item theme={theme} onClick={onRunClick} disabled={!SimulatorState.isStopped(simulatorState)}><ItemIcon icon='play' /> Run</Item>
          <Item theme={theme} onClick={onStopClick} disabled={!SimulatorState.isRunning(simulatorState)}><ItemIcon icon='stop' /> Stop</Item>
          <Item theme={theme} onClick={onDownloadClick}><ItemIcon icon='file-download' /> Download</Item>

          <Spacer style={{ borderRight: `1px solid ${theme.borderColor}` }} />

          <Item theme={theme} onClick={this.onLayoutClick_} style={{ position: 'relative' }}>
            <ItemIcon icon='clone' /> Layout
            {layoutPicker ? (
              <LayoutPicker style={{ zIndex: 9 }} onLayoutChange={onLayoutChange} onShowAll={onShowAll} onHideAll={onHideAll} layout={layout} theme={theme} />
            ) : undefined}
          </Item>

          <Item theme={theme} onClick={onDocumentationClick}><ItemIcon icon='book' /> Documentation</Item>
          
          {/* <Item theme={theme} onClick={onSettingsClick}><ItemIcon icon='cogs'/> Settings</Item>*/}
          <Item theme={theme} onClick={onAboutClick}><ItemIcon icon='question'/> About</Item>
        </Container>
        
      </>
    );
  }
}

export default Menu;