
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
import { AsyncClassroom } from '../../state/State/Classroom';
import Dict from '../../util/objectOps/Dict';
import { current } from 'immer';
import { get } from 'immer/dist/internal';
import { useState } from 'react';
import Async from 'state/State/Async';

export interface PeopleViewPublicProps extends ThemeProps, StyleProps {
  currentSelectedClassroom: AsyncClassroom | null;
  contextMenuVisible: boolean;
  setContextMenuVisible: React.Dispatch<React.SetStateAction<{ visible: boolean; x: number; y: number }>>;
}

export interface PeopleViewPrivateProps extends ThemeProps {
  locale: LocalizedString.Language;
  classroomList: Dict<AsyncClassroom>;
}

type Props = PeopleViewPublicProps & PeopleViewPrivateProps;

const Container = styled('div', (props: ThemeProps) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  color: props.theme.color,
  backgroundColor: props.theme.backgroundColor,
  //minHeight: '100vh',
}));

const TeacherStudentContainer = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  '@screen and (max-width: 800px)': {
    flexDirection: 'column',
  },
  // backgroundColor: 'pink',
  margin: '8px',
});

const TeacherContainer = styled('div', {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  borderColor: 'lightblue',
  alignItems: 'center',
  padding: '8px',
  borderWidth: '4px',
  borderStyle: 'solid',
});

const StudentContainer = styled('div', {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  borderColor: 'lightgreen',
  borderWidth: '4px',
  alignItems: 'center',
  padding: '8px',
  borderStyle: 'solid',
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
  setContextMenuVisible
}: Props) => {
  console.log("people view contextMenuVisible: ", contextMenuVisible)
  console.log("people view classroom list", classroomList)
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  console.log("contextMenu state: ", contextMenu);
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

    const students = Async.latestValue(currentSelectedClassroom)?.studentIds;
    console.log("getStudents: ", students);
    for (const student of Object.values(students || {})) {
      console.log("student", student);
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em', fontSize: '1.5em', alignItems: 'flex-start', width: '80%' }}>
        {students ? (
          Object.values(students).map((student: { displayName: string, id: string }, index) => (
            <StudentRow key={student.id} theme={theme} onClick={() => console.log("student row clicked!")}>
              <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'row' }}>
                <Icon icon={faUser} />
                {student.displayName}
              </div>
              <Icon style={{ height: '1em', padding: '0 0.5em' }} icon={faEllipsisVertical} onClick={(e) => {
                e.stopPropagation();
                console.log("e.clientX, e.clientY", e.clientX, e.clientY);
                setContextMenuVisible({ visible: true, x: e.clientX, y: e.clientY });
                setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
              }} />
            </StudentRow>
          ))


        ) : (
          <div>No students in this classroom.</div>
        )}


      </div>
    )
  }

  function renderContextMenu(x: number, y: number) {
    console.log("rendering context menu at", x, y);
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const menuWidth = 200;
    const menuHeight = 185;

    const adjustedX = Math.min(x, viewportWidth - menuWidth);
    const adjustedY = Math.min(y, viewportHeight - (menuHeight + 50));

    return (
      <ContextMenu x={adjustedX} y={adjustedY} theme={theme} onClick={() => console.log("context menu clicked")}>
        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              console.log("remove user from classroom");
              setContextMenuVisible({ visible: false, x: adjustedX, y: adjustedY });
            }}
          >
            {LocalizedString.lookup(tr("Remove User from Classroom"), locale)}
          </li>
        </ContextMenuItem>
      </ContextMenu>
    )
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
    </Container>
  )
}

export default connect((state: State) => {
  return {
    locale: state.i18n.locale,
    classroomList: state.classrooms.entities,
  }
}, (dispatch, ownProps) => ({

}))(PeopleView) as React.ComponentType<PeopleViewPublicProps>; 