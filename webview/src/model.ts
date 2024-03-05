import { DiamondNode, PreRenderedElementImpl, RectangularNode, SGraphImpl, SLabelImpl } from 'sprotty';
import { EdgePlacement } from 'sprotty-protocol';

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

export class PopupButton extends PreRenderedElementImpl {
    target: string;
    kind: string;
}