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

export interface ItemPickerGroupEntry {
  key: string;
  nodeId: string;
  displayName: string;
  templateId?: string;
  itemKeys: string[];
}

export type ItemPickerEntry = JbcCatalogItem | WorldSceneItem | ItemPickerGroupEntry;

export interface JbcCatalogItemPickerProps extends ThemeProps {
  locale: LocalizedString.Language;
  catalog: ItemPickerEntry[];
  selectedItemKeys: ReadonlySet<string>;
  onToggle: (entry: ItemPickerEntry, selected: boolean) => void;
  onAddPaperReam?: () => void;
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

const AddRow = styled('button', (props: ThemeProps) => ({
  width: '100%',
  display: 'block',
  padding: `${props.theme.itemPadding * 1.5}px`,
  cursor: 'pointer',
  textAlign: 'left',
  color: props.theme.color,
  backgroundColor: 'rgba(255, 255, 255, 0.04)',
  border: 'none',
  borderBottom: `1px solid ${props.theme.borderColor}`,
  fontWeight: 700,
}));

const Meta = styled('span', {
  display: 'block',
  fontSize: '0.85em',
  opacity: 0.75,
  marginTop: '4px',
});

function isGroupEntry_(entry: ItemPickerEntry): entry is ItemPickerGroupEntry {
  return 'itemKeys' in entry;
}

function compactPaperReams_(
  catalog: ItemPickerEntry[],
  locale: LocalizedString.Language
): ItemPickerEntry[] {
  const reams = catalog.filter(entry => /^ream\d+$/i.test(entry.nodeId));
  if (reams.length <= 1) return catalog;

  const withoutReams = catalog.filter(entry => !/^ream\d+$/i.test(entry.nodeId));
  return [
    ...withoutReams,
    {
      key: 'paperReams',
      nodeId: 'ream1',
      displayName: String(LocalizedString.lookup(tr('Paper Reams'), locale)),
      templateId: 'ream',
      itemKeys: reams
        .map(entry => entry.key)
        .sort((a, b) => {
          const aNum = Number(a.replace(/\D+/g, ''));
          const bNum = Number(b.replace(/\D+/g, ''));
          return aNum - bNum;
        }),
    },
  ];
}

const JbcCatalogItemPicker: React.FC<JbcCatalogItemPickerProps> = ({
  theme,
  locale,
  catalog,
  selectedItemKeys,
  onToggle,
  onAddPaperReam,
  listMaxHeight = '220px',
  helpText,
  showUsedIn = true,
}) => {
  const [filter, setFilter] = React.useState('');

  const compactCatalog = React.useMemo(
    () => compactPaperReams_(catalog, locale),
    [catalog, locale]
  );

  const sortedCatalog = React.useMemo(
    () => [...compactCatalog].sort(compareJbcWorldItemOrder),
    [compactCatalog]
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
        {onAddPaperReam && (
          <AddRow theme={theme} type="button" onClick={onAddPaperReam}>
            + {LocalizedString.lookup(tr('Add Paper Ream'), locale)}
          </AddRow>
        )}
        {filtered.length === 0 && (
          <p style={{ padding: theme.itemPadding * 2, opacity: 0.7 }}>
            {LocalizedString.lookup(tr('No matching items'), locale)}
          </p>
        )}
        {filtered.map(entry => {
          const selected = isGroupEntry_(entry)
            ? entry.itemKeys.every(key => selectedItemKeys.has(key))
            : selectedItemKeys.has(entry.key);
          const selectedCount = isGroupEntry_(entry)
            ? entry.itemKeys.filter(key => selectedItemKeys.has(key)).length
            : 0;
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
                {isGroupEntry_(entry) && (
                  <Meta>
                    {selectedCount > 0
                      ? `${selectedCount}/${entry.itemKeys.length} ${LocalizedString.lookup(tr('selected'), locale)}`
                      : `${entry.itemKeys.length} ${LocalizedString.lookup(tr('available'), locale)}`}
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
