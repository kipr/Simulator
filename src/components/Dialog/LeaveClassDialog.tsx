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

export class CreateUserDialog extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  onFinalize_ = async (values: { [id: string]: string }) => {
    const { leaveClassName } = values;
    const { currentClassroom } = this.props;
    try {
      if (leaveClassName === currentClassroom.classroomId) {
        this.props.onLeaveClassDialogClose();
      }
      else {
        return;
      }
    }
    catch (error) {
      console.error('Error leaving classroom:', error);
    }


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


