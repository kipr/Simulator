import * as React from 'react';
import { styled } from 'styletron-react';
import { ThemeProps } from '../constants/theme';
import LocalizedString from '../../util/LocalizedString';
import { JbcCatalogSuccessGoal } from '../../util/jbcChallengeCatalog';
import tr from '@i18n';
import { CatalogPickerList } from './catalogPickerList';

export interface JbcCatalogSuccessGoalPickerProps extends ThemeProps {
  locale: LocalizedString.Language;
  catalog: JbcCatalogSuccessGoal[];
  selectedKeys: ReadonlySet<string>;
  disabledKeys?: ReadonlySet<string>;
  onToggle: (entry: JbcCatalogSuccessGoal, selected: boolean) => void;
  listMaxHeight?: string;
  helpText?: LocalizedString;
  showHeader?: boolean;
}

const Section = styled('div', (props: ThemeProps) => ({
  marginBottom: `${props.theme.itemPadding * 3}px`,
}));

const FilterInput = styled('input', (props: ThemeProps) => ({
  width: '100%',
  padding: `${props.theme.itemPadding}px`,
  marginBottom: `${props.theme.itemPadding * 2}px`,
  boxSizing: 'border-box',
}));

const Row = styled('label', (props: ThemeProps & { $dimmed?: boolean; $selected?: boolean }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: `${props.theme.itemPadding}px`,
  padding: `${props.theme.itemPadding * 1.5}px`,
  cursor: props.$dimmed ? 'not-allowed' : 'pointer',
  opacity: props.$dimmed ? 0.45 : 1,
  backgroundColor: props.$selected ? 'rgba(255, 255, 255, 0.08)' : undefined,
  borderBottom: `1px solid ${props.theme.borderColor}`,
  ':last-child': {
    borderBottom: 'none',
  },
}));

const Meta = styled('span', {
  display: 'block',
  fontSize: '0.85em',
  opacity: 0.75,
  marginTop: '4px',
});

const JbcCatalogSuccessGoalPicker: React.FC<JbcCatalogSuccessGoalPickerProps> = ({
  theme,
  locale,
  catalog,
  selectedKeys,
  disabledKeys,
  onToggle,
  listMaxHeight = '220px',
  helpText,
  showHeader = true,
}) => {
  const [filter, setFilter] = React.useState('');

  const filtered = React.useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      entry =>
        entry.eventId.toLowerCase().includes(q) ||
        entry.label.toLowerCase().includes(q) ||
        entry.source.challengeId.toLowerCase().includes(q) ||
        entry.source.challengeName.toLowerCase().includes(q)
    );
  }, [catalog, filter]);

  return (
    <Section theme={theme}>
      {showHeader && (
        <>
          <h3>{LocalizedString.lookup(tr('Standard JBC goals'), locale)}</h3>
          <p style={{ opacity: 0.85, marginBottom: theme.itemPadding * 2 }}>
            {LocalizedString.lookup(
              helpText ?? tr('Goals from official challenges. Events are added automatically.'),
              locale
            )}
          </p>
        </>
      )}
      <FilterInput
        theme={theme}
        type="search"
        value={filter}
        placeholder={LocalizedString.lookup(tr('Search goals…'), locale)}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setFilter(e.currentTarget.value)
        }
      />
      <CatalogPickerList theme={theme} $maxHeight={listMaxHeight}>
        {filtered.length === 0 && (
          <p style={{ padding: theme.itemPadding * 2, opacity: 0.7 }}>
            {LocalizedString.lookup(tr('No matching success conditions'), locale)}
          </p>
        )}
        {filtered.map(entry => {
          const selected = selectedKeys.has(entry.key);
          const disabled = disabledKeys?.has(entry.key) ?? false;
          return (
            <Row
              key={entry.key}
              theme={theme}
              $selected={selected}
              $dimmed={disabled && !selected}
            >
              <input
                type="checkbox"
                checked={selected}
                disabled={disabled && !selected}
                onChange={e => onToggle(entry, e.target.checked)}
              />
              <div>
                <strong>{entry.label}</strong>
                {showHeader && (
                  <>
                    <Meta>
                      {LocalizedString.lookup(tr('Event'), locale)}:{' '}
                      <code>{entry.eventId}</code>
                      {entry.latchOnce
                        ? ` · ${LocalizedString.lookup(tr('Latch (Once)'), locale)}`
                        : ''}
                    </Meta>
                    <Meta>
                      {LocalizedString.lookup(tr('From'), locale)}:{' '}
                      {entry.source.challengeName}
                    </Meta>
                  </>
                )}
              </div>
            </Row>
          );
        })}
      </CatalogPickerList>
    </Section>
  );
};

export default JbcCatalogSuccessGoalPicker;
