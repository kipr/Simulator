import { AsyncClassroom, Classroom, ClassroomAssignment } from "../../state/State/Classroom";
import * as React from 'react';
import { styled } from 'styletron-react';
import Async from '../../state/State/Async';
import { Dialog } from './Dialog';
import DialogBar from './DialogBar';
import { ThemeProps, GREEN, RED } from '../constants/theme';

import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';

import { connect } from 'react-redux';
import { State as ReduxState, State } from '../../state';
import Dict from '../../util/objectOps/Dict';
import { sprintf } from 'sprintf-js';
import { StyleProps } from "../../util/style";
import Input from "../interface/Input";
import ScrollArea from "../interface/ScrollArea";

export interface ClassroomCodeDialogPublicProps extends StyleProps, ThemeProps {
  onClose: () => void;
  classroom: Classroom;
}

export interface ClassroomCodeDialogPrivateProps extends ThemeProps {
  locale: LocalizedString.Language;
}

type Props = ClassroomCodeDialogPublicProps & ClassroomCodeDialogPrivateProps;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  minHeight: '20em',
  margin: '1em',
  zIndex: 100,
  justifyContent: 'center',
  alignItems: 'center',
}));

const ClassroomCodeDialog = ({
  onClose,
  theme,
  locale,
  classroom
}: Props) => {
  return (
    <Dialog onClose={onClose} theme={theme} name={LocalizedString.lookup(tr("Classroom Code"), locale)} >
      <Container theme={theme}>
        <div style={{
          fontSize: '8em',
          fontWeight: 'bold',
        }}>
          {classroom.code}
        </div>

      </Container>
      <DialogBar theme={theme} onAccept={onClose}>{LocalizedString.lookup(tr("Close"), locale)}</DialogBar>
    </Dialog>
  );
};

export default connect((state: State) => {
  return {
    locale: state.i18n.locale,
  };
}, (dispatch, ownProps) => ({

}))(ClassroomCodeDialog) as React.ComponentType<ClassroomCodeDialogPublicProps>; 