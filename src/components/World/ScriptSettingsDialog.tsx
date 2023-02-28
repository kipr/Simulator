import * as React from "react";
import { styled } from "styletron-react";
import { ReferenceFrame } from "../../unit-math";
import { Dialog } from "../Dialog";
import ScrollArea from "../ScrollArea";
import { ThemeProps } from "../theme";
import ScriptSettings from "./ScriptSettings";
import Script from '../../state/State/Scene/Script';
import DialogBar from '../DialogBar';
import { Fa } from '../Fa';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

import LocalizedString from '../../util/LocalizedString';
import { connect } from 'react-redux';
import { State as ReduxState } from '../../state';
import tr from '@i18n';

export type ScriptSettingsAcceptance = Script;

export interface ScriptSettingsDialogPublicProps extends ThemeProps {
  script: Script;
  id: string;

  onClose: () => void;
  onAccept: (acceptance: ScriptSettingsAcceptance) => void;
}

interface ScriptSettingsDialogPrivateProps {
  locale: LocalizedString.Language;
}

interface ScriptSettingsDialogState {
  workingScript: Script;
}

type Props = ScriptSettingsDialogPublicProps & ScriptSettingsDialogPrivateProps;
type State = ScriptSettingsDialogState;

const InnerContainer = styled('div', () => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '400px',
}));

class ScriptSettingsDialog extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      workingScript: props.script,
    };
  }

  private onChange_ = (script: Script) => {
    this.setState({
      workingScript: script,
    });
  };

  private onAccept_ = () => {
    this.props.onAccept(this.state.workingScript);
  };

  render() {
    const { props, state } = this;
    const { theme, onClose, script, id, locale } = props;

    return (
      <Dialog theme={theme} name={`${script.name || ''} ${LocalizedString.lookup(tr('Settings'), locale)}`} onClose={onClose}>
        <InnerContainer>
          <ScriptSettings
            theme={theme}
            script={script}
            id={id}
            onScriptChange={this.onChange_}
          />
        </InnerContainer>
        <DialogBar theme={theme} onAccept={this.onAccept_}>
          <Fa icon={faCheck} /> {LocalizedString.lookup(tr('Accept'), locale)}
        </DialogBar>
      </Dialog>
    );
  }
}

export default connect((state: ReduxState) => ({
  locale: state.i18n.locale,
}))(ScriptSettingsDialog) as React.ComponentType<ScriptSettingsDialogPublicProps>;