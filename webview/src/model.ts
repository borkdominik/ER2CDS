import { SGraphImpl, SEdgeImpl, SLabelImpl, SNodeImpl } from 'sprotty';
import { EdgePlacement } from 'sprotty-protocol';

export const GRAPH = 'graph';

export const NODE_ENTITY = 'node:entity';
export const NODE_RELATIONSHIP = 'node:relationship';

export const EDGE = 'edge';

export const COMP_ENTITY_HEADER = 'comp:entity-header';
export const COMP_ATTRIBUTES = 'comp:attributes';
export const COMP_ATTRIBUTE = 'comp:attribute';
export const COMP_ASSOCIATIONS = 'comp:associations';
export const COMP_ASSOCIATION = 'comp:association';
export const COMP_WHERE_CLAUSES = 'comp:where-clauses';
export const COMP_WHERE_CLAUSE = 'comp:where-clause';

export const COMP_JOIN_TABLE = 'comp:join-table';
export const COMP_JOIN_CLAUSES = 'comp:join-clauses';
export const COMP_JOIN_CLAUSE = 'comp:join-clause';

export const LABEL_ENTITY = 'label:entity';
export const LABEL_ENTITY_NO_EXPOSE = 'label:entity-no-expose';
export const LABEL_ENTITY_ALIAS = 'label:entity-alias'
export const LABEL_ATTRIBUTE = 'label:attribute';
export const LABEL_ATTRIBUTE_KEY = 'label:attribute-key';
export const LABEL_ATTRIBUTE_NO_OUT = 'label:attribute-no-out';
export const LABEL_ASSOCIATION = 'label:association';
export const LABEL_SEPARATOR = 'label:separator';
export const LABEL_VALUE = 'label:value';

export const LABEL_RELATIONSHIP = 'label:relationship';
export const LABEL_RELATIONSHIP_ASSOCIATION = 'label:relationship-association';
export const LABEL_RELATIONSHIP_ASSOCIATION_TO_PARENT = 'label:relationship-association-to-parent';
export const LABEL_RELATIONSHIP_COMPOSITION = 'label:relationship-composition';
export const LABEL_CARDINALITY = 'label:cardinality';

export const LABEL_JOIN_TABLE = 'label:join-table';
export const LABEL_JOIN_ORDER = 'label:join-order';
export const LABEL_JOIN_CLAUSE = 'label:join-clause';
export const LABEL_JOIN_CLAUSE_COMPARISON = 'label:join-clause-comparison';

export const CARDINALITIES = [
    {
        label: '',
        value: ''
    },
    {
        label: '1',
        value: '1'
    },
    {
        label: '0..N',
        value: '0..N'
    }
];

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
        value: 'STRG'
    },
    {
        label: 'Byte string of variable length',
        value: 'RSTR'
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
    },
    {
        label: 'Decimal Floating Point Stored in BCD Format',
        value: 'D16D'
    },
    {
        label: 'Decimal Floating Point Stored as Binary Number',
        value: 'D16R'
    },

    {
        label: 'Decimal Floating Point Stored in BCD Format',
        value: 'D34D'
    },
    {
        label: 'Decimal Floating Point Stored as Binary Number',
        value: 'D34R'
    },

    {
        label: '8-Byte Integer',
        value: 'INT8'
    },
    {
        label: 'Two-byte integer',
        value: 'PREC'
    },
    {
        label: 'Character String',
        value: 'SSTR'
    }
];

export const ATTRIBUTE_TYPES = [
    {
        label: '',
        value: ''
    },
    {
        label: 'Keyfield',
        value: 'key'
    },
    {
        label: 'No Out',
        value: 'no-out'
    }
];

export const RELATIONSHIP_TYPES = [
    {
        label: '',
        value: ''
    },
    {
        label: 'Association',
        value: 'association'
    },
    {
        label: 'Association To Parent',
        value: 'association-to-parent'
    },
    {
        label: 'Composition',
        value: 'composition'
    }
];

export const COMPARISON_TYPES = [
    {
        label: '=',
        value: '='
    },
    {
        label: '<>',
        value: '<>'
    },
    {
        label: '<',
        value: '<'
    },
    {
        label: '>',
        value: '>'
    },
    {
        label: '<=',
        value: '<='
    },
    {
        label: '>=',
        value: '>='
    }
];

export class ER2CDSRoot extends SGraphImpl {
    name: string;
}

export class EntityNode extends SNodeImpl {

}

export class RelationshipNode extends SNodeImpl {

}

export class Edge extends SEdgeImpl {
    cardinality?: string;
}

export class CardinalityLabel extends SLabelImpl {
    override edgePlacement?: EdgePlacement = {
        position: 0.5,
        side: 'top',
        rotate: false,
        offset: 0
    }
}