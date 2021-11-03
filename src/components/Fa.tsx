import * as React from 'react';

import { StyleProps } from '../style';

export interface FaProps extends StyleProps {
  icon: string;
  brand?: boolean;
  onClick?: (event: React.MouseEvent<HTMLSpanElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLSpanElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLSpanElement>) => void;
  disabled?: boolean;
}

type Props = FaProps;

export class Fa extends React.PureComponent<Props> {
  render() {
    const { props } = this;
    const { className, icon, onClick, onMouseEnter, onMouseLeave, disabled, brand } = props;
    const style: React.CSSProperties = {
      ...props.style,
      cursor: onClick && !disabled ? 'pointer' : undefined,
      opacity: disabled ? 0.5 : undefined
    };
    return (
      <span
        style={style}
        onClick={!disabled ? onClick : undefined}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`${className} ${brand ? `fab` : `fas`} fa-${icon}`}
      />
    );
  }
}