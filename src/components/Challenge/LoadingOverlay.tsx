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

import tr from '@i18n';
import { connect } from 'react-redux';
import { State as ReduxState } from '../../state';

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

const LoadingOverlay = ({ challenge, loading, onStartClick, locale }: { challenge: AsyncChallenge; onStartClick: () => void; loading: boolean; locale: LocalizedString.Language; }) => {
  const latestChallenge = Async.latestValue(challenge);
  if (!latestChallenge) return null;

  return (
    <Container>
      <TitleContainer>
        {LocalizedString.lookup(tr('CHALLENGE'), locale)}
      </TitleContainer>
      <NameContainer>
        {LocalizedString.lookup(latestChallenge.name, locale)}
      </NameContainer>
      <DescriptionContainer>
        {LocalizedString.lookup(latestChallenge.description, locale)}
      </DescriptionContainer>
      <Spacer />
      <BottomBarContainer>
        <Spacer />
        {!loading
          ? <StartButton onClick={onStartClick}><FontAwesomeIcon icon={faPlay} /> {LocalizedString.lookup(tr('Start'), locale)}</StartButton>
          : <LoadingButton>{LocalizedString.lookup(tr('Loading...'), locale)}</LoadingButton>
        }
      </BottomBarContainer>
    </Container>
  );
};


export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(LoadingOverlay) as React.ComponentType<{ challenge: AsyncChallenge; onStartClick: () => void; loading: boolean; }>;