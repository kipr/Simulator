import * as React from "react";
import { styled } from "styletron-react";
import { ReferenceFrame } from "../../unit-math";
import { Dialog } from "../Dialog";
import ScrollArea from "../ScrollArea";
import { ThemeProps } from "../theme";
import ScriptSettings from "./ScriptSettings";
import Script from '../../state/State/Scene/Script';

export type ScriptSettingsAcceptance = Script;

export interface ScriptSettingsDialogProps extends ThemeProps {
  script: Script;
  id: string;

  onChange: (script: Script) => void;

  onClose: () => void;
}

interface ScriptSettingsDialogState {
}

type Props = ScriptSettingsDialogProps;
type State = ScriptSettingsDialogState;

const StyledScrollArea = styled(ScrollArea, (props: ThemeProps) => ({
  minHeight: '300px',
  flex: '1 1',
}));

class ScriptSettingsDialog extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { props, state } = this;
    const { theme, onClose, onChange, script, id } = props;

    return (
      <Dialog theme={theme} name={`${script.name || ''} Settings`} onClose={onClose}>
        <StyledScrollArea theme={theme}>
          <ScriptSettings
            theme={theme}
            script={script}
            id={id}
            onScriptChange={onChange}
          />
        </StyledScrollArea>
      </Dialog>
    );
  }
}

export default ScriptSettingsDialog;