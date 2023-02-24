import Section from '../components/interface/Section';
import { Switch } from '../components/Switch';
import { Theme, ThemeProps } from '../components/constants/theme';
import * as React from 'react';

import { StyleProps } from 'util/style';
import { styled } from 'styletron-react';
import LocalizedString from '../util/LocalizedString';

import tr from '@i18n';
import ValueEdit from '../components/ValueEdit';
import SearchableSwitchList, { SearchableSwitchListItem } from '../components/SearchableSwitchList';
import StandardsLocation from '../state/State/Assignment/StandardsLocation';
import Assignment, { AsyncAssignment } from '../state/State/Assignment';
import Dict from '../util/objectOps/Dict';
import Async from '../state/State/Async';
import Widget, { Mode } from '../components/interface/Widget';
import Subject from '../state/State/Assignment/Subject';
import PillArea, { PillAreaItem } from '../components/PillArea';
import DoubleSlider, { DoubleSliderOption } from '../components/DoubleSlider';

export interface SearchFiltersProps extends ThemeProps, StyleProps {
  locale: LocalizedString.Language;

  isStandardsAligned: boolean;
  onIsStandardsAlignedChange: (isStandardsAligned: boolean) => void;

  subjectsSelected: Set<Subject>;
  onSubjectsSelectedChange: (subjectsSelected: Set<Subject>) => void;

  standardsSelected: Set<StandardsLocation>;
  onStandardsSelectedChange: (standardsSelected: Set<StandardsLocation>) => void;

  assignments: Dict<AsyncAssignment>;
}

const StyledWidget = styled(Widget, ({ theme }: { theme: Theme }) => ({
  minWidth: '300px',
  width: '300px',
  maxWidth: '300px',
  backgroundColor: 'white'
}));

const Row = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const RowLabel = styled('div', ({ $theme }: { $theme: Theme }) => ({
  flex: 1,
  paddingLeft: `${$theme.itemPadding * 2}px`,
}));

export default ({
  style,
  className,
  theme,
  locale,
  isStandardsAligned,
  onIsStandardsAlignedChange,
  subjectsSelected,
  onStandardsSelectedChange,
  onSubjectsSelectedChange,
  standardsSelected,
  assignments
}: SearchFiltersProps) => {
  const [standardsCollapsed, setStandardsCollapsed] = React.useState(false);
  const [subjectCollapsed, setSubjectCollapsed] = React.useState(false);

  const [standardsFilter, setStandardsFilter] = React.useState('');


  const standardsLocations: SearchableSwitchListItem[] = [];
  for (const unitedStatesTerritory of StandardsLocation.UNITED_STATES_TERRITORIES) {
    const conformingAssignments = Dict.filter(assignments, a =>
      Async.latestCommon(a).standardsConformance.findIndex(sc =>
        sc === unitedStatesTerritory
      ) !== -1
    );
    standardsLocations.push({
      id: unitedStatesTerritory,
      name: `${unitedStatesTerritory} (${Dict.keySet(conformingAssignments).size})`
    });
  }

  const subjects = new Set<Subject>();
  for (const assignment of Object.values(assignments)) {
    const common = Async.latestCommon(assignment);
    if (!common) continue;
    for (const subject of common.subjects) subjects.add(subject);
  }

  const subjectItems: PillAreaItem<Subject>[] = [];

  for (const subject of subjects) {
    subjectItems.push({
      id: subject,
      label: LocalizedString.lookup(Subject.toString(subject), locale)
    });
  }

  const sliderOptions: DoubleSliderOption[] = [];
  for (let i = 0; i <= 12; ++i) {
    sliderOptions.push({
      label: LocalizedString.lookup(Assignment.gradeLevelAbbreviatedString(i), locale)
    });
  }

  return (
    <StyledWidget
      style={style}
      className={className}
      theme={theme}
      mode={Mode.Sidebar}
      name={LocalizedString.lookup(tr('Search Filters'), locale)}
    >
      <Row>
        <RowLabel $theme={theme}>{LocalizedString.lookup(tr('Is standards aligned'), locale)}</RowLabel>
        <Switch
          theme={theme}
          onValueChange={onIsStandardsAlignedChange}
          value={isStandardsAligned}
        />
      </Row>
      
      <Section
        theme={theme}
        name={LocalizedString.lookup(tr('Standards'), locale)}
        collapsed={standardsCollapsed}
        onCollapsedChange={setStandardsCollapsed}
      >
        <SearchableSwitchList
          theme={theme}
          items={standardsLocations}
          selectedItems={standardsSelected}
          onSelectionChange={onStandardsSelectedChange as (s: Set<string>) => void}
          filter={standardsFilter}
          onFilterChange={setStandardsFilter}
          locale={locale}
        />
      </Section>
      {subjectItems.length > 0 && <Section
        theme={theme}
        name={LocalizedString.lookup(tr('Subject'), locale)}
        collapsed={subjectCollapsed}
        onCollapsedChange={setSubjectCollapsed}
      >
        <PillArea
          items={subjectItems}
          selectedItems={subjectsSelected}
          onSelectionChange={onSubjectsSelectedChange}
          theme={theme}
        />
      </Section>}
      <DoubleSlider
        options={sliderOptions}
        startIndex={0}
        endIndex={sliderOptions.length - 1}
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onChange={() => {}}
        theme={theme}
      />
    </StyledWidget>

  );
};