import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';

import { StyleProps } from '../style';

export interface FaProps extends StyleProps {
  icon: IconProp;
  onClick?: (event: React.MouseEvent<SVGSVGElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<SVGSVGElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<SVGSVGElement>) => void;
  disabled?: boolean;
}

type Props = FaProps;

export class Fa extends React.PureComponent<Props> {
  render() {
    const { props } = this;
    const { className, icon, onClick, onMouseEnter, onMouseLeave, disabled } = props;
    const style: React.CSSProperties = {
      ...props.style,
      cursor: onClick && !disabled ? 'pointer' : undefined,
      opacity: disabled ? 0.5 : undefined
    };
    return (
      <FontAwesomeIcon
        icon={icon}
        style={style}
        onClick={!disabled ? onClick : undefined}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={className}
      />
    );
  }
}