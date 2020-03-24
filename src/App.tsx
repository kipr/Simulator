
import * as React from 'react';
import { StyleProps } from "./style";

import compile from './compile';

import dynRequire from './require';

export interface AppProps extends StyleProps {

}

interface AppState {
  code: string;
}

type Props = AppProps;
type State = AppState;

export class App extends React.Component<Props, State> {
  constructor(props: Props, context?: any) {
    super(props, context);

    this.state = {
      code: '#include <stdio.h>\n\nint main() {\n  printf("Hello, World!\\n");\n  return 0;\n}\n'
    };
  }

  private onButtonClick_ = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const compiled = await compile(this.state.code);

    // console.log(compiled);

    const mod = dynRequire(compiled);

    mod.onRuntimeInitialized = () => {
      console.log(mod);

      mod._main();
    };
  };

  private onCodeChange_ = (event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    this.setState({
      code: event.currentTarget.value
    });
  };

  render() {
    const { props, state } = this;
    const { code } = state;
    return (

      <>
      <textarea onChange={this.onCodeChange_} value={code} />
      <button onClick={this.onButtonClick_}>Compile</button>
      </>
    )
  }
}