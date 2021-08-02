import { styled } from 'styletron-react';
import * as React from 'react';
import { ThemeProps } from '../theme';
import { StyleProps } from '../../style';
import SensorPlot from '../SensorPlot';
import BooleanPlot from '../BooleanPlot';
import { Spacer } from '../common';

import { ActionTooltip } from '../ActionTooltip';
import Tooltip from '../Tooltip';
import { StyledText } from '../../util';
import { Fa } from '../Fa';

export interface SensorWidgetProps extends ThemeProps, StyleProps {
  name: string;
  value: number | boolean;
  unit?: string;
  plotTitle?: string;
}

interface SensorWidgetState {
  showGuide: boolean;
  showActionTooltip: boolean;
  showPlot: boolean;
}

type Props = SensorWidgetProps;
type State = SensorWidgetState;

const Container = styled('div', ({ theme }: ThemeProps) => ({
  width: '100%',
  borderRadius: `${theme.itemPadding * 2}px`,
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
  padding: `${props.theme.itemPadding * 2}px`,
  borderBottom: `1px solid ${props.theme.borderColor}`,
  backgroundColor: `rgba(0, 0, 0, 0.1)`,
  ':last-child': {
    borderBottom: 'none'
  }
}));

const StyledToolIcon = styled(Fa, (props: ThemeProps & { withBorder?: boolean }) => ({
  userSelect: 'none',
  paddingLeft: !props.withBorder ? `${props.theme.itemPadding}px` : undefined,
  paddingRight: props.withBorder ? `${props.theme.itemPadding}px` : undefined,
  borderRight: props.withBorder ? `1px solid ${props.theme.borderColor}` : undefined,
}));

const ACTION_ITEMS = [
  StyledText.text({ text: 'asd' })
];

class SensorWidget extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    if (!props.plotTitle) {
      props.plotTitle = `Plot`;
    }

    this.state = {
      showGuide: false,
      showActionTooltip: false,
      showPlot: false
    };
  }

  private onMouseEnter_ = (event: React.MouseEvent<HTMLDivElement>) => {
    this.setState({
      showGuide: true,
      showActionTooltip: true
    });
  };

  private onMouseLeave_ = (event: React.MouseEvent<HTMLDivElement>) => {
    this.setState({
      showGuide: false
    });
  };

  private onActionTooltipClose_ = () => this.setState({
    showActionTooltip: false
  });

  private ref_: HTMLDivElement;
  private bindRef_ = (ref: HTMLDivElement) => {
    this.ref_ = ref;
  };

  private onShowPlotClick_ = (event: React.MouseEvent<HTMLSpanElement>) => {
    this.setState({
      showPlot: true
    });
  };

  private onHidePlotClick_ = (event: React.MouseEvent<HTMLSpanElement>) => {
    this.setState({
      showPlot: false
    });
  };

  private onTogglePlotClick_ = (event: React.MouseEvent<HTMLSpanElement>) => {
    if (this.state.showPlot) {
      this.onHidePlotClick_(event);
    } else {
      this.onShowPlotClick_(event);
    }
  };

  render() {
    const { props, state } = this;
    const { style, className, theme, name, unit, value, plotTitle } = props;
    const { showGuide, showActionTooltip, showPlot } = state;

    let plot: JSX.Element;

    const actionItems = [
      StyledText.text({
        text: plotTitle,
        style: {
          paddingRight: `${theme.itemPadding}px`
        }
      }),
      // Show Sensor plot
      StyledText.component({
        component: StyledToolIcon,
        props: {
          icon: 'eye',
          theme,
          onClick: this.onShowPlotClick_,
          disabled: showPlot,
          withBorder: true
        }
      }),
      // Hide sensor plot
      StyledText.component({
        component: StyledToolIcon,
        props: {
          icon: 'eye-slash',
          theme,
          onClick: this.onHidePlotClick_,
          disabled: !showPlot
        }
      }),
    ];

    const headerValue: number = typeof value === 'number'
      ? Math.round(value)
      : (value ? 1 : 0);

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
        <Container
          ref={this.bindRef_}
          style={style}
          className={className}
          theme={theme}
          onMouseEnter={this.onMouseEnter_}
          onMouseLeave={this.onMouseLeave_}
        >
          <Header theme={theme} onClick={this.onTogglePlotClick_}>
            <Name>{name}</Name>
            <Spacer />
            <span style={{ userSelect: 'none' }}>{headerValue}{unit}</span>
          </Header>
          {showPlot ? plot : undefined}
        </Container>
        {showActionTooltip && this.ref_ ? (
          <ActionTooltip
            theme={theme}
            target={Tooltip.Target.Element.create(this.ref_)}
            onClose={this.onActionTooltipClose_} 
            items={actionItems}
          />
        ) : null}
        {/* showGuide && this.ref_ ? <MeshScreenGuide theme={theme} from={this.ref_} to={'black satin finish plastic'} /> : undefined*/}
      </>
    );
  }
}

export default SensorWidget;