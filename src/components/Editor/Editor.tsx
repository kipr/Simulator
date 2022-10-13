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
import Script from '../../state/State/Scene/Script';
import Dict from '../../Dict';

export enum EditorActionState {
  None,
  Compiling,
  Running,
}

export interface EditorProps extends StyleProps, ThemeProps {
  language: ProgrammingLanguage | Script.Language;
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

export namespace EditorBarTarget {
  export enum Type {
    Robot,
    Script
  }

  export interface Robot {
    type: Type.Robot;
    messages: Message[];
    language: ProgrammingLanguage;
    onLanguageChange: (language: ProgrammingLanguage) => void;
    onIndentCode: () => void;
    onDownloadCode: () => void;
    onErrorClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  }
}

export type EditorBarTarget = EditorBarTarget.Robot;

export const createEditorBarComponents = ({
  theme,
  target
}: {
  theme: Theme, 
  target: EditorBarTarget,
}) => {
  
  const editorBar: BarComponent<object>[] = [];
  
  switch (target.type) {
    case EditorBarTarget.Type.Robot: {
      let errors = 0;
      let warnings = 0;

      editorBar.push(BarComponent.create(LanguageSelectCharm, {
        theme,
        language: target.language,
        onLanguageChange: target.onLanguageChange,
      }));

      editorBar.push(BarComponent.create(Button, {
        theme,
        onClick: target.onIndentCode,
        children:
          <>
            <Fa icon={faIndent} />
            {' Indent'}
          </>
      }));

      editorBar.push(BarComponent.create(Button, {
        theme,
        onClick: target.onDownloadCode,
        children:
          <>
            <Fa icon={faFileDownload} />
            {' Download'}
          </>
      }));

      target.messages.forEach(message => {
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
        onClick: target.onErrorClick
      }));

      if (warnings > 0) editorBar.push(BarComponent.create(WarningCharm, {
        theme,
        count: warnings,
        onClick: target.onErrorClick
      }));
      break;
    }
  }

  return editorBar;
};

export const IVYGATE_LANGUAGE_MAPPING: Dict<string> = {
  'ecmascript': 'javascript',
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
    const {
      style,
      className,
      theme,
      code,
      onCodeChange,
      messages,
      autocomplete,
      language
    } = this.props;

    return (
      <Container theme={theme} style={style} className={className}>
        <Ivygate
          ref={this.bindIvygate_}
          code={code}
          language={IVYGATE_LANGUAGE_MAPPING[language] || language}
          messages={messages}
          onCodeChange={onCodeChange}
          autocomplete={autocomplete}
        />
      </Container>
      
    );
  }
}

export default Editor;
