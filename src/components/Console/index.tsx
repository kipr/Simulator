import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import { StyledText } from '../../util';
import ScrollArea from '../ScrollArea';
import { Text } from '../Text';
import { ThemeProps } from '../theme';


export interface ConsoleProps extends StyleProps, ThemeProps {
  text: StyledText;
}

interface ConsoleState {
  
}

type Props = ConsoleProps;
type State = ConsoleState;

const ConsoleText = styled(Text, (props: ThemeProps) => ({
  fontFamily: `'Roboto Mono', monospace`,
  fontSize: '0.9em',
  padding: `${props.theme.itemPadding * 2}px`,
  wordWrap: 'break-word',
  display: 'block'
}));

class Console extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { style, className, theme, text } = this.props;
    return (
      <ScrollArea style={style} className={className} theme={theme} autoscroll>
        <ConsoleText theme={theme} text={text} />
      </ScrollArea>
    );
  }
}

export default Console;