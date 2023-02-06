import * as React from 'react';

import { styled } from 'styletron-react';
import Documentation from '../../state/State/Documentation';
import DocumentationLocation from '../../state/State/Documentation/DocumentationLocation';
import FunctionDocumentation from '../../state/State/Documentation/FunctionDocumentation';
import ModuleDocumentationModel from '../../state/State/Documentation/ModuleDocumentation';
import { StyleProps } from '../../style';
import Section from '../Section';
import { ThemeProps } from '../theme';
import FunctionBrief from './FunctionBrief';

import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';

export interface ModuleDocumentationProps extends StyleProps, ThemeProps {
  language: 'c' | 'python';
  module: ModuleDocumentationModel;
  documentation: Documentation;
  locale: LocalizedString.Language;

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
  theme,
  locale
}: Props) => {
  const functions: [string, FunctionDocumentation][] = module.functions.map(f => [f, documentation.functions[f]]);

  // Sort
  functions.sort(([idA, a], [idB, b]) => FunctionDocumentation.compare(a, b));

  return (
    <Container className={className} style={style}>
      <Section name={LocalizedString.lookup(tr('Functions'), locale)} theme={theme}>
        {functions.map(([id, f]) => (
          <FunctionBrief
            language={language}
            theme={theme}
            key={id}
            func={f}
            onClick={event => onDocumentationPush(DocumentationLocation.func({ id }))}
          />
        ))}
      </Section>
    </Container>
  );
};

export default ModuleDocumentation;