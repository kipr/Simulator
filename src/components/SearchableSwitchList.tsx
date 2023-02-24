// A component that shows a list of items that can be selected, deselected, and filtered.

import * as React from 'react';
import { styled } from 'styletron-react';
import LocalizedString from '../util/LocalizedString';
import { StyleProps } from '../style';
import Input from './Input';
import ScrollArea from './ScrollArea';
import { Switch } from './Switch';
import { Theme, ThemeProps } from './theme';

import tr from '@i18n';

export interface SearchableSwitchListItem {
  id: string;
  name: string;
}

export interface SearchableSwitchListProps extends ThemeProps, StyleProps {
  items: SearchableSwitchListItem[];
  
  selectedItems: Set<string>;
  onSelectionChange: (selectedItems: Set<string>) => void;

  filter: string;
  onFilterChange: (filter: string) => void;

  locale: LocalizedString.Language;
}

const Container = styled('div', {
  width: '100%'
});

const List = styled(ScrollArea, ({ theme }: { theme: Theme }) => ({
  width: '100%',
  height: '300px',
  borderRadius: `${theme.itemPadding * 2}px`,
  marginTop: `${theme.itemPadding * 2}px`,
  border: `1px solid ${theme.borderColor}`
}));

const Row = styled('div', ({ $theme }: { $theme: Theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  paddingLeft: `${$theme.itemPadding * 2}px`,
}));

const RowLabel = styled('div', {
  flex: 1
});

export default ({
  theme,
  style,
  className,
  items,
  selectedItems,
  onSelectionChange,
  filter,
  onFilterChange,
  locale
}: SearchableSwitchListProps) => {

  const filteredItems = items.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
  return (
    <Container style={style} className={className}>
      <Input
        theme={theme}
        value={filter}
        onChange={event => onFilterChange(event.currentTarget.value)}
        placeholder={LocalizedString.lookup(tr('Search'), locale)}
      />
      <List theme={theme}>
        {filteredItems.map(item => (
          <Row key={item.id} $theme={theme}>
            <RowLabel>{item.name}</RowLabel>
            <Switch
              theme={theme}
              value={selectedItems.has(item.id)}
              onValueChange={value => {
                const newSelectedItems = new Set(selectedItems);
                if (value) {
                  newSelectedItems.add(item.id);
                } else {
                  newSelectedItems.delete(item.id);
                }
                onSelectionChange(newSelectedItems);
              }}
            />
          </Row>
        ))}
      </List>
    </Container>
  );
};