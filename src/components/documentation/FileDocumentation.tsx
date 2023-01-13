import * as React from 'react';

import { styled } from 'styletron-react';
import Documentation from '../../state/State/Documentation';
import DocumentationLocation from '../../state/State/Documentation/DocumentationLocation';
import FileDocumentationModel from '../../state/State/Documentation/FileDocumentation';
import { StyleProps } from '../../style';
import Section from '../Section';
import { ThemeProps } from '../theme';
import FunctionBrief from './FunctionBrief';

export interface FileDocumentationProps extends StyleProps, ThemeProps {
  file: FileDocumentationModel;
  documentation: Documentation;

  onDocumentationPush: (location: DocumentationLocation) => void;
}

type Props = FileDocumentationProps;

const Container = styled('div', {
  width: '100%',
});

const FileDocumentation = ({
  file,
  documentation,
  onDocumentationPush,
  style,
  className,
  theme
}: Props) => {
  return (
    <Container className={className} style={style}>
      <Section name='Functions' theme={theme}>
        {file.functions.map(id => (
          <FunctionBrief
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