import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { Fa } from './Fa';
import { Layout } from './Layout';
import { ThemeProps } from './theme';

export interface LayoutPickerProps extends StyleProps, ThemeProps {
  layout: Layout,

  onLayoutChange: (layout: Layout) => void;

  onShowAll: () => void;
  onHideAll: () => void;
}

interface LayoutPickerState {
  
}

type Props = LayoutPickerProps;
type State = LayoutPickerState;

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
  } : {},
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

class LayoutPicker extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  private onOverlayClick_ = (event: React.MouseEvent<HTMLDivElement>) => {
    // event.stopPropagation();
    // event.preventDefault();

    this.props.onLayoutChange(Layout.Overlay);
  };

  private onSideClick_ = (event: React.MouseEvent<HTMLDivElement>) => {
    // event.stopPropagation();
    // event.preventDefault();

    this.props.onLayoutChange(Layout.Side);
  };

  private onBottomClick_ = (event: React.MouseEvent<HTMLDivElement>) => {
    // event.stopPropagation();
    // event.preventDefault();

    this.props.onLayoutChange(Layout.Bottom);
  };


  render() {
    const { props } = this;
    const { theme, layout, onHideAll, onShowAll } = props;
    return (
      <Container theme={theme}>
        <Item theme={theme} style={{ fontWeight: 500, backgroundColor: theme.borderColor }}>Layouts</Item>
        <Item theme={theme} onClick={layout !== Layout.Overlay ? this.onOverlayClick_ : undefined}><ItemIcon icon='clone' /> Overlay</Item>
        <Item theme={theme} disabled onClick={undefined}><ItemIcon icon='caret-square-left' /> Side</Item>
        <Item theme={theme} disabled onClick={undefined}><ItemIcon icon='caret-square-down' /> Bottom</Item>
        
        {layout === Layout.Overlay ? (
          <>
            <Item theme={theme} style={{ fontWeight: 500, backgroundColor: theme.borderColor }}>Layout Options</Item>
            <Item theme={theme} onClick={onShowAll}><ItemIcon icon='eye' /> Show All</Item>
            <Item theme={theme} onClick={onHideAll}><ItemIcon icon='eye-slash' /> Hide All</Item>
          </>
        ) : undefined}
      </Container>
    );
  }
}

export default LayoutPicker;