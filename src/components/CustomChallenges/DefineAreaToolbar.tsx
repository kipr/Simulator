import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { styled } from 'styletron-react';
import { ThemeProps, GREEN } from '../constants/theme';
import LocalizedString from '../../util/LocalizedString';
import tr from '@i18n';
import { FontAwesome } from '../FontAwesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

export interface DefineAreaToolbarProps extends ThemeProps {
  locale: LocalizedString.Language;
  stepLabel: string;
  onBack: () => void;
  onContinue: () => void;
  onCancel: () => void;
}

const Bar = styled('div', (props: ThemeProps) => ({
  position: 'fixed',
  left: '50%',
  transform: 'translateX(-50%)',
  bottom: '24px',
  width: 'min(720px, 92vw)',
  display: 'flex',
  flexDirection: 'column',
  gap: `${props.theme.itemPadding}px`,
  padding: `${props.theme.itemPadding * 2}px`,
  borderRadius: '8px',
  backgroundColor: 'rgba(18, 18, 18, 0.92)',
  border: `1px solid ${props.theme.borderColor}`,
  color: props.theme.color,
  zIndex: 20,
  boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
}));

const Title = styled('div', {
  fontWeight: 700,
  fontSize: '1.05em',
});

const Help = styled('p', {
  margin: 0,
  opacity: 0.88,
  lineHeight: 1.45,
  fontSize: '0.95em',
});

const NavRow = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '8px',
});

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

const TOOLBAR_ROOT_ID = 'define-area-toolbar-root';

const DefineAreaToolbar: React.FC<DefineAreaToolbarProps> = ({
  theme,
  locale,
  stepLabel,
  onBack,
  onContinue,
  onCancel,
}) => {
  const [root, setRoot] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    let el = document.getElementById(TOOLBAR_ROOT_ID);
    if (!el) {
      el = document.createElement('div');
      el.id = TOOLBAR_ROOT_ID;
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

  return ReactDOM.createPortal(
    <Bar theme={theme}>
      <Title>{stepLabel}</Title>
      <Help>
        {LocalizedString.lookup(
          tr('Drag the corners on the mat to outline the play area.'),
          locale
        )}
      </Help>
      <NavRow>
        <Button theme={theme} type="button" onClick={onCancel}>
          {LocalizedString.lookup(tr('Cancel'), locale)}
        </Button>
        <div style={{ flex: 1 }} />
        <Button theme={theme} type="button" onClick={onBack}>
          <FontAwesome icon={faChevronLeft} /> {LocalizedString.lookup(tr('Back'), locale)}
        </Button>
        <Button theme={theme} type="button" $primary onClick={onContinue}>
          {LocalizedString.lookup(tr('Continue'), locale)}{' '}
          <FontAwesome icon={faChevronRight} />
        </Button>
      </NavRow>
    </Bar>,
    root
  );
};

export default DefineAreaToolbar;
