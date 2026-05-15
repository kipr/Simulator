
import { Theme, ThemeProps } from '../constants/theme';
import { StyleProps } from '../../util/style';
import LocalizedString from '../../util/LocalizedString';
import * as React from 'react';
import { styled } from 'styletron-react';
import { TabBar } from '..//Layout/TabBar';
import tr from '@i18n';
import { faHome, faSchool, faPeopleGroup, faFileCircleCheck, faListOl } from '@fortawesome/free-solid-svg-icons';
import { State } from '../../state';
import { connect } from 'react-redux';
import { FontAwesome } from '../FontAwesome';
import PeopleView from './PeopleView';
import { AsyncClassroom, Classroom, ClassroomAssignment } from '../../state/State/Classroom';
import { TourRegistry } from '../../tours/TourRegistry';
import AssignmentsView from './AssignmentsView';
import HomeView from './HomeView';
import GradesView from './GradesView';
import ChallengeTabView from './ChallengeTabView';


export interface TeacherTabsPublicProps extends ThemeProps, StyleProps {
  currentSelectedClassroom: AsyncClassroom | null;
  onAssignmentAction: (currentSelectedClassroom: AsyncClassroom, action: 'edit' | 'create', assingmentToEdit?: ClassroomAssignment) => void;
  tabIndex?: number;
  tourRegistry?: TourRegistry;
  activeTourStepId?: string;
  tourHighlightAssignmentTitle?: string;
}

export interface TeacherTabsPrivateProps extends ThemeProps {
  locale: LocalizedString.Language;
}

type Props = TeacherTabsPublicProps & TeacherTabsPrivateProps;

const Container = styled('div', ({ $theme }: { $theme: Theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  color: $theme.color,
  backgroundColor: $theme.backgroundColor,
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

const TopBar = styled('div', ({ $theme }: { $theme: Theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderBottom: `1px solid ${$theme.borderColor}`,
  height: '48px',
}));

const StyledTabBar = styled(TabBar, ({ theme }: ThemeProps) => ({
  flex: 1,
  borderTopLeftRadius: `${theme.itemPadding * 2}px`,
  borderTopRightRadius: `${theme.itemPadding * 2}px`,
  alignSelf: 'end',
  borderTop: `1px solid ${theme.borderColor}`,
  borderLeft: `1px solid ${theme.borderColor}`,
  borderRight: `1px solid ${theme.borderColor}`,
  backgroundColor: theme.backgroundColor,
  ':last-child': {
    marginRight: `${theme.itemPadding * 2}px`,
  },
  ':first-child': {
    marginLeft: `${theme.itemPadding * 2}px`,
  }

}));

const TopFa = styled(FontAwesome, ({ $theme }: { $theme: Theme }) => ({
  paddingLeft: `${$theme.itemPadding * 2}px`,
  paddingRight: `${$theme.itemPadding * 2}px`,
  fontSize: '32px',
}));

const TeacherTabs = ({
  theme,
  locale,
  currentSelectedClassroom,
  onAssignmentAction,
  tabIndex: tabIndexProp,
  tourRegistry,
  activeTourStepId,
  tourHighlightAssignmentTitle,
}: Props) => {
  const [tabIndex, setTabIndex] = React.useState(tabIndexProp ?? 0);
  React.useEffect(() => {
    setTabIndex(tabIndexProp ?? 0);
  }, [tabIndexProp]);
  const [peopleContextMenu, setPeopleContextMenu] = React.useState({ visible: false, x: 0, y: 0 });
  const [assignmentsContextMenu, setAssignmentsContextMenu] = React.useState({ visible: false, x: 0, y: 0 });
  const [gradesContextMenu, setGradesContextMenu] = React.useState({ visible: false, x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);
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
      name: LocalizedString.lookup(tr('Grades'), locale),
      icon: faFileCircleCheck
    },
    {
      name: LocalizedString.lookup(tr('Leaderboard'), locale),
      icon: faListOl
    }
  ];

  function setContextMenuVisible({ visible, x, y }: { visible: boolean, x: number, y: number }) {
    if (tabIndex === 3) {
      setGradesContextMenu({ visible, x, y });
    }
  }

  return (
    <Container $theme={theme} ref={containerRef}
      onClick={() => {
        tabIndex === 2 && setPeopleContextMenu({ ...peopleContextMenu, visible: false });
        tabIndex === 1 && setAssignmentsContextMenu({ ...assignmentsContextMenu, visible: false });
        tabIndex === 3 && setGradesContextMenu({ ...gradesContextMenu, visible: false });
      }}>
      <TopBar $theme={theme}>
        <StyledTabBar
          tabs={tabs}
          index={tabIndex}
          onIndexChange={setTabIndex}
          theme={theme}
          tourRegistry={tourRegistry}
        />

      </TopBar>
      {currentSelectedClassroom ? (
        <Body>
          {tabIndex === 0 && <HomeView theme={theme} config={'Teacher'} currentClassroom={currentSelectedClassroom} />}
          {tabIndex === 1 &&
            <AssignmentsView containerRef={containerRef} config={'Teacher'} theme={theme} currentSelectedClassroom={currentSelectedClassroom}
              onAssignmentAction={onAssignmentAction}
              contextMenuVisible={assignmentsContextMenu.visible}
              setContextMenuVisible={setAssignmentsContextMenu}
              tourRegistry={tourRegistry}
              activeTourStepId={activeTourStepId}
              tourHighlightAssignmentTitle={tourHighlightAssignmentTitle}
            />
          }
          {tabIndex === 2 &&
            <PeopleView theme={theme} config={'Teacher'} currentSelectedClassroom={currentSelectedClassroom}
              contextMenuVisible={peopleContextMenu.visible}
              setContextMenuVisible={setPeopleContextMenu} />}
          {tabIndex === 3 &&
            <GradesView theme={theme} currentSelectedClassroom={currentSelectedClassroom}
              contextMenuVisible={gradesContextMenu.visible}
              setContextMenuVisible={setContextMenuVisible}
              onAssignmentAction={onAssignmentAction} />}
          {tabIndex === 4 &&
            <ChallengeTabView theme={theme} view="teacherView" currentSelectedClassroom={currentSelectedClassroom} tourRegistry={tourRegistry} />
          }
        </Body>
      ) : (
        <Body style={{ justifyContent: 'center', alignItems: 'center' }}>
          <h2>{LocalizedString.lookup(tr('Select a classroom to view details'), locale)}</h2>
        </Body>
      )}
    </Container>
  );
};

export default connect((state: State) => {
  return {
    locale: state.i18n.locale,
  };
}, (dispatch, ownProps) => ({

}))(TeacherTabs) as React.ComponentType<TeacherTabsPublicProps>;