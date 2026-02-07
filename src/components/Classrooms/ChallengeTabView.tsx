import * as React from 'react';
import { styled } from 'styletron-react';
import { connect } from 'react-redux';
import { DARK, Theme, ThemeProps } from '../constants/theme';
import tr from '@i18n';
import { StyleProps } from '../../util/style';
import LocalizedString from '../../util/LocalizedString';
import { State as ReduxState } from '../../state';
import { withNavigate, WithNavigateProps } from '../../util/withNavigate';
import { AsyncClassroom, Classroom } from '../../state/State/Classroom';
import Dict from '../../util/objectOps/Dict';
import { auth } from '../../firebase/firebase';
import ProgrammingLanguage from '../../programming/compiler/ProgrammingLanguage';
import ChallengeCompletion from 'state/State/ChallengeCompletion';
import ClassroomLeaderboard from '../../pages/ClassroomLeaderboard';
import Async from 'state/State/Async';
import ClassroomLimitedChallenges from './ClassroomLimitedChallenges';

export interface ChallengeTabViewRootRouteParams {
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


export interface ChallengeTabViewPublicProps extends StyleProps, ThemeProps {

}

interface ChallengeTabViewPrivateProps {
  locale: LocalizedString.Language;
  currentStudentClassroom: AsyncClassroom | null;
}

interface SectionProps {
  selected?: boolean;
}

interface ChallengeTabViewState {
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
  isStudentInClassroom?: boolean;
  selectedSection: "Default JBC Challenges" | "Limited Challenges";
}


type Props = ChallengeTabViewPublicProps & ChallengeTabViewPrivateProps & WithNavigateProps;
type State = ChallengeTabViewState;


const SidePanel = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'wrap',
  left: '3.5%',
  top: '6%',
  zIndex: 23,
  backgroundColor: props.theme.backgroundColor,
  width: '100%',
  height: '95%'
}));

const ChallengeViewContainer = styled('div', (props: ThemeProps) => ({
  left: '4%',
  height: '100%',
  width: '100%',
  margin: '5px',
  zIndex: 23,
  backgroundColor: props.theme.backgroundColor
}));
const SectionName = styled('span', (props: ThemeProps & SectionProps & { selected: boolean }) => ({
  ':hover': {
    cursor: 'pointer',
    backgroundColor: props.theme.hoverOptionBackground
  },
  width: '100%',
  fontSize: '1.44em',
  backgroundColor: props.selected ? props.theme.selectedUserBackground : props.theme.unselectedBackground,
  boxShadow: props.theme.themeName === 'DARK' ? '0px 10px 13px -6px rgba(0, 0, 0, 0.2), 0px 20px 31px 3px rgba(0, 0, 0, 0.14), 0px 8px 38px 7px rgba(0, 0, 0, 0.12)' : '0px 10px 13px -6px rgba(255, 105, 180, 0.1), 0px 1px 31px 0px rgba(135, 206, 250, 0.08), 0px 8px 38px 7px rgba(144, 238, 144, 0.1)',
  padding: `5px`,
  fontWeight: props.selected ? 400 : undefined,
  userSelect: 'none',
}));

const SectionsColumn = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flexGrow: 1,
  border: `3px solid ${props.theme.borderColor}`,
  minHeight: '100%',
  height: '100%',
  paddingBottom: '8em',
  backgroundColor: props.theme.backgroundColor,
  zIndex: '1'
}));

export const IVYGATE_LANGUAGE_MAPPING: Dict<string> = {
  'ecmascript': 'javascript',
  'python': 'customPython',
  'c': 'customCpp',
  'cpp': 'customCpp',
  'plaintext': 'plaintext',
};

class ChallengeTabView extends React.Component<Props, State> {
  private challengeCache: Record<string, Dict<ChallengeCompletion>> = {};
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
      selectedSection: 'Default JBC Challenges'
    };

  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<ChallengeTabViewState>, snapshot?: any): void {
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


  private onSectionSelect_ = (section: "Default JBC Challenges" | "Limited Challenges") => {
    this.setState({
      selectedSection: section,
    })
  };


  render() {
    const { props, state } = this;
    const { style, locale, theme } = props;
    const { selectedSection } = state;

    const DefaultJBCChallengeSection = () => {
      const { currentStudentDisplayName } = this.state;
      const { theme, currentStudentClassroom } = this.props;
      return (
        <SectionsColumn theme={theme}>
          <ClassroomLeaderboard
            theme={theme}
            view={"studentView"}
            currentStudentDisplayName={currentStudentDisplayName}
            currentClassroom={Async.latestValue(currentStudentClassroom)} />
        </SectionsColumn>
      );
    };

    const LimitedChallengesSection = () => {
      return (
        <SectionsColumn theme={theme}>
          <ClassroomLimitedChallenges theme={theme} />
        </SectionsColumn>
      )
    }


    return (

      <SidePanel style={style} theme={theme}>
        <ChallengeViewContainer theme={theme}>
          <SectionName theme={theme} selected={selectedSection === "Default JBC Challenges"} onClick={() => this.onSectionSelect_("Default JBC Challenges")}>
            {LocalizedString.lookup(tr('Default JBC Challenges'), locale)}
          </SectionName>
          <SectionName theme={theme} selected={selectedSection === "Limited Challenges"} onClick={() => this.onSectionSelect_("Limited Challenges")}>
            {LocalizedString.lookup(tr('Limited Challenges'), locale)}
          </SectionName>
          {selectedSection === 'Default JBC Challenges' && DefaultJBCChallengeSection()}
          {selectedSection === 'Limited Challenges' && LimitedChallengesSection()}
        </ChallengeViewContainer>
      </SidePanel>
    );
  }
}



const DashboardWithNavigate = withNavigate(ChallengeTabView);

export default connect(
  (state: ReduxState) => {
    return ({
      classroomList: state.classrooms.entities,
      currentStudentClassroom: state.classrooms.currentStudentClassroom,
    })

  },
  (dispatch) => ({

  }))(DashboardWithNavigate);
