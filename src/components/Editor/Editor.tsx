import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import { ThemeProps } from '../theme';

import { Ivygate } from 'ivygate';

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

  render() {
    const { style, className, theme, code, onCodeChange } = this.props;
    return (
      <Container theme={theme} style={style} className={className}>
        <Ivygate code={code} language="c" />
      </Container>
    );
  }
}

export default Editor;
