import { styled } from 'styletron-react';

export const FunctionName = styled('span', {
  fontFamily: 'monospace',
});

export const Type = styled('span', ({ $language }: { $language: 'c' | 'python' }) => ({
  fontFamily: 'monospace',
  color: 'rgb(100, 100, 255)',
  fontWeight: 'bold',
  marginRight: $language === 'c' ? '0.5em' : 0,
}));

export const Keyword = styled('span', {
  fontFamily: 'monospace',
  color: 'rgb(100, 255, 100)',
});

export const ParameterName = styled('span', {
  fontFamily: 'monospace',
  fontStyle: 'italic',
});

export const Decoration = styled('span', {
  fontFamily: 'monospace',
});