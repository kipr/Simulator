import * as React from "react";
import { styled } from "styletron-react";
import { Dialog } from "../Dialog/Dialog";
import DialogBar from "../Dialog/DialogBar";
import { ThemeProps } from "../Constants/theme";
import ScriptSettings from "./ScriptSettings";
import Script from "../../state/State/Scene/Script";

import * as uuid from 'uuid';
import { FontAwesome } from "../FontAwesome";

import { faCheck } from '@fortawesome/free-solid-svg-icons';

import LocalizedString from '../../util/LocalizedString';
import { connect } from 'react-redux';
import { State as ReduxState } from '../../state';
import tr from '@i18n';

export interface AddScriptAcceptance {
  script: Script;
}

export interface AddScriptDialogPublicProps extends ThemeProps {
  onAccept: (acceptance: AddScriptAcceptance) => void;
  onClose: () => void;
}

interface AddScriptDialogPrivateProps {
  locale: LocalizedString.Language;
}

interface AddScriptDialogState {
  id: string;
  script: Script;
}

type Props = AddScriptDialogPublicProps & AddScriptDialogPrivateProps;
type State = AddScriptDialogState;

const InnerContainer = styled('div', () => ({
  display: 'flex',
  minHeight: '400px',
  flex: '1 1',
}));

class AddScriptDialog extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      id: uuid.v4(),
      script: {
        name: 'Unnamed Script',
        language: Script.Language.EcmaScript,
        code: ''
      },
    };
  }

  private onAccept_ = () => {
    this.props.onAccept({
      script: this.state.script,
    });
  };


  private onScriptChange_ = (script: Script) => this.setState({ script });

  render() {
    const { props, state } = this;
    const { theme, onClose, locale } = props;
    const { script, id } = state;

    return (
      <Dialog theme={theme} name={LocalizedString.lookup(tr('Add Script'), locale)} onClose={onClose}>
        <InnerContainer>
          <ScriptSettings
            theme={theme}
            script={script}
            id={id}
            onScriptChange={this.onScriptChange_}
          />
        </InnerContainer>
        <DialogBar theme={theme} onAccept={this.onAccept_}>
          <FontAwesome icon={faCheck} /> {LocalizedString.lookup(tr('Accept'), locale)}
        </DialogBar>
      </Dialog>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(AddScriptDialog) as React.ComponentType<AddScriptDialogPublicProps>;