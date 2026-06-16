import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { styled } from 'styletron-react';
import { ThemeProps, GREEN } from '../constants/theme';
import LocalizedString from '../../util/LocalizedString';
import tr from '@i18n';
import { FontAwesome } from '../FontAwesome';
import { faCheck, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import ScrollArea from '../interface/ScrollArea';
import TourTarget from '../Tours/TourTarget';
import { TourRegistry } from '../../tours/TourRegistry';

export const WIZARD_SIDE_PANEL_ROOT_ID = 'mat-play-zones-panel-root';

/** Shared with MatZoneEditOverlay so the simulator avoids the panel. */
export const WIZARD_SIDE_PANEL_WIDTH = 'min(420px, 38vw)';

export function wizardSidePanelInsetPx(): number {
  const panel = document.getElementById(WIZARD_SIDE_PANEL_ROOT_ID)?.firstElementChild as
    | HTMLElement
    | undefined;
  if (panel) {
    const w = panel.getBoundingClientRect().width;
    if (w > 0) return w;
  }
  return Math.min(420, window.innerWidth * 0.38);
}

/** @deprecated Use wizardSidePanelInsetPx */
export const matPlayZonesPanelInsetPx = wizardSidePanelInsetPx;

const Panel = styled('div', (props: ThemeProps) => ({
  position: 'fixed',
  top: 0,
  right: 0,
  width: WIZARD_SIDE_PANEL_WIDTH,
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'rgba(18, 18, 18, 0.96)',
  borderLeft: `1px solid ${props.theme.borderColor}`,
  color: props.theme.color,
  zIndex: 25,
  boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
}));

const Header = styled('div', (props: ThemeProps) => ({
  padding: `${props.theme.itemPadding * 2}px`,
  borderBottom: `1px solid ${props.theme.borderColor}`,
}));

const Title = styled('div', {
  fontWeight: 700,
  fontSize: '1.05em',
  marginBottom: '8px',
});

const Help = styled('p', {
  margin: 0,
  opacity: 0.88,
  lineHeight: 1.45,
  fontSize: '0.9em',
});

const Body = styled('div', {
  flex: 1,
  minHeight: 0,
  overflow: 'hidden',
});

const Footer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: `${props.theme.itemPadding}px`,
  padding: `${props.theme.itemPadding * 2}px`,
  borderTop: `1px solid ${props.theme.borderColor}`,
}));

const Button = styled('button', (props: ThemeProps & { $primary?: boolean }) => ({
  padding: '10px 16px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 'bold',
  color: props.theme.color,
  backgroundColor: props.$primary ? GREEN.standard : 'rgba(255,255,255,0.1)',
  ':hover': {
    backgroundColor: props.$primary ? GREEN.hover : 'rgba(255,255,255,0.16)',
  },
}));

export interface CustomChallengeWizardSidePanelProps extends ThemeProps {
  locale: LocalizedString.Language;
  stepLabel: string;
  helpText?: LocalizedString;
  children: React.ReactNode;
  onBack: () => void;
  onContinue: () => void;
  onCancel: () => void;
  continueLabel?: Parameters<typeof LocalizedString.lookup>[0];
  continuePrimary?: boolean;
  showBack?: boolean;
  /** Show checkmark and primary styling for the final wizard step (Create challenge). */
  isFinishStep?: boolean;
  tourRegistry?: TourRegistry;
  tourTargetKey?: string;
}

const CustomChallengeWizardSidePanel: React.FC<CustomChallengeWizardSidePanelProps> = ({
  theme,
  locale,
  stepLabel,
  helpText,
  children,
  onBack,
  onContinue,
  onCancel,
  continueLabel,
  continuePrimary = true,
  showBack = true,
  isFinishStep = false,
  tourRegistry,
  tourTargetKey,
}) => {
  const [root, setRoot] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    let el = document.getElementById(WIZARD_SIDE_PANEL_ROOT_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = WIZARD_SIDE_PANEL_ROOT_ID;
      document.body.appendChild(el);
    }
    setRoot(el);
    return () => {
      if (el?.parentElement && el.childElementCount === 0) {
        el.remove();
      }
    };
  }, []);

  if (!root) return null;

  const panel_ = (
    <Panel theme={theme}>
      <Header theme={theme}>
        <Title>{stepLabel}</Title>
        {helpText && <Help>{LocalizedString.lookup(helpText, locale)}</Help>}
      </Header>
      <Body>
        <ScrollArea theme={theme} style={{ height: '100%' }}>
          {children}
        </ScrollArea>
      </Body>
      <Footer theme={theme}>
        <Button theme={theme} type="button" onClick={onCancel}>
          {LocalizedString.lookup(tr('Cancel'), locale)}
        </Button>
        <div style={{ flex: 1 }} />
        {showBack && (
          <Button theme={theme} type="button" onClick={onBack}>
            <FontAwesome icon={faChevronLeft} /> {LocalizedString.lookup(tr('Back'), locale)}
          </Button>
        )}
        <Button theme={theme} type="button" $primary={continuePrimary} onClick={onContinue}>
          {isFinishStep ? (
            <>
              <FontAwesome icon={faCheck} />{' '}
              {LocalizedString.lookup(continueLabel ?? tr('Create challenge'), locale)}
            </>
          ) : (
            <>
              {LocalizedString.lookup(continueLabel ?? tr('Continue'), locale)}{' '}
              <FontAwesome icon={faChevronRight} />
            </>
          )}
        </Button>
      </Footer>
    </Panel>
  );

  return ReactDOM.createPortal(
    tourRegistry && tourTargetKey ? (
      <TourTarget registry={tourRegistry} targetKey={tourTargetKey}>
        {panel_}
      </TourTarget>
    ) : panel_,
    root
  );
};

export default CustomChallengeWizardSidePanel;
