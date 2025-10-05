import React from 'react';
import { useParams } from 'react-router-dom';

/**
 * Generic higher-order component to inject a `params` prop (wrapper around react-router v6 useParams)
 * into class components without converting them to function components.
 *
 * Usage:
 *   interface MyParams { id?: string }
 *   interface Props { params: MyParams; ... }
 *   class MyPage extends React.Component<Props> { ... }
 *   export default withParams<MyParams>()(MyPage);
 */
export function withParams<ParamShape extends Record<string, string | undefined> = Record<string, string | undefined>>() {
  return function <P extends { params: ParamShape }>(Wrapped: React.ComponentType<P>) {
    const WithParams: React.FC<Omit<P, 'params'>> = (props) => {
      // react-router-dom's useParams is loosely typed; cast to requested shape
      const params = useParams() as ParamShape;
      return <Wrapped {...(props as P)} params={params} />;
    };
    WithParams.displayName = `withParams(${Wrapped.displayName || Wrapped.name || 'Component'})`;
    return WithParams;
  };
}

export default withParams;
