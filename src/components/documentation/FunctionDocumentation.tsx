import * as React from 'react';

import { styled } from 'styletron-react';
import DocumentationLocation from '../../state/State/Documentation/DocumentationLocation';
import FunctionDocumentationModel from '../../state/State/Documentation/FunctionDocumentation';
import { StyleProps } from '../../style';
import Section from '../Section';
import { ThemeProps } from '../theme';
import { ParameterName, Type } from './common';
import FunctionPrototype from './FunctionPrototype';
import { toPythonType } from './util';

import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';

export interface FunctionDocumentationProps extends StyleProps, ThemeProps {
  language: 'c' | 'python';
  func: FunctionDocumentationModel;
  locale: LocalizedString.Language;

  onDocumentationPush: (location: DocumentationLocation) => void;
}

type Props = FunctionDocumentationProps;

const Container = styled('div', {
  width: '100%',
});

const StyledFunctionPrototype = styled(FunctionPrototype, ({ theme }: ThemeProps) => ({
  fontSize: '1.5em',
  padding: `${theme.itemPadding * 2}px`
}));

const BriefDescription = styled('p', ({ theme }: ThemeProps) => ({
  fontSize: '1.2em',
  padding: `${theme.itemPadding * 2}px`,
  margin: 0
}));

const ParameterContainer = styled('div', ({ theme }: ThemeProps) => ({
  marginBottom: `${theme.itemPadding}px`,
}));

const ParameterPrototype = styled('span', {
  fontSize: '1.2em',
});

const FunctionDocumentation = ({ language, func, style, className, theme, locale }: Props) => {
  return (
    <Container className={className} style={style}>
      <StyledFunctionPrototype language={language} theme={theme} func={func} />
      {func.brief_description && func.brief_description.length > 0 && (
        <BriefDescription theme={theme}>
          {func.brief_description}
        </BriefDescription>
      )}
      {func.detailed_description && func.detailed_description.length > 0 && (
        <Section name={LocalizedString.lookup(tr('Detailed Description'), locale)} theme={theme}>
          {func.detailed_description}
        </Section>
      )}
      {func.parameters.length > 0 && (
        <Section name={LocalizedString.lookup(tr('Parameters'), locale)} theme={theme}>
          {language === 'c' ? (
            func.parameters.map((parameter, index) => (
              <ParameterContainer key={index} theme={theme}>
                <ParameterPrototype>
                  <Type $language={language}>{parameter.type}</Type>
                  <ParameterName>{parameter.name}</ParameterName>
                </ParameterPrototype>
                {parameter.description && (
                  <div>
                    {parameter.description}
                  </div>
                )}
              </ParameterContainer>
            ))
          ) : (
            func.parameters.map((parameter, index) => (
              <ParameterContainer key={index} theme={theme}>
                <ParameterPrototype>
                  <ParameterName>{parameter.name}: </ParameterName>
                  <Type $language={language}>{toPythonType(parameter.type)}</Type>
                </ParameterPrototype>
                {parameter.description && (
                  <div>
                    {parameter.description}
                  </div>
                )}
              </ParameterContainer>
            ))
          )}
        </Section>
      )}
      {func.return_type !== 'void' && (
        <Section name={LocalizedString.lookup(tr('Return Value'), locale)} theme={theme}>
          <ParameterPrototype>
            <Type $language={language}>{language === 'c' ? func.return_type : toPythonType(func.return_type)}</Type>
          </ParameterPrototype>
          {func.return_description && (
            <div>
              {func.return_description}
            </div>
          )}
        </Section>
      )}

    </Container>
  );
};

export default FunctionDocumentation;
