import * as React from 'react';
import { styled } from 'styletron-react';
import { ThemeProps } from '../../constants/theme';
import * as monaco from 'monaco-editor';
import deepNeq from '../../../util/redux/deepNeq';

export interface MonacoCodeRendererProps extends ThemeProps {
  code: string;
  language?: string;
  inline?: boolean;
}

interface StyleProps extends ThemeProps {
  $inline: boolean;
}

const Container = styled('div', ({ theme, $inline }: StyleProps) => ({
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: `${theme.borderRadius}px`,
  overflow: 'hidden',
  margin: $inline ? '0 2px' : '8px 0',
  display: $inline ? 'inline-block' : 'block',
  minHeight: $inline ? 'auto' : '100px',
  maxHeight: $inline ? 'auto' : '400px',
}));

const InlineCode = styled('code', ({ theme }: ThemeProps) => ({
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  padding: '2px 4px',
  borderRadius: '3px',
  fontFamily: 'monospace',
  fontSize: '0.9em',
}));

// Language mapping similar to Editor component
const LANGUAGE_MAPPING: { [key: string]: string } = {
  'javascript': 'javascript',
  'js': 'javascript',
  'typescript': 'typescript',
  'ts': 'typescript',
  'python': 'python',
  'py': 'python',
  'c': 'c',
  'cpp': 'cpp',
  'c++': 'cpp',
  'java': 'java',
  'json': 'json',
  'html': 'html',
  'css': 'css',
  'xml': 'xml',
  'markdown': 'markdown',
  'md': 'markdown',
  'bash': 'shell',
  'sh': 'shell',
  'shell': 'shell',
};

const Code: React.FC<MonacoCodeRendererProps> = ({ theme, code, language, inline }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const adjustHeight = React.useCallback(() => {
    if (!editorRef.current || !containerRef.current) return;

    const lineCount = editorRef.current.getModel()?.getLineCount() || 1;
    const lineHeight = editorRef.current.getOption(monaco.editor.EditorOption.lineHeight);
    const padding = 16; // Some padding for borders and scrollbars
    
    // Limit height to reasonable bounds
    const maxLines = 20;
    const actualLines = Math.min(lineCount, maxLines);
    const height = Math.max(100, actualLines * lineHeight + padding);
    
    containerRef.current.style.height = `${height}px`;
    editorRef.current.layout();
  }, []);

  // Create editor effect
  React.useEffect(() => {
    if (inline || !containerRef.current || editorRef.current) return;

    const monacoLanguage = LANGUAGE_MAPPING[language?.toLowerCase() || ''] || 'plaintext';

    editorRef.current = monaco.editor.create(containerRef.current, {
      value: code,
      language: monacoLanguage,
      theme: 'vs-dark',
      readOnly: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      lineNumbers: 'on',
      glyphMargin: false,
      folding: false,
      lineDecorationsWidth: theme.itemPadding * 2,
      lineNumbersMinChars: 3,
      renderLineHighlight: 'none',
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
      },
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
      overviewRulerBorder: false,
      wordWrap: 'on',
      fontSize: 12,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    });

    adjustHeight();

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  }, [inline]); // Only recreate if inline changes

  // Update editor content effect
  React.useEffect(() => {
    if (!editorRef.current || inline) return;

    const monacoLanguage = LANGUAGE_MAPPING[language?.toLowerCase() || ''] || 'plaintext';
    const model = editorRef.current.getModel();
    
    if (model) {
      model.setValue(code);
      monaco.editor.setModelLanguage(model, monacoLanguage);
    }

    adjustHeight();
  }, [code, language, adjustHeight, inline]);

  if (inline) {
    return (
      <InlineCode theme={theme}>
        {code}
      </InlineCode>
    );
  }

  return (
    <Container theme={theme} $inline={false} ref={containerRef} />
  );
};

export default React.memo(Code, (prevProps, props) => !deepNeq(prevProps, props)); 