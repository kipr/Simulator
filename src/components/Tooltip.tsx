import * as React from 'react';

import { ThemeProps } from "./theme";

import { createPortal } from 'react-dom';

export interface TooltipProps extends ThemeProps {

}

interface TooltipState {

}

type Props = TooltipProps;
type State = TooltipState;

class Tooltip extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return null;
  }
}