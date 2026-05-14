
import { Theme, ThemeProps } from '../constants/theme';
import { StyleProps } from '../../util/style';
import LocalizedString from '../../util/LocalizedString';
import * as React from 'react';
import { styled } from 'styletron-react';
import { faExpand } from '@fortawesome/free-solid-svg-icons';
import { State } from '../../state';
import { connect } from 'react-redux';
import { FontAwesome } from '../FontAwesome';
import { AsyncClassroom, Classroom, ClassroomAssignment } from '../../state/State/Classroom';
import Dict from '../../util/objectOps/Dict';
import { useEffect, useState } from 'react';
import ScrollArea from '../interface/ScrollArea';
import Async from 'state/State/Async';
import { ClassroomsAction, getGradebook } from '../../state/reducer/classrooms';
import ClassroomCodeDialog from '../Dialog/ClassroomCodeDialog';
import AssignmentDetailsDialog from '../Dialog/AssignmentDetailsDialog';
import db from '../../db';
import { assignmentListsUserInAssignedTo, assignmentHasAnyAssignee } from '../../util/studentAssignmentVisibility';
import { useTeacherViewOverlayEffect } from './TeacherViewOverlayContext';
import tr from '@i18n';
export interface HomeViewPublicProps extends ThemeProps, StyleProps {
  currentClassroom: AsyncClassroom | null;
  config?: 'Student' | 'Teacher';
}

export interface HomeViewPrivateProps extends ThemeProps {
  locale: LocalizedString.Language;
  classroomList: Dict<AsyncClassroom>;
  onLoadClassroom: (classroomId: string) => void;
}

type Props = HomeViewPublicProps & HomeViewPrivateProps;

const Container = styled('div', (props: ThemeProps) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  color: props.theme.color,
  backgroundColor: props.theme.backgroundColor,

  // minHeight: '100vh',
}));

const HomeContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  borderColor: props.theme.borderColor,
  borderWidth: '4px',
  borderStyle: 'solid',
  borderRadius: `${props.theme.itemPadding * 2}px`,
  // padding: '8px',
  margin: '8px',
  backgroundColor: 'lightpurple',

  height: '100%',
}));

const InfoBubble = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  borderColor: props.theme.borderColor,
  borderWidth: '4px',
  borderStyle: 'solid',
  borderRadius: `${props.theme.itemPadding * 2}px`,
  padding: '8px',
  margin: '8px',
  backgroundColor: 'lightpurple',
  alignItems: 'center',
  // height: '100%',
}));

const StyledScrollArea = styled(ScrollArea, ({ theme }: ThemeProps) => ({
  flex: 1,

}));

const Icon = styled(FontAwesome, {
  paddingRight: "5px",
  height: "1.5em",
  ':hover': {
    cursor: 'pointer',
  },
});

const AssignmentItem = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '8px',
  borderBottom: `2px solid ${props.theme.borderColor}`,
  alignItems: 'flex-start',
  ':hover': {
    cursor: 'pointer',
    backgroundColor: props.theme.hoverFileBackground
  },
  width: '100%',

}));


const HomeView = ({
  theme,
  locale,
  currentClassroom,
  classroomList,
  onLoadClassroom,
  config
}: Props) => {

  const loadedClassroom = Async.latestValue(currentClassroom);
  const stateClassroom = classroomList[loadedClassroom?.docId || ''] ? Async.latestValue(classroomList[loadedClassroom.docId]) : null;
  const [classroomCodeDialogVisible, setClassroomCodeDialogVisible] = useState(false);
  const [assignmentDetailsDialogVisible, setAssignmentDetailsDialogVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<ClassroomAssignment | null>(null);
  const [studentChallengeProgressByScene, setStudentChallengeProgressByScene] = useState<Dict<unknown> | null>(null);

  useTeacherViewOverlayEffect(
    config === 'Teacher' && (classroomCodeDialogVisible || assignmentDetailsDialogVisible),
  );

  useEffect(() => {
    if (config !== 'Student') {
      setStudentChallengeProgressByScene(null);
      return;
    }
    const docId = stateClassroom?.docId;
    const tokenManager = db.tokenManager;
    const uid = tokenManager ? tokenManager.auth().currentUser?.uid : undefined;
    if (!docId || !uid) {
      setStudentChallengeProgressByScene(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const gradebook = await getGradebook(docId);
        if (cancelled) return;
        const mine = gradebook[uid] as Dict<unknown> | undefined;
        setStudentChallengeProgressByScene(mine ?? null);
      } catch {
        if (!cancelled) setStudentChallengeProgressByScene(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [config, stateClassroom?.docId]);

  const currentUserId = db.tokenManager?.auth().currentUser?.uid ?? '';

  function renderOrderedAssignments() {
    let assignments = stateClassroom?.classroomAssignments ? Object.values(stateClassroom.classroomAssignments) : [];
    if (config === 'Student') {
      assignments = assignments.filter(a => assignmentListsUserInAssignedTo(a, currentUserId));
    } else if (config === 'Teacher') {
      assignments = assignments.filter(a => assignmentHasAnyAssignee(a));
    }
    const sortedAssignments = assignments.sort((a, b) => {
      const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : Infinity;
      const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : Infinity;

      return bCreated - aCreated; // Sort in descending order (newest first)
    });
    if (assignments) {
      return sortedAssignments.map(assignment => (
        <AssignmentItem theme={theme} key={assignment.title}>
          <div style={{ display: 'flex', flexDirection: 'row' }} onClick={() => {
            setSelectedAssignment(assignment);
            setAssignmentDetailsDialogVisible(true);
          }}>
            <h2>{LocalizedString.lookup(tr('New Assignment Posted'), locale)}: {assignment.title}</h2>
          </div>

          {LocalizedString.lookup(tr('Created at'), locale)}: {assignment.createdAt ? new Date(assignment.createdAt).toLocaleString() : LocalizedString.lookup(tr('Unknown'), locale)}
        </AssignmentItem>
      ));
    }
    return <h2>{LocalizedString.lookup(tr('No assignments yet'), locale)}</h2>;


  }

  function renderUpcomingAssignments() {
    let assignments = stateClassroom?.classroomAssignments ? Object.values(stateClassroom.classroomAssignments) : [];
    if (config === 'Student') {
      assignments = assignments.filter(a => assignmentListsUserInAssignedTo(a, currentUserId));
    } else if (config === 'Teacher') {
      assignments = assignments.filter(a => assignmentHasAnyAssignee(a));
    }
    const upcomingAssignments = assignments.filter(assignment => {
      if (!assignment.dueDate) return false;
      const dueDate = new Date(assignment.dueDate).getTime();
      const now = Date.now();
      return dueDate > now;
    });

    const sortedAssignments = upcomingAssignments.sort((a, b) => {
      const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;

      return aDue - bDue; // Sort in ascending order (soonest first)
    });

    if (upcomingAssignments.length > 0) {
      return sortedAssignments.map(assignment => (
        <AssignmentItem theme={theme} key={assignment.title}>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <h2>{LocalizedString.lookup(tr('Upcoming Assignment'), locale)}: {assignment.title}</h2>
          </div>

          {LocalizedString.lookup(tr('Due'), locale)}: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : LocalizedString.lookup(tr('Unknown'), locale)}
        </AssignmentItem>
      ));
    }
    return <h2>{LocalizedString.lookup(tr('No upcoming assignments'), locale)}</h2>
    ;

  }
  return (
    <Container theme={theme}>
      <HomeContainer theme={theme}>
        <StyledScrollArea theme={theme}>
          <div style={{ padding: '1% 5% 5%', display: 'flex', flexDirection: 'row', gap: '16px', justifyContent: 'space-evenly', height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              {config === 'Teacher' && (
                <InfoBubble theme={theme}>
                  <h1>{LocalizedString.lookup(tr('Classroom Code'), locale)}</h1>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                    <h2>{stateClassroom?.code}</h2>
                    <Icon icon={faExpand} onClick={() => setClassroomCodeDialogVisible(true)} />
                  </div>
                </InfoBubble>
              )}
              <InfoBubble theme={theme}>
                {renderUpcomingAssignments()}
              </InfoBubble>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '90%' }}>
              <InfoBubble style={{ width: '100%' }} theme={theme}>
                {renderOrderedAssignments()}
              </InfoBubble>

            </div>
          </div>
        </StyledScrollArea>
      </HomeContainer>

      {classroomCodeDialogVisible && stateClassroom && (
        <ClassroomCodeDialog theme={theme} classroom={stateClassroom} onClose={() => setClassroomCodeDialogVisible(false)} />
      )}

      {assignmentDetailsDialogVisible && stateClassroom && selectedAssignment && (
        <AssignmentDetailsDialog
          theme={theme}
          assignment={selectedAssignment}
          onClose={() => setAssignmentDetailsDialogVisible(false)}
          config={config}
          challengeProgressions={config === 'Student' ? studentChallengeProgressByScene : undefined}
        />
      )}
    </Container>
  );
};

export default connect((state: State) => {
  return {
    locale: state.i18n.locale,
    classroomList: state.classrooms.entities,
  };
}, (dispatch, ownProps) => ({
  onLoadClassroom: (classroomId: string) => dispatch(ClassroomsAction.loadClassroom({ classroomId })),
}))(HomeView) as React.ComponentType<HomeViewPublicProps>; 