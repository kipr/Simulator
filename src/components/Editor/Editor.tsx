import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../../util/style';
import { Theme, ThemeProps } from '../constants/theme';

import { FontAwesome } from '../FontAwesome';
import { Button } from '../interface/Button';
import { BarComponent } from '../interface/Widget';
import { WarningCharm, ErrorCharm } from './';
import type { Ivygate as IvygateType } from 'ivygate';
import { Ivygate, Message } from 'ivygate';
import LanguageSelectCharm from './LanguageSelectCharm';
import ProgrammingLanguage from '../../programming/compiler/ProgrammingLanguage';

import { faArrowsRotate, faCompress, faExpand, faFileDownload, faIndent } from '@fortawesome/free-solid-svg-icons';
// import { faArrowsRotate, faFileDownload, faIndent } from '@fortawesome/free-solid-svg-icons';
import Script from '../../state/State/Scene/Script';
import Dict from '../../util/objectOps/Dict';

import * as monaco from 'monaco-editor';
import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';
import GraphicalEditor from './GraphicalEditor';

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

  onDocumentationGoToFuzzy?: (query: string, language: 'c' | 'python' | 'scratch') => void;
  onCommonDocumentationGoToFuzzy?: (query: string, language: 'c' | 'python' | 'scratch') => void;
  mini?: boolean;
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
    mini?: boolean;
    onMiniClick?: () => void;
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


      if (target.language !== 'graphical') {
        editorBar.push(BarComponent.create(Button, {
          theme,
          onClick: target.onIndentCode,
          children:
            <>
              <FontAwesome icon={faIndent} />
              {' '} {LocalizedString.lookup(tr('Indent'), locale)}
            </>
        }));
      } else {
        /* editorBar.push(BarComponent.create(Button, {
          theme,
          onClick: target.onMiniClick,
          children:
            <>
              <Fa icon={target.mini ? faExpand : faCompress} />
              {' '} {LocalizedString.lookup(target.mini ? tr('Show Toolbox') : tr('Hide Toolbox'), locale)}
            </>
        })); */
      }

      editorBar.push(BarComponent.create(Button, {
        theme,
        onClick: target.onDownloadCode,
        children:
          <>
            <FontAwesome icon={faFileDownload} />
            {' '} {LocalizedString.lookup(tr('Download'), locale)}
          </>
      }));

      editorBar.push(BarComponent.create(Button, {
        theme,
        onClick: target.onResetCode,
        children:
          <>
            <FontAwesome icon={faArrowsRotate} />
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
  'python': 'customPython',
  'c': 'customCpp',
  'cpp': 'customCpp',
  'plaintext': 'plaintext',
};

const DOCUMENTATION_LANGUAGE_MAPPING: { [key in ProgrammingLanguage | Script.Language]?: 'c' | 'python' | 'graphical' | undefined } = {
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

  private openCommonDocumentation_ = () => {
    const { word } = this.ivygate_.editor.getModel().getWordAtPosition(this.ivygate_.editor.getPosition());
    const language = DOCUMENTATION_LANGUAGE_MAPPING[this.props.language];
    if (!language) return;
    this.props.onCommonDocumentationGoToFuzzy?.(word, language);
  };


  private openDocumentationAction_?: monaco.IDisposable;
  private openCommonDocumentationAction_?: monaco.IDisposable;
  private setupCodeEditor_ = (editor: monaco.editor.IStandaloneCodeEditor) => {
    if (this.props.onDocumentationGoToFuzzy) this.openDocumentationAction_ = editor.addAction({
      id: 'open-documentation',
      label: 'Open Documentation',
      contextMenuOrder: 0,
      contextMenuGroupId: "operation",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: this.openDocumentation_,
    });
    if (this.props.onCommonDocumentationGoToFuzzy) {
      this.openCommonDocumentationAction_ = editor.addAction({
        id: 'open-common-documentation',
        label: 'Open Common Documentation',
        contextMenuOrder: 1,
        contextMenuGroupId: "operation",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
        run: this.openCommonDocumentation_,
      });
    }
  };

  private disposeCodeEditor_ = (editor: monaco.editor.IStandaloneCodeEditor) => {
    if (this.openDocumentationAction_) this.openDocumentationAction_.dispose();
    if (this.openCommonDocumentationAction_) this.openCommonDocumentationAction_.dispose();
  };

  private ivygate_: IvygateType | null = null;
  private bindIvygate_ = (ivygate: IvygateType) => {
    if (this.ivygate_ === ivygate) return;
    const old = this.ivygate_;
    this.ivygate_ = ivygate;
    if (this.ivygate_ && this.ivygate_.editor) {
      this.setupCodeEditor_(this.ivygate_.editor as unknown as monaco.editor.IStandaloneCodeEditor);
    } else {
      this.disposeCodeEditor_(old.editor as unknown as monaco.editor.IStandaloneCodeEditor);
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
      language,
      mini
    } = this.props;

    let component: JSX.Element;
    if (language === 'graphical') {
      component = (
        <GraphicalEditor
          code={code}
          onCodeChange={onCodeChange}
          theme={theme}
          toolboxHidden={mini}
        />
      );
    } else {
      component = (
        <Ivygate
          ref={this.bindIvygate_}
          code={code}
          language={IVYGATE_LANGUAGE_MAPPING[language]}
          messages={messages}
          onCodeChange={onCodeChange}
          autocomplete={autocomplete}
          theme="DARK"
          editable={true}
        />
      );
    }

    return (
      <Container theme={theme} style={style} className={className}>
        {component}
      </Container>

    );
  }
}

export default Editor;