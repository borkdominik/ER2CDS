import { SEdge, SLabel, SModelRoot, SNode } from 'sprotty-protocol';

export const GRAPH = 'graph';

export const NODE_ENTITY = 'node:entity';
export const NODE_RELATIONSHIP = 'node:relationship';

export const EDGE = 'edge';
export const EDGE_INHERITANCE = 'edge:inheritance';
export const EDGE_PARTIAL = 'edge:partial';

export const LABEL_ENTITY = 'label:entity';
export const LABEL_RELATIONSHIP = 'label:relationship';

export const LABEL_TOP = 'label:top';
export const LABEL_TOP_LEFT = 'label:top-left';
export const LABEL_TOP_RIGHT = 'label:top-right';
export const LABEL_BOTTOM = 'label:bottom';
export const LABEL_BOTTOM_LEFT = 'label:bottom-left';
export const LABEL_BOTTOM_RIGHT = 'label:bottom-right';

export interface ER2CDSRoot extends SModelRoot {
    name: string;
}

export interface EntityNode extends SNode {
    expanded: boolean;
    weak: boolean;
}

export interface RelationshipNode extends SNode {
    weak: boolean;
}

export interface Edge extends SEdge {
    cardinality?: string;
}

export interface EdgeInheritance extends SEdge {

}

export interface CardinalityLabel extends SLabel {

}

export interface LeftCardinalityLabel extends SLabel {

}

export interface RightCardinalityLabel extends SLabel {

}

export interface RoleLabel extends SLabel {

}

export interface LeftRoleLabel extends SLabel {

}