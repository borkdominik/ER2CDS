import { SEdge, SModelRoot, SNode } from 'sprotty-protocol';

export const GRAPH = 'graph';

export const NODE_ENTITY = 'node:entity';
export const NODE_RELATIONSHIP = 'node:relationship';

export const EDGE = 'edge';

export const COMP_ENTITY_HEADER = 'comp:entity-header';
export const COMP_ATTRIBUTES = 'comp:attributes';
export const COMP_ATTRIBUTES_ROW = 'comp:attributes-row';

export const LABEL_ATTRIBUTE = 'label:attribute';
export const LABEL_ATTRIBUTE_KEY = 'label:attribute-key';
export const LABEL_SEPARATOR = 'label:separator';
export const LABEL_ENTITY = 'label:entity';
export const LABEL_RELATIONSHIP = 'label:relationship';
export const LABEL_CARDINALITY = 'label:cardinality';

export interface ER2CDSRoot extends SModelRoot {
    name: string;
}

export interface EntityNode extends SNode {

}

export interface RelationshipNode extends SNode {

}

export interface Edge extends SEdge {
    cardinality?: string;
}