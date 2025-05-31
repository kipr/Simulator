import * as React from 'react';
import { styled } from 'styletron-react';
import { ThemeProps } from '../constants/theme';
import { Message, MessageRole } from '../../state/State/Ai';
import ReactMarkdown from 'react-markdown';
import Code from './renderer/Code';
import { FontAwesome } from '../FontAwesome';
import { faRobot, faUser } from '@fortawesome/free-solid-svg-icons';

export interface ChatMessageProps extends ThemeProps {
  message: Message;
}

interface StyleProps extends ThemeProps {
  $role: MessageRole;
}

const roleStyles = {
  [MessageRole.User]: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: 'none',
    avatarColor: '#0078d4',
  },
  [MessageRole.Assistant]: {
    backgroundColor: 'rgba(224, 124, 255, 0.15)',
    border: 'none',
    avatarColor: '#7a00a0',
  },
  [MessageRole.System]: {
    backgroundColor: 'rgba(128, 128, 128, 0.15)',
    border: 'none',
    avatarColor: '#666666',
  },
  [MessageRole.Error]: {
    backgroundColor: 'rgba(255, 0, 0, 0.15)',
    border: '1px solid rgba(255, 0, 0, 0.3)',
    avatarColor: '#d32f2f',
  },
};

const roleInitials = {
  [MessageRole.User]: 'U',
  [MessageRole.Assistant]: 'C',
  [MessageRole.System]: 'S',
  [MessageRole.Error]: '!',
};

const Container = styled('div', ({ theme, $role }: StyleProps) => ({
  display: 'flex',
  flexDirection: 'row',
  padding: `${theme.itemPadding * 2}px`,
  margin: `${theme.itemPadding * 2}px`,
  borderRadius: `${theme.borderRadius}px`,
  backgroundColor: roleStyles[$role].backgroundColor,
  border: roleStyles[$role].border,
}));

const MessageContent = styled('div', ({ theme }: ThemeProps) => ({
  flex: 1,
  marginLeft: `${theme.itemPadding * 2}px`,
  fontSize: '14px',
  lineHeight: '1.5',
  overflowWrap: 'break-word',
  whiteSpace: 'pre-wrap',
}));

const Avatar = styled('div', ({ theme, $role }: StyleProps) => ({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontWeight: 'bold',
  backgroundColor: roleStyles[$role].avatarColor,
}));

const Time = styled('div', ({ theme }: ThemeProps) => ({
  fontSize: '12px',
  color: 'rgba(255, 255, 255, 0.5)',
  marginTop: '4px',
}));

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatMessage: React.FC<ChatMessageProps> = ({ theme, message }) => {
  const initial = roleInitials[message.role];

  const renderAvatarContent = () => {
    switch (message.role) {
      case MessageRole.User:
        return <FontAwesome icon={faUser} />;
      case MessageRole.Assistant:
        return <FontAwesome icon={faRobot} />;
      default:
        return initial;
    }
  };

  const customRenderers = React.useMemo(() => ({
    code: ({ inline, className, children }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : undefined;
      const codeString = String(children).replace(/\n$/, '');
      
      return (
        <Code
          theme={theme}
          code={codeString}
          language={language}
          inline={inline}
        />
      );
    },
    pre: ({ children }: { children?: React.ReactNode }) => (
      <pre style={{ margin: 0 }}>{children}</pre>
    ),
    p: ({ children }: { children?: React.ReactNode }) => (
      <p style={{ margin: 0 }}>{children}</p>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul style={{ paddingLeft: '20px', margin: '0 0 8px 0', listStylePosition: 'outside' }}>{children}</ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol style={{ paddingLeft: '20px', margin: '0 0 8px 0', listStylePosition: 'outside' }}>{children}</ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li style={{ whiteSpace: 'normal', margin: '2px 0' }}>{children}</li>
    ),
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 style={{ margin: '16px 0 8px 0', fontWeight: 'bold' }}>{children}</h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 style={{ margin: '16px 0 8px 0', fontWeight: 'bold' }}>{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 style={{ margin: '16px 0 8px 0', fontWeight: 'bold' }}>{children}</h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4 style={{ margin: '16px 0 8px 0', fontWeight: 'bold' }}>{children}</h4>
    ),
    h5: ({ children }: { children?: React.ReactNode }) => (
      <h5 style={{ margin: '16px 0 8px 0', fontWeight: 'bold' }}>{children}</h5>
    ),
    h6: ({ children }: { children?: React.ReactNode }) => (
      <h6 style={{ margin: '16px 0 8px 0', fontWeight: 'bold' }}>{children}</h6>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote style={{
        borderLeft: '4px solid rgba(255, 255, 255, 0.3)',
        paddingLeft: '12px',
        margin: '8px 0',
        fontStyle: 'italic'
      }}>
        {children}
      </blockquote>
    ),
  }), [theme]);

  return (
    <Container theme={theme} $role={message.role}>
      <Avatar theme={theme} $role={message.role}>{renderAvatarContent()}</Avatar>
      <MessageContent theme={theme}>
        <ReactMarkdown components={customRenderers}>
          {message.content}
        </ReactMarkdown>
        <Time theme={theme}>{formatTime(message.timestamp)}</Time>
      </MessageContent>
    </Container>
  );
};

export default React.memo(ChatMessage);