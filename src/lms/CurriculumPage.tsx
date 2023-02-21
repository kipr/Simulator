import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { styled } from 'styletron-react';
import { Theme, ThemeProps } from '../components/theme';

export interface CurriculumPageProps extends RouteComponentProps, ThemeProps {

}

const Container = styled('div', ({ $theme }: { $theme: Theme }) => ({
  width: '100%',
}));

export default ({ theme }: CurriculumPageProps) => {
  return (
    <Container $theme={theme}>
      <h1>Curriculum Page</h1>
    </Container>
  )
};