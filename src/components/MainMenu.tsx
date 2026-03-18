import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../util/style';
import { Spacer } from './constants/common';
import { FontAwesome } from './FontAwesome';
import { DARK, ThemeProps } from './constants/theme';

import { faSignOutAlt, faBars, faCircleInfo } from '@fortawesome/free-solid-svg-icons';

import tr from '@i18n';

import { connect } from 'react-redux';

import { State as ReduxState } from '../state';

import KIPR_LOGO_BLACK from '../../static/assets/KIPR-Logo-Black-Text-Clear-Large.png';
import KIPR_LOGO_WHITE from '../../static/assets/KIPR-Logo-White-Text-Clear-Large.png';
import { signOutOfApp } from '../firebase/modules/auth';
import LocalizedString from '../util/LocalizedString';
import ClassroomExtraMenu from './ClassroomExtraMenu';
import InformationExtraMenu from './InformationExtraMenu';
import TourTarget from './Tours/TourTarget';
import { TourRegistry } from './../tours/TourRegistry';


namespace SubMenu {
  export enum Type {
    None,
    ExtraMenu,
  }

  export interface None {
    type: Type.None;
  }

  export const NONE: None = { type: Type.None };

  export interface ExtraMenu {
    type: Type.ExtraMenu;
  }

  export const EXTRA_MENU: ExtraMenu = { type: Type.ExtraMenu };
}

type SubMenu =
  | SubMenu.None
  | SubMenu.ExtraMenu;



export interface MenuPublicProps extends StyleProps, ThemeProps {
  tourRegistry?: TourRegistry;
  onRetakeTour?: (event: React.MouseEvent) => void;
}

interface MenuPrivateProps {
  locale: LocalizedString.Language;
}

interface MenuState { subMenu: SubMenu; }

type Props = MenuPublicProps & MenuPrivateProps;
type State = MenuState;

const Container = styled('div', (props: ThemeProps) => ({
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  width: '100%',
  height: '48px',
  lineHeight: '28px',
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  borderBottom: `1px solid ${props.theme.borderColor}`,
  zIndex: 1,
  position: 'relative'
}));

const MenuTrigger = styled('div', {
  position: 'relative',
  display: 'flex',
  height: '100%',
});
const Logo = styled('img', (props: ThemeProps & ClickProps) => ({
  width: '36px',
  height: '36px',
  marginLeft: '20px',
  marginRight: '20px',
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

const ItemIcon = styled(FontAwesome, {
  paddingRight: '10px'
});

export class MainMenu extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      subMenu: SubMenu.NONE,
    };
  }

  private onLogoutClick_ = (event: React.MouseEvent<HTMLDivElement>) => {
    void signOutOfApp();
  };

  private onDashboardClick_ = (event: React.MouseEvent<HTMLDivElement>) => {
    window.location.href = '/';
  };
  private onExtraClick_ = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const currentType = this.state.subMenu.type;
    this.setState(
      {
        subMenu:
          currentType === SubMenu.Type.ExtraMenu
            ? SubMenu.NONE
            : SubMenu.EXTRA_MENU,
      },
      () => {
        if (currentType !== SubMenu.Type.ExtraMenu) {
          window.addEventListener('click', this.onClickOutside_);
        } else {
          window.removeEventListener('click', this.onClickOutside_);
        }
      }
    );

    event.stopPropagation();
  };
  private onClickOutside_ = (event: MouseEvent) => {
    this.setState({ subMenu: SubMenu.NONE });
    window.removeEventListener('click', this.onClickOutside_);
  };

  private onRetakeTour_ = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    this.props.onRetakeTour ? this.props.onRetakeTour(event) : null;
    this.setState({ subMenu: SubMenu.NONE });
  };

  render() {
    const { className, style, locale, tourRegistry } = this.props;
    const { subMenu } = this.state;
    const theme = DARK;
    return (
      <Container className={className} style={style} theme={theme}>
        <Logo theme={theme} src={theme.foreground === 'white' ? KIPR_LOGO_BLACK as string : KIPR_LOGO_WHITE as string} onClick={this.onDashboardClick_} />
        <Spacer style={{ borderRight: `1px solid ${theme.borderColor}` }} />
        {/* <Item theme={theme} onClick={this.onDashboardClick_}><ItemIcon icon='compass'/> Dashboard</Item> */}
        <TourTarget style={style} registry={tourRegistry} targetKey={'retake-tour-button'}>
          <Item theme={theme} onClick={this.onRetakeTour_}><ItemIcon icon={faCircleInfo} /> {LocalizedString.lookup(tr(`Retake Tour`), locale)}</Item>
        </TourTarget>
        <Item theme={theme} onClick={this.onLogoutClick_}><ItemIcon icon={faSignOutAlt} /> {LocalizedString.lookup(tr('Logout'), locale)}</Item>

      </Container>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale
}))(MainMenu) as React.ComponentType<MenuPublicProps>;