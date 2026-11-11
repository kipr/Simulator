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
import { ThemeProps } from '../constants/theme';

import tr from '@i18n';
import { connect } from 'react-redux';
import { State as ReduxState } from '../../state';

interface LoadingOverlayProps extends ThemeProps {
  challenge: AsyncChallenge;
  onStartClick: () => void;
  loading: boolean;
  locale: LocalizedString.Language;
}

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100vw',
  height: '100dvh', // OG: 100vh
  boxSizing: 'border-box', // addition for padding don't push it pas the scren
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  padding: 'clamp(0.5rem, 2vw, 1.5rem)',
  fontSize: 'clamp(1rem, 2.5vw, 2rem)',
}));

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

const StartButton = styled(Button, (props: ThemeProps) => ({
  backgroundColor: props.theme.buttonColors.success.standard,
}));

const LoadingButton = withStyleDeep(Button, {
  backgroundColor: 'grey',
});

// Demo videos for JBC
const demo_videos: Record<string, string> = {
  'jbc0': '/static/demo_videos/JBC0.webm',
  'jbc1': '/static/demo_videos/JBC1.webm',
  'jbc2': '/static/demo_videos/JBC2.webm',
  'jbc3': '/static/demo_videos/JBC3.webm',
  'jbc4': '/static/demo_videos/JBC4.webm',
  'jbc5': '/static/demo_videos/JBC5.webm',
  'jbc6': '/static/demo_videos/JBC6.webm',
  'jbc7': '/static/demo_videos/JBC7.webm',
  'jbc8': '/static/demo_videos/JBC8.webm',
  'jbc9': '/static/demo_videos/JBC9.webm',
  'jbc10': '/static/demo_videos/JBC10Real.webm',
  'jbc11': '/static/demo_videos/JBC11.webm',
  'jbc12': '/static/demo_videos/JBC12.webm',
  'jbc15': '/static/demo_videos/JBC15.webm',
  'jbc16': '/static/demo_videos/JBC16.webm',
  'jbc17': '/static/demo_videos/JBC17.webm',
  'jbc18': '/static/demo_videos/JBC18.webm',
  'jbc19': '/static/demo_videos/JBC19.webm',
  'jbc20': '/static/demo_videos/JBC20.webm',
  'jbc21': '/static/demo_videos/JBC21.webm',
  'jbc22': '/static/demo_videos/JBC22.webm',
  'jbc23': '/static/demo_videos/JBC23.webm',
  'jbc24': '/static/demo_videos/JBC24.webm'
};

const LoadingOverlay = ({ challenge, loading, onStartClick, locale, theme }: LoadingOverlayProps) => {
  const didChallengeFail: boolean = Async.isFailed(challenge);

  if (didChallengeFail) {
    return (
      <Container theme={theme}>
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
    <Container theme={theme}>
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
          ? <StartButton theme={theme} onClick={onStartClick}><FontAwesomeIcon icon={faPlay} /> {LocalizedString.lookup(tr('Start'), locale)}</StartButton>
          : <LoadingButton>{LocalizedString.lookup(tr('Loading...'), locale)}</LoadingButton>
        }
      </BottomBarContainer>
    </Container>
  );
};


export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(LoadingOverlay) as React.ComponentType<{ challenge: AsyncChallenge; onStartClick: () => void; loading: boolean; } & ThemeProps>;