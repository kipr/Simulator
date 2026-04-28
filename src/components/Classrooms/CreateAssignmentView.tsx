
import { Theme, ThemeProps } from '../constants/theme';
import { StyleProps } from '../../util/style';
import LocalizedString from '../../util/LocalizedString';
import * as React from 'react';
import { styled } from 'styletron-react';
import { TabBar } from '../Layout/TabBar';
import tr from '@i18n';
import { faFileLines, faXmark, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { State } from '../../state';
import { connect } from 'react-redux';
import { FontAwesome } from '../FontAwesome';
import { AsyncClassroom, Classroom, ClassroomAssignment, ClassroomAssignmentChallenge } from '../../state/State/Classroom';
import Dict from '../../util/objectOps/Dict';
import { useEffect, useState } from 'react';
import Input from '../interface/Input';
import Async from 'state/State/Async';
import AssignToDialog from '../Dialog/AssignToDialog';
import TextArea from '../interface/TextArea';
import store, { State as ReduxState } from '../../state';
import { Challenges } from '../../state/State';
import ScrollArea from '../interface/ScrollArea';
import ResizeableComboBox from '../interface/ResizeableComboBox';
import { ClassroomsAction } from 'state/reducer/classrooms';


export interface CreateAssignmentViewPublicProps extends ThemeProps, StyleProps {
  onClose: () => void;
  onAssignComplete?: (students: Dict<{ id: string, displayName: string, assignments?: Dict<ClassroomAssignment> }>, assignment: ClassroomAssignment) => void;

  onEditComplete?: (students: Dict<{ id: string, displayName: string, assignments?: Dict<ClassroomAssignment> }>, assignment: ClassroomAssignment) => void;
  classroom: AsyncClassroom;
  originalAssignment?: ClassroomAssignment;
}

export interface CreateAssignmentViewPrivateProps extends ThemeProps {
  locale: LocalizedString.Language;
  challenges: Challenges;
  onCreateAssignment?: (classroom: Classroom, assignment: ClassroomAssignment, students: Dict<{ id: string, displayName: string, assignments?: Dict<ClassroomAssignment> }>) => void;
  onEditAssignment?: (classroom: Classroom, assignment: ClassroomAssignment, students: Dict<{ id: string, displayName: string, assignments?: Dict<ClassroomAssignment> }>) => void;
}
interface ClickProps {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}
type Props = CreateAssignmentViewPublicProps & CreateAssignmentViewPrivateProps;

const Container = styled('div', (props: ThemeProps) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  color: props.theme.color,
  backgroundColor: props.theme.backgroundColor,
  //zIndex: 100,
  //minHeight: '100vh',
}));

const TopRibbon = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  margin: '8px',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const Icon = styled(FontAwesome, {
  paddingRight: "5px",
});

const AssignmentInputContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  borderColor: props.theme.borderColor,
  borderWidth: '4px',
  borderStyle: 'solid',
  borderRadius: `${props.theme.itemPadding * 2}px`,
  padding: '1em',
  margin: '8px',
  gap: '1.4em',

  width: '60%',
  height: '85vh'
}));

const AssignmentInfoContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  borderColor: props.theme.borderColor,
  borderWidth: '4px',
  borderStyle: 'solid',
  borderRadius: `${props.theme.itemPadding * 2}px`,
  padding: '1em',
  margin: '8px',
  gap: '1.4em',
  width: '40%',

}));

const AssignmentInfoRow = styled('div', (props: ThemeProps) => ({
  gap: '0.5em',
  fontWeight: 500,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start'

}));

const AssignmentInfoContent = styled('div', (props: ThemeProps) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'row',
  fontSize: '1.2em',
  marginLeft: '1.4em'
}));

const Button = styled('div', (props: ThemeProps & ClickProps) => ({
  display: 'flex',
  alignItems: 'center',
  fontSize: '1.2em',
  flexDirection: 'row',
  padding: '10px',
  opacity: props.disabled ? "0.5" : "1.0",
  backgroundColor: '#2c2c2cff',
  borderBottom: `1px solid ${props.theme.borderColor}`,
  ':last-child': {
    borderBottom: 'none'
  },
  //opacity: props.disabled ? '0.5' : '1.0',
  fontWeight: 400,
  ":hover":
    props.onClick && !props.disabled
      ? {
        cursor: "pointer",
        backgroundColor: `rgba(255, 255, 255, 0.1)`,
      }
      : {},
  userSelect: 'none',
  transition: 'background-color 0.2s, opacity 0.2s',
}));

const StyledCheckbox = styled(Input, (props: ThemeProps) => ({
  transform: 'scale(1.4)',
  width: 'auto'
}));

const StyledResizeableComboBox = styled(ResizeableComboBox, (props: ThemeProps) => ({
  //flex: '1 0',
  //padding: '3px',
  color: props.theme.color

}));

const DateTimeInput = styled(Input, (props: ThemeProps) => ({
  width: '100%',
  colorScheme: 'dark',

  cursor: 'pointer',

}));


const StyledScrollArea = styled(ScrollArea, ({ theme }: ThemeProps) => ({
  flex: 1,
}));

const CheckboxRow = styled('div', (props: ThemeProps) => ({
  gap: '0.5em',
  fontWeight: 500,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

const TableBody = styled('tbody', (props: ThemeProps) => ({
  outline: `2px solid ${props.theme.borderColor}`,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5em',
  padding: '0.5em',
}));

const TableRow = styled('tr', (props: ThemeProps) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const TableCell = styled('td', (props: ThemeProps) => ({
  fontSize: '0.8em',
  display: 'flex',
  color: props.theme.color,
  justifyContent: 'flex-end'
}));


const CreateAssignmentView = ({
  theme,
  locale,
  onClose,
  classroom,
  challenges,
  onAssignComplete,
  onCreateAssignment,
  originalAssignment,
  onEditComplete,
  onEditAssignment
}: Props) => {

  const loadedClassroom = Async.latestValue(classroom);
  console.log("Loaded classroom in CreateAssignmentView: ", loadedClassroom);
  console.log("Original Assignment in CreateAssignmentView: ", originalAssignment);
  const [assignToMenuVisible, setAssignToMenuVisible] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Dict<{ id: string, displayName: string }>>(originalAssignment?.assignedTo || {});
  const [enableAssign, setEnableAssign] = useState(false);
  const [assignmentInfo, setAssignmentInfo] = useState<Partial<ClassroomAssignment>>(
    {
      createdAt: originalAssignment?.createdAt || '',
      challenges: originalAssignment?.challenges || {},
      dueDate: originalAssignment?.dueDate || "No Due Date",
      description: originalAssignment?.description || '',
      topic: originalAssignment?.topic || "No Subject",
      title: originalAssignment?.title || '',
      assignedTo: originalAssignment?.assignedTo || {},
      points: originalAssignment?.points || 0,
    });
  const [isCreatingTopic, setIsCreatingTopic] = React.useState(false);
  const [newTopic, setNewTopic] = React.useState("");
  const [topics, setTopics] = useState<ResizeableComboBox.Option[]>([loadedClassroom.topics
    ? Object.keys(loadedClassroom.topics).map(topic => topic === 'No Subject'
      ? { text: LocalizedString.lookup(tr('No Subject'), locale), data: 'No Subject' }
      : { text: topic, data: topic }).concat({ text: LocalizedString.lookup(tr('Create Subject'), locale), data: 'Create Subject' })
    : [{ text: LocalizedString.lookup(tr('No Subject'), locale), data: 'No Subject' }, { text: LocalizedString.lookup(tr('Create Subject'), locale), data: 'Create Subject' }]].flat());
  console.log("Topics for CreateAssignmentView: ", topics);
  const [assignedPointsSet, setAssignedPointsSet] = useState<Dict<{ challenge: ClassroomAssignmentChallenge, points: number | '' }>>({});
  const [topicIndex, setTopicIndex] = React.useState(originalAssignment?.topic ? Object.keys(loadedClassroom?.topics || {}).indexOf(originalAssignment.topic) : topics.findIndex(
    topic => topic.data === 'No Subject'
  ));
  const [originalAssignmentInfo, setOriginalAssignmentInfo] = useState<Partial<ClassroomAssignment>>(originalAssignment);


  console.log("CreateAssignmentView originalAssignmentInfo: ", originalAssignmentInfo);
  console.log("CreateAssignmentView topicIndex: ", topicIndex);

  function handleAssign(info: ClassroomAssignment) {
    console.log("Assigning with info: ", info);
    onAssignComplete?.(selectedStudents, info);
    onCreateAssignment(loadedClassroom, info, selectedStudents);
    onClose();
  };
  function handleEdit(info: ClassroomAssignment) {
    console.log("Editing with info: ", info);
    onEditComplete?.(selectedStudents, info);
    onEditAssignment(loadedClassroom, info, selectedStudents);
    onClose();
  }
  useEffect(() => {
    if (!originalAssignment) return;
    console.log("Setting assignmentInfo based on originalAssignment: ", originalAssignment);
    setAssignedPointsSet(originalAssignment.challenges ?? {});
  }, [originalAssignment]);

  useEffect(() => {
    const finalPointValue = Object.values(assignedPointsSet).reduce((total, { points }) => {
      return total + (typeof points === 'number' ? points : 0);
    }, 0);

    console.log("finalPointValue: ", finalPointValue);
    console.log("assignedPointsSet: ", assignedPointsSet);
    setAssignmentInfo({
      ...assignmentInfo, points: finalPointValue,
      challenges: Object.values(assignedPointsSet).reduce((acc, { challenge, points }) => {
        acc[challenge.sceneId] = { challenge, points };
        return acc;
      }, {} as Dict<{ challenge: ClassroomAssignmentChallenge, points: number | '' }>)
    });
  }, [assignedPointsSet]);



  useEffect(() => {
    console.log("useEffect selectedStudents: ", selectedStudents);
    if (selectedStudents) {
      setAssignmentInfo(prev => ({
        ...prev,
        assignedTo: Object.fromEntries(Object.entries(selectedStudents).map(([id, student]) => [id, { id: student.id, displayName: student.displayName }]))
      }));
    }
  }, [selectedStudents]);


  function renderChallengeCheckboxes() {
    console.log("renderChallengeCheckboxes challenges: ", assignmentInfo.challenges);
    return (
      <div style={{ fontSize: '1.5em', display: 'flex', flexDirection: 'column', gap: '1em', alignItems: 'flex-start', margin: '1em' }}>
        {
          Object.values(challenges || {}).map(challenge => (

            <CheckboxRow theme={theme} key={`${Async.latestValue(challenge).sceneId}-key`}>
              <StyledCheckbox theme={theme} type="checkbox" id={`assign-to-${LocalizedString.lookup(Async.latestValue(challenge).description, locale)}`}
                name={`assign-to-${LocalizedString.lookup(Async.latestValue(challenge).name, locale)}`}
                value={LocalizedString.lookup(Async.latestValue(challenge).name, locale)}
                checked={assignmentInfo.challenges ? Object.values(assignmentInfo.challenges).some(({ challenge: assignedChallenge }) => assignedChallenge.sceneId === Async.latestValue(challenge).sceneId) : false}
                onChange={() => {
                  const currentChallenge = Async.latestValue(challenge);
                  const existingChallenges = assignmentInfo.challenges || {};

                  const alreadyExists = Object.values(existingChallenges).some(
                    ({ challenge }) => challenge.name[locale] === currentChallenge.name[locale]
                  );

                  const key = currentChallenge.sceneId;
                  console.log("checkbox key: ", key);

                  setAssignedPointsSet(prev => {
                    const next = { ...prev };
                    if (alreadyExists) {
                      delete next[key];
                    } else {
                      console.log("key: ", key);
                      next[key] = { challenge: { sceneId: currentChallenge.sceneId, name: currentChallenge.name[locale], description: currentChallenge.description[locale] }, points: 0 };
                    }
                    return next;

                  });
                }} />

              <label htmlFor={`assign-to-${LocalizedString.lookup(Async.latestValue(challenge).description, locale)}`}>{LocalizedString.lookup(Async.latestValue(challenge).description, locale)}</label>
            </CheckboxRow>
          ))
        }
      </div>)
  }

  function editTopic() {
    const topic = newTopic.trim();

    const newTopics = [...topics];
    const insertIndex = newTopics.length - 1;

    newTopics.splice(insertIndex, 0, {
      text: topic,
      data: topic,
    });

    setTopics(newTopics);
    setAssignmentInfo({ ...assignmentInfo, topic });
    setTopicIndex(insertIndex);
    setIsCreatingTopic(false);
  }

  return (
    <Container theme={theme}>
      <TopRibbon theme={theme}>
        <div style={{ gap: '0.5em', fontWeight: 500, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Icon icon={faXmark} style={{ cursor: 'pointer', height: '1.1em' }} onClick={onClose} />
          <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'row', fontSize: '1.5em' }}>
            <Icon icon={faFileLines} style={{ fontSize: '1.3em' }} />
            {originalAssignment ? LocalizedString.lookup(tr('Edit Assignment'), locale) : LocalizedString.lookup(tr('Create Assignment'), locale)}
          </div>

        </div>
        <Button theme={theme} disabled={originalAssignment ? Object.keys(selectedStudents).length > 0 ? false : true : !(enableAssign && Object.keys(selectedStudents).length > 0)}
          onClick={() => {
            originalAssignment
              ? (() => {
                console.log("Editing assignment with info: ", assignmentInfo);
                const editedAssignment = {
                  ...assignmentInfo,
                  editedAt: new Date().toISOString(),
                } as ClassroomAssignment;
                onEditComplete?.(selectedStudents, editedAssignment);
                handleEdit(editedAssignment);
                console.log("Edited assignment: ", editedAssignment);
              })()
              : (enableAssign && Object.keys(selectedStudents).length > 0 ? (() => {
                const updatedAssignmentInfo = {
                  ...assignmentInfo,
                  createdAt: new Date().toISOString(),
                } as ClassroomAssignment;

                setAssignmentInfo(updatedAssignmentInfo);
                handleAssign(updatedAssignmentInfo);
              })() : null)
          }}>
          {originalAssignment ? LocalizedString.lookup(tr('Save Changes'), locale) : LocalizedString.lookup(tr('Assign'), locale)}
        </Button>
      </TopRibbon>
      <div style={{ padding: '8px', display: 'flex', flexDirection: 'row', gap: '8px', flex: 1, justifyContent: 'space-evenly' }}>


        <AssignmentInputContainer theme={theme}>
          <AssignmentInfoRow theme={theme}>
            <label htmlFor="assignmentTitle" style={{ fontSize: '1.5em', fontWeight: 500 }}>
              {LocalizedString.lookup(tr('Assignment Title*'), locale)}

            </label>
            <AssignmentInfoContent theme={theme}>
              <Input
                id="assignmentTitle"
                value={assignmentInfo?.title ?? ''}
                onInput={(e) => {
                  const val = (e.target as HTMLInputElement).value;
                  setEnableAssign(val.trim().length > 0);
                  setAssignmentInfo(prev => ({ ...prev!, title: val }));
                }}
                required={true}
                placeholder={LocalizedString.lookup(tr('*Required'), locale)}
                theme={theme}
              />
            </AssignmentInfoContent>

          </AssignmentInfoRow>

          <AssignmentInfoRow theme={theme}>
            <label htmlFor="assignmentDescription" style={{ fontSize: '1.5em', fontWeight: 500 }}>
              {LocalizedString.lookup(tr('Assignment Description'), locale)}
            </label>
            <AssignmentInfoContent theme={theme}>
              <TextArea cols={50} defaultValue={assignmentInfo.description} onBlur={(e) => {
                setAssignmentInfo({ ...assignmentInfo, description: (e.target as HTMLTextAreaElement).value });
              }} id="assignmentDescription" rows={4} placeholder={LocalizedString.lookup(tr('Optional'), locale)} theme={theme} />
            </AssignmentInfoContent>
          </AssignmentInfoRow>

          <AssignmentInfoRow theme={theme} style={{ height: '100%', flex: 1 }}>
            <label htmlFor="assignmentChallenges" style={{ fontSize: '1.5em', fontWeight: 500 }}>
              {LocalizedString.lookup(tr('Choose JBC Challenges to Assign'), locale)}
            </label>
            <StyledScrollArea theme={theme}>
              {renderChallengeCheckboxes()}
            </StyledScrollArea>
          </AssignmentInfoRow>
        </AssignmentInputContainer>


        <AssignmentInfoContainer theme={theme}>
          <AssignmentInfoRow theme={theme}>
            {LocalizedString.lookup(tr('For Class'), locale)}
            <AssignmentInfoContent theme={theme}>
              {`${loadedClassroom?.classroomId || 'Loading...'}`}
            </AssignmentInfoContent>
          </AssignmentInfoRow>
          <AssignmentInfoRow theme={theme}>
            {LocalizedString.lookup(tr('Assign to'), locale)}
            <Button
              style={{ marginLeft: '1.4em' }} theme={theme} onClick={() => setAssignToMenuVisible(true)}>
              {Object.keys(selectedStudents).length === Object.keys(loadedClassroom?.studentIds || {}).length
                ? LocalizedString.lookup(tr('All Students'), locale)
                : `${Object.keys(selectedStudents).length} ${LocalizedString.lookup(tr('Students'), locale)}`}
            </Button>
          </AssignmentInfoRow>

          <AssignmentInfoRow theme={theme}>
            <label>
              {LocalizedString.lookup(tr('Topic'), locale)}

            </label>
            <AssignmentInfoContent theme={theme}>
              <StyledResizeableComboBox
                options={topics}
                index={topicIndex}
                onSelect={(optionIndex) => {
                  console.log("Selected topic: ", topics[optionIndex]);
                  if (topics[optionIndex].data === "Create Subject") {
                    setIsCreatingTopic(true);
                    setNewTopic("");
                    return;
                  }
                  else {
                    setIsCreatingTopic(false);
                    setTopicIndex(optionIndex);

                  }

                  setAssignmentInfo({
                    ...assignmentInfo,
                    topic: topics[optionIndex].data as string,
                  });
                }}
                mainWidth={'4em'}
                mainHeight={'1.5em'}
                mainFontSize={'0.9em'}
                theme={theme}
                customMainContent={
                  isCreatingTopic ? (
                    <input
                      autoFocus
                      value={newTopic}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setNewTopic(e.target.value)}
                      onBlur={() => { editTopic(); }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newTopic.trim()) {
                          editTopic();
                        }

                        if (e.key === "Escape") {
                          setIsCreatingTopic(false);
                        }
                      }}
                    />
                  ) : undefined
                }
              />
            </AssignmentInfoContent>
          </AssignmentInfoRow>
          <AssignmentInfoRow theme={theme}>

            {LocalizedString.lookup(tr('Points'), locale)}
            <AssignmentInfoContent theme={theme}>
              <Input
                style={{ width: '50%', cursor: 'default' }}
                type="number"
                inputMode="numeric"
                readOnly={true}
                value={assignmentInfo.points}
                onChange={(e) => {
                  const value = e.target.value;

                  setAssignmentInfo({
                    ...assignmentInfo,
                    points: value === '' ? '' : parseInt(value, 10),
                  });
                }}

                theme={theme}
              />
            </AssignmentInfoContent>
            {Object.keys(assignedPointsSet).length > 0 && (

              <AssignmentInfoContent theme={theme} style={{ marginTop: '0.2em', width: '97%' }}>
                <StyledScrollArea style={{ height: '18em' }} theme={theme}>
                  <table>
                    <TableBody theme={theme}>

                      {Object.values(assignedPointsSet)?.map(({ challenge, points }, index) => (
                        <TableRow theme={theme} key={`${challenge.sceneId}-points-row`}>
                          <TableCell theme={theme} style={{ maxWidth: '70%', fontSize: '0.8em', color: theme.color }}>
                            {LocalizedString.lookup(tr(challenge.description), locale)}
                          </TableCell>
                          <TableCell style={{ width: '20%' }} theme={theme}>
                            <Input
                              type="number" min={0} inputMode="numeric" theme={theme} value={points} onChange={(e) => {
                                const value = e.target.value;
                                setAssignedPointsSet(prev => ({
                                  ...prev,
                                  [challenge.sceneId]: {
                                    challenge,
                                    points: value === '' ? 0 : parseInt(value, 10),
                                  }
                                }));
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}


                    </TableBody>
                  </table>
                </StyledScrollArea>
              </AssignmentInfoContent>

            )}

          </AssignmentInfoRow>

          <AssignmentInfoRow theme={theme}>

            {LocalizedString.lookup(tr('Due Date'), locale)}
            <AssignmentInfoContent theme={theme}>
              <DateTimeInput
                type="datetime-local"
                theme={theme}
                onChange={(e) => {
                  setAssignmentInfo({
                    ...assignmentInfo,
                    dueDate: (e.target as HTMLInputElement).value,
                  });
                }}
              />
            </AssignmentInfoContent>


          </AssignmentInfoRow>


        </AssignmentInfoContainer>

      </div>

      {
        assignToMenuVisible && (
          <AssignToDialog theme={theme} onClose={() => setAssignToMenuVisible(false)} classroom={classroom}
            selectedStudents={(students) => { console.log("Selected students: ", students); setSelectedStudents(students); }}
            alreadyAssignedStudents={originalAssignment?.assignedTo as Dict<{ id: string, displayName: string }> | undefined}
          />
        )
      }
    </Container >
  );
}

export default connect((state: ReduxState) => {
  return {
    locale: state.i18n.locale,
    classroomList: state.classrooms.entities,
    challenges: state.challenges,

  }
}, (dispatch, ownProps) => ({
  onCreateAssignment: (classroom: Classroom, assignment: ClassroomAssignment, studentIds: Dict<{ id: string, displayName: string, assignments?: Dict<ClassroomAssignment> }>) => {
    console.log("Dispatching create assignment with info: ", assignment, studentIds);
    dispatch(ClassroomsAction.setAssignment({ classroom, assignment, studentIds }));
  },
  onEditAssignment: (classroom: Classroom, assignment: ClassroomAssignment, studentIds: Dict<{ id: string, displayName: string, assignments?: Dict<ClassroomAssignment> }>) => {
    console.log("Dispatching edit assignment with info: ", assignment, studentIds);
    dispatch(ClassroomsAction.setAssignment({ classroom, assignment, studentIds }));
  }
}))(CreateAssignmentView) as React.ComponentType<CreateAssignmentViewPublicProps>; 