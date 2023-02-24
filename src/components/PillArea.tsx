import { faCross, faTimes } from '@fortawesome/free-solid-svg-icons';
import Color from 'colorjs.io';
import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { Fa } from './Fa';
import { Theme, ThemeProps } from './theme';

export interface PillAreaItem<T> {
  id: T;
  label: string;
}

export interface PillAreaProps<T> extends ThemeProps, StyleProps {
  items: PillAreaItem<T>[];
  selectedItems?: Set<T>;
  onSelectionChange?: (s: Set<T>) => void;
  onItemRemove?: (item: T) => void;
}


const Pill = styled('span', ({ $theme, $selected, onClick }: {
  $theme: Theme,
  $selected: boolean,
  onClick: unknown
}) => ({
  display: 'inline-flex',
  flexDirection: 'row',
  alignItems: 'center',
  lineHeight: `${$theme.itemPadding * 2}px`,
  padding: `${$theme.itemPadding * 2}px`,
  marginBottom: `${$theme.itemPadding * 2}px`,
  marginRight: `${$theme.itemPadding * 2}px`,
  ':last-child': {
    marginRight: 0,
  },
  borderRadius: `${$theme.itemPadding * 2}px`,
  border: `1px solid ${$theme.borderColor}`,
  cursor: !!onClick ? 'pointer' : 'default',
  backgroundColor: !!$selected ? `rgba(0, 0, 0, 0.1)` : 'white',
  ':hover': !!onClick ? {
    backgroundColor: `rgba(0, 0, 0, 0.05)`,
  } : undefined,
}));

const StyledFa = styled(Fa, ({ $theme }: { $theme: Theme }) => ({
  marginLeft: `${$theme.itemPadding}px`,
  cursor: 'pointer',
}));

export default <T extends {}>({
  items,
  selectedItems,
  onSelectionChange,
  onItemRemove,
  theme,
  style,
  className
}: PillAreaProps<T>) => {
  return (
    <div style={style} className={className}>
      {items.map((item, i) => (
        <Pill
          key={i}
          $theme={theme}
          $selected={!!selectedItems ? selectedItems.has(item.id) : false}
          onClick={!!onSelectionChange ? () => {
            const newSelectedItems = new Set(selectedItems);
            if (newSelectedItems.has(item.id)) {
              newSelectedItems.delete(item.id);
            } else {
              newSelectedItems.add(item.id);
            }
            onSelectionChange(newSelectedItems);
          } : undefined}
        >
          {item.label}
          {!!onItemRemove && (
            <StyledFa $theme={theme} icon={faTimes} onClick={() => onItemRemove(item.id)} />
          )}
        </Pill>
      ))}
    </div>
  );
};