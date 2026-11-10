import { faPlay, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { styled, withStyleDeep } from 'styletron-react';

import Async from '../../state/State/Async';
import { AsyncChallenge } from '../../state/State/Challenge';
import LocalizedString from '../../util/LocalizedString';
import { Spacer } from '../constants/common';
import { Dialog } from '../Dialog/Dialog';
import { Modal } from '../interface/Modal';
import { DARK, LIGHT } from '../constants/theme';

import tr from '@i18n';
import { connect } from 'react-redux';
import { State as ReduxState } from '../../state';

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  width: '100vw',
  height: '100dvh', //OG: 100vh
  boxSizing: 'border-box', // addition for padding don't push it pas the scren
  backgroundColor: DARK.backgroundColor,
  color: DARK.color,
  //padding: '1rem',
  //fontSize: '2rem',

  padding: 'clamp(0.5rem, 2vw, 1.5rem)',
  fontSize: 'clamp(1rem, 2.5vw, 2rem)',
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

// Container for demo video
const VideoContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: '1 1 0',     // take all remaining space
  minHeight: 0,      // lets it shrink instead of overflowing
});

const BottomBarContainer = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  flex: 'none',
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

// Demo videos for JBC
const demo_videos: Record<string, string> = {
  'jbc0': '/static/demo_videos/JBC0.mp4',
  'jbc1': '/static/demo_videos/JBC1.mp4',
  'jbc2': '/static/demo_videos/JBC2.mp4',
  'jbc3': '/static/demo_videos/JBC3.mp4',
  'jbc4': '/static/demo_videos/JBC4.mp4',
  'jbc5': '/static/demo_videos/JBC5.mp4',
  'jbc6': '/static/demo_videos/JBC6.mp4',
  'jbc7': '/static/demo_videos/JBC7.mp4',
  'jbc8': '/static/demo_videos/JBC8.mp4',
  'jbc9': '/static/demo_videos/JBC9.mp4',
  'jbc10': '/static/demo_videos/JBC10Real.mp4',
  'jbc11': '/static/demo_videos/JBC11.mp4',
  'jbc12': '/static/demo_videos/JBC12.mp4',
  'jbc15': '/static/demo_videos/JBC15.mp4',
  'jbc16': '/static/demo_videos/JBC16.mp4',
  'jbc17': '/static/demo_videos/JBC17.mp4',
  'jbc18': '/static/demo_videos/JBC18.mp4',
  'jbc19': '/static/demo_videos/JBC19.mp4',
  'jbc20': '/static/demo_videos/JBC20.mp4',
  'jbc21': '/static/demo_videos/JBC21.mp4',
  'jbc22': '/static/demo_videos/JBC22.mp4',
  'jbc23': '/static/demo_videos/JBC23.mp4',
  'jbc24': '/static/demo_videos/JBC24.mp4'
};

const LoadingOverlay = ({ challenge, loading, onStartClick, locale }: { challenge: AsyncChallenge; onStartClick: () => void; loading: boolean; locale: LocalizedString.Language; }) => {
  const didChallengeFail: boolean = Async.isFailed(challenge);

  if (didChallengeFail) {
    return (
      <Container>
        <TitleContainer>
          {LocalizedString.lookup(tr('Failed to load challenge'), locale)}
        </TitleContainer>
      </Container>
    );
  }

  const latestChallenge = Async.latestValue(challenge);
  
  if (!latestChallenge) return null;

  const videoSrc = demo_videos[latestChallenge.sceneId];

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
      {/* Video size: fills leftover space in VideoContainer (flex 1 1 0). Tune width/maxWidth here, or Container padding/fontSize clamps. No extra <Spacer /> after VideoContainer. */}
      <VideoContainer>
        {videoSrc && (
          <video
            src={videoSrc}
            controls
            style={{ flex: '1 1 0', minHeight: 0, maxWidth: '100%', objectFit: 'contain' }}
          />
        )}
        <sub style={{ flex: 'none' }}>Demonstration video</sub>
      </VideoContainer>
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