import * as React from 'react';
import { connect } from 'react-redux';
import { State } from 'state';
import Assignment, { AsyncAssignment } from '../../state/State/Assignment';
import { styled } from 'styletron-react';
import LocalizedString from '../../util/LocalizedString';
import { Theme, ThemeProps } from '../../components/constants/theme';
import { StyleProps } from '../../util/style';
import Async from '../../state/State/Async';
import { GradesContainer, NameContainer, SubjectsContainer, UsStdContainer } from '../common';
import { FontAwesome } from '../../components/FontAwesome';
import Markdown from 'react-markdown';
import { TabBar } from '../../components/Layout/TabBar';
import Subject from '../../state/State/Assignment/Subject';

export interface AssignmentViewProps extends StyleProps {
  theme: Theme;
  assignment: AsyncAssignment;
  locale: LocalizedString.Language;

  onClick?: (e: React.MouseEvent) => void;
}

const Container = styled('div', ({ $theme, onClick }: { $theme: Theme; onClick: unknown; }) => ({
  width: '100%',
  borderRadius: `${$theme.itemPadding * 2}px`,
  border: `1px solid ${$theme.borderColor}`,
  marginBottom: `${$theme.itemPadding * 2}px`,
  ':last-child': {
    marginBottom: 0,
  },
  // eslint-disable-next-line no-extra-boolean-cast
  cursor: !!onClick ? 'pointer' : 'default',
  backgroundColor: 'white',
  overflow: 'hidden',
}));

const Header = styled('div', ({ $theme }: { $theme: Theme; }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  padding: `${$theme.itemPadding * 2}px`,
  borderBottom: 'none',
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
  onClick
}: AssignmentViewProps) => {
  const common = Async.latestCommon(assignment);

  const gradeLevelRanges = Assignment.gradeLevelRanges(new Set(common.gradeLevels));
  const gradeLevelAbbreviations = gradeLevelRanges.map(([min, max]) => {
    if (min === max) LocalizedString.lookup(Assignment.gradeLevelAbbreviatedString(min), locale);
    return `${LocalizedString.lookup(Assignment.gradeLevelAbbreviatedString(min), locale)}-${LocalizedString.lookup(Assignment.gradeLevelAbbreviatedString(max), locale)}`;
  });

  const gradeLevelString = gradeLevelAbbreviations.join(', ');

  const latestAssignment = Async.latestValue(assignment);
  
  return (
    <Container
      style={style}
      className={className}
      $theme={theme}
      onClick={onClick}
    >
      <Header $theme={theme}>
        <NameContainer>{LocalizedString.lookup(common.name, locale)}</NameContainer>
        <UsStdContainer></UsStdContainer>
      </Header>
      <Header $theme={theme}>
        <GradesContainer>
          {gradeLevelString}
        </GradesContainer>
        <SubjectsContainer>{common.subjects
          .map(sub => LocalizedString.lookup(Subject.toString(sub), locale)).join(', ')
        }</SubjectsContainer>
      </Header>
    </Container>
  );
};
