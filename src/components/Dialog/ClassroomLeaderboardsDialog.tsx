import * as React from 'react';
import axios from 'axios';
import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';

import Form from '../interface/Form';
import { ThemeProps } from '../constants/theme';
import { StyleProps } from '../../util/style';
import { styled } from 'styletron-react';
import { Dialog } from './Dialog';
//import { Modal } from '../pages/Modal';

import { FontAwesome } from '../FontAwesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Settings } from '../constants/Settings';
import { AsyncClassroom, Classroom } from 'state/State/Classroom';
import Dict from 'util/objectOps/Dict';
import Button from '../../components/interface/Button';
import ComboBox from '../../components/interface/ComboBox';

export interface ClassroomLeaderboardsDialogPublicProps extends ThemeProps, StyleProps {

  classrooms: Dict<AsyncClassroom>;
  onClose: () => void;

}

interface ClassroomLeaderboardsDialogPrivateProps {
  locale: LocalizedString.Language;
}

interface ClickProps {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}

interface ClassroomLeaderboardsDialogState {

  showRepeatProjectDialog: boolean;
  language: string;
  classroomOptions: ComboBox.Option[];
  selectedClassroom: AsyncClassroom;
  errorMessage: string;
}

type Props = ClassroomLeaderboardsDialogPublicProps & ClassroomLeaderboardsDialogPrivateProps;
type State = ClassroomLeaderboardsDialogState;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  color: props.theme.color,
  minHeight: '200px',
}));

const ComboBoxLabel = styled('label', (theme: ThemeProps) => ({
  display: 'block',
  color: theme.theme.color,
  fontSize: '1.1em',
  fontWeight: 'normal',
  marginTop: `${theme.theme.itemPadding * 2}px`,
  marginBottom: `${theme.theme.itemPadding}px`,
  marginRight: `${theme.theme.itemPadding}px`,
  userSelect: 'none'
}));

const ComboBoxContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  color: props.theme.color,
  spacing: '10px',
  minHeight: '30px',
  marginLeft: '8px',
  marginRight: '8px',
  marginBottom: '8px',
}));

const NewProjectContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  color: props.theme.color,
  backgroundColor: props.theme.backgroundColor,
  minHeight: '200px',
  paddingLeft: `${props.theme.itemPadding * 2}px`,
  paddingRight: `${props.theme.itemPadding * 2}px`,
  paddingTop: `${props.theme.itemPadding * 2}px`,
}));

const StyledComboBox = styled(ComboBox, {
  flex: '1 0',
});

const StyledForm = styled(Form, (props: ThemeProps) => ({
  paddingLeft: `${props.theme.itemPadding * 2}px`,
  paddingRight: `${props.theme.itemPadding * 2}px`,
}));



const InterfaceChangeButton = styled(Button, (props: ThemeProps & ClickProps) => ({
  backgroundColor: props.theme.yesButtonColor.standard,
  border: `1px solid ${props.theme.yesButtonColor.border}`,
  ':hover':
    props.onClick && !props.disabled
      ? {
        backgroundColor: props.theme.yesButtonColor.hover,
      }
      : {},
  color: props.theme.yesButtonColor.textColor,
  textShadow: props.theme.yesButtonColor.textShadow,
  boxShadow: '2px 2px 4px rgba(0,0,0,0.9)',
  ':active': props.onClick && !props.disabled
    ? {
      boxShadow: '1px 1px 2px rgba(0,0,0,0.7)',
      transform: 'translateY(1px, 1px)',
    }
    : {},
}));


const ErrorMessageContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: 'red',
  color: 'white',
  height: '40px',
  alignItems: 'center',
  marginTop: '10px',
}));

const ItemIcon = styled(FontAwesome, {
  paddingLeft: '10px',
  paddingRight: '10px',
  alignItems: 'center',
  height: '30px'
});

export class ClassroomLeaderboardsDialog extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    const initialClassroom = Object.keys(this.props.classrooms).length > 0 ? Object.values(this.props.classrooms)[0] : null;
    console.log("initialClassroom: ", initialClassroom);
    this.state = {
      showRepeatProjectDialog: false,
      language: 'c',
      errorMessage: '',
      selectedClassroom: initialClassroom,
      classroomOptions: this.CLASSROOM_OPTIONS

    }
  }

  componentDidMount = () => {
    console.log("ClassroomLeaderboardsDialog componentDidMount props: ", this.props);
    console.log("ClassroomLeaderboardsDialog componentDidMount state: ", this.state);
  }

  componentDidUpdate = (prevProps: Props, prevState: State) => {
    console.log("ClassroomLeaderboardsDialog componentDidUpdate props: ", this.props);
    console.log("ClassroomLeaderboardsDialog componentDidUpdate state: ", this.state);
  }


  onFinalize_ = async (values: { [id: string]: string }) => {

    const projectName = values.projectName;

    const specialCharRegex = /[^a-zA-Z0-9 _-]/;
    const isOnlySpaces = !projectName.trim(); // Check if the name is empty or only spaces
    // Check if project name exceeds 50 characters
    if (projectName.length > 50) {
      this.setState({ errorMessage: 'Project name cannot exceed 50 characters.' });
      return;
    }
    if (specialCharRegex.test(projectName)) {
      this.setState({ errorMessage: 'Project name contains special characters. Please use only letters, numbers, underscores, and hyphens.' });
      return;
    }
    if (isOnlySpaces) {
      this.setState({ errorMessage: "Project name cannot be empty or just spaces!" });
      return;
    }
    this.setState({ errorMessage: "" }); // Clear error message if input is valid
    try {

      console.log("ClassroomLeaderboardsDialog props: ", this.props);



    }
    catch (error) {
      console.error('Error adding user to database:', error);
      if (error.response.status === 409) {
        this.setState({ errorMessage: 'Project name already exists. Please choose a different name.' });
      }
    }

  };

  private onSelectClassroomLeaderboard_ = (index: number, option: ComboBox.Option) => {
    console.log('Selected classroom leaderboard classroom:', option.data);
    this.setState({ selectedClassroom: option.data as AsyncClassroom }, () => {
      console.log("Updated selectedClassroom state:", this.state.selectedClassroom);
    });

  }

  private onConfirmClick_ = () => {
    console.log("Confirmed selection of classroom leaderboard");

  }

  CLASSROOM_OPTIONS: ComboBox.Option[] = (() => {
    const ret: ComboBox.Option[] = [];
    console.log("ClassroomLeaderboardsDialog CLASSROOM_OPTIONS props: ", this.props);
    const classroomsArray = Object.values(this.props.classrooms);
    console.log("ClassroomLeaderboardsDialog CLASSROOM_OPTIONS classroomsArray: ", classroomsArray);
    for (const classroom of classroomsArray) {
      console.log("Processing classroom for CLASSROOM_OPTIONS: ", classroom.valueOf());
      const classroomName = LocalizedString.lookup(tr(`${classroom.value.classroomId}`), this.props.locale);
      if (classroomName) {
        ret.push({
          data: classroom,
          text: classroomName
        });
      } else {
        console.error(`Classroom ${classroom} has an invalid localized name.`);
      }
    }
    return ret;
  })();

  render() {
    const { props, state } = this;
    const { style, className, theme, onClose, locale } = props;
    const { errorMessage } = state;
    const CREATEPROJECT_FORM_ITEMS: Form.Item[] = [
      Form.classroomName('classroomName', 'Classroom Name')
    ];

    const classroomIndex = this.CLASSROOM_OPTIONS.findIndex(option => option.data === this.state.selectedClassroom);
    console.log("Rendering ClassroomLeaderboardsDialog with classroomIndex:", classroomIndex);
    return (
      <div>
        <Dialog
          theme={theme}
          name={LocalizedString.lookup(tr('Create New Project'), locale)}
          onClose={onClose}
        >
          <NewProjectContainer theme={theme} style={style} className={className}>
            <ComboBoxContainer theme={theme} style={style} className={className}>
              <ComboBoxLabel theme={theme}>Choose Classroom to See Leaderboard:</ComboBoxLabel>
              <StyledComboBox
                theme={theme}
                onSelect={this.onSelectClassroomLeaderboard_}
                options={this.CLASSROOM_OPTIONS}
                index={classroomIndex}
              />
            </ComboBoxContainer>

            <InterfaceChangeButton
              theme={theme}
              onClick={this.onConfirmClick_}
            >
              Confirm
            </InterfaceChangeButton>



          </NewProjectContainer>

        </Dialog>

      </div>

    );
  }
}

export default ClassroomLeaderboardsDialog;