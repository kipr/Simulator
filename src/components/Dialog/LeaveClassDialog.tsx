import * as React from 'react';
import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';
import { ThemeProps } from '../constants/theme';
import { StyleProps } from '../../util/style';
import { styled } from 'styletron-react';
import { Dialog } from './Dialog';
import { State as ReduxState } from '../../state';
import { I18nAction } from '../../state/reducer';
import { connect } from 'react-redux';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesome } from '../FontAwesome';
import Form from '../interface/Form';
import { Classroom } from 'state/State/Classroom';

export interface LeaveClassDialogPublicProps extends ThemeProps, StyleProps {

  locale: LocalizedString.Language;
  onClose: () => void;
  currentClassroom: Classroom;
  onLeaveClassDialogClose: () => void;
}

interface LeaveClassDialogPrivateProps {

  onLocaleChange: (locale: LocalizedString.Language) => void;
}

interface LeaveClassDialogState {
}

type Props = LeaveClassDialogPublicProps & LeaveClassDialogPrivateProps;
type State = LeaveClassDialogState;
interface ClickProps {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}
const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: props.theme.backgroundColor,
  alignItems: 'center',
  padding: '2em',
  gap: '1em',
  color: props.theme.color,
  height: 'auto'
}));

const StyledForm = styled(Form, (props: ThemeProps) => ({
  paddingLeft: `${props.theme.itemPadding * 2}px`,
  paddingRight: `${props.theme.itemPadding * 2}px`,
}));


const Button = styled('div', (props: ThemeProps & ClickProps) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  padding: '10px',
  backgroundColor: '#2c2c2cff',
  borderBottom: `1px solid ${props.theme.borderColor}`,
  ':last-child': {
    borderBottom: 'none'
  },
  opacity: props.disabled ? '0.5' : '1.0',
  fontWeight: 400,
  ':hover': {
    cursor: 'pointer',
    backgroundColor: `rgba(255, 255, 255, 0.1)`
  },
  userSelect: 'none',
  transition: 'background-color 0.2s, opacity 0.2s'
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
  }

  onFinalize_ = async (values: { [id: string]: string }) => {
    const { leaveClassName } = values;
    const { currentClassroom } = this.props;
    console.log("LeaveClassDialog onFinalize_ called with leaveClassName:", leaveClassName);
    console.log("Current classroom:", currentClassroom);
    try {
      if (leaveClassName === currentClassroom.classroomId) {
        console.log("Leaving classroom:", currentClassroom);
        this.props.onLeaveClassDialogClose();
      }
      else {
        return;
      }
    }
    catch (error) {
      console.error('Error leaving classroom:', error);
    }

    // try {
    //   const returnedClassroom = await findClassroomByInviteCode(classroomInviteCode);
    //   console.log("Returned classroom from invite code:", returnedClassroom);

    //   returnedClassroom ? this.props.onJoinClassDialogClose(returnedClassroom, classroomInviteCode, values.displayName) : this.setState({ errorMessage: 'Invalid invite code. Please check and try again.' });

    // } catch (error) {
    //   console.error('Error joining classroom:', error);
    // }



  };

  render() {
    const { props } = this;
    const { style, className, theme, onClose, locale, currentClassroom } = props;
    const LEAVECLASSROOM_FORM_ITEMS: Form.Item[] = [
      Form.leaveClass('leaveClassName', 'Leave Classroom', 'Reenter classroom name to confirm leaving classroom.'),
    ];

    return (
      <Dialog
        theme={theme}
        name={LocalizedString.lookup(tr('Leave Classroom'), locale)}
        onClose={onClose}
      >
        <Container theme={theme} style={style} className={className}>
          {LocalizedString.lookup(tr(`Are you sure you want to leave ${currentClassroom.classroomId}?`), locale)}

          {/* <Button theme={theme} onClick={() => this.props.onLeaveClassDialogClose()}>
            <ItemIcon icon={faExclamationTriangle} />
            {LocalizedString.lookup(tr('Leave Classroom'), locale)}
          </Button> */}
          <StyledForm
            theme={theme}
            onFinalize={this.onFinalize_}
            items={LEAVECLASSROOM_FORM_ITEMS}
            finalizeText="Leave Classroom"
            finalizeDisabled={false}
          />
        </Container>

      </Dialog>

    );
  }
}

export default connect((state: ReduxState) => ({

}), dispatch => ({
  onLocaleChange: (locale: LocalizedString.Language) => dispatch(I18nAction.setLocale({ locale })),

}))(CreateUserDialog) as React.ComponentType<LeaveClassDialogPublicProps>;


