import { styled } from 'styletron-react';
import * as React from 'react';
import { ThemeProps } from '../constants/theme';
import { StyleProps } from '../../util/style';
import SensorPlot from './SensorPlot';
import BooleanPlot from '../interface/BooleanPlot';
import { Spacer } from '../constants/common';

// import { ActionTooltip } from './ActionTooltip';
// import Tooltip from './Tooltip';
import { StyledText } from '../../util';
import { FontAwesome } from '../FontAwesome';

import Dict from "../../util/objectOps/Dict";
import tr from '@i18n';

// import { connect } from 'react-redux';
// import { State as ReduxState } from '../../state';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import LocalizedString from '../../util/LocalizedString';
import { ACTIVE_SPACE } from '../../simulator/Space';

export interface SensorWidgetProps extends ThemeProps, StyleProps {
  name: string;
  value: number | boolean;
  unit?: string;
  plotTitle?: string;
  locale: LocalizedString.Language;
}

interface SensorWidgetState {
  showGuide: boolean;
  showActionTooltip: boolean;
  showPlot: boolean;
  hlHandle: number | null;
}

type Props = SensorWidgetProps;
type State = SensorWidgetState;

const Fieldset = styled('div', ({ theme }: ThemeProps) => ({
  margin: 10,
  paddingHorizontal: 10,
  paddingBottom: 10,
  borderRadius: 5,
  borderWidth: 1,
  borderColor: `${theme.borderColor}`,
  width: '100%',
}));

const Container = styled('div', ({ theme }: ThemeProps) => ({
  width: '100%',
  borderRadius: `${theme.itemPadding * 2}px`,
  overflow: 'none',
}));

const Legend = styled('div', ({ theme }: ThemeProps) => ({
  fontSize: '11pt',
  position: 'relative',
  top: '0.5em',
  left: '1em',
  width: 'max-content',
  paddingLeft: '0.25em',
  paddingRight: '0.25em',
  backgroundColor: `${theme.backgroundColor}`,
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

const StyledToolIcon = styled(FontAwesome, (props: ThemeProps & { withBorder?: boolean }) => ({
  userSelect: 'none',
  paddingLeft: !props.withBorder ? `${props.theme.itemPadding}px` : undefined,
  paddingRight: props.withBorder ? `${props.theme.itemPadding}px` : undefined,
  borderRight: props.withBorder ? `1px solid ${props.theme.borderColor}` : undefined,
}));

const ACTION_ITEMS = [
  StyledText.text({ text: 'asd' })
];

const portMeshMap: Dict<string> = {
  'get_servo_position(0)': 'arm_primitive0_merged',
  'get_servo_position(3)': 'Claw_primitive0_merged',
  'motor 0': 'Wheel_primitive0_merged',
  'motor 3': 'Wheel_primitive0_merged',
};

class SensorWidget extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    if (!props.plotTitle) {
      props.plotTitle = `Plot`;
    }

    this.state = {
      showGuide: false,
      showActionTooltip: false,
      showPlot: false,
      hlHandle: null,
    };
  }


  private onMouseEnter_ = (event: React.MouseEvent<HTMLDivElement>, props: SensorWidgetProps) => {
    this.setState({
      showGuide: true,
      showActionTooltip: true,

      hlHandle: window.setTimeout(() => {
        const mesh = portMeshMap[props.name];
        if (mesh) {
          // Both wheels have the mesh ID 'Wheel_primitive0_merged', so use idx
          // to distinguish between them.
          const idx = props.name === 'motor 3' ? 1 : 0;
          ACTIVE_SPACE.highlight(mesh, idx);
        }
      }, 1000),

    });
  };

  private onMouseLeave_ = (event: React.MouseEvent<HTMLDivElement>, props: SensorWidgetProps) => {
    clearTimeout(this.state.hlHandle);
    this.setState({
      showGuide: false,
      hlHandle: null,
    });

    const mesh = portMeshMap[props.name];
    if (mesh) {
      window.setTimeout(() => {
        const idx = props.name === 'motor 3' ? 1 : 0;
        ACTIVE_SPACE.unhighlight(mesh, idx);
      }, 1000);
    }
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
    const { style, className, theme, name, unit, value, plotTitle, locale } = props;
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
          icon: faEye,
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
          icon: faEyeSlash,
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

    const USED_PORTS: Dict<string> = {
      'get_servo_position(0)': LocalizedString.lookup(tr('Arm'), locale),
      'get_servo_position(3)': LocalizedString.lookup(tr('Claw'), locale),
      'motor 0': LocalizedString.lookup(tr('Left wheel'), locale),
      'motor 3': LocalizedString.lookup(tr('Right wheel'), locale),
      'analog(0)': LocalizedString.lookup(tr('Rangefinder'), locale),
      'analog(1)': LocalizedString.lookup(tr('Reflectance'), locale),
      'analog(2)': LocalizedString.lookup(tr('Light'), locale),
      'digital(0)': LocalizedString.lookup(tr('Limit switch'), locale),
      'digital(1)': LocalizedString.lookup(tr('Left touch'), locale),
      'digital(2)': LocalizedString.lookup(tr('Right touch'), locale),
    };

    const portName = USED_PORTS[name];

    const inner: JSX.Element = (
      <>
        <Container
          ref={this.bindRef_}
          $style={{ border: portName ? '1px solid #16fc50' : `1px solid ${theme.borderColor}` }}
          className={className}
          theme={theme}
          onMouseEnter={(e) => this.onMouseEnter_(e, props)}
          onMouseLeave={(e) => this.onMouseLeave_(e, props)}
        >
          <Header theme={theme} onClick={this.onTogglePlotClick_}>
            <Name>{name}</Name>
            <Spacer />
            <span style={{ userSelect: 'none' }}>{headerValue}{unit}</span>
          </Header>
          {showPlot ? plot : undefined}
        </Container>
        {/* showGuide && this.ref_ ? <MeshScreenGuide theme={theme} from={this.ref_} to={'black satin finish plastic'} /> : undefined*/}
      </>
    );

    if (portName) {
      return (
        <>
          <Fieldset theme={theme}>
            <Legend theme={theme}>{portName}</Legend>
            {inner}
          </Fieldset>
        </>
      );
    } else {
      return inner;
    }
  }
}

export default SensorWidget;
