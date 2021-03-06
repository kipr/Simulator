import { styled } from 'styletron-react';
import * as React from 'react';
import { ThemeProps } from '../theme';
import { StyleProps } from '../../style';
import SensorPlot from '../SensorPlot';
import BooleanPlot from '../BooleanPlot';
import { Spacer } from '../common';

export interface SensorWidgetProps extends ThemeProps, StyleProps {
  name: string;
  value: number | boolean;
  unit?: string;
}

interface SensorWidgetState {
  showGuide: boolean;
}

type Props = SensorWidgetProps;
type State = SensorWidgetState;

const Container = styled('div', ({ theme }: ThemeProps) => ({
  width: '100%',
  borderRadius: `${theme.itemPadding}px`,
  overflow: 'none',
  border: `1px solid ${theme.borderColor}`
}));

const Name = styled('span', {
  userSelect: 'none'
});

const Header = styled('div', (props: ThemeProps) => ({
  fontFamily: `'Roboto Mono', monospace`,
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  alignItems: 'center',
  fontSize: '9pt',
  padding: `${props.theme.itemPadding}px`,
  borderBottom: `1px solid ${props.theme.borderColor}`,
  backgroundColor: `rgba(0, 0, 0, 0.1)`
}));

class SensorWidget extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      showGuide: false
    };
  }

  private onMouseEnter_ = (event: React.MouseEvent<HTMLDivElement>) => {
    this.setState({
      showGuide: true
    });
  };

  private onMouseLeave_ = (event: React.MouseEvent<HTMLDivElement>) => {
    this.setState({
      showGuide: false
    });
  };

  private ref_: HTMLDivElement;
  private bindRef_ = (ref: HTMLDivElement) => {
    this.ref_ = ref;
  };

  render() {
    const { props, state } = this;
    const { style, className, theme, name, unit, value } = props;
    const { showGuide } = state;

    let plot: JSX.Element;

    switch (typeof value) {
      case 'boolean': {
        plot = <BooleanPlot value={value} theme={theme} />;
        break;
      }
      case 'number': {
        plot = <SensorPlot value={value} theme={theme} />;
        break;
      }
    }
    return (
      <>
        <Container ref={this.bindRef_} style={style} className={className} theme={theme} onMouseEnter={this.onMouseEnter_} onMouseLeave={this.onMouseLeave_}>
          <Header theme={theme}>
            <Name>{name}</Name>
            <Spacer />
            <span style={{ userSelect: 'none' }}>{typeof value === 'number' ? Math.round(value) : value}{unit}</span>
          </Header>
          {plot}
        </Container>
        {/* showGuide && this.ref_ ? <MeshScreenGuide theme={theme} from={this.ref_} to={'black satin finish plastic'} /> : undefined*/}
      </>
    );
  }
}

export default SensorWidget;