import { styled } from 'styletron-react';

const ModuleName = styled('span', ({ onClick }: { onClick?: (event: React.MouseEvent) => void }) => ({
  fontFamily: 'monospace',
  cursor: onClick ? 'pointer' : 'default',
}));

export default ModuleName;