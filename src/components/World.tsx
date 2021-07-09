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
import { DropdownList, OptionDefinition } from './DropdownList';
import { SurfaceStatePresets } from '../SurfaceState';


export interface WorldProps extends StyleProps, ThemeProps {
  cans: boolean[];
  surfaceName: string;

  onCanChange: (index: number, enabled: boolean) => void;
  onSurfaceChange: (surfaceName: string) => void;
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

const SURFACE_NAME = StyledText.text({
  text: 'Surface',
  style: NAME_STYLE
});

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1',
  color: props.theme.color,
  padding: '10px'
}));

const StyledSection = styled(Section, {
  marginTop: '10px',
  ':first-child': {
    marginTop: 0
  },
});

const StyledField = styled(Field, (props: ThemeProps) => ({
  marginTop: `${props.theme.itemPadding}px`,
  ':first-child': {
    marginTop: 0
  }
}));

const SURFACE_OPTIONS: OptionDefinition[] = [
  { displayName: SurfaceStatePresets.jbcA.surfaceName, value: SurfaceStatePresets.jbcA.surfaceName },
  { displayName: SurfaceStatePresets.jbcB.surfaceName, value: SurfaceStatePresets.jbcB.surfaceName }
];

class World extends React.PureComponent<Props, State> {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(props: Props) {
    super(props);
  }

  private onCanChange_ = (index: number) => (value: boolean) => {
    this.props.onCanChange(index, value);
  };

  private onSurfaceChange_ = (newSurfaceName: string) => {
    this.props.onSurfaceChange(newSurfaceName);
  };

  render() {
    const { style, className, theme, cans, surfaceName } = this.props;
    
    return (
      <ScrollArea theme={theme} style={{ flex: '1 1' }}>
        <Container theme={theme} style={style} className={className}>
          <StyledSection theme={theme} name={CANS_NAME}>
            {cans.map((can, i) => (
              <StyledField key={i} theme={theme} name={`Can ${i}`}>
                <Spacer />
                <Switch value={can} onValueChange={this.onCanChange_(i)} theme={theme} />
              </StyledField>
            ))}
          </StyledSection>
          <StyledSection theme={theme} name={SURFACE_NAME}>
            <StyledField theme={theme} name={'Surface:'}>
              <DropdownList theme={theme} value={surfaceName} options={SURFACE_OPTIONS} onValueChange={this.onSurfaceChange_} />
            </StyledField>
          </StyledSection>
        </Container>
      </ScrollArea>
    );
  }
}

export default World;