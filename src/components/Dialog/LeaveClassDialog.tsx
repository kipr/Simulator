import * as React from 'react';
import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';
import { ThemeProps } from '../constants/theme';
import { StyleProps } from '../../util/style';
import { styled } from 'styletron-react';
import { Dialog } from './Dialog';
import { State as ReduxState } from '../../state';
import { I18nAction } from '../../state/reducer';
import { connect } from 'react-redux';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesome } from '../FontAwesome';

export interface LeaveClassDialogPublicProps extends ThemeProps, StyleProps {

  locale: LocalizedString.Language;
  onClose: () => void;
  onLeaveClassDialogClose: () => void;
}

interface LeaveClassDialogPrivateProps {

  onLocaleChange: (locale: LocalizedString.Language) => void;
}

interface LeaveClassDialogState {
}

type Props = LeaveClassDialogPublicProps & LeaveClassDialogPrivateProps;
type State = LeaveClassDialogState;
interface ClickProps {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}
const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: props.theme.backgroundColor,
  alignItems: 'center',
  padding: '2em',
  gap: '1em',
  color: props.theme.color,
  height: 'auto'
}));
const Button = styled('div', (props: ThemeProps & ClickProps) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  padding: '10px',
  backgroundColor: '#2c2c2cff',
  borderBottom: `1px solid ${props.theme.borderColor}`,
  ':last-child': {
    borderBottom: 'none'
  },
  opacity: props.disabled ? '0.5' : '1.0',
  fontWeight: 400,
  ':hover': {
    cursor: 'pointer',
    backgroundColor: `rgba(255, 255, 255, 0.1)`
  },
  userSelect: 'none',
  transition: 'background-color 0.2s, opacity 0.2s'
}));

const ItemIcon = styled(FontAwesome, {
  paddingLeft: '10px',
  paddingRight: '10px',
  alignItems: 'center',
  height: '30px'
});


export class CreateUserDialog extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
  }

  render() {
    const { props } = this;
    const { style, className, theme, onClose, locale, } = props;

    return (
      <Dialog
        theme={theme}
        name={LocalizedString.lookup(tr('Leave Classroom'), locale)}
        onClose={onClose}
      >
        <Container theme={theme} style={style} className={className}>
          {LocalizedString.lookup(tr('Are you sure you want to leave this classroom?'), locale)}

          <Button theme={theme} onClick={() => this.props.onLeaveClassDialogClose()}>
            <ItemIcon icon={faExclamationTriangle} />
            {LocalizedString.lookup(tr('Leave Classroom'), locale)}
          </Button>

        </Container>

      </Dialog>

    );
  }
}

export default connect((state: ReduxState) => ({

}), dispatch => ({
  onLocaleChange: (locale: LocalizedString.Language) => dispatch(I18nAction.setLocale({ locale })),

}))(CreateUserDialog) as React.ComponentType<LeaveClassDialogPublicProps>;


