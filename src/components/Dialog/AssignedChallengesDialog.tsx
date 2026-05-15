
import { AsyncClassroom, ClassroomAssignment } from "../../state/State/Classroom";
import * as React from 'react';
import { styled } from 'styletron-react';
import Async from '../../state/State/Async';
import { Dialog } from './Dialog';
import DialogBar from './DialogBar';
import { ThemeProps, GREEN, RED } from '../constants/theme';
import { FontAwesome } from '../FontAwesome';
import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';
import { faPlus, faUser, faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { State as ReduxState, State } from '../../state';
import Dict from '../../util/objectOps/Dict';
import { sprintf } from 'sprintf-js';
import { StyleProps } from "../../util/style";
import Input from "../interface/Input";
import ScrollArea from "../interface/ScrollArea";
import { withNavigate, WithNavigateProps } from '../../util/withNavigate';


export interface AssignedChallengesDialogPublicProps extends StyleProps, ThemeProps {
  onClose: () => void;
  assignment: ClassroomAssignment
  config?: 'Student' | 'Teacher';

}

export interface AssignedChallengesDialogPrivateProps extends ThemeProps {
  locale: LocalizedString.Language;

}

type Props = AssignedChallengesDialogPublicProps & AssignedChallengesDialogPrivateProps & WithNavigateProps;


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

const Button = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  padding: '10px',
  marginRight: '2.5em',
  backgroundColor: '#2c2c2cff',
  borderBottom: `1px solid ${props.theme.borderColor}`,
  ':last-child': {
    borderBottom: 'none'
  },
  // opacity: props.disabled ? '0.5' : '1.0',
  fontWeight: 400,
  ':hover': {
    cursor: 'pointer',
    backgroundColor: `rgba(255, 255, 255, 0.1)`
  },
  userSelect: 'none',
  transition: 'background-color 0.2s, opacity 0.2s'
}));



const AssignedChallengesDialog = ({
  onClose,
  theme,
  locale,
  assignment,
  config,
  navigate
}: Props) => {
  return (
    <Dialog onClose={onClose} theme={theme} name={LocalizedString.lookup(tr("Assigned Challenges"), locale)} >
      <Container theme={theme}>
        <StyledScrollArea theme={theme}>
          {assignment.challenges ? Object.values(assignment.challenges).map((challengeInfo, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} >

              <div key={index} style={{ display: 'flex', flexDirection: 'column', marginBottom: '1em' }}>
                <div style={{ fontWeight: 'bold' }}>{challengeInfo.challenge.name}</div>
                <div>{challengeInfo.challenge.description}</div>
                <div style={{ fontStyle: 'italic' }}>Points: {challengeInfo.points || 'Not Set'}</div>
              </div>

              <Button theme={theme} onClick={() => { navigate(`/challenge/${challengeInfo.challenge.sceneId}`); }}>
                <FontAwesome icon={faArrowRightToBracket} style={{ marginRight: '8px' }} />
                {LocalizedString.lookup(tr('Go to Challenge'), locale)}
              </Button>
            </div>
          )) : <div>No challenges assigned to this assignment.</div>}
        </StyledScrollArea>
      </Container>
    </Dialog>
  );

};

export default connect((state: State) => {
  return {
    locale: state.i18n.locale,
    classroomList: state.classrooms.entities,
  };
}, (dispatch, ownProps) => ({

}))(withNavigate(AssignedChallengesDialog)) as React.ComponentType<AssignedChallengesDialogPublicProps>; 