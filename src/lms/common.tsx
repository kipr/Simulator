import { styled } from 'styletron-react';
import { RED, Theme } from '../components/theme';

const Base = styled('div', {
  flex: '1 1 0',
  overflow: 'hidden',
  userSelect: 'none',
})

export const NameContainer = Base;

export const UsStdContainer = Base;

export const GradesContainer = Base;

export const SubjectsContainer = Base;

export const AddContainer = styled('div', {
  width: '100px',
});

export const AddButton = styled('button', ({ $on, $theme }: { $on: boolean; $theme: Theme }) => ({
  backgroundColor: $on ? `hsl(0, 100%, 40%)` : 'white',
  ':hover': {
    backgroundColor: $on ? `hsl(0, 100%, 50%)` : 'rgba(0, 0, 0, 0.05)',
  },
  color: $on ? 'white' : $theme.color,
  border: `1px solid ${$on ? `hsl(0, 100%, 30%)` : $theme.borderColor}`,
  borderRadius: `${$theme.itemPadding * 2}px`,
  padding: `${$theme.itemPadding * 2}px`,
  transition: 'background-color 0.2s, color 0.2s',
  cursor: 'pointer',
  width: '100%',
  fontWeight: 'bold',
}));