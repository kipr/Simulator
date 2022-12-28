import { faPlay, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { styled, withStyleDeep } from 'styletron-react';

import Async from '../../state/State/Async';
import { AsyncChallenge } from '../../state/State/Challenge';
import LocalizedString from '../../util/LocalizedString';
import { Spacer } from '../common';
import { Dialog } from '../Dialog';
import { Modal } from '../Modal';
import { DARK } from '../theme';

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  width: '100vw',
  height: '100vh',
  backgroundColor: DARK.backgroundColor,
  color: DARK.color,
  padding: '1rem',
  fontSize: '2rem',
});

const TitleContainer = styled('div', {
  fontSize: '1em',
  marginBottom: '1em',
});

const NameContainer = styled('div', {
  fontSize: '2em',
});

const DescriptionContainer = styled('div', {
  fontSize: '1em',
  marginTop: '0.5em'
});

const BottomBarContainer = styled('div', {
  display: 'flex',
  flexDirection: 'row',
});

const Button = styled('div', {
  padding: '1em',
  borderRadius: '0.5em',
  userSelect: 'none',
});

const StartButton = withStyleDeep(Button, {
  backgroundColor: 'green',
});

const LoadingButton = withStyleDeep(Button, {
  backgroundColor: 'grey',
});

export default ({ challenge, loading, onStartClick }: { challenge: AsyncChallenge; onStartClick: () => void; loading: boolean; }) => {
  const latestChallenge = Async.latestValue(challenge);
  if (!latestChallenge) return null;

  return (
    <Container>
      <TitleContainer>
        CHALLENGE
      </TitleContainer>
      <NameContainer>
        {LocalizedString.lookup(latestChallenge.name, LocalizedString.EN_US)}
      </NameContainer>
      <DescriptionContainer>
        {LocalizedString.lookup(latestChallenge.description, LocalizedString.EN_US)}
      </DescriptionContainer>
      <Spacer />
      <BottomBarContainer>
        <Spacer />
        {!loading
          ? <StartButton onClick={onStartClick}><FontAwesomeIcon icon={faPlay} /> Start</StartButton>
          : <LoadingButton>Loading...</LoadingButton>
        }
      </BottomBarContainer>
    </Container>
  );
};