import * as React from 'react';
import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';
import { styled } from 'styletron-react';
import { StyleProps } from '../../util/style';
import { Dialog } from './Dialog';
import { ThemeProps } from '../constants/theme';
import { connect } from 'react-redux';
import { State as ReduxState } from '../../state';
import DialogBar from './DialogBar';
import { withNavigate, WithNavigateProps } from '../../util/withNavigate';

export interface RetakeTourDialogPublicProps extends ThemeProps, StyleProps {
  onClose: () => void;
  onAccept: () => void;
}

interface RetakeTourDialogPrivateProps {
  locale: LocalizedString.Language;
}

type Props = RetakeTourDialogPublicProps & RetakeTourDialogPrivateProps & WithNavigateProps;

const Container = styled('div', (props: ThemeProps) => ({
  color: props.theme.color,
  backgroundColor: props.theme.titleBarBackground,
  padding: `${props.theme.itemPadding * 2}px`,
}));

const Bold = styled('span', {
  fontWeight: 400
});

const CenteredContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  width: '100%',
  height: '100%',
});


class RetakeTourDialog extends React.PureComponent<Props> {

  constructor(props: Props) {
    super(props);
  }

  private onAccept = () => {
    this.props.navigate(`/scene/jbcSandbox`);
    this.props.onAccept();
  };

  render() {
    const { props } = this;
    const { onClose, locale, theme } = props;


    return (
      <Dialog theme={theme} name={LocalizedString.lookup(tr('Retake Tour'), locale)} onClose={onClose}>
        <Container theme={theme}>
          <CenteredContainer>
            <p>{LocalizedString.lookup(tr('Retaking the tour will change your current scene to the JBC Sandbox.'), locale)}</p>
            <Bold>{LocalizedString.lookup(tr('Do you want to retake the tour?'), locale)}</Bold>
          </CenteredContainer>
          <br />

        </Container>
        <DialogBar theme={theme} onAccept={this.onAccept}> {LocalizedString.lookup(tr('Accept'), locale)}</DialogBar>
      </Dialog>
    );
  }
}


const ConnectedRetakeTourDialog = connect<unknown, unknown, Props>((state: ReduxState) => ({
  scenes: state.scenes,
  locale: state.i18n.locale,
}), dispatch => ({

}))(withNavigate(RetakeTourDialog)) as React.ComponentType<RetakeTourDialogPublicProps>;

export default ConnectedRetakeTourDialog;