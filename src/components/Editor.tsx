import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { ThemeProps } from './theme';

import { Controlled as CodeMirror } from 'react-codemirror2';
require('codemirror/lib/codemirror.css');
require('codemirror/mode/clike/clike');

export enum EditorActionState {
  None,
  Compiling,
  Running,
}

export interface EditorProps extends StyleProps, ThemeProps {
  code: string;
  onCodeChange: (code: string) => void;
}

interface EditorState {
  
}

type Props = EditorProps;
type State = EditorState;

const Container = styled('textarea', (props: ThemeProps) => ({
  flex: '1 1',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  resize: 'none',
  border: 'none',
  ':focus': {
    outline: 'none'
  }
}));

const CODE_MIRROR_OPTIONS = {
  lineNumbers: true,
  mode: 'text/x-csrc',
  theme: 'kiss',
};

class Editor extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { style, className, theme, code, onCodeChange } = this.props;
    return (
      <Container theme={theme} style={style} className={className}>
        <CodeMirror value={'Hello'} onBeforeChange={onCodeChange} options={CODE_MIRROR_OPTIONS} />
      </Container>
    );
  }
}

export default Editor;