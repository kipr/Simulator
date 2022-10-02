import * as React from "react";
import { styled } from "styletron-react";
import { ReferenceFrame, Rotation } from "../../unit-math";
import { Angle, Distance, Mass, Value } from "../../util";
import ComboBox from "../ComboBox";
import { Dialog } from "../Dialog";
import DialogBar from "../DialogBar";
import Field from "../Field";
import Input from "../Input";
import ScrollArea from "../ScrollArea";
import Section from "../Section";
import { ThemeProps } from "../theme";
import ValueEdit from "../ValueEdit";
import { AxisAngle, Euler } from "../../math";
import ScriptSettings from "./ScriptSettings";
import Script from "../../state/State/Scene/Script";

import * as uuid from 'uuid';
import { Fa } from "../Fa";

import { faCheck } from '@fortawesome/free-solid-svg-icons';

export interface AddScriptAcceptance {
  script: Script;
}

export interface AddScriptDialogProps extends ThemeProps {
  onAccept: (acceptance: AddScriptAcceptance) => void;
  onClose: () => void;
}

interface AddScriptDialogState {
  id: string;
  script: Script;
}

type Props = AddScriptDialogProps;
type State = AddScriptDialogState;

const StyledScrollArea = styled(ScrollArea, (props: ThemeProps) => ({
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
    const { theme, onClose } = props;
    const { script, id } = state;

    return (
      <Dialog theme={theme} name='Add Script' onClose={onClose}>
        <StyledScrollArea theme={theme}>
          <ScriptSettings
            theme={theme}
            script={script}
            id={id}
            onScriptChange={this.onScriptChange_}
          />
        </StyledScrollArea>
        <DialogBar theme={theme} onAccept={this.onAccept_}>
          <Fa icon={faCheck} /> Accept
        </DialogBar>
      </Dialog>
    );
  }
}

export default AddScriptDialog;