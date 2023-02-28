import * as React from 'react';

import { styled } from 'styletron-react';
import LocalizedString from '../../util/LocalizedString';

export interface SectionProps {
  name: LocalizedString;
  children: React.ReactNode;
}

const Container = styled('div', {
  width: '100%',
});

const Title = styled('div', {
  fontSize: '1.5em',
  fontWeight: 'bold',
});

export const Section = (props: SectionProps) => {
  const { name, children } = props;
  return (
    <Container>
      <Title>{name}</Title>
      {children}
    </Container>
  );
};