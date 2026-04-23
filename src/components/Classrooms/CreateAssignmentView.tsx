
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
import { AsyncClassroom, ClassroomAssignment } from '../../state/State/Classroom';
import Dict from '../../util/objectOps/Dict';
import { useEffect, useState } from 'react';
import Input from '../interface/Input';
import Async from 'state/State/Async';
import AssignToDialog from '../Dialog/AssignToDialog';
import TextArea from '../interface/TextArea';

import { Challenges } from '../../state/State';
import ScrollArea from '../interface/ScrollArea';

export interface CreateAssignmentViewPublicProps extends ThemeProps, StyleProps {
  onClose: () => void;
  classroom: AsyncClassroom;
}

export interface CreateAssignmentViewPrivateProps extends ThemeProps {
  locale: LocalizedString.Language;
  challenges: Challenges;
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
  backgroundColor: 'lightgreen',
  width: '100%',
  height: '70vh'
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
  backgroundColor: 'lightgreen',
  gap: '1.4em',
  //width: '100%',

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


const CreateAssignmentView = ({
  theme,
  locale,
  onClose,
  classroom,
  challenges
}: Props) => {
  console.log("CreateAssignmentView rendered with classroom: ", classroom);
  console.log("CreateAssignmentView prop challenges: ", challenges);
  const loadedClassroom = Async.latestValue(classroom);
  const [assignToMenuVisible, setAssignToMenuVisible] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Dict<{ id: string, displayName: string }>>({});
  const [enableAssign, setEnableAssign] = useState(false);
  const [assignmentInfo, setAssignmentInfo] = useState<Partial<ClassroomAssignment>>({ points: 100, dueDate: "No Due Date" });
  console.log("CreateAssignmentView selectedStudents: ", selectedStudents);

  // useEffect(() => {
  //   console.log("CreateAssignmentView assignmentInfo changed: ", assignmentInfo);
  // }, [])
  function handleAssign() {
    assignmentInfo.dueDate ? console.log("Assignment due date: ", assignmentInfo.dueDate) : console.log("No due date set");
    console.log("Assigning with info: ", assignmentInfo);
  };

  function renderChallengeCheckboxes() {

    Object.values(challenges || {}).map(challenge => {
      console.log("Rendering checkbox for challenge: ", Async.latestValue(challenge).description[locale]);

    })
    // <div style={{ fontSize: '1.5em', display: 'flex', flexDirection: 'column', gap: '1em', alignItems: 'flex-start', margin: '1em' }}>
    //   {
    //     Object.values(challenges || {}).map(challenge => (

    //       <CheckboxRow theme={theme} key={LocalizedString.lookup(Async.latestValue(challenge).name, locale)}>
    //         <StyledCheckbox theme={theme} type="checkbox" id={`assign-to-${LocalizedString.lookup(Async.latestValue(challenge).name, locale)}`} name={`assign-to-${LocalizedString.lookup(Async.latestValue(challenge).name, locale)}`} value={LocalizedString.lookup(Async.latestValue(challenge).name, locale)} onChange={() => console.log("Toggled challenge: ", LocalizedString.lookup(Async.latestValue(challenge).name, locale))} />
    //         <label htmlFor={`assign-to-${LocalizedString.lookup(Async.latestValue(challenge).name, locale)}`}>{LocalizedString.lookup(Async.latestValue(challenge).name, locale)}</label>
    //       </CheckboxRow>
    //     ))
    //   }
    // </div>
    return (
      <div style={{ fontSize: '1.5em', display: 'flex', flexDirection: 'column', gap: '1em', alignItems: 'flex-start', margin: '1em' }}>
        {
          Object.values(challenges || {}).map(challenge => (

            <CheckboxRow theme={theme} key={`${Async.latestValue(challenge).name[locale]}-key`}>
              <StyledCheckbox theme={theme} type="checkbox" id={`assign-to-${LocalizedString.lookup(Async.latestValue(challenge).description, locale)}`} name={`assign-to-${LocalizedString.lookup(Async.latestValue(challenge).name, locale)}`} value={LocalizedString.lookup(Async.latestValue(challenge).name, locale)} onChange={() => console.log("Toggled challenge: ", LocalizedString.lookup(Async.latestValue(challenge).name, locale))} />
              <label htmlFor={`assign-to-${LocalizedString.lookup(Async.latestValue(challenge).description, locale)}`}>{LocalizedString.lookup(Async.latestValue(challenge).description, locale)}</label>
            </CheckboxRow>
          ))
        }
      </div>)
  }
  return (
    <Container theme={theme}>
      <TopRibbon theme={theme}>
        <div style={{ gap: '0.5em', fontWeight: 500, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Icon icon={faXmark} style={{ cursor: 'pointer', height: '1.1em' }} onClick={onClose} />
          <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'row', fontSize: '1.5em' }}>
            <Icon icon={faFileLines} style={{ fontSize: '1.3em' }} />
            {LocalizedString.lookup(tr('Create Assignment'), locale)}
          </div>

        </div>
        <Button theme={theme} disabled={!(enableAssign && Object.keys(selectedStudents).length > 0)} onClick={() => { enableAssign && Object.keys(selectedStudents).length > 0 ? handleAssign() : null }}>
          {LocalizedString.lookup(tr('Assign'), locale)}
        </Button>
      </TopRibbon>
      <div style={{ padding: '8px', display: 'flex', flexDirection: 'row', gap: '8px', flex: 1, justifyContent: 'space-evenly' }}>


        <AssignmentInputContainer theme={theme}>
          <AssignmentInfoRow theme={theme}>
            <label htmlFor="assignmentTitle" style={{ fontSize: '1.5em', fontWeight: 500 }}>
              {LocalizedString.lookup(tr('Assignment Title*'), locale)}

            </label>
            <AssignmentInfoContent theme={theme}>
              <Input id="assignmentTitle" onInput={(e) => { setEnableAssign((e.target as HTMLInputElement).value.trim().length > 0); setAssignmentInfo({ ...assignmentInfo, title: (e.target as HTMLInputElement).value }); }} required={true} placeholder={LocalizedString.lookup(tr('*Required'), locale)} theme={theme} />
            </AssignmentInfoContent>

          </AssignmentInfoRow>

          <AssignmentInfoRow theme={theme}>
            <label htmlFor="assignmentDescription" style={{ fontSize: '1.5em', fontWeight: 500 }}>
              {LocalizedString.lookup(tr('Assignment Description'), locale)}
            </label>
            <AssignmentInfoContent theme={theme}>
              <TextArea cols={50} onBlur={(e) => {
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
              {LocalizedString.lookup(tr('Points'), locale)}
              <AssignmentInfoContent theme={theme}>
                <Input
                  style={{ width: '50%' }}
                  type="number"
                  inputMode="numeric"
                  value={assignmentInfo.points}
                  onChange={(e) => {
                    const value = e.target.value;

                    setAssignmentInfo({
                      ...assignmentInfo,
                      points: value === '' ? '' : parseInt(value, 10),
                    });
                  }}
                  onBlur={() => {
                    setAssignmentInfo({
                      ...assignmentInfo,
                      points: assignmentInfo.points === '' ? 0 : assignmentInfo.points,
                    });
                  }}
                  theme={theme}
                />
              </AssignmentInfoContent>
            </label>
          </AssignmentInfoRow>

          <AssignmentInfoRow theme={theme}>
            <label>
              {LocalizedString.lookup(tr('Due Date'), locale)}
              <AssignmentInfoContent theme={theme}>
                <Input type="datetime-local" theme={theme} onChange={(e) => {
                  setAssignmentInfo({ ...assignmentInfo, dueDate: (e.target as HTMLInputElement).value });
                }} />
              </AssignmentInfoContent>
            </label>

          </AssignmentInfoRow>
        </AssignmentInfoContainer>

      </div>

      {
        assignToMenuVisible && (
          <AssignToDialog theme={theme} onClose={() => setAssignToMenuVisible(false)} classroom={classroom}
            selectedStudents={(students) => { console.log("Selected students: ", students); setSelectedStudents(students); }} />
        )
      }
    </Container >
  );
}

export default connect((state: State) => {
  return {
    locale: state.i18n.locale,
    classroomList: state.classrooms.entities,
    challenges: state.challenges,
  }
}, (dispatch, ownProps) => ({

}))(CreateAssignmentView) as React.ComponentType<CreateAssignmentViewPublicProps>; 