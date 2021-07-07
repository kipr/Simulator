import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { Switch } from './Switch';
import { ThemeProps } from './theme';
import Field from './Field';
import ScrollArea from './ScrollArea';
import Section from './Section';
import { Spacer } from './common';
import { StyledText } from '../util';


export interface WorldProps extends StyleProps, ThemeProps {
  cans: boolean[];
  onCanChange: (index: number, enabled: boolean) => void;
}

interface WorldState {
  
}

type Props = WorldProps;
type State = WorldState;

const NAME_STYLE: React.CSSProperties = {
  fontSize: '1.2em'
};

const CANS_NAME = StyledText.text({
  text: 'Cans',
  style: NAME_STYLE
});

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1',
  color: props.theme.color,
  padding: '10px'
}));

const StyledField = styled(Field, (props: ThemeProps) => ({
  marginTop: `${props.theme.itemPadding}px`,
  ':first-child': {
    marginTop: 0
  }
}));

class World extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  private onCanChange_ = (index: number) => (value: boolean) => {
    this.props.onCanChange(index, value);
  }

  render() {
    const { style, className, theme, cans } = this.props;
    
    return (
      <ScrollArea theme={theme} style={{ flex: '1 1' }}>
        <Container theme={theme} style={style} className={className}>
          <Section theme={theme} name={CANS_NAME}>
            {cans.map((can, i) => (
              <StyledField key={i} theme={theme} name={`Can ${i}`}>
                <Spacer />
                <Switch value={can} onValueChange={this.onCanChange_(i)} theme={theme} />
              </StyledField>
            ))}
          </Section>
        </Container>
      </ScrollArea>
    );
  }
}

export default World;