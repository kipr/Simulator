import * as React from "react";
import { styled } from "styletron-react";

import Field from "../Field";
import Input from "../Input";
import Section from "../Section";
import { LIGHT, Theme, ThemeProps } from "../theme";
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
  theme: Theme
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

class ScriptSettings extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      theme: LIGHT
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
    const { script, id } = props;
    const{theme} = state;

    return (
      <Container theme={theme}>
        <StyledField name='Name' theme={theme} long>
          <Input theme={theme} type='text' value={script.name} onChange={this.onNameChange_} />
        </StyledField>
        <Ivygate
          code={script.code}
          theme = {theme}
          language={'javascript'}
          onCodeChange={this.onCodeChange_}
          autocomplete
          style={{ flex: '1 1' }}
        />
      </Container>
    );
  }
}

export default ScriptSettings;