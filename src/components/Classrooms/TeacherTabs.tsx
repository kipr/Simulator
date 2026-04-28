
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
import { AsyncClassroom, Classroom, ClassroomAssignment } from '../../state/State/Classroom';
import { current } from 'immer';
import AssignmentsView from './AssignmentsView';

export interface TeacherTabsPublicProps extends ThemeProps, StyleProps {
  currentSelectedClassroom: AsyncClassroom | null;
  onAssignmentAction: (currentSelectedClassroom: AsyncClassroom, action: 'edit' | 'create', assingmentToEdit?: ClassroomAssignment) => void;
  tabIndex?: number;
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
  //backgroundColor: $theme.backgroundColor,
  backgroundColor: 'lightblue'
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
}: Props) => {
  const [tabIndex, setTabIndex] = React.useState(tabIndexProp ?? 0);
  const [peopleContextMenu, setPeopleContextMenu] = React.useState({ visible: false, x: 0, y: 0 });
  const [assignmentsContextMenu, setAssignmentsContextMenu] = React.useState({ visible: false, x: 0, y: 0 });
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
    }
  ];

  return (
    <Container $theme={theme} ref={containerRef}
      onClick={() => {
        tabIndex === 2 && setPeopleContextMenu({ ...peopleContextMenu, visible: false });
        tabIndex === 1 && setAssignmentsContextMenu({ ...assignmentsContextMenu, visible: false });
        console.log("container click");
      }}>
      <TopBar $theme={theme}>
        <StyledTabBar
          tabs={tabs}
          index={tabIndex}
          onIndexChange={setTabIndex}
          theme={theme}
        />

      </TopBar>
      {currentSelectedClassroom ? (
        <Body>
          {tabIndex === 0 && <div>Home</div>}
          {tabIndex === 1 &&
            <AssignmentsView containerRef={containerRef} theme={theme} currentSelectedClassroom={currentSelectedClassroom}
              onAssignmentAction={onAssignmentAction}
              contextMenuVisible={assignmentsContextMenu.visible}
              setContextMenuVisible={setAssignmentsContextMenu} />}
          {tabIndex === 2 &&
            <PeopleView theme={theme} currentSelectedClassroom={currentSelectedClassroom}
              contextMenuVisible={peopleContextMenu.visible}
              setContextMenuVisible={setPeopleContextMenu} />}
          {tabIndex === 3 && <div>Grades</div>}
        </Body>
      ) : (
        <Body style={{ justifyContent: 'center', alignItems: 'center' }}>
          <h2>{LocalizedString.lookup(tr('Select a classroom to view details'), locale)}</h2>
        </Body>
      )}
    </Container>
  )
}

export default connect((state: State) => {
  return {
    locale: state.i18n.locale,
  }
}, (dispatch, ownProps) => ({

}))(TeacherTabs) as React.ComponentType<TeacherTabsPublicProps>;