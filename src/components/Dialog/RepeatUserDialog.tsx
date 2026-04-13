import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../../util/style';
import { Dialog } from './Dialog';
import { ThemeProps } from '../constants/theme';
import { JSX } from 'react';
import { faCopyright } from '@fortawesome/free-solid-svg-icons';

import KIPR_LOGO_BLACK from '../assets/KIPR-Logo-Black-Text-Clear-Large.png';
import KIPR_LOGO_WHITE from '../assets/KIPR-Logo-White-Text-Clear-Large.png';

import tr from '@i18n';

import { connect } from 'react-redux';
import { State as ReduxState } from '../../state';
import LocalizedString from '../../util/LocalizedString';


export interface RepeatUserDialogPublicProps extends ThemeProps, StyleProps {
  onClose: () => void;
}

interface RepeatUserDialogPrivateProps {
  locale: LocalizedString.Language;
}

type Props = RepeatUserDialogPublicProps & RepeatUserDialogPrivateProps;

namespace Modal {
  export enum Type {
    Settings,
    CreateUser,
    RepeatUser,
    None,
    OpenUser
  }
  export interface None {
    type: Type.None;
  }

  export const NONE: None = { type: Type.None };

  export interface Settings {
    type: Type.Settings;
  }

  export const SETTINGS: Settings = { type: Type.Settings };

  export interface CreateUser {
    type: Type.CreateUser;
  }

  export const CREATEUSER: CreateUser = { type: Type.CreateUser };

  export interface RepeatUser {
    type: Type.RepeatUser;
  }

  export const REPEATUSER: RepeatUser = { type: Type.RepeatUser };
}

export type Modal = (
  Modal.Settings |
  Modal.CreateUser |
  Modal.None |
  Modal.RepeatUser
);

const Logo = styled('img', {
  width: '150px',
  height: 'auto',
});

const LogoContainer = styled('div', {
  flex: '1 1'
});

const Container = styled('div', (props: ThemeProps) => ({
  color: props.theme.color,
  padding: `${props.theme.itemPadding * 2}px`,
}));

const Bold = styled('span', {
  fontWeight: 400
});

const Link = styled('a', (props: ThemeProps) => ({
  color: props.theme.color,
}));

const LogoRow = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  marginBottom: '10px',
  alignItems: 'center',
});

const CopyrightContainer = styled('div', {
  flex: '1 1'
});

const CenteredContainer = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center', // Ensures that text within the Bold component is centered
  width: '100%', // Ensures the container takes up the full width of its parent
  height: '100%', // Ensures the container takes up the full height of its parent (if required)
});

class RepeatUserDialog extends React.PureComponent<Props> {



  render() {
    const { props } = this;
    const { theme, onClose, locale } = props;

    let logo: JSX.Element;

    switch (theme.foreground) {
      case 'black': {
        logo = <Logo src={KIPR_LOGO_WHITE as string} />;
        break;
      }
      case 'white': {
        logo = <Logo src={KIPR_LOGO_BLACK as string} />;
        break;
      }
    }

    return (
      <Dialog theme={theme} name={LocalizedString.lookup(tr('User Already Exists'), locale)} onClose={onClose}>
        <Container theme={theme}>
          <br />
          <CenteredContainer>
            <Bold>{LocalizedString.lookup(tr('UH OH!'), locale)}</Bold>
          </CenteredContainer>
          <br />
          <CenteredContainer><Bold>{LocalizedString.lookup(tr('This user already exists.'), locale)}</Bold></CenteredContainer>
          <br />

        </Container>
      </Dialog>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(RepeatUserDialog) as React.ComponentType<RepeatUserDialogPublicProps>;