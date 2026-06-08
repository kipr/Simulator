import { styled } from 'styletron-react';
import { ThemeProps } from '../constants/theme';
import { nativeScrollbarChrome } from '../../util/nativeScrollbarChrome';

export const CatalogPickerList = styled('div', (props: ThemeProps & { $maxHeight: string }) => ({
  maxHeight: props.$maxHeight,
  overflowY: 'auto',
  border: `1px solid ${props.theme.borderColor}`,
  borderRadius: '4px',
  ...nativeScrollbarChrome,
}));
