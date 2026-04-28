import { AsyncClassroom, ClassroomAssignment } from "../../state/State/Classroom";
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


export interface SeeAssignedToDialogPublicProps extends StyleProps, ThemeProps {
  onClose: () => void;
  assignment: ClassroomAssignment;
}

export interface SeeAssignedToDialogPrivateProps extends ThemeProps {
  locale: LocalizedString.Language;
}

type Props = SeeAssignedToDialogPublicProps & SeeAssignedToDialogPrivateProps;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  height: '30em',
  margin: '1em',
  zIndex: 100,
}));

const StyledScrollArea = styled(ScrollArea, ({ theme }: ThemeProps) => ({
  flex: 1,
}));

const SeeAssignedToDialog = ({
  onClose,
  theme,
  locale,
  assignment
}: Props) => {
  console.log("SeeAssignedToDialog assignment: ", assignment);
  return (
    <Dialog onClose={onClose} theme={theme} name={LocalizedString.lookup(tr("Assigned To"), locale)} >
      <Container theme={theme}>
        <StyledScrollArea theme={theme}>
          {Object.values(assignment.assignedTo).map(student => (
            <div key={student.id} style={{ padding: '0.5em 0' }}>
              {student.displayName}
            </div>
          ))}
        </StyledScrollArea>
      </Container>
    </Dialog>
  );
}

export default connect((state: State) => {
  return {
    locale: state.i18n.locale,
  }
}, (dispatch, ownProps) => ({

}))(SeeAssignedToDialog) as React.ComponentType<SeeAssignedToDialogPublicProps>; 