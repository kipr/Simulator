import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import { ThemeProps } from '../theme';

import { Ivygate, Message } from 'ivygate';

export enum EditorActionState {
  None,
  Compiling,
  Running,
}

export interface EditorProps extends StyleProps, ThemeProps {
  code: string;
  onCodeChange: (code: string) => void;
  messages?: Message[];
  autocomplete: boolean;
}

interface EditorState {
  
}

type Props = EditorProps;
type State = EditorState;

const Container = styled('div', (props: ThemeProps) => ({
  flex: '1 1',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  resize: 'none',
  border: 'none',
  ':focus': {
    outline: 'none'
  }
}));

class Editor extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  private ivygate_: Ivygate;
  private bindIvygate_ = (ivygate: Ivygate) => {
    this.ivygate_ = ivygate;
  };

  get ivygate() {
    return this.ivygate_;
  }

  render() {
    const { style, className, theme, code, onCodeChange, messages, autocomplete } = this.props;
    return (
      <Container theme={theme} style={style} className={className}>
        <Ivygate ref={this.bindIvygate_} code={code} language="c" messages={messages} onCodeChange={onCodeChange} autocomplete={autocomplete} />
      </Container>
    );
  }
}

export default Editor;
