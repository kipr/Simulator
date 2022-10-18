import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import { Fa } from '../Fa';
import { ThemeProps } from '../theme';
import { faCaretSquareLeft, faClone, faCopy, faEye, faEyeSlash, faFolderOpen, faPlus, faSave } from '@fortawesome/free-solid-svg-icons';

export interface SceneMenuProps extends StyleProps, ThemeProps {
  onSaveScene?: (event: React.MouseEvent) => void;
  onNewScene?: (event: React.MouseEvent) => void;
  onCopyScene?: (event: React.MouseEvent) => void;
  onOpenScene?: (event: React.MouseEvent) => void;
}

interface SceneMenuState {
  
}

type Props = SceneMenuProps;
type State = SceneMenuState;

const Container = styled('div', (props: ThemeProps) => ({
  position: 'absolute',
  top: '100%',
  left: `-1px`,
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
    const { theme, onCopyScene, onNewScene, onSaveScene, onOpenScene } = props;
    return (
      <Container theme={theme}>
        <Item theme={theme} disabled={!onOpenScene} onClick={onOpenScene}><ItemIcon icon={faFolderOpen} /> Open</Item>
        <Item theme={theme} disabled={!onNewScene} onClick={onSaveScene}><ItemIcon icon={faPlus} /> New</Item>
        <Item theme={theme} disabled={!onSaveScene} onClick={onSaveScene}><ItemIcon icon={faSave} /> Save</Item>
        <Item theme={theme} disabled={!onCopyScene} onClick={onCopyScene}><ItemIcon icon={faCopy} /> Copy</Item>
      </Container>
    );
  }
}

export default SceneMenu;