import * as React from 'react';
import { styled } from 'styletron-react';
import { ThemeProps } from '../constants/theme';
import LocalizedString from '../../util/LocalizedString';
import { JbcCatalogGeometry } from '../../util/jbcChallengeCatalog';
import tr from '@i18n';
import { CatalogPickerList } from './catalogPickerList';

export interface JbcCatalogGeometryPickerProps extends ThemeProps {
  locale: LocalizedString.Language;
  catalog: JbcCatalogGeometry[];
  selectedKeys: ReadonlySet<string>;
  onToggle: (entry: JbcCatalogGeometry, selected: boolean) => void;
  listMaxHeight?: string;
  helpText?: LocalizedString;
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

const JbcCatalogGeometryPicker: React.FC<JbcCatalogGeometryPickerProps> = ({
  theme,
  locale,
  catalog,
  selectedKeys,
  onToggle,
  listMaxHeight = '220px',
  helpText,
}) => {
  const [filter, setFilter] = React.useState('');

  const filtered = React.useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      entry =>
        entry.geometryId.toLowerCase().includes(q) ||
        entry.nodeId.toLowerCase().includes(q) ||
        entry.displayName.toLowerCase().includes(q) ||
        entry.geometryType.toLowerCase().includes(q) ||
        entry.usedIn.some(
          ref =>
            ref.challengeId.toLowerCase().includes(q) ||
            ref.challengeName.toLowerCase().includes(q)
        )
    );
  }, [catalog, filter]);

  return (
    <Section theme={theme}>
      <p style={{ opacity: 0.85, marginBottom: theme.itemPadding * 2 }}>
        {LocalizedString.lookup(
          helpText ??
          tr(
            'Start boxes, garages, lines, and other script zones.'
          ),
          locale
        )}
      </p>
      <FilterInput
        theme={theme}
        type="search"
        value={filter}
        placeholder={LocalizedString.lookup(
          tr('Search markers…'),
          locale
        )}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setFilter(e.currentTarget.value)
        }
      />
      <CatalogPickerList theme={theme} $maxHeight={listMaxHeight}>
        {filtered.length === 0 && (
          <p style={{ padding: theme.itemPadding * 2, opacity: 0.7 }}>
            {LocalizedString.lookup(tr('No matching geometries'), locale)}
          </p>
        )}
        {filtered.map(entry => {
          const selected = selectedKeys.has(entry.key);
          return (
            <Row key={entry.key} theme={theme} $selected={selected}>
              <input
                type="checkbox"
                checked={selected}
                onChange={e => onToggle(entry, e.target.checked)}
              />
              <div>
                <strong>{entry.displayName}</strong>{' '}
                <code style={{ opacity: 0.9 }}>{entry.nodeId}</code>
                <Meta>
                  {LocalizedString.lookup(tr('Geometry'), locale)}: {entry.geometryId} (
                  {entry.geometryType})
                </Meta>
                <Meta>
                  {LocalizedString.lookup(tr('Used in'), locale)}:{' '}
                  {entry.usedIn.map(ref => ref.challengeName).join(', ')}
                </Meta>
              </div>
            </Row>
          );
        })}
      </CatalogPickerList>
    </Section>
  );
};

export default JbcCatalogGeometryPicker;
