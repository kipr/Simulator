import * as React from "react";
import { styled } from "styletron-react";

import Field from "../Field";
import Input from "../Input";
import Section from "../Section";
import { ThemeProps } from "../theme";
import ValueEdit from "../ValueEdit";
import Script from "../../state/State/Scene/Script";
import { Ivygate } from 'ivygate';
import { Editor } from '../Editor';
import * as monaco from 'monaco-editor';


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
  paddingLeft: `${props.theme.itemPadding * 2}px`,
  paddingRight: `${props.theme.itemPadding * 2}px`,
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
  paddingTop: `${props.theme.itemPadding * 2}px`,
  
}));


(async () => {
  const simulator = await (await fetch('/simulator.d.ts')).text();
  console.log(simulator);
  monaco.languages.typescript.typescriptDefaults.addExtraLib(simulator);
})().catch(err => {
  console.error(err);
});

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

  private onCodeChange_ = (code: string) => {
    this.props.onScriptChange({
      ...this.props.script,
      code,
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
        <Ivygate
          code={script.code}
          language={'typescript'}
          onCodeChange={this.onCodeChange_}
          autocomplete
          style={{ flex: '1 1' }}
        />
      </Container>
    );
  }
}

export default ScriptSettings;