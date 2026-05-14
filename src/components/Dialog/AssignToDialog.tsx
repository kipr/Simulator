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
import TourTarget from "../Tours/TourTarget";
import { TourRegistry } from "../../tours/TourRegistry";


export interface AssignToDialogPublicProps extends StyleProps, ThemeProps {
  onClose: () => void;
  classroom: AsyncClassroom;
  selectedStudents: (students: Dict<{ id: string, displayName: string, assignments?: Dict<ClassroomAssignment> }>) => void;
  alreadyAssignedStudents?: Dict<{ id: string, displayName: string, assignments?: Dict<ClassroomAssignment> }>;
  tourRegistry?: TourRegistry;
}

export interface AssignToDialogPrivateProps extends ThemeProps {
  locale: LocalizedString.Language;
}

type Props = AssignToDialogPublicProps & AssignToDialogPrivateProps;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  height: 'auto',
  margin: '1em',
  zIndex: 100,
}));

const CheckboxRow = styled('div', (props: ThemeProps) => ({
  gap: '0.5em',
  fontWeight: 500,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

const StyledCheckbox = styled(Input, (props: ThemeProps) => ({
  transform: 'scale(1.4)',
  width: 'auto'
}));

const ButtonContainer = styled('div', (theme: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: `${theme.theme.itemPadding * 4}px`,
  marginBottom: `${theme.theme.itemPadding * 2}px`,
}));

const Finalize = styled('div', (props: ThemeProps & { disabled?: boolean }) => ({
  flex: '1 1',
  borderRadius: `${props.theme.itemPadding * 2}px`,
  padding: `${props.theme.itemPadding * 2}px`,
  backgroundColor: GREEN.standard,
  ':hover': {
    backgroundColor: GREEN.hover,
  },
  fontWeight: 400,
  fontSize: '1.1em',
  textAlign: 'center',
  cursor: 'pointer',
}));

const AssignTo = ({
  onClose,
  classroom,
  theme,
  locale,
  selectedStudents,
  alreadyAssignedStudents,
  tourRegistry
}: Props) => {
  const loadedClassroom = Async.latestValue(classroom);

  const students = loadedClassroom?.studentIds || {};
  const foundStudents: Dict<{
    id: string;
    displayName: string;
    assignments?: Dict<ClassroomAssignment>;
  }> = Object.fromEntries(
    Object.entries(students)
      .filter(([id]) => Boolean(alreadyAssignedStudents?.[id]))
      .map(([id, student]) => [
        id,
        {
          id,
          displayName: student.displayName,
          assignments: student.assignments,
        },
      ])
  );

  const [selectedIds, setSelectedIds] = React.useState<Dict<{ id: string, displayName: string, assignments?: Dict<ClassroomAssignment> }>>(foundStudents || {});
  const allSelected =
    loadedClassroom &&
    Object.keys(selectedIds).length === Object.keys(loadedClassroom.studentIds || {}).length;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds({});
    } else {
      setSelectedIds(loadedClassroom.studentIds || {});
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedIds(prev =>
      (Object.prototype.hasOwnProperty.call(prev, studentId)
        ? Object.fromEntries(
          Object.entries(prev).filter(([id]) => id !== studentId)
        )
        : { ...prev, [studentId]: loadedClassroom.studentIds[studentId] as { id: string; displayName: string; assignments?: Dict<ClassroomAssignment> } })
    );
  };

  const assignToStudentRows = React.useMemo(() => {
    const ids = loadedClassroom?.studentIds;
    if (!ids) return [] as { id: string; displayName: string }[];
    return Object.keys(ids).map((id) => {
      const s = ids[id];
      return { id, displayName: s.displayName };
    });
  }, [loadedClassroom?.studentIds]);

  return (
    <Dialog
      theme={theme}
      name={LocalizedString.lookup(tr('Assign To'), locale)}
      onClose={onClose}
      tourRegistry={tourRegistry}
      tourTargetKey={tourRegistry ? 'teacher-create-assignment-assign-to-dialog' : undefined}
    >
      <Container theme={theme}>
        <div style={{ fontSize: '1.5em', display: 'flex', flexDirection: 'column', gap: '1em', alignItems: 'flex-start', margin: '1em' }}>
          <CheckboxRow theme={theme}>
            <StyledCheckbox type="checkbox" theme={theme} id={`assign-to-all`} checked={allSelected} onChange={() => { toggleAll(); }} />
            <label htmlFor={`assign-to-all`}>{LocalizedString.lookup(tr('All Students'), locale)}</label>
          </CheckboxRow>
          {
            assignToStudentRows.map(({ id, displayName }) => (
              <CheckboxRow theme={theme} key={id}>
                <StyledCheckbox theme={theme} type="checkbox" id={`assign-to-${id}`} name={`assign-to-${id}`} value={id} checked={selectedIds[id] !== undefined} onChange={() => toggleStudent(id)} />
                <label htmlFor={`assign-to-${id}`}>{displayName}</label>
              </CheckboxRow>
            ))
          }
        </div>

        <ButtonContainer theme={theme}>
          {tourRegistry ? (
            <TourTarget registry={tourRegistry} targetKey="teacher-create-assignment-assign-to-done" style={{ display: 'contents' }}>
              <Finalize
                theme={theme}
                onClick={() => { selectedStudents(selectedIds); onClose(); }}
              >
                {LocalizedString.lookup(tr('Done'), locale)}
              </Finalize>
            </TourTarget>
          ) : (
            <Finalize
              theme={theme}
              onClick={() => { selectedStudents(selectedIds); onClose(); }}
            >
              {LocalizedString.lookup(tr('Done'), locale)}
            </Finalize>
          )}
        </ButtonContainer>
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

}))(AssignTo) as React.ComponentType<AssignToDialogPublicProps>; 