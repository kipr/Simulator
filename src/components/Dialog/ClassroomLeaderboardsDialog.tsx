import * as React from 'react';
import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';
import Form from '../interface/Form';
import { ThemeProps } from '../constants/theme';
import { StyleProps } from '../../util/style';
import { styled } from 'styletron-react';
import { Dialog } from './Dialog';
import { AsyncClassroom, Classroom } from 'state/State/Classroom';
import Dict from 'util/objectOps/Dict';
import Button from '../../components/interface/Button';
import ComboBox from '../../components/interface/ComboBox';
import Async from 'state/State/Async';

export interface ClassroomLeaderboardsDialogPublicProps extends ThemeProps, StyleProps {

  classrooms: Dict<AsyncClassroom>;
  onClose: () => void;
  onCloseClassroomLeaderboardDialog: (classroomId: string) => void;

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
  showLeaderboard: boolean;
}

type Props = ClassroomLeaderboardsDialogPublicProps & ClassroomLeaderboardsDialogPrivateProps;
type State = ClassroomLeaderboardsDialogState;

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
  margin: '8px',
}));

const ChooseLeaderboardContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  color: props.theme.color,
  backgroundColor: props.theme.backgroundColor,
  alignItems: 'center',
  minHeight: '200px',
  paddingLeft: `${props.theme.itemPadding * 2}px`,
  paddingRight: `${props.theme.itemPadding * 2}px`,
  paddingTop: `${props.theme.itemPadding * 2}px`,
}));

const StyledComboBox = styled(ComboBox, {
  flex: '1 0',
});

const ConfirmButton = styled(Button, (props: ThemeProps & ClickProps) => ({
  display: 'flex',
  width: '7em',
  height: '2em',
  alignItems: 'center',
  justifyContent: 'center',
  justifyItems: 'center',
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



export class ClassroomLeaderboardsDialog extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    const initialClassroom = Object.keys(this.props.classrooms).length > 0 ? Object.values(this.props.classrooms)[0] : null;
    this.state = {
      showRepeatProjectDialog: false,
      language: 'c',
      errorMessage: '',
      selectedClassroom: initialClassroom,
      classroomOptions: this.CLASSROOM_OPTIONS,
      showLeaderboard: false,

    }
  }

  private onSelectClassroomLeaderboard_ = (index: number, option: ComboBox.Option) => {
    this.setState({ selectedClassroom: option.data as AsyncClassroom }, () => {
    });

  }

  private onConfirmClick_ = () => {
    const { theme } = this.props;
    this.setState({ showLeaderboard: true });
    this.props.onCloseClassroomLeaderboardDialog((this.state.selectedClassroom.type === Async.Type.Loaded) ? this.state.selectedClassroom.value.classroomId : '');
  }

  CLASSROOM_OPTIONS: ComboBox.Option[] = (() => {
    const ret: ComboBox.Option[] = [];
    const classroomsArray = Object.values(this.props.classrooms);
    for (const classroom of classroomsArray) {
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

    const classroomIndex = this.CLASSROOM_OPTIONS.findIndex(option => option.data === this.state.selectedClassroom);
    return (
      <div>
        <Dialog
          theme={theme}
          name={LocalizedString.lookup(tr('Choose Class Leaderboard'), locale)}
          onClose={onClose}
        >
          <ChooseLeaderboardContainer theme={theme} style={style} className={className}>
            <ComboBoxContainer theme={theme} style={style} className={className}>
              <ComboBoxLabel theme={theme}>Choose Classroom to See Leaderboard:</ComboBoxLabel>
              <StyledComboBox
                theme={theme}
                onSelect={this.onSelectClassroomLeaderboard_}
                options={this.CLASSROOM_OPTIONS}
                index={classroomIndex}
              />
            </ComboBoxContainer>

            <ConfirmButton
              theme={theme}
              onClick={this.onConfirmClick_}
            >
              Confirm
            </ConfirmButton>



          </ChooseLeaderboardContainer>

        </Dialog>


      </div>

    );
  }
}

export default ClassroomLeaderboardsDialog;