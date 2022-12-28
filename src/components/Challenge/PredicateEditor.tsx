import * as React from 'react';
import Dict from '../../Dict';
import Event from '../../state/State/Challenge/Event';
import Expr from '../../state/State/Challenge/Expr';

import Predicate from '../../state/State/Challenge/Predicate';
import PredicateCompletion from '../../state/State/ChallengeCompletion/PredicateCompletion';
import { StyleProps } from '../../style';
import HTree, { HTreeNode } from '../HTree';
import EventViewer from './EventViewer';
import Operator from './Operator';

export interface PredicateEditorProps extends StyleProps {
  predicate: Predicate;
  predicateCompletion?: PredicateCompletion;
  events: Dict<Event>;
}

namespace Node {
  export enum Type {
    Terminal,
    NonTerminal
  }

  export interface Terminal<P extends StyleProps = StyleProps> {
    type: Type.Terminal;
    node: HTreeNode<P>;
    state?: boolean;
  }

  export interface NonTerminal<P extends StyleProps = StyleProps> {
    type: Type.NonTerminal;
    parent: HTreeNode<P>;
    children: Dict<Node>;
    childrenOrdering: string[];
    state?: boolean;
  }
}

type Node<P extends StyleProps = StyleProps> = Node.Terminal<P> | Node.NonTerminal<P>;

const treeify = (exprs: Dict<Expr>, rootId: string, events: Dict<Event>, exprStates?: Dict<boolean>): Node => {
  const root = exprs[rootId];

  switch (root.type) {
    case Expr.Type.And:
    case Expr.Type.Or:
    case Expr.Type.Xor: {
      return {
        type: Node.Type.NonTerminal,
        parent: {
          component: Operator,
          props: { type: root.type } as any
        },
        children: Dict.generate(root.argIds, id => treeify(exprs, id, events, exprStates)),
        childrenOrdering: root.argIds,
        state: exprStates ? exprStates[rootId] : undefined
      };
    }
    case Expr.Type.Once:
    case Expr.Type.Not: {
      return {
        type: Node.Type.NonTerminal,
        parent: {
          component: Operator,
          props: { type: root.type } as any
        },
        children: Dict.generate([root.argId], id => treeify(exprs, id, events, exprStates)),
        childrenOrdering: [root.argId],
        state: exprStates ? exprStates[rootId] : undefined
      };
    }
    case Expr.Type.Event: {
      return {
        type: Node.Type.Terminal,
        node: {
          component: EventViewer,
          props: { event: events[root.eventId] } as any
        },
        state: exprStates ? exprStates[rootId] : undefined
      };
    }
  }
};

const STATE_TRUE_COLOR = 'green';
const STATE_FALSE_COLOR = 'red';
const STATE_NONE_COLOR = 'black';
const STATE_INCOMPLETE_COLOR = 'yellow';

const NodeEditor: React.FC<{ node: Node } & StyleProps> = ({ node, style, className }) => {
  switch (node.type) {
    case Node.Type.Terminal: {
      const { component: Component, props } = node.node;
      return <Component {...props} />;
    }
    case Node.Type.NonTerminal: {
      const children: Dict<HTreeNode> = Dict.map(node.children, child => ({
        component: NodeEditor,
        props: {
          node: child
        }
      }));

      let color = STATE_NONE_COLOR;

      if (node.state === true) {
        color = STATE_TRUE_COLOR;
      } else if (node.state === false) {
        color = STATE_FALSE_COLOR;
      } else if (node.state === undefined) {
        // try to derive from children states
        
        // if all true
        if (Dict.every(node.children, child => child.state === true)) {
          color = STATE_TRUE_COLOR;
        } else if (Dict.every(node.children, child => child.state === false)) {
          color = STATE_FALSE_COLOR;
        } else if (Dict.every(node.children, child => child.state === undefined)) {
          color = STATE_NONE_COLOR;
        } else {
          color = STATE_INCOMPLETE_COLOR;
        }
      }

      const parentProps = node.parent.props || {};

      const coloredParent: HTreeNode = {
        component: node.parent.component,
        props: {
          ...parentProps,
          style: {
            ...(parentProps.style || {}),
            color
          }
        }
      };

      return (
        <HTree
          style={style}
          className={className}
          parent={coloredParent}
          children={children}
          childrenOrdering={node.childrenOrdering}
          decorationColor={color}
        />
      );
    }
  }
};

const PredicateEditor: React.FC<PredicateEditorProps> = ({
  predicate,
  predicateCompletion,
  events,
  style,
  className
}) => {
  const { exprs, rootId } = predicate;

  const tree = treeify(exprs, rootId, events, predicateCompletion ? predicateCompletion.exprStates : undefined);
  
  return (
    <NodeEditor
      node={tree}
      style={style}
      className={className}
    />
  );
};

export default PredicateEditor;

