import {
    CreatingOnDrag, ManhattanEdgeRouter, RectangularNode, RectangularPort,
    SEdgeImpl, SLabelImpl, SRoutableElementImpl
} from 'sprotty';
import { Action, CreateElementAction, SEdge, EdgePlacement } from 'sprotty-protocol';

export class StatesEdge extends SEdgeImpl {
    override routerKind = ManhattanEdgeRouter.KIND;
    override targetAnchorCorrection = Math.sqrt(5);
}

export class StatesEdgeLabel extends SLabelImpl {
    override edgePlacement = <EdgePlacement>{
        rotate: true,
        position: 0.6
    };
}

export class StatesNode extends RectangularNode {
    override canConnect(routable: SRoutableElementImpl, role: string) {
        return true;
    }
}

export class CreateTransitionPort extends RectangularPort implements CreatingOnDrag {
    createAction(id: string): Action {
        const edge: SEdge = {
            id,
            type: 'edge',
            sourceId: this.parent.id,
            targetId: this.id
        };
        return CreateElementAction.create(edge, { containerId: this.root.id });
    }
}