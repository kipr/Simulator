import * as React from 'react';
import { ThemeProps } from './theme';

export interface SettingsProps extends ThemeProps {

}

interface SettingsState {

}

type Props = SettingsProps;
type State = SettingsState;

class Settings extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    return (
      null
    );
  }
}