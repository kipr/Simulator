import * as React from 'react';

import { styled } from 'styletron-react';
import Documentation from '../../state/State/Documentation';
import DocumentationLocation from '../../state/State/Documentation/DocumentationLocation';
import FileDocumentationModel from '../../state/State/Documentation/FileDocumentation';
import { StyleProps } from '../../style';
import Section from '../Section';
import { ThemeProps } from '../theme';
import FunctionBrief from './FunctionBrief';

import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';

export interface FileDocumentationProps extends StyleProps, ThemeProps {
  language: 'c' | 'python';
  file: FileDocumentationModel;
  documentation: Documentation;
  locale: LocalizedString.Language;

  onDocumentationPush: (location: DocumentationLocation) => void;
}

type Props = FileDocumentationProps;

const Container = styled('div', {
  width: '100%',
});

const FileDocumentation = ({
  language,
  file,
  documentation,
  onDocumentationPush,
  style,
  className,
  theme,
  locale
}: Props) => {
  return (
    <Container className={className} style={style}>
      <Section name={LocalizedString.lookup(tr('Functions'), locale)} theme={theme}>
        {file.functions.map(id => (
          <FunctionBrief
            language={language}
            theme={theme}
            key={id}
            func={documentation.functions[id]}
            onClick={event => onDocumentationPush(DocumentationLocation.func({ id }))}
          />
        ))}
      </Section>
    </Container>
  );
};

export default FileDocumentation;