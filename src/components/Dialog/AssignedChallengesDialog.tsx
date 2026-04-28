
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


export interface AssignedChallengesDialogPublicProps extends StyleProps, ThemeProps {
  onClose: () => void;
  assignment: ClassroomAssignment

}

export interface AssignedChallengesDialogPrivateProps extends ThemeProps {
  locale: LocalizedString.Language;

}

type Props = AssignedChallengesDialogPublicProps & AssignedChallengesDialogPrivateProps;


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

const AssignedChallengesDialog = ({
  onClose,
  theme,
  locale,
  assignment
}: Props) => {
  console.log("AssignedChallengesDialog assignment: ", assignment);
  return (
    <Dialog onClose={onClose} theme={theme} name={LocalizedString.lookup(tr("Assigned Challenges"), locale)} >
      <Container theme={theme}>
        <StyledScrollArea theme={theme}>
          {assignment.challenges ? Object.values(assignment.challenges).map((challengeInfo, index) => (
            <div key={index} style={{ marginBottom: '1em' }}>
              <div style={{ fontWeight: 'bold' }}>{challengeInfo.challenge.name}</div>
              <div>{challengeInfo.challenge.description}</div>
              <div style={{ fontStyle: 'italic' }}>Points: {challengeInfo.points || 'Not Set'}</div>
            </div>
          )) : <div>No challenges assigned to this assignment.</div>}
        </StyledScrollArea>
      </Container>
    </Dialog>
  )

}

export default connect((state: State) => {
  return {
    locale: state.i18n.locale,
    classroomList: state.classrooms.entities,
  }
}, (dispatch, ownProps) => ({

}))(AssignedChallengesDialog) as React.ComponentType<AssignedChallengesDialogPublicProps>; 