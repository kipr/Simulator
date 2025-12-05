import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../util/style';
import { Spacer } from './constants/common';
import { FontAwesome } from './FontAwesome';
import { DARK, ThemeProps } from './constants/theme';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { State as ReduxState } from '../state';
import KIPR_LOGO_BLACK from '../../static/assets/KIPR-Logo-Black-Text-Clear-Large.png';
import KIPR_LOGO_WHITE from '../../static/assets/KIPR-Logo-White-Text-Clear-Large.png';
import LocalizedString from '../util/LocalizedString';
import ClassroomExtraMenu from './ClassroomExtraMenu';

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


export interface ClassroomMainMenuPublicProps extends StyleProps, ThemeProps {
  onLeaveClass: () => void;
}

interface ClassroomMainMenuPrivateProps {
  locale: LocalizedString.Language;
}

interface ClassroomMainMenuState { subMenu: SubMenu; }

type Props = ClassroomMainMenuPublicProps & ClassroomMainMenuPrivateProps;
type State = ClassroomMainMenuState;

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
  zIndex: 1
}));

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

export class ClassroomMainMenu extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      subMenu: SubMenu.NONE,
    };
  }

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
  render() {
    const { className, style, locale, onLeaveClass } = this.props;
    const { subMenu } = this.state;
    const theme = DARK;
    return (
      <Container className={className} style={style} theme={theme}>
        <Logo theme={theme} src={theme.foreground === 'white' ? KIPR_LOGO_BLACK as string : KIPR_LOGO_WHITE as string} onClick={this.onDashboardClick_} />
        <Spacer style={{ borderRight: `1px solid ${theme.borderColor}` }} />
        <Item
          theme={theme}
          onClick={this.onExtraClick_}
          style={{ position: 'relative' }}
        >
          <ItemIcon icon={faBars} style={{ padding: 0 }} />
          {subMenu.type === SubMenu.Type.ExtraMenu ? (
            <ClassroomExtraMenu theme={theme}
              onLeaveClass={onLeaveClass}
            />


          ) : undefined}
        </Item>
      </Container>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale
}))(ClassroomMainMenu) as React.ComponentType<ClassroomMainMenuPublicProps>;