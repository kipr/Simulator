import Input from '../components/Input';
import * as React from 'react';
import { StyleProps } from 'style';
import { styled, StyletronComponent, withStyleDeep } from 'styletron-react';
import { Theme, ThemeProps } from '../components/theme';
import LocalizedString from '../util/LocalizedString';

import tr from '@i18n';
import { AsyncAssignment } from 'state/State/Assignment';
import Dict from '../Dict';
import AssignmentView from './AssignmentView';
import Async from '../state/State/Async';
import { AddContainer, GradesContainer, NameContainer, SubjectsContainer, UsStdContainer } from './common';
import { Fa } from '../components/Fa';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import StandardsLocation from '../state/State/Assignment/StandardsLocation';

import Color from 'colorjs.io';
import Subject_ from '../state/State/Assignment/Subject';
import PillArea, { PillAreaItem, PillAreaProps } from '../components/PillArea';
import construct from '../util/construct';
import { sprintf } from 'sprintf-js';

export interface AssignmentsViewProps extends ThemeProps, StyleProps {
  locale: LocalizedString.Language;
  assignments: Dict<AsyncAssignment>;

  subjectsSelected?: Set<Subject_>;
  standardsSelected?: Set<StandardsLocation>;

  onRemoveSubject?: (subject: Subject_) => void;
  onRemoveStandard?: (standard: StandardsLocation) => void;

  added: Set<string>;
  onAddedChange: (added: Set<string>) => void;

  expanded: Set<string>;
  onExpandedChange: (expanded: Set<string>) => void;
}

const Container = styled('div', ({ $theme }: { $theme: Theme }) => ({
  backgroundColor: $theme.backgroundColor,
  width: '100%',
  padding: `${$theme.itemPadding * 2}px`,
}));

const Search = styled(Input, ({ theme }: ThemeProps) => ({
  width: '100%',
  marginBottom: `${theme.itemPadding * 2}px`,
}));

const Header = styled('div', ({ $theme }: { $theme: Theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  borderRadius: `${$theme.itemPadding * 2}px`,
  padding: `${$theme.itemPadding * 2}px`,
  border: `1px solid ${$theme.borderColor}`,
  marginBottom: `${$theme.itemPadding * 2}px`,
  backgroundColor: 'white'
}));

namespace Sort {
  export interface Name {
    direction: 'asc' | 'desc';
  }

  export interface UsStd {
    direction: 'asc' | 'desc';
  }
}

const clickable = element => withStyleDeep(element, {
  cursor: 'pointer',
  userSelect: 'none',
});

const StyledNameContainer = clickable(NameContainer);
const StyledUsStdContainer = clickable(UsStdContainer);

type SortDirection = 'asc' | 'desc';

const sortIcon = (direction: SortDirection) => direction === 'asc' ? faCaretUp : faCaretDown;

namespace PillId {
  export interface Subject {
    type: 'subject';
    subject: Subject_;
  }

  export const subject = construct<Subject>('subject');

  export interface Standard {
    type: 'standard';
    standard: StandardsLocation;
  }

  export const standard = construct<Standard>('standard');
}

type PillId = (
  PillId.Subject |
  PillId.Standard
);

const StyledPillArea = styled(PillArea, ({ theme }: { theme: Theme }) => ({
  marginBottom: `${theme.itemPadding * 2}px`,
})) as StyletronComponent<Pick<PillAreaProps<PillId>, keyof PillAreaProps<PillId>> & {
  theme: Theme;
}>;

const AssignmentsView = ({
  style,
  className,
  theme,
  locale,
  assignments,
  subjectsSelected,
  standardsSelected,
  onRemoveStandard,
  onRemoveSubject,
  added,
  onAddedChange,
  expanded,
  onExpandedChange
}: AssignmentsViewProps) => {
  const [filter, setFilter] = React.useState<string>('');
  const [nameSort, setNameSort] = React.useState<SortDirection>('asc');
  const [usStdSort, setUsStdSort] = React.useState<SortDirection>('desc');

  const assignmentsList = Dict.toList(assignments).filter(([_, assignment]) => !!Async.latestCommon(assignment));

  const filteredAssignments = assignmentsList.filter(([_, assignment]) => {
    const common = Async.latestCommon(assignment)!;
    const name = LocalizedString.lookup(common.name, locale);
    if (name.toLowerCase().includes(filter.toLowerCase())) return true;
    
    const latestValue = Async.latestValue(assignment);
    if (!latestValue) return false;

    const educatorNotes = LocalizedString.lookup(latestValue.educatorNotes, locale);
    if (educatorNotes.toLowerCase().includes(filter.toLowerCase())) return true;

    const studentNotes = LocalizedString.lookup(latestValue.studentNotes, locale);
    if (studentNotes.toLowerCase().includes(filter.toLowerCase())) return true;

    return false;
  });

  const sortedAssignments = filteredAssignments.sort(([aId, a], [bId, b]) => {
    const aCommon = Async.latestCommon(a)!;
    const bCommon = Async.latestCommon(b)!;

    const aName = LocalizedString.lookup(aCommon.name, locale);
    const bName = LocalizedString.lookup(bCommon.name, locale);
    return nameSort === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
  });

  sortedAssignments.sort(([aId, a], [bId, b]) => {
    const aCommon = Async.latestCommon(a)!;
    const bCommon = Async.latestCommon(b)!;

    const aUsStd = aCommon.standardsConformance.findIndex(sc => sc === StandardsLocation.UnitedStates);
    const bUsStd = bCommon.standardsConformance.findIndex(sc => sc === StandardsLocation.UnitedStates);

    return usStdSort === 'asc' ? aUsStd - bUsStd : bUsStd - aUsStd;
  });

  const pillItems: PillAreaItem<PillId>[] = [];

  for (const standard of standardsSelected || new Set()) {
    pillItems.push({
      id: PillId.standard({ standard }),
      label: sprintf(
        LocalizedString.lookup(tr('Standard: %s'), locale),
        standard
      ),
    });
  }

  for (const subject of subjectsSelected || new Set()) {
    pillItems.push({
      id: PillId.subject({ subject }),
      label: sprintf(
        LocalizedString.lookup(tr('Subject: %s'), locale),
        LocalizedString.lookup(Subject_.toString(subject), locale)
      ),
    });
  }

  return (
    <Container style={style} className={className} $theme={theme}>
      <Search
        theme={theme}
        value={filter}
        onChange={e => setFilter(e.currentTarget.value)}
        placeholder={LocalizedString.lookup(tr('Search'), locale)}
      />
      {pillItems.length > 0 && (
        <PillArea
          theme={theme}
          items={pillItems}
          onItemRemove={id => {
            switch (id.type) {
              case 'subject': return onRemoveSubject(id.subject);
              case 'standard': return onRemoveStandard(id.standard);
            }
          }}
        />
      )}
      <Header $theme={theme}>
        <StyledNameContainer onClick={_ => setNameSort(nameSort === 'asc' ? 'desc' : 'asc')}>
          {LocalizedString.lookup(tr('Name'), locale)} <Fa icon={sortIcon(nameSort)} />
        </StyledNameContainer>
        <StyledUsStdContainer onClick={_ => setUsStdSort(usStdSort === 'asc' ? 'desc' : 'asc')}>
          {LocalizedString.lookup(tr('U.S. Std.'), locale)} <Fa icon={sortIcon(usStdSort)} />
        </StyledUsStdContainer>
        <GradesContainer>Grades</GradesContainer>
        <SubjectsContainer>Subjects</SubjectsContainer>
        <AddContainer />
      </Header>
      {sortedAssignments.map(([id, assignment]) => (
        <AssignmentView
          key={id}
          assignment={assignment}
          locale={locale}
          theme={theme}
          added={added.has(id)}
          onAddedChange={addedSingle => {
            const nextAdded = new Set(added);
            if (addedSingle) nextAdded.add(id);
            else nextAdded.delete(id);
            onAddedChange(nextAdded);
          }}
          expanded={expanded.has(id)}
          onExpandedChange={expandedSingle => {
            const nextExpanded = new Set(expanded);
            if (expandedSingle) nextExpanded.add(id);
            else nextExpanded.delete(id);
            onExpandedChange(nextExpanded);
          }}
        />
      ))}
    </Container>
  );
};

export default AssignmentsView;