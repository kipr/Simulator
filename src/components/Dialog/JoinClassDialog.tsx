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
import { findClassroomByInviteCode, I18nAction } from '../../state/reducer';
import { connect } from 'react-redux';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesome } from '../FontAwesome';
import { User } from 'ivygate/dist/types/user';
import ComboBox from '../interface/ComboBox';
import { InterfaceMode } from 'ivygate/dist/types/interface';
import { Settings } from '../constants/Settings';
import { default as IvygateClassroomType } from 'ivygate/dist/types/classroomTypes';
import { Classroom } from 'state/State/Classroom';



export interface JoinClassDialogPublicProps extends ThemeProps, StyleProps {

  locale: LocalizedString.Language;
  onClose: () => void;
  onJoinClassDialogClose: (joinedClassroom: Classroom) => void;
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

    this.state = {
      userName: '',
      showRepeatUserDialog: false,
      errorMessage: '',
      interfaceMode: InterfaceMode.SIMPLE,

    }
  }

  private closeRepeatUserDialog_ = () => {

    this.setState({ showRepeatUserDialog: false });
  };

  onFinalize_ = async (values: { [id: string]: string }) => {
    const { classroomInviteCode } = values;

    try {
      //this.props.onJoinClassDialogClose(classroomInviteCode);
      const returnedClassroom = await findClassroomByInviteCode(tr(classroomInviteCode));
      console.log("Returned classroom from invite code:", returnedClassroom);

      returnedClassroom ? this.props.onJoinClassDialogClose(returnedClassroom) : this.setState({ errorMessage: 'Invalid invite code. Please check and try again.' });

    } catch (error) {
      console.error('Error joining classroom:', error);
    }


  };

  render() {
    const { props, state } = this;
    const { style, className, theme, onClose, locale, } = props;
    const { errorMessage, interfaceMode, IvygateClassroomType } = state;

    const { showRepeatUserDialog } = state;
    const JOINCLASS_FORM_ITEMS: Form.Item[] = [
      Form.classroomInviteCode('classroomInviteCode', 'Classroom Invite Code', 'Enter the invite code provided by your teacher to join a classroom'),
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


