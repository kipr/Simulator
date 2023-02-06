import * as React from 'react';

import { styled } from 'styletron-react';
import Documentation from '../../state/State/Documentation';
import DocumentationLocation from '../../state/State/Documentation/DocumentationLocation';
import StructureDocumentationModel from '../../state/State/Documentation/StructureDocumentation';
import { StyleProps } from '../../style';
import Section from '../Section';
import { ThemeProps } from '../theme';
import { ParameterName, Type } from './common';
import FunctionBrief from './FunctionBrief';
import StructureBrief from './StructureBrief';
import { toPythonType } from './util';

import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';

export interface StructureDocumentationProps extends StyleProps, ThemeProps {
  language: 'c' | 'python';
  structure: StructureDocumentationModel;
  locale: LocalizedString.Language;

  onDocumentationPush: (location: DocumentationLocation) => void;
}

type Props = StructureDocumentationProps;

const Container = styled('div', {
  width: '100%',
});

const BriefDescription = styled('p', ({ theme }: ThemeProps) => ({
  fontSize: '1.2em',
  padding: `${theme.itemPadding * 2}px`,
  margin: 0
}));

const FieldContainer = styled('div', ({ theme }: ThemeProps) => ({
  marginBottom: `${theme.itemPadding}px`,
}));

const FieldPrototype = styled('span', {
  fontSize: '1.2em',
});

const StyledStructureBrief = styled(StructureBrief, ({ theme }: ThemeProps) => ({
  fontSize: '1.5em',
  padding: `${theme.itemPadding * 2}px`
}));

const StructureDocumentation = ({
  language,
  structure,
  onDocumentationPush,
  style,
  className,
  theme,
  locale
}: Props) => {
  return (
    <Container className={className} style={style}>
      <StyledStructureBrief language={language} theme={theme} structure={structure} />
      {structure.brief_description && structure.brief_description.length > 0 && (
        <BriefDescription theme={theme}>
          {structure.brief_description}
        </BriefDescription>
      )}
      {structure.detailed_description && structure.detailed_description.length > 0 && (
        <Section name={LocalizedString.lookup(tr('Detailed Description'), locale)} theme={theme}>
          {structure.detailed_description}
        </Section>
      )}
      {structure.members.length > 0 && (
        <Section name={LocalizedString.lookup(tr('Fields'), locale)} theme={theme}>
          {language === 'c' ? (
            structure.members.map((member, index) => (
              <FieldContainer key={index} theme={theme}>
                <FieldPrototype>
                  <Type $language={language}>{member.type}</Type>
                  <ParameterName>{member.name}</ParameterName>
                </FieldPrototype>
                {member.brief_description && member.brief_description.length > 0 && (
                  <div>
                    {member.brief_description}
                  </div>
                )}
                {member.detailed_description && member.detailed_description.length > 0 && (
                  <div>
                    {member.detailed_description}
                  </div>
                )}
              </FieldContainer>
            ))
          ) : (
            structure.members.map((member, index) => (
              <FieldContainer key={index} theme={theme}>
                <FieldPrototype>
                  <ParameterName>{member.name}: </ParameterName>
                  <Type $language={language}>{toPythonType(member.type)}</Type>
                </FieldPrototype>
                {member.brief_description && member.brief_description.length > 0 && (
                  <div>
                    {member.brief_description}
                  </div>
                )}
                {member.detailed_description && member.detailed_description.length > 0 && (
                  <div>
                    {member.detailed_description}
                  </div>
                )}
              </FieldContainer>
            ))
          )}
        </Section>
      )}
    </Container>
  );
};

export default StructureDocumentation;