import { DiamondNode, RectangularNode, SGraphImpl, SLabelImpl } from 'sprotty';
import { EdgePlacement } from 'sprotty-protocol';

export const GRAPH = 'graph';

export const NODE_ENTITY = 'node:entity';
export const NODE_RELATIONSHIP = 'node:relationship';

export const LABEL_ENTITY = 'label:entity';
export const LABEL_RELATIONSHIP = 'label:relationship';

export class ER2CDSModel extends SGraphImpl {
    name: string;
}

export class EntityNode extends RectangularNode {
    expanded: boolean;
    weak: boolean;
}

export class RelationshipNode extends DiamondNode {
    weak: boolean;
}

export class CardinalityLabel extends SLabelImpl {
    override edgePlacement = <EdgePlacement>{
        position: 0.5,
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