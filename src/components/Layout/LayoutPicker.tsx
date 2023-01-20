import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import { Fa } from '../Fa';
import { Layout } from './Layout';
import { ThemeProps } from '../theme';
import { faCaretSquareLeft, faClone, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import LocalizedString from '../../util/LocalizedString';
import { connect } from 'react-redux';
import { State as ReduxState } from '../../state';
import tr from '@i18n';

export interface LayoutPickerPublicProps extends StyleProps, ThemeProps {
  layout: Layout,

  onLayoutChange: (layout: Layout) => void;

  onShowAll: () => void;
  onHideAll: () => void;
}

interface LayoutPickerPrivateProps {
  locale: LocalizedString.Language;
}

interface LayoutPickerState {
  
}

type Props = LayoutPickerPublicProps & LayoutPickerPrivateProps;
type State = LayoutPickerState;

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
    const { theme, layout, onHideAll, onShowAll, locale } = props;
    return (
      <Container theme={theme}>
        <Item theme={theme} style={{ fontWeight: 500, backgroundColor: theme.borderColor }}>{LocalizedString.lookup(tr('Layouts'), locale)}</Item>
        <Item theme={theme} disabled={layout === Layout.Overlay} onClick={layout !== Layout.Overlay ? this.onOverlayClick_ : undefined}><ItemIcon icon={faClone} /> {LocalizedString.lookup(tr('Overlay'), locale)}</Item>
        <Item theme={theme} disabled={layout === Layout.Side} onClick={layout !== Layout.Side ? this.onSideClick_ : undefined}><ItemIcon icon={faCaretSquareLeft} /> {LocalizedString.lookup(tr('Side'), locale)}</Item>
        {/* <Item theme={theme} disabled={layout === Layout.Bottom} onClick={layout !== Layout.Bottom ? this.onBottomClick_ : undefined}><ItemIcon icon={faCaretSquareDown} /> Bottom</Item> */}
        
        {layout === Layout.Overlay ? (
          <>
            <Item theme={theme} style={{ fontWeight: 500, backgroundColor: theme.borderColor }}>{LocalizedString.lookup(tr('Options'), locale)}</Item>
            <Item theme={theme} onClick={onShowAll}><ItemIcon icon={faEye} /> {LocalizedString.lookup(tr('Show All'), locale)}</Item>
            <Item theme={theme} onClick={onHideAll}><ItemIcon icon={faEyeSlash} /> {LocalizedString.lookup(tr('Hide All'), locale)}</Item>
          </>
        ) : undefined}
      </Container>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale
}))(LayoutPicker) as React.ComponentType<LayoutPickerPublicProps>;