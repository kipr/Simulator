import { Theme, ThemeProps } from '../constants/theme';
import { StyleProps } from '../../util/style';
import LocalizedString from '../../util/LocalizedString';
import * as React from 'react';
import { styled } from 'styletron-react';
import { TabBar } from '..//Layout/TabBar';
import tr from '@i18n';
import { faHome, faSchool, faPeopleGroup, faFileCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { State } from '../../state';
import { connect } from 'react-redux';
import { FontAwesome } from '../FontAwesome';
import PeopleView from './PeopleView';
import { AsyncClassroom, ClassroomAssignment } from '../../state/State/Classroom';
import AssignmentsView from './AssignmentsView';
import HomeView from './HomeView';
import ChallengeTabView from './ChallengeTabView';
import { TourRegistry } from '../../tours/TourRegistry';


export interface StudentTabsPublicProps extends ThemeProps, StyleProps {
  currentSelectedClassroom: AsyncClassroom | null;
  onAssignmentAction: (currentSelectedClassroom: AsyncClassroom, action: 'edit' | 'create', assingmentToEdit?: ClassroomAssignment) => void;
  tabIndex?: number;
  tourRegistry?: TourRegistry;
  tourAutoOpenAssignmentDetails?: boolean;
  /** When 0–3, switches the visible tab so tour targets in that panel can register. */
  tourSyncTabIndex?: number;
  /** When true, all assignment subject sections expand so tour targets on rows are mounted. */
  tourExpandAssignmentTopics?: boolean;
  /** Current guided-tour step id (student in-classroom tour) so AssignmentsView can reopen details when the step changes. */
  tourAssignmentDetailsStepId?: string;
  /** Guided-tour step index; bumps on every step so AssignmentsView can reopen the details dialog after Back. */
  tourGuidedStepIndex?: number;
  /** Syncs ChallengeTabView to Default vs Limited when the tour sets `currentTab` on the parent. */
  leaderboardChallengeShowTab?: 'Default JBC Challenges' | 'Limited Challenges';
}

export interface StudentTabsPrivateProps extends ThemeProps {
  locale: LocalizedString.Language;
}

type Props = StudentTabsPublicProps & StudentTabsPrivateProps;

const Container = styled('div', (props: ThemeProps) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  color: props.theme.color,
  backgroundColor: props.theme.backgroundColor,
  // minHeight: '100vh',
}));

const Body = styled('div', {
  flex: 1,
  display: 'flex',
  flexDirection: 'row',
  '@screen and (max-width: 800px)': {
    flexDirection: 'column',
  },
});

const TopBar = styled('div', (props: ThemeProps) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderBottom: `1px solid ${props.theme.borderColor}`,
  height: '48px',
}));

const StyledTabBar = styled(TabBar, (props: ThemeProps) => ({
  flex: 1,
  borderTopLeftRadius: `${props.theme.itemPadding * 2}px`,
  borderTopRightRadius: `${props.theme.itemPadding * 2}px`,
  alignSelf: 'end',
  borderTop: `1px solid ${props.theme.borderColor}`,
  borderLeft: `1px solid ${props.theme.borderColor}`,
  borderRight: `1px solid ${props.theme.borderColor}`,
  backgroundColor: props.theme.backgroundColor,
  ':last-child': {
    marginRight: `${props.theme.itemPadding * 2}px`,
  },
  ':first-child': {
    marginLeft: `${props.theme.itemPadding * 2}px`,
  }

}));


const StudentTabs = ({
  currentSelectedClassroom,
  onAssignmentAction,
  tabIndex: tabIndexProp,
  theme,
  locale,
  tourRegistry,
  tourAutoOpenAssignmentDetails,
  tourSyncTabIndex,
  tourExpandAssignmentTopics,
  tourAssignmentDetailsStepId,
  tourGuidedStepIndex,
  leaderboardChallengeShowTab,
}: Props) => {
  const [tabIndex, setTabIndex] = React.useState(tabIndexProp ?? 0);
  const [peopleContextMenu, setPeopleContextMenu] = React.useState({ visible: false, x: 0, y: 0 });
  const [assignmentsContextMenu, setAssignmentsContextMenu] = React.useState({ visible: false, x: 0, y: 0 });

  const displayTabIndex =
    typeof tourSyncTabIndex === 'number' && tourSyncTabIndex >= 0 && tourSyncTabIndex <= 3
      ? tourSyncTabIndex
      : tabIndex;

  React.useLayoutEffect(() => {
    if (typeof tourSyncTabIndex === 'number' && tourSyncTabIndex >= 0 && tourSyncTabIndex <= 3) {
      setTabIndex(tourSyncTabIndex);
    }
  }, [tourSyncTabIndex]);

  const tabs: TabBar.TabDescription[] = [
    {
      name: LocalizedString.lookup(tr('Home'), locale),
      icon: faHome
    },
    {
      name: LocalizedString.lookup(tr('Assignments'), locale),
      icon: faSchool
    },
    {
      name: LocalizedString.lookup(tr('People'), locale),
      icon: faPeopleGroup
    },
    {
      name: LocalizedString.lookup(tr('Leaderboard'), locale),
      icon: faFileCircleCheck
    }
  ];

  return (
    <Container theme={theme}>
      <TopBar theme={theme}>
        <StyledTabBar
          tabs={tabs}
          index={displayTabIndex}
          onIndexChange={setTabIndex}
          theme={theme}
          tourRegistry={tourRegistry}
        />

      </TopBar>
      {currentSelectedClassroom ? (<Body>
        {displayTabIndex === 0 && <HomeView theme={theme} config={'Student'} currentClassroom={currentSelectedClassroom} />}
        {displayTabIndex === 1 &&
          <AssignmentsView theme={theme}
            config={'Student'}
            currentSelectedClassroom={currentSelectedClassroom}
            onAssignmentAction={onAssignmentAction}
            contextMenuVisible={false}
            setContextMenuVisible={setAssignmentsContextMenu} containerRef={undefined}
            tourRegistry={tourRegistry}
            tourAutoOpenAssignmentDetails={tourAutoOpenAssignmentDetails}
            tourExpandAssignmentTopics={tourExpandAssignmentTopics}
            tourAssignmentDetailsStepId={tourAssignmentDetailsStepId}
            tourGuidedStepIndex={tourGuidedStepIndex}
          />
        }
        {displayTabIndex === 2 &&
          <PeopleView theme={theme}
            config={'Student'}
            currentSelectedClassroom={currentSelectedClassroom}
            contextMenuVisible={false}
            setContextMenuVisible={setPeopleContextMenu} />
        }
        {displayTabIndex === 3 && (
          <ChallengeTabView
            theme={theme}
            view="studentView"
            currentSelectedClassroom={currentSelectedClassroom}
            tourRegistry={tourRegistry}
            showTab={leaderboardChallengeShowTab}
          />
        )}
      </Body>) : null}
    </Container>
  );
};

export default connect((state: State) => {
  return {
    locale: state.i18n.locale,
  };
}, (dispatch, ownProps) => ({

}))(StudentTabs) as React.ComponentType<StudentTabsPublicProps>;
