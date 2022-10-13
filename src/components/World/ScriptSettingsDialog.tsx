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

export type ScriptSettingsAcceptance = Script;

export interface ScriptSettingsDialogProps extends ThemeProps {
  script: Script;
  id: string;

  onClose: () => void;
  onAccept: (acceptance: ScriptSettingsAcceptance) => void;
}

interface ScriptSettingsDialogState {
  workingScript: Script;
}

type Props = ScriptSettingsDialogProps;
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
    const { theme, onClose, script, id } = props;

    return (
      <Dialog theme={theme} name={`${script.name || ''} Settings`} onClose={onClose}>
        <InnerContainer>
          <ScriptSettings
            theme={theme}
            script={script}
            id={id}
            onScriptChange={this.onChange_}
          />
        </InnerContainer>
        <DialogBar theme={theme} onAccept={this.onAccept_}>
          <Fa icon={faCheck} /> Accept
        </DialogBar>
      </Dialog>
    );
  }
}

export default ScriptSettingsDialog;