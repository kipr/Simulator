
import { Theme, ThemeProps } from '../constants/theme';
import { StyleProps } from '../../util/style';
import LocalizedString from '../../util/LocalizedString';
import * as React from 'react';
import { styled } from 'styletron-react';
import { TabBar } from '../Layout/TabBar';
import tr from '@i18n';
import { faPlus, faUser, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { State } from '../../state';
import { connect } from 'react-redux';
import { FontAwesome } from '../FontAwesome';
import { AsyncClassroom, ClassroomAssignment } from '../../state/State/Classroom';
import Dict from '../../util/objectOps/Dict';
import { useState } from 'react';
import ScrollArea from '../interface/ScrollArea';
import Async from 'state/State/Async';
import Classroom from 'ivygate/dist/src/types/classroomTypes';
import { set } from 'immer/dist/internal';
import AssignedChallengesDialog from '../Dialog/AssignedChallengesDialog';
import SeeAssignedToDialog from '../Dialog/SeeAssignedToDialog';
import { DeleteDialog } from '../Dialog';

export interface AssignmentsViewPublicProps extends ThemeProps, StyleProps {
  currentSelectedClassroom: AsyncClassroom | null;
  onAssignmentAction: (currentSelectedClassroom: AsyncClassroom, action: 'edit' | 'create', assingmentToEdit?: ClassroomAssignment) => void;
  contextMenuVisible: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
  setContextMenuVisible: React.Dispatch<React.SetStateAction<{ visible: boolean; x: number; y: number }>>;
}

export interface AssignmentsViewPrivateProps extends ThemeProps {
  locale: LocalizedString.Language;
}

type Props = AssignmentsViewPublicProps & AssignmentsViewPrivateProps;


const Container = styled('div', ({ $theme }: { $theme: Theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  color: $theme.color,
  backgroundColor: $theme.backgroundColor,
  //minHeight: '100vh',
}));

const Button = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  padding: '10px',
  backgroundColor: '#2c2c2cff',
  borderBottom: `1px solid ${props.theme.borderColor}`,
  ':last-child': {
    borderBottom: 'none'
  },
  //opacity: props.disabled ? '0.5' : '1.0',
  fontWeight: 400,
  ':hover': {
    cursor: 'pointer',
    backgroundColor: `rgba(255, 255, 255, 0.1)`
  },
  userSelect: 'none',
  transition: 'background-color 0.2s, opacity 0.2s'
}));

const AssignmentsListContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  borderColor: props.theme.borderColor,
  borderWidth: '4px',
  borderStyle: 'solid',
  borderRadius: `${props.theme.itemPadding * 2}px`,
  padding: '8px',
  margin: '8px',
  backgroundColor: 'lightpurple',
  height: '100%',
}));

const StyledScrollArea = styled(ScrollArea, ({ theme }: ThemeProps) => ({
  flex: 1,
}));

const SubjectContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'lightpurple',
  //width: '100%'

}));

const SubjectHeader = styled('div', (props: ThemeProps) => ({
  fontSize: '1.5em',
  fontWeight: 'bold',
  marginBottom: '8px',
  borderBottom: `2px solid ${props.theme.borderColor}`,
  padding: '0 1em',
}));

const AssignmentRow = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  padding: '8px',
  borderBottom: `2px solid ${props.theme.borderColor}`,
  alignItems: 'center',
  ':hover': {
    cursor: 'pointer',
    backgroundColor: props.theme.hoverFileBackground
  },

}));

const AssignmentInfoBlurb = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '8px',
  borderBottom: `2px solid ${props.theme.borderColor}`,
  gap: '4px',


}));


const ContextMenu = styled('div', (props: ThemeProps & { x: number; y: number }) => ({
  position: "fixed",
  left: `${props.x}px`,
  top: `${props.y}px`,
  background: props.theme.contextMenuBackground,
  border: `2px solid ${props.theme.borderColor}`,
  borderRadius: "4px",
  boxShadow: "0px 4px 6px hsla(0, 0.00%, 0.00%, 0.10)",
  zIndex: 1000,
}));

const ContextMenuItem = styled('div', (props: ThemeProps) => ({
  listStyle: "none",
  padding: "10px",
  color: props.theme.color,
  margin: 0,
  cursor: "pointer",
  ':hover': {
    cursor: 'pointer',
    backgroundColor: `${props.theme.hoverFileBackground}`
  },
}));

const Icon = styled(FontAwesome, {
  paddingRight: "5px",
  height: "1.5em",
});

const BlurbClickText = styled('div', (props: ThemeProps) => ({
  color: '#7676ff',
  fontStyle: 'italic',
  fontSize: '0.9em',
  marginLeft: '1em',
  ':hover': {
    cursor: 'pointer',

  },
}));

const AssignmentsView = ({
  theme,
  locale,
  currentSelectedClassroom,
  onAssignmentAction,
  setContextMenuVisible,
  contextMenuVisible,
  containerRef
}: Props) => {

  console.log("AssignmentsView currentSelectedClassroom: ", currentSelectedClassroom);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [selectedAssignment, setSelectedAssignment] = useState<ClassroomAssignment | null>(null);
  const [assignmentInfoBlurbVisible, setAssignmentInfoBlurbVisible] = useState(false);
  const [assignedChallengesDialogVisible, setAssignedChallengesDialogVisible] = useState(false);
  const [assignedStudentsDialogVisible, setAssignedStudentsDialogVisible] = useState(false);
  const [deleteAssignmentDialogVisible, setDeleteAssignmentDialogVisible] = useState(false);

  function renderAssignmentInfoBlurb(assignment: ClassroomAssignment) {

    return (
      <AssignmentInfoBlurb theme={theme} key={`${assignment.title}-info-blurb`}>
        {assignment.dueDate !== 'No Due Date' ?
          <div style={{ marginLeft: '1em' }}>Posted {new Date(assignment.createdAt || '').toLocaleDateString(locale)}</div>
          : <div style={{ marginLeft: '1em' }} > No Due Date</div>}

        {assignment.description && <div style={{ marginLeft: '1em' }}>{assignment.description}</div>}

        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          {assignment.challenges && <BlurbClickText theme={theme} onClick={() => setAssignedChallengesDialogVisible(true)}>See Assigned Challenges</BlurbClickText>}
          {assignment.assignedTo && Object.keys(assignment.assignedTo).length > 0 &&
            <BlurbClickText theme={theme} onClick={() => setAssignedStudentsDialogVisible(true)}>
              See Assigned Students
            </BlurbClickText>}
        </div>
      </AssignmentInfoBlurb>
    )
  }


  function renderNoSubject(subject: string, assignments: ClassroomAssignment[]) {

    const loadedClassroom = Async.latestValue(currentSelectedClassroom);
    if (loadedClassroom && loadedClassroom.classroomAssignments) {
      return (
        <SubjectContainer theme={theme}>
          <SubjectHeader theme={theme}>{subject}</SubjectHeader>
          {assignments.map(assignment => (
            <div style={{ width: '100%' }} key={`${assignment.title}-row`}>
              <AssignmentRow theme={theme}
                onClick={(e) => {
                  e.stopPropagation();
                  setAssignmentInfoBlurbVisible(selectedAssignment !== assignment || !assignmentInfoBlurbVisible);
                  setSelectedAssignment(assignment);
                  console.log("Assignment clicked:", assignment);
                }}>
                <div style={{ flex: 1, fontWeight: 'bold' }}>
                  {assignment.title}
                </div>

                <div style={{ display: 'flex', flexDirection: 'row', gap: '4px', alignItems: 'center' }}>
                  <div >
                    {assignment.dueDate !== 'No Due Date' ?
                      `Due ${new Date(assignment.dueDate || '').toLocaleDateString(locale)}`
                      : `Posted ${new Date(assignment.createdAt || '').toLocaleDateString(locale)}`}
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'row', gap: '4px' }}>
                    <Icon style={{ height: '1em', padding: '0 0.5em' }} icon={faEllipsisVertical}
                      onClick={(e) => {
                        console.log("e.clientX, e.clientY", e.clientX, e.clientY);
                        const rect = containerRef.current?.getBoundingClientRect();
                        console.log("rect", rect);
                        const clickX = e.clientX;
                        const clickY = e.clientY;

                        setContextMenuVisible({ visible: true, x: clickX, y: clickY });
                        setContextMenu({ visible: true, x: clickX, y: clickY });

                      }} />
                  </div>
                </div>


              </AssignmentRow>
              < >
                {assignmentInfoBlurbVisible && selectedAssignment === assignment && renderAssignmentInfoBlurb(assignment)}
              </>
            </div>
          ))}
        </SubjectContainer>
      )
    }
  }



  function renderContextMenu(x: number, y: number) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const menuWidth = 200;
    const menuHeight = 185;

    const adjustedX = Math.min(x, viewportWidth - menuWidth);
    const adjustedY = Math.min(y, viewportHeight - (menuHeight + 50));
    console.log("rendering context menu at", x, y, "adjusted to", adjustedX, adjustedY);
    return (
      <ContextMenu x={adjustedX} y={adjustedY} theme={theme} onClick={() => console.log("context menu clicked")}>
        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              console.log("Existing Assignment Edit Clicked with assignment: ", selectedAssignment);
              onAssignmentAction(currentSelectedClassroom as AsyncClassroom, 'edit', selectedAssignment);
              setContextMenuVisible({ visible: false, x: adjustedX, y: adjustedY });
            }}
          >
            {LocalizedString.lookup(tr("Edit"), locale)}
          </li>

        </ContextMenuItem>
        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              console.log("Existing Assignment Delete Clicked");
              setContextMenuVisible({ visible: false, x: adjustedX, y: adjustedY });
              setDeleteAssignmentDialogVisible(true);
            }}
          >
            {LocalizedString.lookup(tr("Delete"), locale)}
          </li>
        </ContextMenuItem>
      </ContextMenu>
    )
  }

  const assignments = Async.latestValue(currentSelectedClassroom)?.classroomAssignments;
  console.log("AssignmentsView assignments: ", assignments);
  let topics: Dict<ClassroomAssignment[]> = {};
  if (assignments) {
    for (const assignment of Object.values(assignments)) {
      const topic = assignment.topic || 'No Subject';
      if (!topics[topic]) {
        topics[topic] = [];
      }
      topics[topic].push(assignment);
    }
    console.log("Derived topics from assignments: ", topics);
  }
  return (
    <Container $theme={theme}>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', margin: '8px' }}>
        <Button theme={theme} onClick={() => onAssignmentAction(currentSelectedClassroom, 'create')}>
          <FontAwesome icon={faPlus} style={{ marginRight: '8px' }} />
          {LocalizedString.lookup(tr('Create Assignment'), locale)}
        </Button>
      </div>

      <AssignmentsListContainer theme={theme}>
        <StyledScrollArea theme={theme}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '5em', padding: '8px' }}>

            {/* No Subject Container Column */}
            {<div style={{ width: '50%' }}>
              {renderNoSubject('No Subject', topics['No Subject'] || [])}
            </div>}

            {/* Named Subject Container Column */}
            <div style={{ display: 'flex', flexDirection: 'column', width: '50%' }}>
              {Object.keys(topics).filter(topic => topic !== 'No Subject').map(topic => (

                <div key={`${topic}-subject-column`} style={{ marginBottom: '2em' }}>
                  {renderNoSubject(topic, topics[topic] || [])}
                </div>
              ))}
            </div>

          </div>

        </StyledScrollArea>

      </AssignmentsListContainer>
      {assignedChallengesDialogVisible && selectedAssignment && (
        <AssignedChallengesDialog
          theme={theme}
          onClose={() => setAssignedChallengesDialogVisible(false)}
          assignment={selectedAssignment}
        />
      )}
      {assignedStudentsDialogVisible && selectedAssignment && (
        <SeeAssignedToDialog
          theme={theme}
          onClose={() => setAssignedStudentsDialogVisible(false)}
          assignment={selectedAssignment}
        />
      )}
      {contextMenuVisible && renderContextMenu(contextMenu.x, contextMenu.y)}
      {deleteAssignmentDialogVisible && selectedAssignment && (
        <DeleteDialog
          theme={theme}
          onClose={() => setDeleteAssignmentDialogVisible(false)}
          onAccept={() => {
            // Handle the delete action here
            console.log("Delete assignment accepted");
            setDeleteAssignmentDialogVisible(false);
          }}
          name={tr(selectedAssignment.title)}
        />
      )}
    </Container >
  );
};

export default connect((state: State) => {
  return {
    locale: state.i18n.locale,
    classroomList: state.classrooms.entities,
    challenges: state.challenges
  }
}, (dispatch, ownProps) => ({

}))(AssignmentsView) as React.ComponentType<AssignmentsViewPublicProps>; 