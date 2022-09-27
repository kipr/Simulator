import * as React from 'react';
import { styled, withStyleDeep } from 'styletron-react';
import { StyleProps } from '../../style';
import Charm from '../Charm';
import { ThemeProps } from '../theme';
import { charmColor } from '../charm-util';
import ComboBox from '../ComboBox';
import ProgrammingLanguage from '../../ProgrammingLanguage';

export interface LanguageSelectCharmProps extends StyleProps, ThemeProps {
  language: ProgrammingLanguage;

  onLanguageChange: (language: ProgrammingLanguage) => void;
}

type Props = LanguageSelectCharmProps;

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'row',
});

const OPTIONS: ComboBox.Option[] = [{
  text: 'C',
  data: 'c'
}, {
  text: 'C++',
  data: 'cpp'
}, {
  text: 'Python',
  data: 'python'
}];

const Label = styled('div', {
  marginRight: '5px'
});

const StyledComboBox = styled(ComboBox, {
  padding: 0,
});

class LanguageSelectCharm extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  private onSelect_ = (index: number, option: ComboBox.Option) => {
    const { props } = this;
    const { onLanguageChange } = props;

    onLanguageChange(option.data as ProgrammingLanguage);
  };

  render() {
    const { props } = this;
    const {
      theme,
      language,
      onLanguageChange
    } = props;

    const index = OPTIONS.findIndex(option => option.data === language);

    return (
      <Container>
        <StyledComboBox
          minimal
          options={OPTIONS}
          onSelect={this.onSelect_}
          index={index}
          theme={theme}
        />
      </Container>
    );
  }
}

export default LanguageSelectCharm;