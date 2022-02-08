/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import { ThemeProps } from '../theme';

import { Ivygate, Message } from 'ivygate';

(self as any).MonacoEnvironment = {
  getWorkerUrl: function (_moduleId: any, label: string) {
    if (label === 'json') {
      return './static/json.worker.bundle.js';
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return './static/css.worker.bundle.js';
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return './static/html.worker.bundle.js';
    }
    if (label === 'typescript' || label === 'javascript') {
      return './static/ts.worker.bundle.js';
    }
    return './static/editor.worker.bundle.js';
  }
};


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
        <div>
          <button onClick={() => console.log(this.ivygate_)}>Ivygate</button>
          <button onClick={() => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            this.ivygate_.changeFormatter('indent');
            this.ivygate_.formatCode();
          }}>Indent</button>
          <button onClick={() => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            this.ivygate_.changeFormatter('beautify');
            this.ivygate_.formatCode();
          }}>Beautify</button>
          <button onClick={() => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            this.ivygate_.changeFormatter('prettier');
            this.ivygate_.formatCode();
          }}>Prettier</button>
        </div>
        <Ivygate ref={this.bindIvygate_} code={code} language="c" messages={messages} onCodeChange={onCodeChange} autocomplete={autocomplete} />
      </Container>
    );
  }
}

export default Editor;
