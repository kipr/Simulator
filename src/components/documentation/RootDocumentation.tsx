import * as React from 'react';
import { styled } from 'styletron-react';
import Dict from '../../Dict';
import Documentation from '../../state/State/Documentation';
import DocumentationLocation from '../../state/State/Documentation/DocumentationLocation';
import FileDocumentation from '../../state/State/Documentation/FileDocumentation';
import FunctionDocumentation from '../../state/State/Documentation/FunctionDocumentation';
import Input from '../Input';
import Section from '../Section';
import { ThemeProps } from '../theme';
import FileBrief from './FileBrief';
import FunctionBrief from './FunctionBrief';

import Color from 'colorjs.io';
import ModuleDocumentation from '../../state/State/Documentation/ModuleDocumentation';
import ModuleBrief from './ModuleBrief';
import StructureDocumentation from '../../state/State/Documentation/StructureDocumentation';
import StructureBrief from './StructureBrief';
import EnumerationBrief from './EnumerationBrief';
import EnumerationDocumentation from '../../state/State/Documentation/EnumerationDocumentation';

import tr from '@i18n';
import LocalizedString from '../../util/LocalizedString';

export interface RootDocumentationProps extends ThemeProps {
  language: 'c' | 'python';
  documentation: Documentation;
  locale: LocalizedString.Language;
  onDocumentationPush: (location: DocumentationLocation) => void;
}

interface RootDocumentationState {
  query: string;
}

type Props = RootDocumentationProps;
type State = RootDocumentationState;

const Container = styled('div', {
  width: '100%',
});

const StyledInput = styled(Input, ({ theme }: ThemeProps) => ({
  borderLeft: 'none',
  borderRight: 'none',
  borderTop: 'none',
  borderBottom: `1px solid ${theme.borderColor}`,
  borderRadius: 0,
  position: 'sticky',
  top: 0,
  backgroundColor: new Color(theme.backgroundColor).darken(0.1)
    .toString(),
}));

const StyledFileBrief = styled(FileBrief, ({ theme }: ThemeProps) => ({
  marginBottom: `${theme.itemPadding}px`
}));


class RootDocumentation extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      query: ''
    };
  }

  private onQueryChange_ = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ query: event.target.value });
  };

  private onFunctionClick_ = (id: string) => (event: React.MouseEvent) => {
    this.props.onDocumentationPush(DocumentationLocation.func({ id }));
  };

  private onStructureClick_ = (id: string) => (event: React.MouseEvent) => {
    this.props.onDocumentationPush(DocumentationLocation.structure({ id }));
  };

  private onEnumerationClick_ = (id: string) => (event: React.MouseEvent) => {
    this.props.onDocumentationPush(DocumentationLocation.enumeration({ id }));
  };

  private onFileClick_ = (id: string) => (event: React.MouseEvent) => {
    this.props.onDocumentationPush(DocumentationLocation.file({ id }));
  };

  private onModuleClick_ = (id: string) => (event: React.MouseEvent) => {
    this.props.onDocumentationPush(DocumentationLocation.module({ id }));
  };

  render() {
    const { props, state } = this;
    const { theme, documentation, language, locale } = props;
    const { query } = state;

    const sections: JSX.Element[] = [];

    const modules = Dict.toList(documentation.modules)
      .sort(([idA, a], [idB, b]) => ModuleDocumentation.compare(a, b))
      .filter(([id, f]) => f.name.search(new RegExp(query, 'i')) !== -1);

    let first = true;

    if (modules.length > 0) {
      sections.push((
        <Section name={LocalizedString.lookup(tr('Modules'), locale)} theme={theme} noBorder={first} key='modules'>
          {modules.map(([id, module]) => (
            <ModuleBrief
              theme={theme}
              key={id}
              module={module}
              onClick={this.onModuleClick_(id)}
            />
          ))}
        </Section>
      ));
      first = false;
    }

    const functions = Dict.toList(documentation.functions)
      .sort(([idA, a], [idB, b]) => FunctionDocumentation.compare(a, b))
      .filter(([id, f]) => f.name.search(new RegExp(query, 'i')) !== -1);

    if (functions.length > 0) {
      sections.push((
        <Section name={LocalizedString.lookup(tr('Functions'), locale)} theme={theme} noBorder={first} key='functions'>
          {functions.map(([id, func]) => (
            <FunctionBrief
              language={language}
              theme={theme}
              key={id}
              func={func}
              onClick={this.onFunctionClick_(id)}
            />
          ))}
        </Section>
      ));
      first = false;
    }

    const structures = Dict.toList(documentation.structures)
      .sort(([idA, a], [idB, b]) => StructureDocumentation.compare(a, b))
      .filter(([id, f]) => f.name.search(new RegExp(query, 'i')) !== -1);

    if (structures.length > 0) {
      sections.push((
        <Section name={LocalizedString.lookup(tr('Structures'), locale)} theme={theme} noBorder={first} key='structures'>
          {structures.map(([id, structure]) => (
            <StructureBrief
              language={language}
              theme={theme}
              key={id}
              structure={structure}
              onClick={this.onStructureClick_(id)}
            />
          ))}
        </Section>
      ));
      first = false;
    }

    const enumerations = Dict.toList(documentation.enumerations)
      .sort(([idA, a], [idB, b]) => EnumerationDocumentation.compare(a, b))
      .filter(([id, f]) => f.name.search(new RegExp(query, 'i')) !== -1);

    if (enumerations.length > 0) {
      sections.push((
        <Section name={LocalizedString.lookup(tr('Enumerations'), locale)} theme={theme} noBorder={first} key='enumerations'>
          {enumerations.map(([id, enumeration]) => (
            <EnumerationBrief
              language={language}
              theme={theme}
              key={id}
              enumeration={enumeration}
              onClick={this.onEnumerationClick_(id)}
            />
          ))}
        </Section>
      ));
      first = false;
    }
    
    const files = Dict.toList(documentation.files)
      .sort(([idA, a], [idB, b]) => FileDocumentation.compare(a, b))
      .filter(([id, f]) => f.name.search(new RegExp(query, 'i')) !== -1);

    if (files.length > 0) {
      sections.push((
        <Section name={LocalizedString.lookup(tr('Files'), locale)} theme={theme} noBorder={first} key='files'>
          {files.map(([id, file]) => (
            <StyledFileBrief
              language={language}
              theme={theme}
              key={id}
              file={file}
              onClick={this.onFileClick_(id)}
            />
          ))}
        </Section>
      ));
      first = false;
    }

    return (
      <Container>
        <StyledInput
          theme={theme}
          type='text'
          onChange={this.onQueryChange_}
          value={query}
          placeholder={LocalizedString.lookup(tr('Search...'), locale)}
        />
        {sections}
      </Container>
    );
  }
}

export default RootDocumentation;