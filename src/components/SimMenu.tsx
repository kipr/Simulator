import * as React from 'react';

import { styled, withStyleDeep } from 'styletron-react';
import { StyleProps } from '../style';
import { Spacer } from './common';
import { Fa } from './Fa';
import { Layout } from './Layout';
import LayoutPicker from './LayoutPicker';
import { SimulatorState } from './SimulatorState';
import { GREEN, RED, ThemeProps } from './theme';

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
  onDashboardClick: () => void;
  onLogoutClick: () => void;

  simulatorState: SimulatorState;
}

interface MenuState {
  layoutPicker: boolean
}

type Props = MenuProps;
type State = MenuState;

import KIPR_LOGO_BLACK from '../assets/KIPR-Logo-Black-Text-Clear-Large.png';
import KIPR_LOGO_WHITE from '../assets/KIPR-Logo-White-Text-Clear-Large.png';

const Container = styled('div', (props: ThemeProps) => ({
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  height: '48px',
  lineHeight: '28px',
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  borderBottom: `1px solid ${props.theme.borderColor}`,
  zIndex: 1
}));

const Logo = styled('img', (props: ThemeProps) => ({
  width: '36px',
  height: '36px',
  marginLeft: '20px',
  marginRight: '20px',
}));

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
  height: '100%',
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

const RunItem = withStyleDeep(Item, (props: ClickProps & { $running: boolean }) => ({
  backgroundColor: props.disabled ? GREEN.disabled : GREEN.standard,
  ':hover': props.onClick && !props.disabled ? {
    backgroundColor: GREEN.hover
  } : {},
}));

const StopItem = withStyleDeep(Item, (props: ClickProps & { $running: boolean }) => ({
  backgroundColor: props.disabled ? RED.disabled : RED.standard,
  ':hover': props.onClick && !props.disabled ? {
    backgroundColor: RED.hover
  } : {},
}));


const ItemIcon = styled(Fa, {
  paddingRight: '10px'
});

class SimMenu extends React.PureComponent<Props, State> {
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
      onDashboardClick,
      onLogoutClick,
      simulatorState
    } = props;

    const { layoutPicker } = state;

    const running = SimulatorState.isRunning(simulatorState);

    return (
      <>
        <Container theme={theme}>
          <Logo theme={theme} src={theme.foreground === 'white' ? KIPR_LOGO_BLACK as string : KIPR_LOGO_WHITE as string} />

          <RunItem
            theme={theme}
            onClick={SimulatorState.isStopped(simulatorState) ? onRunClick : undefined}
            $running={running}
            disabled={!SimulatorState.isStopped(simulatorState)}
            style={{ borderLeft: `1px solid ${theme.borderColor}` }}
          >
            <ItemIcon icon='play' /> Run
          </RunItem>
          <StopItem
            theme={theme}
            onClick={running ? onStopClick : undefined}
            disabled={!running}
            $running={running}
          >
            <ItemIcon icon='stop' /> Stop
          </StopItem>
          <Item theme={theme} onClick={onDownloadClick}><ItemIcon icon='file-download' /> Download</Item>

          <Spacer style={{ borderRight: `1px solid ${theme.borderColor}` }} />

          <Item theme={theme} onClick={this.onLayoutClick_} style={{ position: 'relative' }}>
            <ItemIcon icon='clone' /> Layout
            {layoutPicker ? (
              <LayoutPicker style={{ zIndex: 9 }} onLayoutChange={onLayoutChange} onShowAll={onShowAll} onHideAll={onHideAll} layout={layout} theme={theme} />
            ) : undefined}
          </Item>

          <Item theme={theme} onClick={onDocumentationClick}><ItemIcon icon='book' /> Documentation</Item>
          
          <Item theme={theme} onClick={onSettingsClick}><ItemIcon icon='cogs'/> Settings</Item>
          <Item theme={theme} onClick={onAboutClick}><ItemIcon icon='question'/> About</Item>
          <Item theme={theme} onClick={onDashboardClick}><ItemIcon icon='compass'/> Dashboard</Item>
          <Item theme={theme} onClick={onLogoutClick}><ItemIcon icon='sign-out-alt'/> Logout</Item>
        </Container>
        
      </>
    );
  }
}

export default SimMenu;
