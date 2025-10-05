import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Higher-order component to inject a `navigate` function prop (wrapper around react-router v6 useNavigate)
 * into class components without converting them to function components.
 *
 * Usage:
 *   class MyPage extends React.Component<{ navigate: (to: string, opts?: { replace?: boolean }) => void }> { ... }
 *   export default withNavigate(MyPage);
 */

export interface WithNavigateProps {
  navigate: (to: string, opts?: { replace?: boolean }) => void;
}

export function withNavigate<P extends WithNavigateProps>(Wrapped: React.ComponentType<P>) {
  const ComponentWithNavigate: React.FC<Omit<P, 'navigate'>> = (props) => {
    const navigate = useNavigate();

    const wrappedNavigate = React.useCallback((to: string, opts?: { replace?: boolean }) => {
      navigate(to, { replace: opts?.replace });
    }, [navigate]);

    return <Wrapped {...(props as P)} navigate={wrappedNavigate} />;
  };

  // For easier debugging
  const wrappedName = Wrapped.displayName || Wrapped.name || 'Component';
  ComponentWithNavigate.displayName = `withNavigate(${wrappedName})`;

  return ComponentWithNavigate;
}

export default withNavigate;
