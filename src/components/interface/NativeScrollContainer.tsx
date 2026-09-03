import { styled } from 'styletron-react';
import { nativeScrollbarChrome } from '../../util/nativeScrollbarChrome';

/** Shared native overflow container. Callers remain responsible for sizing it. */
const NativeScrollContainer = styled('div', {
  width: '100%',
  overflow: 'auto',
  ...nativeScrollbarChrome,
});

export default NativeScrollContainer;
