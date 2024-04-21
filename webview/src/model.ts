import { DiamondNode, RectangularNode, SGraphImpl, SEdgeImpl, SLabelImpl } from 'sprotty';
import { EdgePlacement } from 'sprotty-protocol';

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

export const LABEL_KEY = 'label:key';
export const LABEL_PARTIAL_KEY = 'label:partial-key';
export const LABEL_DERIVED = 'label:derived';
export const LABEL_TEXT = 'label:text';
export const LABEL_SEPARATOR = 'label:separator';

export const COMP_ENTITY_HEADER = 'comp:entity-header';
export const COMP_ATTRIBUTES = 'comp:attributes';
export const COMP_ATTRIBUTES_ROW = 'comp:attributes-row';

export const DATATYPES = [
    {
        label: 'Calculation/amount field',
        value: 'DEC'
    },
    {
        label: 'Single-byte integer',
        value: 'INT1'
    },
    {
        label: 'Two-byte integer',
        value: 'INT2'
    },
    {
        label: 'Four-byte integer',
        value: 'INT4',
    },
    {
        label: 'Currency field',
        value: 'CURR'
    },
    {
        label: 'Currency key',
        value: 'CUKY'
    },
    {
        label: 'Quantity',
        value: 'QUAN'
    },
    {
        label: 'Unit',
        value: 'UNIT'
    },
    {
        label: 'Floating point number',
        value: 'FLTP'
    },
    {
        label: 'Numeric text',
        value: 'NUMC'
    },
    {
        label: 'Character',
        value: 'CHAR'
    },
    {
        label: 'Long Character',
        value: 'LCHR'
    },
    {
        label: 'String of variable length',
        value: 'STRING'
    },
    {
        label: 'Byte string of variable length',
        value: 'RAWSTRING'
    },
    {
        label: 'Date',
        value: 'DATS'
    },
    {
        label: 'Accounting period YYYYMM',
        value: 'ACCP'
    },
    {
        label: 'Time HHMMSS',
        value: 'TIMS'
    },
    {
        label: 'Byte string',
        value: 'RAW'
    },
    {
        label: 'Long byte string',
        value: 'LRAW'
    },
    {
        label: 'Client',
        value: 'CLNT'
    },
    {
        label: 'Language',
        value: 'LANG'
    }
]

export const ATTRIBUTE_TYPES = [
    {
        label: 'derived',
        value: 'derived'
    },
    {
        label: 'key',
        value: 'key'
    },
    {
        label: 'multivalued',
        value: 'multivalued'
    },
    {
        label: 'none',
        value: 'none',
    },
    {
        label: 'optional',
        value: 'optional'
    },
    {
        label: 'partial-key',
        value: 'partial-key'
    }
]

export class ER2CDSRoot extends SGraphImpl {
    name: string;
}

export class EntityNode extends RectangularNode {
    weak: boolean;
}

export class RelationshipNode extends DiamondNode {
    weak: boolean;
}

export class Edge extends SEdgeImpl {
    cardinality: string;
}

export class EdgeInheritance extends SEdgeImpl {

}

export class CardinalityLabel extends SLabelImpl {
    override edgePlacement = <EdgePlacement>{
        position: 0.5,
        side: 'top',
        rotate: false,
        offset: 10
    };
}

export class LeftCardinalityLabel extends SLabelImpl {
    override edgePlacement = <EdgePlacement>{
        position: 0.2,
        side: 'top',
        rotate: false,
        offset: 10
    };
}

export class RightCardinalityLabel extends SLabelImpl {
    override edgePlacement = <EdgePlacement>{
        position: 0.8,
        side: 'top',
        rotate: false,
        offset: 10
    };
}

export class RoleLabel extends SLabelImpl {
    override edgePlacement = <EdgePlacement>{
        position: 0.5,
        side: 'bottom',
        rotate: false,
        offset: 10
    };
}

export class LeftRoleLabel extends SLabelImpl {
    override edgePlacement = <EdgePlacement>{
        position: 0.2,
        side: 'bottom',
        rotate: false,
        offset: 10
    };
}

export class RightRoleLabel extends SLabelImpl {
    override edgePlacement = <EdgePlacement>{
        position: 0.8,
        side: 'bottom',
        rotate: false,
        offset: 10
    };
}