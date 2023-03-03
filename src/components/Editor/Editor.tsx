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

import { faArrowsRotate, faFileDownload, faIndent } from '@fortawesome/free-solid-svg-icons';
import Script from '../../state/State/Scene/Script';
import Dict from '../../Dict';

import * as monaco from 'monaco-editor';
import DocumentationLocation from '../../state/State/Documentation/DocumentationLocation';
import { DocumentationAction } from '../../state/reducer';
import tr from '@i18n';
import { connect } from 'react-redux';
import { State as ReduxState } from '../../state';
import LocalizedString from '../../util/LocalizedString';
import DeleteDialog from 'components/DeleteDialog';

export enum EditorActionState {
  None,
  Compiling,
  Running,
}

export interface EditorPublicProps extends StyleProps, ThemeProps {
  language: ProgrammingLanguage | Script.Language;
  code: string;

  onCodeChange: (code: string) => void;
  messages?: Message[];
  autocomplete: boolean;

  onDocumentationGoToFuzzy?: (query: string, language: 'c' | 'python') => void;
}

interface EditorPrivateProps {
  locale: LocalizedString.Language;
}

interface EditorState {
}

type Props = EditorPublicProps;
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
    onResetCode: () => void;
    onErrorClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  }
}

export type EditorBarTarget = EditorBarTarget.Robot;

export const createEditorBarComponents = ({
  theme,
  target,
  locale
}: {
  theme: Theme, 
  target: EditorBarTarget,
  locale: LocalizedString.Language
}) => {
  
  // eslint-disable-next-line @typescript-eslint/ban-types
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
            {' '} {LocalizedString.lookup(tr('Indent'), locale)}
          </>
      }));

      editorBar.push(BarComponent.create(Button, {
        theme,
        onClick: target.onDownloadCode,
        children:
          <>
            <Fa icon={faFileDownload} />
            {' '} {LocalizedString.lookup(tr('Download'), locale)}
          </>
      }));

      editorBar.push(BarComponent.create(Button, {
        theme,
        onClick: target.onResetCode,
        children:
          <>
            <Fa icon={faArrowsRotate} />
            {' '} {LocalizedString.lookup(tr('Reset'), locale)}
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
        onClick: target.onErrorClick,
        locale
      }));

      if (warnings > 0) editorBar.push(BarComponent.create(WarningCharm, {
        theme,
        count: warnings,
        onClick: target.onErrorClick,
        locale
      }));
      break;
    }
  }

  return editorBar;
};

export const IVYGATE_LANGUAGE_MAPPING: Dict<string> = {
  'ecmascript': 'javascript',
};

const DOCUMENTATION_LANGUAGE_MAPPING: { [key in ProgrammingLanguage | Script.Language]: 'c' | 'python' | undefined } = {
  'ecmascript': undefined,
  'python': 'python',
  'c': 'c',
  'cpp': 'c',
};

class Editor extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  private openDocumentation_ = () => {
    const { word } = this.ivygate_.editor.getModel().getWordAtPosition(this.ivygate_.editor.getPosition());
    const language = DOCUMENTATION_LANGUAGE_MAPPING[this.props.language];
    if (!language) return;
    this.props.onDocumentationGoToFuzzy?.(word, language);
    
  };

  private openDocumentationAction_?: monaco.IDisposable;
  private setupCodeEditor_ = (editor: monaco.editor.IStandaloneCodeEditor) => {
    if (this.props.onDocumentationGoToFuzzy) this.openDocumentationAction_ = editor.addAction({
      id: 'open-documentation',
      label: 'Open Documentation',
      contextMenuOrder: 0,
      contextMenuGroupId: "operation",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: this.openDocumentation_,
    });
  };

  private disposeCodeEditor_ = (editor: monaco.editor.IStandaloneCodeEditor) => {
    if (this.openDocumentationAction_) this.openDocumentationAction_.dispose();
  };

  private ivygate_: Ivygate;
  private bindIvygate_ = (ivygate: Ivygate) => {
    if (this.ivygate_ === ivygate) return;
    const old = this.ivygate_;
    this.ivygate_ = ivygate;
    if (this.ivygate_ && this.ivygate_.editor) {
      this.setupCodeEditor_(this.ivygate_.editor as monaco.editor.IStandaloneCodeEditor);
    } else {
      this.disposeCodeEditor_(old.editor as monaco.editor.IStandaloneCodeEditor);
    }
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