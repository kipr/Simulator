import * as React from 'react';
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

export interface CreateClassroomDialogPublicProps extends ThemeProps, StyleProps {
  onClose: () => void;
  onCloseClassroomDialog: (teacherDisplayName: string, classroomName: string, classroomInviteCode: string) => void;
}

interface CreateClassroomDialogPrivateProps {
  locale: LocalizedString.Language;
}

interface CreateClassroomDialogState {
  userName: string;
  errorMessage: string;
  invitationCode: string;
}

type Props = CreateClassroomDialogPublicProps & CreateClassroomDialogPrivateProps;
type State = CreateClassroomDialogState;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  minHeight: '15em',
  height: 'auto',
  alignItems: 'center',
}));


const StyledForm = styled(Form, (props: ThemeProps) => ({
  paddingTop: `${props.theme.itemPadding * 4}px`,
  paddingLeft: `${props.theme.itemPadding * 2}px`,
  paddingRight: `${props.theme.itemPadding * 2}px`,
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
export class CreateClassroomDialog extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      userName: '',
      errorMessage: '',
      invitationCode: ''
    }
  }

  componentDidMount() {
    this.generateInviteCode_();
  }

  private generateInviteCode_ = async () => {
    const longCode = crypto.randomUUID();
    const invitationCode = longCode.slice(0, 5);
    this.setState({
      invitationCode: invitationCode
    })
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
      this.props.onCloseClassroomDialog(values.displayName, classroomName, values.inviteCode);
    } catch (error) {
      console.error('Error creating classroom:', error);
    }
  };

  render() {
    const { props, state } = this;
    const { style, className, theme, onClose, locale } = props;
    const { errorMessage } = state;


    const CREATECLASSROOM_FORM_ITEMS: Form.Item[] = [
      Form.displayName('displayName', 'Your Display Name', 'The teacher\'s name that will be shown to your students'),
      Form.classroomName('classroomName', 'Classroom Name'),
      Form.createClassInviteCode('inviteCode', 'Invite Code', 'Code students can use to join the classroom'),

    ];

    return (
      <Dialog
        theme={theme}
        name={LocalizedString.lookup(tr('Create New Classroom'), locale)}
        onClose={onClose}
      >
        <Container theme={theme} style={style} className={className}>
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
            items={CREATECLASSROOM_FORM_ITEMS}
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


