import * as React from 'react';
import { styled } from 'styletron-react';
import Dict from '../Dict';
import { Vector2 } from '../math';
import { StyleProps } from '../style';
import Svg, { DrawFunction } from './Svg';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface HTreeNode<P = any> {
  component: React.ComponentType<P>;
  props: P;
}

export interface HTreeProps extends StyleProps {
  parent: HTreeNode;
  children: Dict<HTreeNode>;
  childrenOrdering: string[];

  onParentClick?: (event: React.MouseEvent) => void;

  onChildRemoveClick?: (id: string, event: React.MouseEvent) => void;
  onChildAddClick?: (id: string, event: React.MouseEvent) => void;
  onChildSettingsClick?: (id: string, event: React.MouseEvent) => void;

  decorationColor?: string;
}

type Props = HTreeProps;

const Container = styled('div', {
  display: 'inline-grid',
  gridTemplateColumns: 'auto auto auto',
  gridTemplateRows: 'auto',
  alignItems: 'center',
});

const Title = styled('div', {
  gridColumn: '1',
  gridRow: '1',
  margin: '0.25em'
});

const Decoration = styled('div', {
  position: 'relative',
  gridColumn: '2',
  gridRow: '1',
  height: '100%',
  width: '20px',
  alignSelf: 'stretch',
});

const OperandList = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gridColumn: '3',
  gridRow: '1',
  width: '100%',
  margin: '0.25em',
});

const drawCurly = (decorationColor?: string) => (size: Vector2) => {
  // Draws a curly bracket using two bezier curves
  return (
    <>
      <path
        d={`
          M ${size.x - 1} 1
          C 1 1, ${size.x - 1} ${size.y / 2 - size.y / 10}, 1 ${size.y / 2}
          C ${size.x - 1} ${size.y / 2 + size.y / 10}, 1 ${size.y - 1}, ${size.x - 1} ${size.y - 1}
        `}
        fill="none"
        stroke={decorationColor || 'black'}
        strokeWidth="1"
      />
    </>
  );
};
  
const HTree: React.FC<Props> = ({
  parent: { component: Parent, props: parentProps },
  children,
  childrenOrdering,
  className,
  style,
  decorationColor
}) => {
  return (
    <Container style={style} className={className}>
      <Title>
        <Parent {...parentProps} />
      </Title>
      <Decoration>
        <Svg draw={drawCurly(decorationColor)} />
      </Decoration>
      <OperandList>
        {childrenOrdering.map(id => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const { component: Child, props: childProps } = children[id];
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          return <Child key={id} {...childProps} />;
        })}
      </OperandList>
    </Container>
  );
};

export default HTree;