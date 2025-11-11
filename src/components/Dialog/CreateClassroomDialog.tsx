import * as React from 'react';
import axios from 'axios';
import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';
import Form from '../interface/Form';
import { ThemeProps } from '../constants/theme';
import { StyleProps } from '../../util/style';
import { styled } from 'styletron-react';
import { Dialog } from './Dialog';
import { State as ReduxState } from '../../state';
import { I18nAction } from '../../state/reducer';
import { connect } from 'react-redux';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesome } from '../FontAwesome';
import { User } from 'ivygate/dist/types/user';
import ComboBox from '../interface/ComboBox';
import { InterfaceMode } from 'ivygate/dist/types/interface';

export interface CreateClassroomDialogPublicProps extends ThemeProps, StyleProps {
  userName: string;
  onClose: () => void;
  onCloseClassroomDialog: (classroomName: string, classroomInviteCode: string) => void;
}

interface CreateClassroomDialogPrivateProps {
  locale: LocalizedString.Language;
  onLocaleChange: (locale: LocalizedString.Language) => void;
}

interface CreateClassroomDialogState {
  userName: string;
  errorMessage: string;
  interfaceMode: InterfaceMode;
}

type Props = CreateClassroomDialogPublicProps & CreateClassroomDialogPrivateProps;
type State = CreateClassroomDialogState;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  minHeight: '15em',
  height: 'auto'
}));

const StyledForm = styled(Form, (props: ThemeProps) => ({
  paddingTop: `${props.theme.itemPadding * 4}px`,
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
export class CreateClassroomDialog extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      userName: '',
      errorMessage: '',
      interfaceMode: InterfaceMode.SIMPLE
    }
  }
  private onInterfaceChange = (interfaceMode: InterfaceMode) => {
    this.setState({
      interfaceMode: interfaceMode
    });
  };
  private onSelectInterface_ = (interfaceIndex: number, option: ComboBox.Option) => {
    this.onInterfaceChange(option.data as InterfaceMode);
  };
  onFinalize_ = async (values: { [id: string]: string }) => {
    const classroomName = values.classroomName;

    const specialCharRegex = /[^a-zA-Z0-9 _-]/; // Removed space from allowed chars

    // Check if classroom name exceeds 50 characters
    if (classroomName.length > 50) {
      this.setState({ errorMessage: 'Classroom name cannot exceed 50 characters.' });
      return;
    }
    if (specialCharRegex.test(classroomName)) {
      this.setState({ errorMessage: 'Classroom name contains special characters. Please use only letters, numbers, underscores, and hyphens.' });
      return;
    }
    if (classroomName.trim() === '') {
      this.setState({ errorMessage: 'Classroom name cannot be empty!' });
      return;
    }

    this.setState({ errorMessage: '' }); // Clear error message if input is valid

    try {
      this.props.onCloseClassroomDialog(classroomName, values.inviteCode);
    } catch (error) {
      console.error('Error creating classroom:', error);
    }
  };


  public myComponent(props: CreateClassroomDialogPublicProps) {
    return (props.userName)
  }

  render() {
    const { props, state } = this;
    const { style, className, theme, onClose, locale } = props;
    const { errorMessage } = state;


    const CREATEUSER_FORM_ITEMS: Form.Item[] = [
      Form.classroomName('classroomName', 'Classroom Name'),
      Form.classroomInviteCode('inviteCode', 'Invite Code', 'Code students can use to join the classroom')
    ];

    console.log("Rendering CreateClassroomDialog with userName:", props.userName);
    return (
      <Dialog
        theme={theme}
        name={LocalizedString.lookup(tr('Create New Classroom'), locale)}
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

          <StyledForm
            theme={theme}
            onFinalize={this.onFinalize_}
            items={CREATEUSER_FORM_ITEMS}
            finalizeText="Create"
            finalizeDisabled={false}
          />
        </Container>

      </Dialog>)


  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale
}), dispatch => ({
  onLocaleChange: (locale: LocalizedString.Language) => dispatch(I18nAction.setLocale({ locale })),

}))(CreateClassroomDialog) as React.ComponentType<CreateClassroomDialogPublicProps>;


