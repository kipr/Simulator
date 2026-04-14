import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../../util/style';
import { FontAwesome } from '../FontAwesome';
import { ThemeProps } from '../constants/theme';
import { faBook, faCogs, faCommentDots, faQuestion, faSignOutAlt, faRobot, faCircleInfo } from '@fortawesome/free-solid-svg-icons';

import tr from '@i18n';

import { connect } from 'react-redux';

import { State as ReduxState } from '../../state';
import LocalizedString from '../../util/LocalizedString';
import { AiAction } from '../../state/reducer';
import TourTarget from '../Tours/TourTarget';
import { TourRegistry } from '../../tours/TourRegistry';

export interface ExtraMenuPublicProps extends StyleProps, ThemeProps {
  onLogoutClick: (event: React.MouseEvent) => void;
  onFeedbackClick?: (event: React.MouseEvent) => void;
  onDocumentationClick: (event: React.MouseEvent) => void;
  onSettingsClick: (event: React.MouseEvent) => void;
  onAboutClick: (event: React.MouseEvent) => void;
  onAiClick: (event: React.MouseEvent) => void;
  tourRegistry?: TourRegistry;
  onRetakeTourClick?: () => void;
}

interface ExtraMenuPrivateProps {
  locale: LocalizedString.Language;
}

interface ExtraMenuState {

}

type Props = ExtraMenuPublicProps & ExtraMenuPrivateProps;
type State = ExtraMenuState;

const Container = styled('div', (props: ThemeProps) => ({
  position: 'absolute',
  top: '100%',
  right: `0px`,
  width: '200px',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,

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

class ExtraMenu extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }


  render() {
    const { props } = this;
    const {
      className,
      style,
      theme,
      onLogoutClick,
      onAboutClick,
      onDocumentationClick,
      onFeedbackClick,
      onSettingsClick,
      locale,
      onAiClick,
      onRetakeTourClick
    } = props;

    const documentationItem_ = (<Item theme={theme} onClick={onDocumentationClick}><ItemIcon icon={faBook} /> {LocalizedString.lookup(tr('Documentation'), locale)}</Item>);
    const tutorItem_ = (<Item theme={theme} onClick={onAiClick}><ItemIcon icon={faRobot} /> {LocalizedString.lookup(tr('Tutor'), locale)}</Item>);
    const settingsItem_ = (<Item theme={theme} onClick={onSettingsClick}><ItemIcon icon={faCogs} /> {LocalizedString.lookup(tr('Settings'), locale)}</Item>);
    const aboutItem_ = (<Item theme={theme} onClick={onAboutClick}><ItemIcon icon={faQuestion} /> {LocalizedString.lookup(tr('About'), locale)}</Item>);
    const feedbackItem_ = (<Item theme={theme} onClick={onFeedbackClick}><ItemIcon icon={faCommentDots} /> {LocalizedString.lookup(tr('Feedback'), locale)}</Item>);
    const logoutItem_ = (<Item theme={theme} onClick={onLogoutClick}><ItemIcon icon={faSignOutAlt} /> {LocalizedString.lookup(tr('Logout'), locale)}</Item>);
    const retakeTourItem_ = (<Item theme={theme} onClick={onRetakeTourClick}><ItemIcon icon={faCircleInfo} /> {LocalizedString.lookup(tr(`Retake Tour`), locale)}</Item>);
    const tourContent_ = (
      <>
        <TourTarget registry={this.props.tourRegistry} targetKey={'extra-menu-documentation-button'} style={{ display: 'flex', height: '100%' }}>
          {documentationItem_}
        </TourTarget>
        <TourTarget registry={this.props.tourRegistry} targetKey={'extra-menu-ask-tutor-button'} style={{ display: 'flex', height: '100%' }}>
          {tutorItem_}
        </TourTarget>
        <TourTarget registry={this.props.tourRegistry} targetKey={'extra-menu-settings-button'} style={{ display: 'flex', height: '100%' }}>
          {settingsItem_}
        </TourTarget>
        <TourTarget registry={this.props.tourRegistry} targetKey={'extra-menu-about-button'} style={{ display: 'flex', height: '100%' }}>
          {aboutItem_}
        </TourTarget>
        {onFeedbackClick &&
          <TourTarget registry={this.props.tourRegistry} targetKey={'extra-menu-feedback-button'} style={{ display: 'flex', height: '100%' }}>
            {feedbackItem_}
          </TourTarget>}
        {retakeTourItem_}
        <TourTarget registry={this.props.tourRegistry} targetKey={'extra-menu-logout-button'} style={{ display: 'flex', height: '100%' }}>
          {logoutItem_}
        </TourTarget>

      </>);

    const normalContent_ = (
      <>
        {documentationItem_}
        {tutorItem_}
        {settingsItem_}
        {aboutItem_}
        {onFeedbackClick &&
          feedbackItem_
        }
        {retakeTourItem_}
        {logoutItem_}

      </>);
    return (
      <Container theme={theme} style={style} className={className}>
        {this.props.tourRegistry ? tourContent_ : normalContent_}
      </Container>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale
}))(ExtraMenu) as React.ComponentType<ExtraMenuPublicProps>;