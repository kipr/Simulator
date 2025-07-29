import * as React from 'react';
import { useEffect } from 'react';
import * as ReactDOM from 'react-dom';

export interface AiRootProps {
  children: React.ReactNode;
}

const AI_ROOT = document.getElementById('ai-root');

// Static methods
export const isActive = () => AI_ROOT.children.length !== 0;
export const isVisible = () => AI_ROOT.childElementCount > 0;

const AiRoot: React.FC<AiRootProps> = ({ children }) => {
  useEffect(() => {
    AI_ROOT.style.opacity = '1';
    return () => {
      AI_ROOT.style.opacity = '0';
    };
  }, []);

  return ReactDOM.createPortal(children, AI_ROOT);
};

export default AiRoot; 