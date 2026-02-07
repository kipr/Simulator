import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../../util/style';
import { Dialog } from './Dialog';
import { ThemeProps, LIGHTMODE_YES, LIGHTMODE_NO, LIGHT } from '../constants/theme';
import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';
import { connect } from 'react-redux';
import { State as ReduxState } from '../../state';
import { AsyncProject, Project } from '../../state/State/Project';


export interface DeleteProjectDialogPublicProps extends ThemeProps, StyleProps {
  name: string;
  onClose: () => void;
  onDeleteProject: (answser: boolean) => void;
}

interface DeleteProjectDialogPrivateProps {
  locale: LocalizedString.Language;
}

type Props = DeleteProjectDialogPublicProps & DeleteProjectDialogPrivateProps;

namespace Modal {
  export enum Type {
    Settings,
    CreateUser,
    DeleteUserProjectFile,
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

  export interface DeleteUserProjectFile {
    type: Type.DeleteUserProjectFile;
  }

  export const DeleteUserProjectFile: DeleteUserProjectFile = { type: Type.DeleteUserProjectFile };
}

export type Modal = (
  Modal.Settings |
  Modal.CreateUser |
  Modal.None |
  Modal.DeleteUserProjectFile
);

const Logo = styled('img', {
  width: '150px',
  height: 'auto',
});

const Container = styled('div', (props: ThemeProps) => ({
  color: props.theme.color,
  padding: `${props.theme.itemPadding * 2}px`,
  background: props.theme.titleBarBackground
}));

const Bold = styled('span', {
  fontWeight: 400
});

const CenteredContainer = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  width: '100%',
  height: '100%',
});
const BottomButtonContainer = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  marginTop: '20px',
});

const Button = styled('button', {
  margin: '0 10px',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
});

// Styled component button for the "Yes" button
const YesItem = styled(Button, (props: ThemeProps & { onClick?: () => void; disabled?: boolean }) => ({
  backgroundColor: LIGHTMODE_YES.standard,
  border: `1px solid ${LIGHTMODE_YES.border}`,
  ':hover':
    props.onClick && !props.disabled
      ? {
        backgroundColor: LIGHTMODE_YES.hover,
      }
      : {},
  color: LIGHTMODE_YES.textColor,
  textShadow: LIGHTMODE_YES.textShadow,
  boxShadow: '2px 2px 4px rgba(0,0,0,0.9)',
  ':active': props.onClick && !props.disabled
    ? {
      boxShadow: '1px 1px 2px rgba(0,0,0,0.7)',
      transform: 'translateY(1px, 1px)',
    }
    : {},
}));

// Styled component button for the "No, don't save and continue" button
const NoItem = styled(Button, (props: ThemeProps & { onClick?: () => void; disabled?: boolean }) => ({
  backgroundColor: LIGHTMODE_NO.standard,
  border: `1px solid ${LIGHTMODE_NO.border}`,
  ':hover':
    props.onClick && !props.disabled
      ? {
        backgroundColor: LIGHTMODE_NO.hover,
      }
      : {},
  color: LIGHTMODE_NO.textColor,
  textShadow: LIGHTMODE_NO.textShadow,
  boxShadow: '2px 2px 4px rgba(0,0,0,0.9)',
  ':active': props.onClick && !props.disabled
    ? {
      boxShadow: '1px 1px 2px rgba(0,0,0,0.7)',
      transform: 'translateY(1px, 1px)',
    }
    : {},
}));


class DeleteProjectDialog extends React.PureComponent<Props> {

  constructor(props: Props) {
    super(props);
    this.state = {
    }
  }

  render() {
    const { props } = this;
    const { theme, onClose, locale } = props;
    console.log('DeleteProjectDialog render props: ', props);

    return (
      <Dialog theme={theme} name={LocalizedString.lookup(tr('Are You Sure?'), locale)} onClose={onClose}>
        <Container theme={theme}>
          <br />
          <CenteredContainer>
            <Bold>{LocalizedString.lookup(tr(`Are you sure you want to delete ${this.props.name}?`), locale)}</Bold>
          </CenteredContainer>
          <br />
          <CenteredContainer>

            <BottomButtonContainer>
              <YesItem onClick={() => this.props.onDeleteProject(true)} theme={theme}>
                Yes
              </YesItem>
              <NoItem onClick={() => this.props.onDeleteProject(false)} theme={theme}>
                No
              </NoItem>
            </BottomButtonContainer>
          </CenteredContainer>
          <br />

        </Container>
      </Dialog>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(DeleteProjectDialog) as React.ComponentType<DeleteProjectDialogPublicProps>;