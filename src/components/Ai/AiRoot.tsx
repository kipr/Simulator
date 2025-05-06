import * as React from 'react';
import { useState, useEffect } from 'react';
import * as ReactDOM from 'react-dom';

export interface AiRootProps {
  children: React.ReactNode;
}

const AiRoot: React.FC<AiRootProps> = ({ children }) => {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create a container for the portal if one doesn't already exist
    let container = document.getElementById('ai-root') as HTMLDivElement;
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'ai-root';
      container.style.position = 'absolute';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.zIndex = '1000';
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);
    }

    setPortalContainer(container);

    // Clean up the portal container when unmounting
    return () => {
      if (container && container.childNodes.length <= 1) {
        document.body.removeChild(container);
      }
    };
  }, []);

  if (!portalContainer) return null;

  return ReactDOM.createPortal(children, portalContainer);
};

export default AiRoot; 