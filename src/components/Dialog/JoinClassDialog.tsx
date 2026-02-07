import * as React from 'react';
import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';
import Form from '../interface/Form';
import { ThemeProps } from '../constants/theme';
import { StyleProps } from '../../util/style';
import { styled } from 'styletron-react';
import { Dialog } from './Dialog';
import { State as ReduxState } from '../../state';
import { findClassroomByInviteCode, I18nAction } from '../../state/reducer';
import { connect } from 'react-redux';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesome } from '../FontAwesome';
import { InterfaceMode } from 'ivygate/dist/src/types/interface';
import { default as IvygateClassroomType } from 'ivygate/dist/src/types/classroomTypes';
import { Classroom } from 'state/State/Classroom';



export interface JoinClassDialogPublicProps extends ThemeProps, StyleProps {

  locale: LocalizedString.Language;
  onClose: () => void;
  onJoinClassDialogClose: (foundClassroom: Classroom, classroomInviteCode: string, displayName: string) => void;
}

interface JoinClassDialogPrivateProps {

  onLocaleChange: (locale: LocalizedString.Language) => void;
  onUserCreation: (userName: string) => void;
}

interface JoinClassDialogState {
  userName: string;
  errorMessage: string;
  showRepeatUserDialog: boolean;
  interfaceMode: InterfaceMode;
  IvygateClassroomType?: IvygateClassroomType | null;
}

type Props = JoinClassDialogPublicProps & JoinClassDialogPrivateProps;
type State = JoinClassDialogState;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  height: 'auto',
}));

const StyledForm = styled(Form, (props: ThemeProps) => ({
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


export class CreateUserDialog extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);

    this.state = {
      userName: '',
      showRepeatUserDialog: false,
      errorMessage: '',
      interfaceMode: InterfaceMode.SIMPLE,

    }
  }

  onFinalize_ = async (values: { [id: string]: string }) => {
    const { classroomInviteCode } = values;

    try {
      const returnedClassroom = await findClassroomByInviteCode(classroomInviteCode);
      console.log("Returned classroom from invite code:", returnedClassroom);

      returnedClassroom ? this.props.onJoinClassDialogClose(returnedClassroom, classroomInviteCode, values.displayName) : this.setState({ errorMessage: 'Invalid invite code. Please check and try again.' });

    } catch (error) {
      console.error('Error joining classroom:', error);
    }



  };

  render() {
    const { props, state } = this;
    const { style, className, theme, onClose, locale, } = props;
    const { errorMessage } = state;

    const { showRepeatUserDialog } = state;
    const JOINCLASS_FORM_ITEMS: Form.Item[] = [
      Form.joinClassInviteCode('classroomInviteCode', 'Classroom Invite Code', 'Enter the invite code provided by your teacher to join a classroom'),
      Form.displayNameField('displayName', 'Display Name', 'The name that will be shown to your teacher and classmates', undefined, 'This can be changed later in your profile settings'),
    ];

    return (
      <div>
        {!showRepeatUserDialog && (
          <Dialog
            theme={theme}
            name={LocalizedString.lookup(tr('Join Classroom'), locale)}
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
                items={JOINCLASS_FORM_ITEMS}
                finalizeText="Join"
                finalizeDisabled={false}
              />
            </Container>

          </Dialog>)}

      </div>

    );
  }
}

export default connect((state: ReduxState) => ({

}), dispatch => ({
  onLocaleChange: (locale: LocalizedString.Language) => dispatch(I18nAction.setLocale({ locale })),

}))(CreateUserDialog) as React.ComponentType<JoinClassDialogPublicProps>;


