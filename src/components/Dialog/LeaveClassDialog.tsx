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
import Form from '../interface/Form';
import { Classroom } from 'state/State/Classroom';
import {
  classroomNameAsString,
  classroomNamesMatch,
} from '../../util/classroomDisplayName';

export interface LeaveClassDialogPublicProps extends ThemeProps, StyleProps {

  locale: LocalizedString.Language;
  onClose: () => void;
  currentClassroom: Classroom;
  onLeaveClassDialogClose: () => Promise<void>;
}

interface LeaveClassDialogPrivateProps {

  onLocaleChange: (locale: LocalizedString.Language) => void;
}

interface LeaveClassDialogState {
  errorMessage: string;
}

type Props = LeaveClassDialogPublicProps & LeaveClassDialogPrivateProps;
type State = LeaveClassDialogState;

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

const ClassroomName = styled('span', (props: ThemeProps) => ({
  fontWeight: 'bold',
  color: props.theme.color,
  textDecoration: 'underline',
}));
const StyledForm = styled(Form, (props: ThemeProps) => ({
  paddingLeft: `${props.theme.itemPadding * 2}px`,
  paddingRight: `${props.theme.itemPadding * 2}px`,
}));

const ErrorMessage = styled('div', (props: ThemeProps) => ({
  color: '#ff6b6b',
  fontSize: '0.9em',
  textAlign: 'center',
}));

export class LeaveClassDialog extends React.PureComponent<Props, State> {
  /** Exact name shown in the dialog — user must match this string. */
  private readonly confirmClassroomName_: string;

  constructor(props: Props) {
    super(props);
    this.confirmClassroomName_ = classroomNameAsString(
      props.currentClassroom.classroomId,
      props.locale
    );
    this.state = { errorMessage: '' };
  }

  onFinalize_ = async (values: { [id: string]: string }) => {
    const { leaveClassName } = values;
    const entered = typeof leaveClassName === 'string' ? leaveClassName : '';
    if (!classroomNamesMatch(entered, this.confirmClassroomName_)) {
      this.setState({
        errorMessage: LocalizedString.lookup(
          tr('Classroom name does not match. Type the classroom name exactly as shown above.'),
          this.props.locale
        ),
      });
      return;
    }
    try {
      this.setState({ errorMessage: '' });
      await this.props.onLeaveClassDialogClose();
    } catch (error) {
      console.error('Error leaving classroom:', error);
      this.setState({
        errorMessage: LocalizedString.lookup(
          tr('Could not leave the classroom. Please try again.'),
          this.props.locale
        ),
      });
    }
  };

  render() {
    const { props, state } = this;
    const { style, className, theme, onClose, locale } = props;
    const { errorMessage: leaveError } = state;
    const displayName = this.confirmClassroomName_;
    const LEAVECLASSROOM_FORM_ITEMS: Form.Item[] = [
      Form.leaveClass(
        'leaveClassName',
        LocalizedString.lookup(tr('Leave Classroom'), locale),
        LocalizedString.lookup(
          tr('Type the classroom name shown above to confirm.'),
          locale
        )
      ),
    ];

    return (
      <Dialog
        theme={theme}
        name={LocalizedString.lookup(tr('Leave Classroom'), locale)}
        onClose={onClose}
      >
        <Container theme={theme} style={style} className={className}>

          <div style={{ display: 'flex', flexDirection: 'row', gap: '0.25em', alignItems: 'center' }}>
            {LocalizedString.lookup(tr('Are you sure you want to leave: '), locale)}
            <ClassroomName theme={theme}>{displayName}</ClassroomName>?
          </div>
          {leaveError ? (
            <ErrorMessage theme={theme}>{leaveError}</ErrorMessage>
          ) : null}
          <StyledForm
            theme={theme}
            onFinalize={this.onFinalize_}
            items={LEAVECLASSROOM_FORM_ITEMS}
            finalizeText={LocalizedString.lookup(tr('Leave Classroom'), locale)}
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

}))(LeaveClassDialog) as React.ComponentType<LeaveClassDialogPublicProps>;


