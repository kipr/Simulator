import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import { Theme, ThemeProps } from '../theme';

import { Fa } from '../Fa';
import { Button } from '../Button';
import { BarComponent } from '../Widget';
import { WarningCharm, ErrorCharm } from './';

import { Ivygate, Message } from 'ivygate';
import LanguageSelectCharm from './LanguageSelectCharm';
import ProgrammingLanguage from '../../ProgrammingLanguage';

import { faFileDownload, faIndent } from '@fortawesome/free-solid-svg-icons';

export enum EditorActionState {
  None,
  Compiling,
  Running,
}

export interface EditorProps extends StyleProps, ThemeProps {
  language: ProgrammingLanguage;
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
  },
  height: '100%'
}));

export const createEditorBarComponents = ({
  theme,
  messages,
  language,
  onLanguageChange,
  onIndentCode,
  onDownloadCode,
  onErrorClick
}: {
  theme: Theme, 
  messages: Message[],
  language: ProgrammingLanguage,
  onLanguageChange: (language: ProgrammingLanguage) => void,
  onIndentCode: () => void,
  onDownloadCode: () => void,
  onErrorClick: (event: React.MouseEvent<HTMLDivElement>) => void
}) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const editorBar: BarComponent<object>[] = [];
  let errors = 0;
  let warnings = 0;

  editorBar.push(BarComponent.create(LanguageSelectCharm, {
    theme,
    language,
    onLanguageChange,
  }));

  editorBar.push(BarComponent.create(Button, {
    theme,
    onClick: onIndentCode,
    children:
      <>
        <Fa icon={faIndent} />
        {' Indent'}
      </>
  }));

  editorBar.push(BarComponent.create(Button, {
    theme,
    onClick: onDownloadCode,
    children:
      <>
        <Fa icon={faFileDownload} />
        {' Download'}
      </>
  }));

  messages.forEach(message => {
    switch (message.severity) {
      case 'error': {
        ++errors;
        break;
      }
      case 'warning': {
        ++warnings;
        break;
      }
    }
  });

  if (errors > 0) editorBar.push(BarComponent.create(ErrorCharm, {
    theme,
    count: errors,
    onClick: onErrorClick
  }));

  if (warnings > 0) editorBar.push(BarComponent.create(WarningCharm, {
    theme,
    count: warnings,
    onClick: onErrorClick
  }));

  // editorBar.push(BarComponent.create(PerfectCharm, { theme }));
  
  return editorBar;
};

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
    const { style, className, theme, code, onCodeChange, messages, autocomplete, language } = this.props;
    return (
      <Container theme={theme} style={style} className={className}>
        <Ivygate
          ref={this.bindIvygate_}
          code={code}
          language={language}
          messages={messages}
          onCodeChange={onCodeChange}
          autocomplete={autocomplete}
        />
      </Container>
      
    );
  }
}

export default Editor;
