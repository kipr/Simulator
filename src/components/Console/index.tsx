import * as React from 'react';

import { styled } from 'styletron-react';
import { StyleProps } from '../../style';
import { StyledText } from '../../util';
import ScrollArea from '../ScrollArea';
import { Text } from '../Text';
import { Theme, ThemeProps } from '../theme';

import { Fa } from '../Fa';
import { Button } from '../Button';
import { BarComponent } from '../Widget';

import { faFile } from '@fortawesome/free-solid-svg-icons';
import LocalizedString from '../../util/LocalizedString';
import tr from '@i18n';

export const createConsoleBarComponents = (
  theme: Theme, 
  onClearConsole: () => void,
  locale: LocalizedString.Language
) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const consoleBar: BarComponent<object>[] = [];

  consoleBar.push(BarComponent.create(Button, {
    theme,
    onClick: onClearConsole,
    children:
      <>
        <Fa icon={faFile} />
        {' '} {LocalizedString.lookup(tr('Clear'), locale)}
      </>,
  }));

  return consoleBar;
};

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

export class Console extends React.PureComponent<Props, State> {
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