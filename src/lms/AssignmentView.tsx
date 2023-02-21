import * as React from 'react';
import { styled } from 'styletron-react';
import { Theme } from '../components/theme';
import { StyleProps } from '../style';


export interface AssignmentViewProps extends StyleProps {
  theme: Theme;
}

const Container = styled('div', {
  width: '100%',
});

export default (props: AssignmentViewProps) => {
  return (
    <Container>

    </Container>
  );
};
