import * as React from 'react';
import { styled } from 'styletron-react';
import { ThemeProps } from '../constants/theme';
import { Message, MessageRole } from '../../state/State/Ai';
import ReactMarkdown from 'react-markdown';

export interface ChatMessageProps extends ThemeProps {
  message: Message;
}

interface StyleProps extends ThemeProps {
  $isUser: boolean;
}

const Container = styled('div', ({ theme, $isUser }: StyleProps) => ({
  display: 'flex',
  flexDirection: 'row',
  padding: `${theme.itemPadding * 2}px`,
  marginBottom: `${theme.itemPadding}px`,
  borderRadius: `${theme.borderRadius}px`,
  backgroundColor: $isUser ? `rgba(0, 0, 0, 0.1)` : `rgba(122, 0, 160, 0.05)`,
}));

const MessageContent = styled('div', ({ theme }: ThemeProps) => ({
  flex: 1,
  marginLeft: `${theme.itemPadding}px`,
  fontSize: '14px',
  lineHeight: '1.5',
  overflowWrap: 'break-word',
  whiteSpace: 'pre-wrap',
}));

const Avatar = styled('div', ({ theme, $isUser }: StyleProps) => ({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontWeight: 'bold',
  backgroundColor: $isUser ? '#0078d4' : '#7a00a0',
}));

const Time = styled('div', ({ theme }: ThemeProps) => ({
  fontSize: '12px',
  color: 'rgba(0, 0, 0, 0.5)',
  marginTop: '4px',
}));

const MarkdownContainer = styled('div', ({ theme }: ThemeProps) => ({
  '& pre': {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: '8px',
    borderRadius: '4px',
    overflowX: 'auto',
  },
  '& code': {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: '2px 4px',
    borderRadius: '3px',
    fontFamily: 'monospace',
  },
  '& p': {
    margin: '0 0 8px 0',
  },
  '& ul, & ol': {
    paddingLeft: '20px',
    margin: '0 0 8px 0',
  },
}));

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatMessage: React.FC<ChatMessageProps> = ({ theme, message }) => {
  const isUser = message.role === MessageRole.User;
  const initial = isUser ? 'U' : 'C';

  return (
    <Container theme={theme} $isUser={isUser}>
      <Avatar theme={theme} $isUser={isUser}>{initial}</Avatar>
      <MessageContent theme={theme}>
        {isUser ? (
          message.content
        ) : (
          <MarkdownContainer theme={theme}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </MarkdownContainer>
        )}
        <Time theme={theme}>{formatTime(message.timestamp)}</Time>
      </MessageContent>
    </Container>
  );
};

export default ChatMessage;