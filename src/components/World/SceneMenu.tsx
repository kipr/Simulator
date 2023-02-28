import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import { Fa } from '../Fa';
import { ThemeProps } from '../theme';
import { faCaretSquareLeft, faClone, faCogs, faCopy, faEye, faEyeSlash, faFolderOpen, faPlus, faSave, faTrash } from '@fortawesome/free-solid-svg-icons';

import LocalizedString from '../../util/LocalizedString';
import { connect } from 'react-redux';
import { State as ReduxState } from '../../state';
import tr from '@i18n';

export interface SceneMenuPublicProps extends StyleProps, ThemeProps {
  onSaveScene?: (event: React.MouseEvent) => void;
  onNewScene?: (event: React.MouseEvent) => void;
  onSaveAsScene?: (event: React.MouseEvent) => void;
  onOpenScene?: (event: React.MouseEvent) => void;
  onSettingsScene?: (event: React.MouseEvent) => void;
  onDeleteScene?: (event: React.MouseEvent) => void;
}

interface SceneMenuPrivateProps {
  locale: LocalizedString.Language;
}

interface SceneMenuState {
  
}

type Props = SceneMenuPublicProps & SceneMenuPrivateProps;
type State = SceneMenuState;

const Container = styled('div', (props: ThemeProps) => ({
  position: 'absolute',
  top: '100%',
  left: `-1px`,
  right: '-1px',
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


const ItemIcon = styled(Fa, {
  width: '20px',
  minWidth: '20px',
  maxWidth: '20px',
  textAlign: 'center',
  marginRight: '10px'
});

class SceneMenu extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }


  render() {
    const { props } = this;
    const { theme, onSaveAsScene, onNewScene, onSaveScene, onOpenScene, onSettingsScene, onDeleteScene, locale } = props;
    return (
      <Container theme={theme}>
        <Item theme={theme} disabled={!onSettingsScene} onClick={onSettingsScene}><ItemIcon icon={faCogs} /> {LocalizedString.lookup(tr('Settings'), locale)}</Item>
        <Item theme={theme} disabled={!onOpenScene} onClick={onOpenScene}><ItemIcon icon={faFolderOpen} /> {LocalizedString.lookup(tr('Open'), locale)}</Item>
        <Item theme={theme} disabled={!onSaveScene} onClick={onSaveScene}><ItemIcon icon={faSave} /> {LocalizedString.lookup(tr('Save'), locale)}</Item>
        <Item theme={theme} disabled={!onSaveAsScene} onClick={onSaveAsScene}><ItemIcon icon={faCopy} /> {LocalizedString.lookup(tr('Save As'), locale)}</Item>
        <Item theme={theme} disabled={!onDeleteScene} onClick={onDeleteScene}><ItemIcon icon={faTrash} /> {LocalizedString.lookup(tr('Delete'), locale)}</Item>
      </Container>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale
}))(SceneMenu) as React.ComponentType<SceneMenuPublicProps>;