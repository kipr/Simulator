import { Theme, ThemeProps } from '../constants/theme';
import { StyleProps } from '../../util/style';
import LocalizedString from '../../util/LocalizedString';
import * as React from 'react';
import { styled } from 'styletron-react';
import { TourRegistry } from '../../tours/TourRegistry';
import TourTarget from '../Tours/TourTarget';
import { FontAwesome } from '../FontAwesome';
import tr from '@i18n';
import { connect } from 'react-redux';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import store, { State as ReduxState } from '../../state';
import { retakeTour, SettingsAction } from 'state/reducer';
import { Settings } from 'components/constants/Settings';
import TourDoc from '../../tours/Tours';
export interface ExtraMenuPublicProps extends StyleProps, ThemeProps {
  tourRegistry?: TourRegistry;

}

export interface ExtraMenuPrivateProps {
  locale: LocalizedString.Language;
  tour?: TourDoc;
  uid: string;
  setSettings: (settings: Partial<Settings>) => void;
  onShowSettingsDialog?: (show: boolean) => void;
}

type Props = ExtraMenuPublicProps & ExtraMenuPrivateProps;
const Container = styled('div', (props: ThemeProps) => ({
  position: 'absolute',
  top: '100%',
  right: `0px`,
  minWidth: 'fit-content',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  zIndex: 999,
  display: 'flex',
  flexDirection: 'column',
  borderBottomLeftRadius: `${props.theme.borderRadius}px`,
  borderBottomRightRadius: `${props.theme.borderRadius}px`,
  borderRight: `1px solid ${props.theme.borderColor}`,
  borderLeft: `1px solid ${props.theme.borderColor}`,
  borderBottom: `1px solid ${props.theme.borderColor}`
}));
interface ClickProps {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}

const Item = styled('div', (props: ThemeProps & ClickProps) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  padding: '10px',
  borderBottom: `1px solid ${props.theme.borderColor}`,
  ':last-child': {
    borderBottom: 'none'
  },
  opacity: props.disabled ? '0.5' : '1.0',
  fontWeight: 400,
  ':hover': !props.disabled && props.onClick ? {
    cursor: 'pointer',
    backgroundColor: `rgba(255, 255, 255, 0.1)`
  } : {
    cursor: 'auto',
  },
  whiteSpace: 'nowrap',

  userSelect: 'none',
  transition: 'background-color 0.2s, opacity 0.2s'
}));

const ItemIcon = styled(FontAwesome, {
  width: '20px',
  minWidth: '20px',
  maxWidth: '20px',
  textAlign: 'center',
  marginRight: '10px'
});
const ExtraMenu = ({
  theme,
  style,
  tour,
  locale,
  uid,
  tourRegistry,
  setSettings,
}: Props) => {

  const settingsContent = (
    <Item theme={theme} disabled={false} onClick={() => setSettings({ showSettingsDialog: true })}>
      <ItemIcon icon={faGear} />
      {LocalizedString.lookup(tr('Settings'), locale)}
    </Item>
  );

  const retakeTourContent =
    (<Item theme={theme} disabled={false} onClick={() => { void retakeTour(tour, uid, tourRegistry.getTourID()); }}>
      {LocalizedString.lookup(tr('Retake Tour'), locale)}
    </Item>);
  return (
    <Container theme={theme}>
      {tourRegistry ? (<TourTarget
        registry={tourRegistry} targetKey={''}>
        {settingsContent}
        <TourTarget style={style} registry={tourRegistry} targetKey={'retake-tour-button'}>
          {retakeTourContent}
        </TourTarget>
      </TourTarget>) : (
        <>
          {settingsContent}
        </>
      )}
    </Container>
  );
};

export default connect((state: ReduxState, props: Props) => {
  return {
    locale: state.i18n.locale,
    uid: state.users.me,
    showSettingsDialog: state.settings.showSettingsDialog,
    tour: state.tours.byId[props.tourRegistry?.getTourID()] ?? TourDoc.DEFAULT,
  };
}, dispatch => ({

  setSettings: (settings: Partial<Settings>) => dispatch(SettingsAction.updateSettings({ settings }))


}))(ExtraMenu) as React.ComponentType<ExtraMenuPublicProps>; 