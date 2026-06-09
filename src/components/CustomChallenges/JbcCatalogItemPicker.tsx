import * as React from 'react';
import { styled } from 'styletron-react';
import { ThemeProps } from '../constants/theme';
import LocalizedString from '../../util/LocalizedString';
import {
  compareJbcWorldItemOrder,
  JbcCatalogItem,
  WorldSceneItem,
} from '../../util/jbcChallengeCatalog';
import tr from '@i18n';
import { CatalogPickerList } from './catalogPickerList';

export type ItemPickerEntry = JbcCatalogItem | WorldSceneItem;

export interface JbcCatalogItemPickerProps extends ThemeProps {
  locale: LocalizedString.Language;
  catalog: ItemPickerEntry[];
  selectedItemKeys: ReadonlySet<string>;
  onToggle: (entry: ItemPickerEntry, selected: boolean) => void;
  listMaxHeight?: string;
  helpText?: LocalizedString;
  showUsedIn?: boolean;
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

const Row = styled('label', (props: ThemeProps & { $selected?: boolean }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: `${props.theme.itemPadding}px`,
  padding: `${props.theme.itemPadding * 1.5}px`,
  cursor: 'pointer',
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

const JbcCatalogItemPicker: React.FC<JbcCatalogItemPickerProps> = ({
  theme,
  locale,
  catalog,
  selectedItemKeys,
  onToggle,
  listMaxHeight = '220px',
  helpText,
  showUsedIn = true,
}) => {
  const [filter, setFilter] = React.useState('');

  const sortedCatalog = React.useMemo(
    () => [...catalog].sort(compareJbcWorldItemOrder),
    [catalog]
  );

  const filtered = React.useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return sortedCatalog;
    return sortedCatalog.filter(
      entry =>
        entry.nodeId.toLowerCase().includes(q) ||
        entry.displayName.toLowerCase().includes(q) ||
        (entry.templateId?.toLowerCase().includes(q) ?? false) ||
        ('usedIn' in entry &&
          entry.usedIn.some(
            ref =>
              ref.challengeId.toLowerCase().includes(q) ||
              ref.challengeName.toLowerCase().includes(q)
          ))
    );
  }, [sortedCatalog, filter]);

  return (
    <Section theme={theme}>
      <p style={{ opacity: 0.85, marginBottom: theme.itemPadding * 2 }}>
        {LocalizedString.lookup(
          helpText ??
          tr('Pick objects to place on the mat.'),
          locale
        )}
      </p>
      <FilterInput
        theme={theme}
        type="search"
        value={filter}
        placeholder={LocalizedString.lookup(tr('Search objects…'), locale)}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setFilter(e.currentTarget.value)
        }
      />
      <CatalogPickerList theme={theme} $maxHeight={listMaxHeight}>
        {filtered.length === 0 && (
          <p style={{ padding: theme.itemPadding * 2, opacity: 0.7 }}>
            {LocalizedString.lookup(tr('No matching items'), locale)}
          </p>
        )}
        {filtered.map(entry => {
          const selected = selectedItemKeys.has(entry.key);
          return (
            <Row key={entry.key} theme={theme} $selected={selected}>
              <input
                type="checkbox"
                checked={selected}
                onChange={e => onToggle(entry, e.target.checked)}
              />
              <div>
                <strong>{entry.displayName}</strong>
                {entry.templateId && showUsedIn && (
                  <Meta>
                    {LocalizedString.lookup(tr('Template'), locale)}: {entry.templateId}
                  </Meta>
                )}
                {showUsedIn && 'usedIn' in entry && entry.usedIn.length > 0 && (
                  <Meta>
                    {LocalizedString.lookup(tr('Used in'), locale)}:{' '}
                    {entry.usedIn.map(ref => ref.challengeName).join(', ')}
                  </Meta>
                )}
              </div>
            </Row>
          );
        })}
      </CatalogPickerList>
    </Section>
  );
};

export default JbcCatalogItemPicker;
