import * as React from 'react';
import axios from 'axios';
import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';
import Form from '../interface/Form';
import RepeatUserDialog from './RepeatUserDialog';
import { ThemeProps } from '../constants/theme';
import { StyleProps } from '../../util/style';
import { styled } from 'styletron-react';
import { Dialog } from './Dialog';
import { State as ReduxState } from '../../state';
import { I18nAction } from '../../state/reducer';
import { connect } from 'react-redux';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesome } from '../FontAwesome';
import { User } from 'ivygate/dist/src/types/user';
import ComboBox from '../interface/ComboBox';
import { InterfaceMode } from 'ivygate/dist/src/types/interface';
import { Settings } from '../constants/Settings';
import { default as IvygateClassroomType } from 'ivygate/dist/src/types/classroomTypes';



export interface CreateUserDialogPublicProps extends ThemeProps, StyleProps {
  showRepeatUserDialog: boolean;
  settings?: Settings | null;
  propClassroom?: IvygateClassroomType | null;
  classrooms: IvygateClassroomType[] | null;

  onClose: () => void;
  onCreateProjectDialog: (userName: string, interfaceMode: InterfaceMode, IvygateClassroomType?: IvygateClassroomType | null) => void;
}

interface CreateUserDialogPrivateProps {
  locale: LocalizedString.Language;
  onLocaleChange: (locale: LocalizedString.Language) => void;
  onUserCreation: (userName: string) => void;
}

interface CreateUserDialogState {
  userName: string;
  errorMessage: string;
  showRepeatUserDialog: boolean;
  interfaceMode: InterfaceMode;
  IvygateClassroomType?: IvygateClassroomType | null;
}

type Props = CreateUserDialogPublicProps & CreateUserDialogPrivateProps;
type State = CreateUserDialogState;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  minHeight: '15em',
  height: '9em'
}));

const StyledForm = styled(Form, (props: ThemeProps) => ({
  paddingLeft: `${props.theme.itemPadding * 2}px`,
  paddingRight: `${props.theme.itemPadding * 2}px`,
}));

const ComboBoxContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  color: props.theme.color,
  spacing: '10px',
  minHeight: '30px',
  marginLeft: '8px',
  marginRight: '8px',
  marginBottom: '4px',
  marginTop: '4px',
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
const StyledComboBox = styled(ComboBox, {
  flex: '1 0',
});

const ItemIcon = styled(FontAwesome, {
  paddingLeft: '10px',
  paddingRight: '10px',
  alignItems: 'center',
  height: '30px'
});
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
const INTERFACE_OPTIONS: ComboBox.Option[] = [{
  text: 'Simple',
  data: 'Simple'
}, {
  text: 'Advanced',
  data: 'Advanced'

}];


export class CreateUserDialog extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    const initialClassroom = this.props.classrooms?.length > 0 ? this.props.classrooms[0] : IvygateClassroomType.EMPTY_CLASSROOM;
    this.state = {
      userName: '',
      showRepeatUserDialog: false,
      errorMessage: '',
      interfaceMode: InterfaceMode.SIMPLE,
      IvygateClassroomType: this.props.propClassroom ? this.props.propClassroom : this.props.classrooms?.[0] || IvygateClassroomType.NO_CLASSROOM
    }
  }

  componentDidMount() {
    console.log("CreateUserDialog componentDidMount props: ", this.props);
    console.log("CreateUserDialog componentDidMount state: ", this.state);
  }

  componentDidUpdate = (prevProps: Props, prevState: State) => {
    console.log("CreateUserDialog componentDidUpdate props: ", this.props);
    console.log("CreateUserDialog componentDidUpdate state: ", this.state);
  }
  private closeRepeatUserDialog_ = () => {

    this.setState({ showRepeatUserDialog: false });
  };
  private onInterfaceChange = (interfaceMode: InterfaceMode) => {
    this.setState({
      interfaceMode: interfaceMode
    });
  };
  private onSelectInterface_ = (interfaceIndex: number, option: ComboBox.Option) => {
    this.onInterfaceChange(option.data as InterfaceMode);
  };
  private onSelectClassroom_ = (classroomIndex: number, option: ComboBox.Option) => {
    console.log("Selected IvygateClassroomType: ", option);
    this.setState({
      IvygateClassroomType: {
        name: option.text as IvygateClassroomType['name'],
        users: option.data as User[]
      }
    }, () => {
      console.log("Updated IvygateClassroomType state: ", this.state);
    })
  };
  onFinalize_ = async (values: { [id: string]: string }) => {
    const userName = values.userName;

    const specialCharRegex = /[^a-zA-Z0-9 _-]/; // Removed space from allowed chars


    // Check if user name exceeds 50 characters
    if (userName.length > 50) {
      this.setState({ errorMessage: 'User name cannot exceed 50 characters.' });
      return;
    }
    if (specialCharRegex.test(userName)) {
      this.setState({ errorMessage: 'User name contains special characters. Please use only letters, numbers, underscores, and hyphens.' });
      return;
    }
    if (userName.trim() === '') {
      this.setState({ errorMessage: 'User name cannot be empty!' });
      return;
    }

    this.setState({ errorMessage: '' }); // Clear error message if input is valid

    try {
      const response = await axios.get('/get-users', { params: { filePath: '/home/kipr/Documents/KISS' } });
      console.log("CreateUserDialog response: ", response.data);
      if (response.data.users.some(user => user.userName === userName)) {
        this.setState({ showRepeatUserDialog: true });
      } else {
        this.props.onClose();
        this.props.onCreateProjectDialog(userName as User['userName'], this.state.interfaceMode, this.state.IvygateClassroomType ? this.state.IvygateClassroomType.name === 'No IvygateClassroomType' ? { name: "", users: [] } : this.state.IvygateClassroomType : null);
      }
    } catch (error) {
      console.error('Error adding user to database:', error);
    }
  };
  CLASSROOM_OPTIONS: ComboBox.Option[] = (() => {
    const ret: ComboBox.Option[] = [];
    const classrooms = this.props.classrooms || [];
    for (const IvygateClassroomType of classrooms) {

      const classroomName = LocalizedString.lookup(tr(`${IvygateClassroomType.name}`), this.props.locale);


      if (classroomName) {
        ret.push({
          data: IvygateClassroomType.users,
          text: classroomName
        });
      } else {
        console.error(`IvygateClassroomType ${IvygateClassroomType.name} has an invalid localized name.`);
      }
    }

    console.log("CreateUserDialog CLASSROOM_OPTIONS ret: ", ret);
    ret.push({
      data: [],
      text: LocalizedString.lookup(tr('No IvygateClassroomType'), this.props.locale)
    })
    return ret;
  })();

  render() {
    const { props, state } = this;
    const { style, className, theme, onClose, locale, settings, classrooms, propClassroom } = props;
    const { errorMessage, interfaceMode, IvygateClassroomType } = state;
    console.log("CreateUserDialog render props: ", props);
    console.log("CreateUserDialog render state: ", state);

    const { showRepeatUserDialog } = state;
    const CREATEUSER_FORM_ITEMS: Form.Item[] = [
      Form.username('userName', 'User Name')
    ];
    const interfaceIndex = INTERFACE_OPTIONS.findIndex(option => option.data === this.state.interfaceMode);
    console.log("CreateUserDialog render interfaceIndex: ", interfaceIndex);
    console.log("CreateUserDialog render IvygateClassroomType: ", IvygateClassroomType);
    const classroomIndex = this.CLASSROOM_OPTIONS.findIndex(option => option.text === IvygateClassroomType?.name);
    console.log("CreateUserDialog render classroomIndex: ", classroomIndex);

    return (
      <div>
        {!showRepeatUserDialog && (
          <Dialog
            theme={theme}
            name={LocalizedString.lookup(tr('Create New User'), locale)}
            onClose={onClose}
          >
            <Container theme={theme} style={style} className={className}>
              {/* Show error message if it exists */}
              {errorMessage && (
                <ErrorMessageContainer theme={theme}>
                  <ItemIcon icon={faExclamationTriangle} />
                  <div style={{ fontWeight: 450 }}>
                    {state.errorMessage}
                  </div>

                </ErrorMessageContainer>
              )}
              <ComboBoxContainer theme={theme} style={style} className={className}>
                <ComboBoxLabel theme={theme}>Interface Mode:</ComboBoxLabel>
                <StyledComboBox
                  theme={theme}
                  onSelect={this.onSelectInterface_}
                  options={INTERFACE_OPTIONS}
                  index={interfaceIndex}
                />
              </ComboBoxContainer>
              {settings && settings.classroomView && !propClassroom && classrooms && (
                <ComboBoxContainer theme={theme} style={style} className={className}>
                  <ComboBoxLabel theme={theme}>IvygateClassroomType:</ComboBoxLabel>
                  <StyledComboBox
                    theme={theme}
                    onSelect={this.onSelectClassroom_}
                    options={this.CLASSROOM_OPTIONS}
                    index={classroomIndex}
                  />
                </ComboBoxContainer>
              )}
              <StyledForm
                theme={theme}
                onFinalize={this.onFinalize_}
                items={CREATEUSER_FORM_ITEMS}
                finalizeText="Create"
                finalizeDisabled={false}
              />
            </Container>

          </Dialog>)}
        {showRepeatUserDialog && (
          <RepeatUserDialog
            onClose={this.closeRepeatUserDialog_}
            theme={theme}
          />
        )}
      </div>

    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale
}), dispatch => ({
  onLocaleChange: (locale: LocalizedString.Language) => dispatch(I18nAction.setLocale({ locale })),

}))(CreateUserDialog) as React.ComponentType<CreateUserDialogPublicProps>;


