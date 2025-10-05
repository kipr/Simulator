import { TabBar } from '../../components/Layout/TabBar';
import * as React from 'react';
import { styled } from 'styletron-react';
import LocalizedString from '../../util/LocalizedString';
import { DARK, LIGHT, Theme, ThemeProps } from '../../components/constants/theme';

import tr from '@i18n';
import { faHome, faSchool, faSchoolCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { State } from '../../state';
import SearchFilters from '../SearchFilters';
import AssignmentsView from '../AssignmentsView';
import { AsyncAssignment } from '../../state/State/Assignment';
import Dict from '../../util/objectOps/Dict';
import { FontAwesome } from '../../components/FontAwesome';
import Async from '../../state/State/Async';
import Subject from '../../state/State/Assignment/Subject';
import { PillAreaItem } from '../../components/PillArea';
import StandardsLocation from '../../state/State/Assignment/StandardsLocation';
import { UsersAction } from '../../state/reducer';
import Input from 'components/interface/Input';
import BriefAssignmentsView from './BriefAssignmentsView';
import { courseId } from './globals';

export interface PluginPagePublicProps {
  
}

export interface PluginPagePrivateProps extends ThemeProps {
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
  backgroundColor: 'white'
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


const PluginPage = ({
  theme,
  locale,
  assignments,
  myAssignments,
  onMyAssignmentsChange,
  userId
}: PluginPagePublicProps & PluginPagePrivateProps) => {
  const [expandedAssignments, setExpandedAssignments] = React.useState<Set<string>>(new Set());
  
  return (
    <Container $theme={theme}>
      <Body>
        <BriefAssignmentsView
          theme={theme}
          locale={locale}
          assignments={assignments}
          onAssignmentClick={async id => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
            await (gapi.client as any).classroom.courses.courseWork.create({
              courseId,
            });
            window.top.postMessage({ type: 'open-assignment', id }, '*');
          }}
        />
      </Body>
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
}))(PluginPage) as React.ComponentType<PluginPagePublicProps>;