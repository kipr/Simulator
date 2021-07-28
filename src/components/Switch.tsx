import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { ThemeProps } from './theme';

export interface SwitchProps extends ThemeProps, StyleProps {
  value: boolean;

  onValueChange: (value: boolean) => void;
}

type Props = SwitchProps;

const Container = styled('div', {
  height: '40px',
  paddingTop: '20px',
  paddingBottom: '20px',
  paddingLeft: '10px',
  paddingRight: '10px',
  cursor: 'pointer'
});

const Bar = styled('div', (props: ThemeProps & { value: boolean }) => ({
  position: 'relative',
  width: '30px',
  height: '10px',
  borderRadius: '5px',
  backgroundColor: props.value ? props.theme.switch.on.secondary : props.theme.switch.off.secondary,
  transition: 'background-color 0.2s',
  transform: 'translateY(-50%)',

}));

const Toggle = styled('div', (props: ThemeProps & { value: boolean }) => ({
  position: 'absolute',
  top: '50%',
  left: !props.value ? '5px' : '25px',
  width: '20px',
  height: '20px',
  borderRadius: '100%',
  backgroundColor: props.value ? props.theme.switch.on.primary : props.theme.switch.off.primary,
  transform: 'translate(-50%, -50%)',
  transition: 'left 0.2s, background-color 0.2s'
}));

export class Switch extends React.PureComponent<Props> {
  private onClick_ = () => {
    this.props.onValueChange(!this.props.value);
  };

  render() {
    const { props } = this;
    const { value, theme, style, className } = props;
    return (
      <Container onClick={this.onClick_} style={style} className={className}>
        <Bar theme={theme} value={value}>
          <Toggle theme={theme} value={value} />
        </Bar>
      </Container>
    );
  }
}