import { faArrowLeft, faPlay, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { styled, withStyleDeep } from 'styletron-react';

import Async from '../../state/State/Async';
import { AsyncChallenge } from '../../state/State/Challenge';
import LocalizedString from '../../util/LocalizedString';
// import { Spacer } from '../constants/common';
import { Dialog } from '../Dialog/Dialog';
import { Modal } from '../interface/Modal';
import { ThemeProps } from '../constants/theme';

import tr from '@i18n';
import { connect } from 'react-redux';
import { State as ReduxState } from '../../state';

import { getJbcChallengeScene } from '../../util/jbcChallengeCatalog';
import { ChallengeName } from '../../simulator/definitions/challenges/challengeList';
import { rgbdDecodePixelShader } from '@babylonjs/core/Shaders/rgbdDecode.fragment';

interface LoadingOverlayProps extends ThemeProps {
  challenge: AsyncChallenge;
  onStartClick: () => void;
  onBackClick: () => void;
  loading: boolean;
  locale: LocalizedString.Language;
}

// Main layout
const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100vw',
  height: '100dvh', // OG: 100vh
  boxSizing: 'border-box', // addition for padding don't push it pas the scren
  backgroundColor: '#1B1D1C',

  backgroundImage: `
    radial-gradient(
      ellipse at 95% 45%,
    rgba(145, 55, 50, 0.32) 0%,
      transparent 65%
    ),
    radial-gradient(
      ellipse at 15% 15%,
      rgba(110, 40, 35, 0.12) 0%,
      transparent 55%
    ),
    radial-gradient(
      ellipse at 50% 95%,
      rgba(120, 40, 40, 0.10) 0%,
      transparent 50%
    )
  `,
  color: props.theme.color, // Text color
  padding: '32px 40px', // OG 'clamp(0.5rem, 2vw, 1.5rem)'
  fontSize: 'clamp(1rem, 2.5vw, 2rem)',
}));

const ContentContainer = styled('div',{
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 3fr)',
  gridTemplateRows: 'auto auto', //'minmax(0, 1fr) auto',
  columnGap: '24px',
  flex: '1 1 0',
  minHeight: 0,
  width: '100%',
  alignItems: 'center',
  alignContent: 'center',
});

const BottomBarContainer = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  flex: 'none',
  marginTop: 'auto',
});

// Header
const TitleContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginBottom: '16px',
});

const TitleLabel = styled('div', {
  color: '#E36A60',
  fontSize: 'clamp(12px, 1vw, 16px)',
  fontWeight: 600,
  letterSpacing: '0.12em',
});

// Video
const VideoContainer = styled('div', {
  gridColumn: '1',
  gridRow: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 0,
  minHeight: 0,
  width: '100%',
  height: '100%',
});

const VideoWrapper = styled('div', {
  width: '100%',

  // Rounded video corners
  borderRadius: '20px',
  overflow: 'hidden',
  isolation: 'isolate',
  clipPath: 'inset(0 round 20px)',

  // Border highlight
  position: 'relative',

  '::after': {
    content: '""',
    position: 'absolute',
    inset: '0',
    borderRadius: 'inherit',
    padding: '1px',

    background: `
      linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.50) 0%,
        rgba(255, 255, 255, 0.08) 30%,
        rgba(255, 255, 255, 0.05) 70%,
        rgba(255, 255, 255, 0.40) 100%
      )
    `,

    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',

    pointerEvents: 'none',
  },
});

const VideoLabel = styled('div', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',

  // Grid positioning
  gridColumn: '1',
  gridRow: '2',
  justifySelf: 'center',

  padding: '10px 24px',
  marginTop: '16px',

  // Glass look
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.10)',
  borderRadius: '999px',

  fontSize: 'clamp(14px, 1vw, 18px)',
  fontWeight: 500,
  color: '#FFFFFF',

  // Border highlight
  position: 'relative',

  '::before': {
    content: '""',
    position: 'absolute',
    inset: '-1px',
    borderRadius: 'inherit',
    padding: '1px',

    background: `
      linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.40) 0%,
        rgba(255, 255, 255, 0.06) 30%,
        rgba(255, 255, 255, 0.04) 70%,
        rgba(255, 255, 255, 0.30) 100%
      )
    `,

    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',

    pointerEvents: 'none',
  },
});

// Challenge information
const DetailsContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',

  // Grid positioning
  gridColumn: '2',
  gridRow: '1',
  minWidth: 0,
  alignSelf: 'center',

  // Glass look
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.10)',
  borderRadius: '20px',

  // Required for the border highlight
  position: 'relative',

  // Inner spacing
  padding: 'clamp(16px, 2vw, 32px)',
  boxSizing: 'border-box',

  // Border highlight
  '::before': {
    content: '""',
    position: 'absolute',
    inset: '-1px',
    borderRadius: 'inherit',
    padding: '1px',

    background: `
      linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.55) 0%,
        rgba(255, 255, 255, 0.08) 30%,
        rgba(255, 255, 255, 0.05) 70%,
        rgba(255, 255, 255, 0.40) 100%
      )
    `,

    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',

    pointerEvents: 'none',
  },
});

const NameContainer = styled('div', {
  fontSize: 'clamp(24px, 2.2vw, 36px)',
  fontWeight: 600,
  marginBottome: '16px',
});

const DescriptionContainer = styled('div', {
  fontSize: 'clamp(16px, 1.3vw, 20px)',
  lineHeight: '1.5',
  marginTop: '8px',
});

const SectionLabel = styled('div', {
  color: '#E36A60',
  fontSize: '1em',
  fontWeight: 600,
  marginBottom: '8px',
});

// Buttons
const Button = styled('div', {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',

  padding: '12px 24px',
  fontSize: 'clamp(14px, 1vw, 18px)',
  fontWeight: 500,

  borderRadius: '12px',
  userSelect: 'none',
  cursor: 'pointer',

  transition: 'all 0.2s ease',
});

const BackButton = styled(Button, {
  backgroundColor: 'rgba(255, 255, 255, 0.06)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(199, 53, 43, 0.25)',
  borderRadius: '12px',

  ':hover': {
    backgroundColor: 'rgba(199, 53, 43, 0.12)',
    borderColor: 'rgba(199, 53, 43, 0.45)',
  },
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

const LoadingOverlay = ({ challenge, loading, onStartClick, onBackClick, locale, theme }: LoadingOverlayProps) => {
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

  const scene = getJbcChallengeScene(latestChallenge.sceneId as ChallengeName);
  const skill = scene?.summary?.skill;
  const mission = scene?.summary?.baseMission;
  const fullChallengeTitle = scene?.description
    ? LocalizedString.lookup(scene.description, locale)
    : '';
  const challengeTitle = fullChallengeTitle
    ? fullChallengeTitle.split(':').slice(1).join(':').trim()
    : LocalizedString.lookup(latestChallenge.name, locale)

  return (
    <Container theme={theme}>

      <TitleContainer>
        <TitleLabel>
          {LocalizedString.lookup(tr('CHALLENGE'), locale)}
        </TitleLabel>

        <NameContainer>
          {challengeTitle}
        </NameContainer>
      </TitleContainer>

      <ContentContainer>

        <VideoContainer>
          {videoSrc && (
            <VideoWrapper>
              <video
                src={videoSrc}
                controls
                style={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                }}
              />
            </VideoWrapper>
          )}
        </VideoContainer>

        <DetailsContainer>
          <NameContainer>
            {LocalizedString.lookup(latestChallenge.name, locale)}
          </NameContainer>

          <DescriptionContainer>
            <SectionLabel>Skill:</SectionLabel>
            <p>
              {skill
                ? LocalizedString.lookup(skill, locale)
                : 'No skill description available.'}
            </p>

            <SectionLabel>Base Mission:</SectionLabel>
            <p>
              {mission
                ? LocalizedString.lookup(mission, locale)
                : 'No base mission available.'}
            </p>
          </DescriptionContainer>
        </DetailsContainer>

        <VideoLabel>
          Demonstration video
        </VideoLabel>

      </ContentContainer>

      <BottomBarContainer>
        <BackButton onClick={onBackClick}>
          <FontAwesomeIcon icon={faArrowLeft} />
          {LocalizedString.lookup(tr('Back'), locale)}
      </BackButton>

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
}))(LoadingOverlay) as React.ComponentType<{ challenge: AsyncChallenge; onStartClick: () => void; onBackClick: () => void; loading: boolean; } & ThemeProps>;
