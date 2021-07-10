// Parses clang error messages

import { Message } from 'ivygate';
import { StyledText } from './StyledText';

export const hasErrors = (messages: Message[]) => {
  for (const message of messages) {
    if (message.severity === 'error') return true;
  }
  return false;
};

export const hasWarnings = (messages: Message[]) => {
  for (const message of messages) {
    if (message.severity === 'warning') return true;
  }
  return false;
};


export default (stderr: string) => {
  const lines = stderr.split('\n');
  
  const ret: Message[] = [];
  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];
    const parts = line.split(':');
    
    if (parts.length < 5) continue;

    const lineNumber = +parts[1];
    const column = +parts[2];
    const type = parts[3].trim();
    const message = parts[4].trim();

    
    const end: Message.Index = {
      line: lineNumber,
      col: column
    };

    const nextLine = lines[++i];
    if (typeof nextLine === 'string') {
      end.col = nextLine.length + 1;
    }

    switch (type) {
      case 'fatal error':
      case 'error': {
        ret.push({
          severity: 'error', 
          ranges: [{
            start: {
              line: lineNumber,
              col: column
            },
            end
          }],
          message
        });
        break;
      }
      case 'warning': {
        ret.push({
          severity: 'warning', 
          ranges: [{
            start: {
              line: lineNumber,
              col: column
            },
            end
          }],
          message
        });
        break;
      }
    }
  }

  return ret;
};

const ERROR_STYLE = (props: React.HTMLProps<HTMLSpanElement>): React.CSSProperties => ({
  color: 'red',
  cursor: props && props.onClick ? 'pointer' : undefined
});

const WARNING_STYLE = (props: React.HTMLProps<HTMLSpanElement>): React.CSSProperties => ({
  color: 'yellow',
  cursor: props && props.onClick ? 'pointer' : undefined
});

const INFO_STYLE = (props: React.HTMLProps<HTMLSpanElement>): React.CSSProperties => ({
  color: 'white',
  cursor: props && props.onClick ? 'pointer' : undefined
});

const ORDERING = {
  error: 0,
  warning: 1,
  info: 2
};

export const sort = (message: Message[]) => message.sort((a, b) => ORDERING[a.severity] - ORDERING[b.severity]);

export const toStyledText = (message: Message, props?: React.HTMLProps<HTMLSpanElement>) => {
  switch (message.severity) {
    case 'error': return StyledText.text({
      text: `${message.message}\n`,
      style: ERROR_STYLE(props),
      props
    });
    case 'warning': return StyledText.text({
      text: `${message.message}\n`,
      style: WARNING_STYLE(props),
      props
    });
    case 'info': return StyledText.text({
      text: `${message.message}\n`,
      style: INFO_STYLE(props),
      props
    });
  }
};