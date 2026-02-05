import * as React from 'react';
import { connect } from 'react-redux';
import { State } from 'state';
import Assignment, { AsyncAssignment } from '../state/State/Assignment';
import { styled } from 'styletron-react';
import LocalizedString from '../util/LocalizedString';
import { Theme, ThemeProps } from '../components/constants/theme';
import { StyleProps } from '../util/style';
import Async from '../state/State/Async';
import { AddButton, AddContainer, GradesContainer, NameContainer, SubjectsContainer, UsStdContainer } from './common';
import { faChalkboardTeacher, faCheck, faGraduationCap, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesome } from '../components/FontAwesome';
import Markdown from 'react-markdown';
import { Tab, TabBar } from '../components/Layout/TabBar';
import Subject from '../state/State/Assignment/Subject';


export interface AssignmentViewProps extends StyleProps {
  theme: Theme;
  assignment: AsyncAssignment;
  locale: LocalizedString.Language;

  added: boolean;
  onAddedChange: (added: boolean) => void;

  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

const Container = styled('div', ({ $theme, onClick }: { $theme: Theme; onClick: unknown; }) => ({
  width: '100%',
  borderRadius: `${$theme.itemPadding * 2}px`,
  border: `1px solid ${$theme.borderColor}`,
  marginBottom: `${$theme.itemPadding * 2}px`,
  ':last-child': {
    marginBottom: 0,
  },
  cursor: onClick ? 'pointer' : 'default',
  backgroundColor: 'white',
  overflow: 'hidden',
}));

const Header = styled('div', ({ $theme, $expanded }: { $theme: Theme; $expanded: boolean; }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  padding: `${$theme.itemPadding * 2}px`,
  borderBottom: $expanded ? `1px solid ${$theme.borderColor}` : 'none',
}));

const Body = styled('div', ({ $theme }: { $theme: Theme; }) => ({
  width: '100%',
  overflow: 'hidden',
}));

const StyledMarkdown = styled(Markdown, ({ $theme }: { $theme: Theme; }) => ({
  paddingLeft: `${$theme.itemPadding * 2}px`,
  paddingRight: `${$theme.itemPadding * 2}px`,
}));

const StyledTabBar = styled(TabBar, ({ theme }: ThemeProps) => ({
  width: '100%',
  borderTop: `1px solid ${theme.borderColor}`,
  backgroundColor: 'white'
}));

export default ({
  style,
  className,
  theme,
  assignment,
  locale,
  added,
  onAddedChange,
  expanded,
  onExpandedChange
}: AssignmentViewProps) => {
  const common = Async.latestCommon(assignment);

  const gradeLevelRanges = Assignment.gradeLevelRanges(new Set(common.gradeLevels));
  const gradeLevelAbbreviations = gradeLevelRanges.map(([min, max]) => {
    if (min === max) LocalizedString.lookup(Assignment.gradeLevelAbbreviatedString(min), locale);
    return `${LocalizedString.lookup(Assignment.gradeLevelAbbreviatedString(min), locale)}-${LocalizedString.lookup(Assignment.gradeLevelAbbreviatedString(max), locale)}`;
  });

  const gradeLevelString = gradeLevelAbbreviations.join(', ');

  const latestAssignment = Async.latestValue(assignment);

  const bodyTabs: TabBar.TabDescription[] = [{
    name: 'Educator Notes',
    icon: faChalkboardTeacher,
  }, {
    name: 'Student Notes',
    icon: faGraduationCap,
  }];

  const [bodyTabIndex, setBodyTabIndex] = React.useState(0);

  return (
    <Container
      style={style}
      className={className}
      $theme={theme}
      onClick={_ => onExpandedChange(!expanded)}
    >
      <Header $theme={theme} $expanded={expanded}>
        <NameContainer>{LocalizedString.lookup(common.name, locale)}</NameContainer>
        <UsStdContainer>
          {common.standardsAligned ? <FontAwesome icon={faCheck} /> : null}
        </UsStdContainer>
        <GradesContainer>
          {gradeLevelString}
        </GradesContainer>
        <SubjectsContainer>{common.subjects
          .map(sub => LocalizedString.lookup(Subject.toString(sub), locale)).join(', ')
        }</SubjectsContainer>
        <AddContainer>
          <AddButton $on={!added} $theme={theme} onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            e.preventDefault();
            onAddedChange(!added);
          }}>
            <FontAwesome icon={added ? faMinus : faPlus} /> {added ? 'Remove' : 'Add'}
          </AddButton>
        </AddContainer>
      </Header>
      {expanded && latestAssignment && (
        <Body $theme={theme}>
          <StyledMarkdown $theme={theme}>
            {LocalizedString.lookup(bodyTabIndex === 0 ? latestAssignment.educatorNotes : latestAssignment.studentNotes, locale)}
          </StyledMarkdown>
          <StyledTabBar
            theme={theme}
            tabs={bodyTabs}
            index={bodyTabIndex}
            onIndexChange={setBodyTabIndex}
          />
        </Body>
      )}
    </Container>
  );
};
