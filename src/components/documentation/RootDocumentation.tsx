import * as React from 'react';
import { styled } from 'styletron-react';
import Dict from '../../Dict';
import Documentation from '../../state/State/Documentation';
import DocumentationLocation from '../../state/State/Documentation/DocumentationLocation';
import Input from '../Input';
import Section from '../Section';
import { ThemeProps } from '../theme';
import FileBrief from './FileBrief';
import FunctionBrief from './FunctionBrief';

export interface RootDocumentationProps extends ThemeProps {
  documentation: Documentation;

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
  borderRadius: 0
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

  render() {
    const { props, state } = this;
    const { theme, documentation } = props;
    const { query } = state;

    let sections: JSX.Element[] = [];

    if (query.length === 0) {
      sections.push((
        <Section name='Functions' theme={theme}>
          {Dict.toList(documentation.functions)
            .sort(([idA, funcA], [idB, funcB]) => funcA.name.localeCompare(funcB.name))
            .map(([id, func]) => (
              <FunctionBrief key={id} func={func} />
            ))
          }
        </Section>
      ))
      
      sections.push((
        <Section name='Files' theme={theme}>
          {Dict.toList(documentation.files)
            .sort(([idA, fileA], [idB, fileB]) => fileA.name.localeCompare(fileB.name))
            .map(([id, file]) => (
              <FileBrief key={id} file={file} />
            ))
          }
        </Section>
      ))
    }

    return (
      <Container>
        <StyledInput
          theme={theme}
          type='text'
          onChange={this.onQueryChange_}
          value={query}
          placeholder='Search...'
        />
        {sections}
      </Container>
    );
  }
}

export default RootDocumentation;