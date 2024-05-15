import { SGraphImpl, SEdgeImpl, SLabelImpl, SNodeImpl } from 'sprotty';
import { EdgePlacement } from 'sprotty-protocol';

export const GRAPH = 'graph';

export const NODE_ENTITY = 'node:entity';
export const NODE_RELATIONSHIP = 'node:relationship';

export const EDGE = 'edge';

export const COMP_ENTITY_HEADER = 'comp:entity-header';
export const COMP_ATTRIBUTES = 'comp:attributes';
export const COMP_ATTRIBUTE = 'comp:attribute';

export const COMP_JOIN_TABLE = 'comp:join-table';
export const COMP_JOIN_CLAUSES = 'comp:join-clauses';
export const COMP_JOIN_CLAUSE = 'comp:join-clause';

export const LABEL_ENTITY = 'label:entity';
export const LABEL_ATTRIBUTE = 'label:attribute';
export const LABEL_ATTRIBUTE_KEY = 'label:attribute-key';
export const LABEL_SEPARATOR = 'label:separator';

export const LABEL_RELATIONSHIP = 'label:relationship';
export const LABEL_CARDINALITY = 'label:cardinality';

export const LABEL_JOIN_TABLE = 'label:join-table';
export const LABEL_JOIN_ORDER = 'label:join-order';
export const LABEL_JOIN_CLAUSE = 'label:join-clause';

export const CARDINALITIES = [
    {
        label: '',
        value: ''
    },
    {
        label: '0..1',
        value: '0..1'
    },
    {
        label: '0..N',
        value: '0..N'
    }
]

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