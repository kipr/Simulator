import * as React from "react";
import { styled } from "styletron-react";

import Field from "../Field";
import Input from "../Input";
import Section from "../Section";
import { ThemeProps } from "../theme";
import ValueEdit from "../ValueEdit";
import Script from "../../state/State/Scene/Script";


export interface ScriptSettingsProps extends ThemeProps {
  onScriptChange: (script: Script) => void;
  script: Script;
  id: string;
}

interface ScriptSettingsState {
}

type Props = ScriptSettingsProps;
type State = ScriptSettingsState;

const StyledField = styled(Field, (props: ThemeProps) => ({
  width: '100%',
  marginBottom: `${props.theme.itemPadding * 2}px`,
  ':last-child': {
    marginBottom: 0,
  },
}));

const StyledValueEdit = styled(ValueEdit, (props: ThemeProps) => ({
  marginBottom: `${props.theme.itemPadding * 2}px`,
  ':last-child': {
    marginBottom: 0,
  },
}));

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1',
  padding: `${props.theme.itemPadding * 2}px`,
}));

class ScriptSettings extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  private onNameChange_ = (event: React.SyntheticEvent<HTMLInputElement>) => {
    this.props.onScriptChange({
      ...this.props.script,
      name: event.currentTarget.value,
    });
  };

  render() {
    const { props, state } = this;
    const { theme, script, id } = props;

    return (
      <Container theme={theme}>
        <StyledField name='Name' theme={theme} long>
          <Input theme={theme} type='text' value={script.name} onChange={this.onNameChange_} />
        </StyledField>

      </Container>
    );
  }
}

export default ScriptSettings;