import Input from '../../components/Input';
import * as React from 'react';
import { StyleProps } from 'style';
import { styled, StyletronComponent, withStyleDeep } from 'styletron-react';
import { Theme, ThemeProps } from '../../components/theme';
import LocalizedString from '../../util/LocalizedString';

import tr from '@i18n';
import { AsyncAssignment } from 'state/State/Assignment';
import Dict from '../../Dict';
import Async from '../../state/State/Async';
import { Fa } from '../../components/Fa';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import StandardsLocation from '../../state/State/Assignment/StandardsLocation';

import Color from 'colorjs.io';
import Subject_ from '../../state/State/Assignment/Subject';
import construct from '../../util/construct';
import { sprintf } from 'sprintf-js';
import BriefAssignmentView from './BriefAssignmentView';

export interface AssignmentsViewProps extends ThemeProps, StyleProps {
  locale: LocalizedString.Language;
  assignments: Dict<AsyncAssignment>;

  onAssignmentClick?: (id: string) => void;
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

const BriefAssignmentsView = ({
  style,
  className,
  theme,
  locale,
  assignments,
  onAssignmentClick
}: AssignmentsViewProps) => {
  const [filter, setFilter] = React.useState<string>('');

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

  return (
    <Container style={style} className={className} $theme={theme}>
      <Search
        theme={theme}
        value={filter}
        onChange={e => setFilter(e.currentTarget.value)}
        placeholder={LocalizedString.lookup(tr('Search'), locale)}
      />
      {filteredAssignments.map(([id, assignment]) => (
        <BriefAssignmentView
          key={id}
          assignment={assignment}
          locale={locale}
          theme={theme}
          onClick={_ => onAssignmentClick && onAssignmentClick(id)}
        />
      ))}
    </Container>
  );
};

export default BriefAssignmentsView;