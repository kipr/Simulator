import * as React from 'react';

import { styled } from 'styletron-react';
import Documentation from '../../state/State/Documentation';
import DocumentationLocation from '../../state/State/Documentation/DocumentationLocation';
import ModuleDocumentationModel from '../../state/State/Documentation/ModuleDocumentation';
import { StyleProps } from '../../style';
import Section from '../Section';
import { ThemeProps } from '../theme';
import FunctionBrief from './FunctionBrief';

export interface ModuleDocumentationProps extends StyleProps, ThemeProps {
  language: 'c' | 'python';
  module: ModuleDocumentationModel;
  documentation: Documentation;

  onDocumentationPush: (location: DocumentationLocation) => void;
}

type Props = ModuleDocumentationProps;

const Container = styled('div', {
  width: '100%',
});

const ModuleDocumentation = ({
  language,
  module,
  documentation,
  onDocumentationPush,
  style,
  className,
  theme
}: Props) => {
  return (
    <Container className={className} style={style}>
      <Section name='Functions' theme={theme}>
        {module.functions.map(id => (
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

export default ModuleDocumentation;