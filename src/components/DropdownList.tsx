import * as React from 'react';
import { styled } from 'styletron-react';
import { StyleProps } from '../style';
import { ThemeProps } from './theme';

export interface DropdownListProps extends ThemeProps, StyleProps {
  value: string;
  options: OptionDefinition[];

  onValueChange: (value: string) => void;
}

export interface OptionDefinition {
  displayName: string;
  value: string;
}

const Container = styled('div', {
  height: '20px',
  paddingLeft: '10px',
  paddingRight: '10px',
  width: 'calc(100% - 80px)',
  cursor: 'pointer'
});

export class DropdownList extends React.PureComponent<DropdownListProps> {
  private onValueChange_ = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.onValueChange(event.target.value);
  };

  render() {
    const { props } = this;
    const { value, options, style, className } = props;
    return (
      <Container style={style} className={className}>
        <select value={value} onChange={this.onValueChange_}>
          {options.map((option) => (
            <option value={option.value} key={option.value}>{option.displayName}</option>
          ))}
        </select>
      </Container>
    );
  }
}