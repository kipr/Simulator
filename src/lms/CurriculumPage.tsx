import { TabBar } from '../components/Layout/TabBar';
import * as React from 'react';
import { styled } from 'styletron-react';
import LocalizedString from '../util/LocalizedString';
import { DARK, LIGHT, Theme, ThemeProps } from '../components/constants/theme';
import { withNavigate, WithNavigateProps } from '../util/withNavigate';

import tr from '@i18n';
import { faHome, faSchool, faSchoolCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { State } from '../state';
import SearchFilters from './SearchFilters';
import AssignmentsView from './AssignmentsView';
import { AsyncAssignment } from '../state/State/Assignment';
import Dict from '../util/objectOps/Dict';
import { FontAwesome } from '../components/FontAwesome';
import Async from '../state/State/Async';
import Subject from '../state/State/Assignment/Subject';
import { PillAreaItem } from '../components/PillArea';
import StandardsLocation from '../state/State/Assignment/StandardsLocation';
import { UsersAction } from '../state/reducer';

export interface CurriculumPagePublicProps {
  
}

export interface CurriculumPagePrivateProps extends ThemeProps {
  locale: LocalizedString.Language;
  assignments: Dict<AsyncAssignment>;

  userId: string;
  myAssignments: Set<string>;
  onMyAssignmentsChange: (myAssignments: Set<string>) => void;
}

const Container = styled('div', ({ $theme }: { $theme: Theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  color: $theme.color,
  backgroundColor: $theme.backgroundColor,
  minHeight: '100vh',
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
  backgroundColor: 'white',
  ':last-child': {
    marginRight: `${theme.itemPadding * 2}px`,
  }
  
}));

const TopFa = styled(FontAwesome, ({ $theme }: { $theme: Theme }) => ({
  paddingLeft: `${$theme.itemPadding * 2}px`,
  paddingRight: `${$theme.itemPadding * 2}px`,
  fontSize: '32px',
}));


const AddBotballPluginButton = styled('button', ({ $theme }: { $theme: Theme }) => ({
  // Remove all button styles
  border: 'none',
  background: 'none',
  color: 'inherit',
  padding: `${$theme.itemPadding * 2}px`,
  margin: `0 ${$theme.itemPadding * 2}px`,
  // Add custom styles
}));


const CurriculumPage = ({
  theme,
  locale,
  assignments,
  myAssignments,
  onMyAssignmentsChange,
  navigate,
  userId
}: CurriculumPagePublicProps & CurriculumPagePrivateProps & WithNavigateProps) => {
  const [tabIndex, setTabIndex] = React.useState(0);
  const [isStandardsAligned, setIsStandardsAligned] = React.useState(false);
  const [subjectsSelected, setSubjectsSelected] = React.useState<Set<Subject>>(new Set());
  const [standardsSelected, setStandardsSelected] = React.useState<Set<StandardsLocation>>(new Set());
  const [expandedAssignments, setExpandedAssignments] = React.useState<Set<string>>(new Set());
  const [gradeLevels, setGradeLevels] = React.useState<[number, number]>([0, 12]);
  
  const tabs: TabBar.TabDescription[] = [{
    name: LocalizedString.lookup(tr('Curriculum'), locale),
    icon: faSchool
  }, {
    name: LocalizedString.lookup(tr('My Assignments'), locale),
    icon: faSchoolCircleCheck
  }];


  return (
    <Container $theme={theme}>
      <TopBar $theme={theme}>
        <TopFa
          $theme={theme}
          icon={faHome}
          onClick={() => {
            navigate('/');
          }}
        />

        <StyledTabBar
          tabs={tabs}
          index={tabIndex}
          onIndexChange={setTabIndex}
          theme={theme}
        />
        <AddBotballPluginButton $theme={theme} onClick={() => window.location.href = '/lms/plugin'}>
          Add Botball Plugin
        </AddBotballPluginButton>
      </TopBar>
      {tabIndex === 0 ? (
        <Body>
          <SearchFilters
            locale={locale}
            theme={theme}
            isStandardsAligned={isStandardsAligned}
            onIsStandardsAlignedChange={setIsStandardsAligned}
            subjectsSelected={subjectsSelected}
            onSubjectsSelectedChange={setSubjectsSelected}
            standardsSelected={standardsSelected}
            onStandardsSelectedChange={setStandardsSelected}
            assignments={assignments}
            gradeLevels={gradeLevels}
            onGradeLevelsChange={setGradeLevels}
          />
          <AssignmentsView
            theme={theme}
            locale={locale}
            assignments={assignments}
            subjectsSelected={subjectsSelected}
            standardsSelected={standardsSelected}
            gradeLevels={gradeLevels}
            onGradeLevelsChange={setGradeLevels}
            onRemoveStandard={standard => {
              const newStandardsSelected = new Set(standardsSelected);
              newStandardsSelected.delete(standard);
              setStandardsSelected(newStandardsSelected);
            }}
            onRemoveSubject={subject => {
              const newSubjectsSelected = new Set(subjectsSelected);
              newSubjectsSelected.delete(subject);
              setSubjectsSelected(newSubjectsSelected);
            }}
            added={myAssignments}
            onAddedChange={added => onMyAssignmentsChange(added)}
            expanded={expandedAssignments}
            onExpandedChange={setExpandedAssignments}
            standardsAligned={isStandardsAligned}
            onStandardsAlignedChange={setIsStandardsAligned}
          />
        </Body>
      ) : (
        <Body>
          <SearchFilters
            locale={locale}
            theme={theme}
            isStandardsAligned={isStandardsAligned}
            onIsStandardsAlignedChange={setIsStandardsAligned}
            subjectsSelected={subjectsSelected}
            onSubjectsSelectedChange={setSubjectsSelected}
            standardsSelected={standardsSelected}
            onStandardsSelectedChange={setStandardsSelected}
            assignments={assignments}
            gradeLevels={gradeLevels}
            onGradeLevelsChange={setGradeLevels}
          />
          <AssignmentsView
            theme={theme}
            locale={locale}
            assignments={Dict.filter(assignments, (_, id) => myAssignments.has(id))}
            added={myAssignments}
            onAddedChange={added => onMyAssignmentsChange(added)}
            expanded={expandedAssignments}
            onExpandedChange={setExpandedAssignments}
            gradeLevels={gradeLevels}
            onGradeLevelsChange={setGradeLevels}
            onStandardsAlignedChange={setIsStandardsAligned}
            standardsAligned={isStandardsAligned}
          />
        </Body>
      )}
    </Container>
  );
};

export default connect((state: State) => {
  let myAssignments = new Set();
  if (state.users.me) {
    const latestMe = Async.latestValue(state.users.users[state.users.me]);
    if (latestMe && latestMe.myAssignments) myAssignments = new Set(latestMe.myAssignments);
  }
  return {
    theme: LIGHT,
    locale: state.i18n.locale,
    assignments: state.assignments,
    myAssignments
  };
}, (dispatch, ownProps) => ({
  onMyAssignmentsChange: (myAssignments: Set<string>) => dispatch(UsersAction.setMyAssignments({
    assignmentIds: Array.from(myAssignments)
  }))
}))(withNavigate(CurriculumPage)) as React.ComponentType<CurriculumPagePublicProps>;