
import { Theme, ThemeProps } from '../constants/theme';
import { StyleProps } from '../../util/style';
import LocalizedString from '../../util/LocalizedString';
import * as React from 'react';
import { styled } from 'styletron-react';
import { TabBar } from '..//Layout/TabBar';
import tr from '@i18n';
import { faPersonChalkboard, faUser, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { State } from '../../state';
import { connect } from 'react-redux';
import { FontAwesome } from '../FontAwesome';
import { AsyncClassroom, Classroom } from '../../state/State/Classroom';
import Dict from '../../util/objectOps/Dict';
import { current } from 'immer';
import { get } from 'immer/dist/internal';
import { useState } from 'react';
import Async from 'state/State/Async';
import { ClassroomsAction } from '../../state/reducer';
import RemoveUserFromClassroomDialog from '../Dialog/RemoveUserFromClassroomDialog';
import { useTeacherViewOverlayEffect } from './TeacherViewOverlayContext';

export interface PeopleViewPublicProps extends ThemeProps, StyleProps {
  currentSelectedClassroom: AsyncClassroom | null;
  contextMenuVisible: boolean;
  setContextMenuVisible: React.Dispatch<React.SetStateAction<{ visible: boolean; x: number; y: number }>>;
  config?: 'Student' | 'Teacher';
}

export interface PeopleViewPrivateProps extends ThemeProps {
  locale: LocalizedString.Language;
  classroomList: Dict<AsyncClassroom>;
  onRemoveStudentFromClassroom: (studentId: string, currentClassroom: AsyncClassroom) => void;
}

type Props = PeopleViewPublicProps & PeopleViewPrivateProps;

const Container = styled('div', (props: ThemeProps) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  color: props.theme.color,
  backgroundColor: props.theme.backgroundColor,
  // minHeight: '100vh',
}));

const TeacherStudentContainer = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  '@screen and (max-width: 800px)': {
    flexDirection: 'column',
  },
  margin: '8px',
});

const TeacherContainer = styled('div', {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '8px',
  // borderWidth: '4px',
  // borderStyle: 'solid',
});

const StudentContainer = styled('div', {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  // borderWidth: '4px',
  alignItems: 'center',
  padding: '8px',
  // borderStyle: 'solid',
});
const Icon = styled(FontAwesome, {
  paddingRight: "5px",
  height: "1.5em",
});

const StudentRow = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  ':hover': {
    cursor: 'pointer',
    backgroundColor: props.theme.hoverFileBackground
  },
  padding: '4px',
  borderRadius: '4px',
  width: '100%',
  justifyContent: 'space-between',
  alignItems: 'center',
  zIndex: 0,
}));

const ContextMenu = styled('div', (props: ThemeProps & { x: number; y: number }) => ({
  position: "absolute",
  top: `${props.y}px`,
  left: `${props.x}px`,
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

const PeopleView = ({
  theme,
  locale,
  classroomList,
  currentSelectedClassroom,
  contextMenuVisible,
  setContextMenuVisible,
  onRemoveStudentFromClassroom,
  config
}: Props) => {

  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [selectedStudent, setSelectedStudent] = useState<{ id: string, displayName: string } | null>(null);
  const [removeUserDialogVisible, setRemoveUserDialogVisible] = useState(false);

  useTeacherViewOverlayEffect(config === 'Teacher' && removeUserDialogVisible);

  function getTeachers(currentSelectedClassroom: AsyncClassroom | null) {
    const teachers = Async.latestValue(currentSelectedClassroom)?.teacherDisplayName;
    return (
      <div style={{ display: 'flex', flexDirection: 'row', gap: '1em', fontSize: '1.5em', justifyContent: 'center', alignItems: 'center' }}>
        <Icon icon={faPersonChalkboard} />
        {teachers}
      </div>
    );
  }

  function getStudents(currentSelectedClassroom: AsyncClassroom | null) {

    const loadedClassroom = Async.latestValue(currentSelectedClassroom);
    const stateClassroom = classroomList[loadedClassroom?.docId || ''];
    const students = Async.latestValue(stateClassroom)?.studentIds;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em', fontSize: '1.5em', alignItems: 'flex-start', width: '80%' }}>
        {students ? (
          Object.values(students).map((student: { displayName: string, id: string }, index) => (
            <StudentRow key={student.id} theme={theme}>
              <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'row' }}>
                <Icon icon={faUser} />
                {student.displayName}
              </div>
              {config === 'Teacher' && (
                <Icon style={{ height: '1em', padding: '0 0.5em' }} icon={faEllipsisVertical} onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setSelectedStudent(student);
                  setContextMenuVisible({ visible: true, x: e.clientX, y: e.clientY });
                  setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
                }} />)}
            </StudentRow>
          ))


        ) : (
          <div>No students in this classroom.</div>
        )}


      </div>
    );
  }

  function renderContextMenu(x: number, y: number) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const menuWidth = 200;
    const menuHeight = 185;

    const adjustedX = Math.min(x, viewportWidth - menuWidth);
    const adjustedY = Math.min(y, viewportHeight - (menuHeight + 50));

    return (
      <ContextMenu x={adjustedX} y={adjustedY} theme={theme} >
        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              setRemoveUserDialogVisible(true);
              setContextMenuVisible({ visible: false, x: adjustedX, y: adjustedY });
            }}
          >
            {LocalizedString.lookup(tr("Remove User from Classroom"), locale)}
          </li>
        </ContextMenuItem>
      </ContextMenu>
    );
  }
  return (
    <Container theme={theme} onClick={() => setContextMenu({ ...contextMenu, visible: false })}>
      <TeacherStudentContainer>
        <TeacherContainer>
          <h1 style={{ textDecoration: 'underline' }}>{LocalizedString.lookup(tr('Teachers'), locale)}</h1>
          {currentSelectedClassroom && (
            getTeachers(currentSelectedClassroom)
          )}
        </TeacherContainer>
        <StudentContainer>
          <h1 style={{ textDecoration: 'underline' }}>{LocalizedString.lookup(tr('Students'), locale)}</h1>
          {currentSelectedClassroom && (
            getStudents(currentSelectedClassroom)
          )}
        </StudentContainer>
      </TeacherStudentContainer>
      {contextMenuVisible && renderContextMenu(contextMenu.x, contextMenu.y)}
      {removeUserDialogVisible &&
        <RemoveUserFromClassroomDialog
          theme={theme} locale={locale}
          onClose={() => setRemoveUserDialogVisible(false)}
          onAcceptRemove={() => {
            onRemoveStudentFromClassroom(selectedStudent?.id || "", currentSelectedClassroom);
            setRemoveUserDialogVisible(false);
          }}
          toRemoveUser={selectedStudent?.displayName || ""}
          classroom={Async.latestValue(currentSelectedClassroom) }

        />}
    </Container>
  );
};

export default connect((state: State) => {
  return {
    locale: state.i18n.locale,
    classroomList: state.classrooms.entities,
  };
}, (dispatch, ownProps) => ({
  onRemoveStudentFromClassroom: (studentId: string, currentClassroom: AsyncClassroom) => {
    dispatch(ClassroomsAction.removeStudentFromClassroom({ studentId, currentClassroom }));
  }
}))(PeopleView) as React.ComponentType<PeopleViewPublicProps>; 