import * as React from 'react';
import { styled } from 'styletron-react';
import { connect } from 'react-redux';
import { DARK, Theme, ThemeProps } from '../components/constants/theme';
import { StyleProps } from '../util/style';
import LocalizedString from '../util/LocalizedString';
import { State as ReduxState } from '../state';
import { withNavigate, WithNavigateProps } from '../util/withNavigate';
import { AsyncClassroom, Classroom } from '../state/State/Classroom';
import Dict from '../util/objectOps/Dict';
import { addStudentToClassroomAsyncRaw, ClassroomsAction, listChallengesByStudentId } from 'state/reducer/classrooms';
import { auth } from '../firebase/firebase';
import { studentInClassroom } from 'state/reducer/classrooms';
import JoinClassDialog from '../components/Dialog/JoinClassDialog';
import LeaveClassDialog from '../components/Dialog/LeaveClassDialog';
import ProgrammingLanguage from '../programming/compiler/ProgrammingLanguage';
import ChallengeCompletion from 'state/State/ChallengeCompletion';
import ClassroomLeaderboard from './ClassroomLeaderboard';
import ChallengeTabView from '../components/Classrooms/ChallengeTabView';
import MainMenu from '../components/MainMenu';
import { FontAwesome } from '../components/FontAwesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import ClassroomExtraMenu from '../components/ClassroomExtraMenu';

namespace SubMenu {
  export enum Type {
    None,
    ExtraMenu,
  }

  export interface None {
    type: Type.None;
  }

  export const NONE: None = { type: Type.None };

  export interface ExtraMenu {
    type: Type.ExtraMenu;
  }

  export const EXTRA_MENU: ExtraMenu = { type: Type.ExtraMenu };
}

type SubMenu =
  | SubMenu.None
  | SubMenu.ExtraMenu;

export interface ClassroomStudentViewRootRouteParams {
  classroomId: string;
  [key: string]: string;

}

interface Challenge {
  name: LocalizedString;
  description: LocalizedString;
  src?: string;
  backgroundColor?: string;
}

interface Score {
  name: LocalizedString; // Challenge name
  completed: boolean;
  score?: number;
  completionTime?: number;
  code?: string;
  language?: ProgrammingLanguage;
}

interface LeaderboardUser {
  id: string;
  name: string;
  scores: Score[];
  src?: string;
  backgroundColor?: string;
  altId?: string;
}


export interface ClassroomStudentViewPublicProps extends StyleProps, ThemeProps {
  onStudentAdded: (classroomId: string, studentId: string, displayName: string) => void;
  onJoinClassroom: (classroom: Classroom) => void;
  onRemoveStudentFromClassroom: (studentId: string, currentClassroom: Classroom) => void;
}

interface ClassroomStudentViewPrivateProps {
  locale: LocalizedString.Language;
  currentStudentClassroom: AsyncClassroom | null;
}

interface ClassroomStudentViewState {
  currentClassroom: Classroom;
  selectedStudentId: string;
  leaderboardClassroom: AsyncClassroom | null;
  users: Record<string, LeaderboardUser>;
  challenges: Record<string, Challenge>;
  showCreateClassroomDialog: boolean;
  showJoinClassroomDialog: boolean;
  showClassroomLeaderboardSelector: boolean;
  showSelectedClassroomLeaderboard: boolean;
  showLeaveClassroomDialog: boolean;
  currentStudentDisplayName?: string;
  subMenu: SubMenu;
  isStudentInClassroom?: boolean;
}

interface ClickProps {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}

type Props = ClassroomStudentViewPublicProps & ClassroomStudentViewPrivateProps & WithNavigateProps;
type State = ClassroomStudentViewState;

const ClassroomInfoContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  alignContent: 'center',
  padding: '0.5px',
  fontSize: '1.2em',
  overflow: 'hidden',
  flexWrap: 'nowrap',
}));

const PageContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  height: 'calc(100vh - 1px)',
  zIndex: 35
}));

const ClassroomsContainer = styled("div", (props: ThemeProps) => ({
  backgroundColor: props.theme.backgroundColor,
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const ClassroomsClassroomInfoContainer = styled('div', (props: ThemeProps) => ({
  alignItems: 'center',
  justifyContent: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignContent: 'center',

}));

const ClassroomHeaderContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: '3em',
  height: 'auto',
  width: '90vw'
}));

const MyClassroomContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
  height: '100%',
  width: '90vw'

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
const Item = styled('div', (props: ThemeProps & ClickProps) => ({
  display: 'flex',
  width: '3em',
  alignItems: 'center',
  flexDirection: 'row',
  borderRight: `1px solid ${props.theme.borderColor}`,
  paddingLeft: '20px',
  paddingRight: '20px',
  height: '3em',
  opacity: props.disabled ? '0.5' : '1.0',
  ':last-child': {
    borderRight: 'none'
  },
  fontWeight: 400,
  ':hover': props.onClick && !props.disabled ? {
    cursor: 'pointer',
    backgroundColor: `rgba(255, 255, 255, 0.1)`
  } : {},
  userSelect: 'none',
  transition: 'background-color 0.2s, opacity 0.2s'
}));

const ItemIcon = styled(FontAwesome, {
  paddingRight: '10px'
});

export const IVYGATE_LANGUAGE_MAPPING: Dict<string> = {
  'ecmascript': 'javascript',
  'python': 'customPython',
  'c': 'customCpp',
  'cpp': 'customCpp',
  'plaintext': 'plaintext',
};

class ClassroomStudentView extends React.Component<Props, State> {
  private unsubscribeChallenges: (() => void) | null = null;
  constructor(props: Props) {
    super(props);

    this.state = {
      currentClassroom: null,
      selectedStudentId: '',
      users: {},
      challenges: {},
      showCreateClassroomDialog: false,
      isStudentInClassroom: false,
      showJoinClassroomDialog: false,
      showClassroomLeaderboardSelector: false,
      showSelectedClassroomLeaderboard: false,
      showLeaveClassroomDialog: false,
      leaderboardClassroom: null,
      subMenu: SubMenu.NONE,
    };


  }

  async componentDidMount() {
    const currentUserId = auth.currentUser?.uid || ''
    const isInClassroom = await studentInClassroom(currentUserId);
    const currentUser = auth.currentUser.uid;

    if (isInClassroom.classroom) {
      this.setState({
        isStudentInClassroom: isInClassroom.inClassroom,
        currentClassroom: isInClassroom.classroom,
        currentStudentDisplayName: isInClassroom.classroom.studentIds[currentUserId].displayName
      }, () => {
        this.props.navigate(`/classrooms/${currentUser}/studentView/${isInClassroom.classroom.classroomId}`)
        this.props.onJoinClassroom(isInClassroom.classroom);
      });


    }

  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<ClassroomStudentViewState>, snapshot?: any): void {
    if (prevState.currentClassroom !== this.state.currentClassroom && this.state.currentClassroom) {
      const currentUser = auth.currentUser.uid;
      this.props.navigate(`/classrooms/${currentUser}/studentView/${this.state.currentClassroom.classroomId}`)

    };
  }

  componentWillUnmount() {
    if (this.unsubscribeChallenges) {
      this.unsubscribeChallenges();
    }
  }

  private onJoinClassroomDialog_ = () => {
    this.setState({ showJoinClassroomDialog: true });
  }

  private onLeaveClassroomDialog_ = () => {
    this.setState({ showLeaveClassroomDialog: true });
  }

  private onCloseJoinClassroomDialog_ = async (returnedClassroom: Classroom, inviteCode: string, displayName: string) => {
    const classroom = await addStudentToClassroomAsyncRaw(
      returnedClassroom,
      inviteCode,
      auth.currentUser?.uid || '',
      displayName
    );

    if (classroom) {
      this.props.onStudentAdded(inviteCode, auth.currentUser?.uid || '', displayName);
      this.props.onJoinClassroom(classroom);
      this.setState({ showJoinClassroomDialog: false, isStudentInClassroom: true, currentClassroom: classroom, currentStudentDisplayName: displayName });
    }


  }

  private onCloseLeaveClassroomDialog_ = async () => {
    const { currentClassroom } = this.state;
    await this.props.onRemoveStudentFromClassroom(
      auth.currentUser?.uid || '',
      currentClassroom
    );
    this.props.navigate(`/classrooms/${auth.currentUser?.uid || ''}/studentView/`);
    this.setState({ showLeaveClassroomDialog: false, isStudentInClassroom: false, currentClassroom: null, currentStudentDisplayName: undefined });
  }

  private onExitJoinClassroomDialog_ = () => {
    this.setState({ showJoinClassroomDialog: false });
  }

  private onExitLeaveClassroomDialog_ = () => {
    this.setState({ showLeaveClassroomDialog: false });
  }
  private renderClassroomLeaderboard = () => {
    const { theme } = this.props;
    const { currentClassroom } = this.state;
    return (
      <ClassroomLeaderboard
        theme={theme}
        view={"studentView"}
        currentStudentDisplayName={this.state.currentStudentDisplayName}
        currentClassroom={currentClassroom} />
    );
  };

  private renderMyClassroom = () => {
    const { isStudentInClassroom } = this.state;
    const { theme, locale } = this.props;
    return (
      <MyClassroomContainer theme={theme}>
        {isStudentInClassroom ? (

          <ChallengeTabView theme={theme} locale={locale} />

        ) : (
          <ClassroomInfoContainer theme={theme}>
            <p>You are not enrolled in any classroom.</p>

            <Button style={{ marginLeft: '1em' }} theme={DARK} onClick={this.onJoinClassroomDialog_}>
              Join Class
            </Button>
          </ClassroomInfoContainer>
        )}
      </MyClassroomContainer>
    )

  }

  private onExtraClick_ = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const currentType = this.state.subMenu.type;
    this.setState(
      {
        subMenu:
          currentType === SubMenu.Type.ExtraMenu
            ? SubMenu.NONE
            : SubMenu.EXTRA_MENU,
      },
      () => {
        if (currentType !== SubMenu.Type.ExtraMenu) {
          window.addEventListener('click', this.onClickOutside_);
        } else {
          window.removeEventListener('click', this.onClickOutside_);
        }
      }
    );

    event.stopPropagation();
  };

  private onClickOutside_ = (event: MouseEvent) => {
    this.setState({ subMenu: SubMenu.NONE });
    window.removeEventListener('click', this.onClickOutside_);
  };

  render() {
    const { props, state } = this;
    const { style, locale } = props;
    const { showLeaveClassroomDialog, showJoinClassroomDialog, currentClassroom, subMenu } = state;
    const theme = DARK;
    return (
      <PageContainer style={style} theme={theme}>
        <MainMenu theme={theme} />
        <div style={{ width: '100%', alignItems: 'flex-end', display: 'flex', flexDirection: 'column' }}>
          <Item
            theme={theme}
            onClick={this.onExtraClick_}
            style={{ position: 'relative' }}
          >
            <ItemIcon icon={faBars} style={{ padding: 0 }} />
            {subMenu.type === SubMenu.Type.ExtraMenu ? (
              <ClassroomExtraMenu theme={theme}
                onLeaveClass={this.onLeaveClassroomDialog_}
              />
            ) : undefined}
          </Item>
        </div>

        <ClassroomsContainer style={style} theme={theme}>
          <ClassroomsClassroomInfoContainer style={style} theme={theme}>
            <h1>Classrooms - Student View</h1>
            <ClassroomHeaderContainer style={style} theme={theme}>
              {this.renderMyClassroom()}
              {showLeaveClassroomDialog && (
                <LeaveClassDialog
                  onClose={this.onExitLeaveClassroomDialog_}
                  currentClassroom={currentClassroom}
                  locale={locale}
                  onLeaveClassDialogClose={this.onCloseLeaveClassroomDialog_}
                  theme={DARK}

                />
              )}
              {showJoinClassroomDialog && (
                <JoinClassDialog
                  onClose={this.onExitJoinClassroomDialog_}
                  locale={locale}
                  onJoinClassDialogClose={this.onCloseJoinClassroomDialog_}
                  theme={DARK}

                />
              )}
            </ClassroomHeaderContainer>

          </ClassroomsClassroomInfoContainer>

        </ClassroomsContainer>
      </PageContainer>
    );
  }
}

const DashboardWithNavigate = withNavigate(ClassroomStudentView);

export default connect(
  (state: ReduxState) => ({
    classroomList: state.classrooms.entities,
    currentStudentClassroom: state.classrooms.currentStudentClassroom,
  }),
  (dispatch) => ({
    onStudentAdded: (inviteCode, studentId, displayName) => {
      dispatch(ClassroomsAction.studentAdded({ classroomId: inviteCode, studentId, displayName }));
    },
    onJoinClassroom: (classroom) => {
      dispatch(ClassroomsAction.joinClassroom({ classroom }));
    },

    onRemoveStudentFromClassroom: (studentId: string, currentClassroom: Classroom) =>
      dispatch(ClassroomsAction.removeStudentFromClassroom({ studentId, currentClassroom })),
  }))(DashboardWithNavigate);
