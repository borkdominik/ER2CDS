import { injectable, inject } from 'inversify';
import { MouseListener, SChildElementImpl, SModelElementImpl, findParentByFeature } from 'sprotty';
import { Action } from 'sprotty-protocol';
import { ER2CDSMouseTool } from '../mouse-tool';
import { RelationshipNode } from '../../../model';
import { CreateJoinClauseAction } from '../../../actions';

@injectable()
export class JoinClauseCreateMouseTool {
    @inject(ER2CDSMouseTool)
    protected mouseTool: ER2CDSMouseTool;

    protected joinClauseCreateMouseListener: JoinClauseCreateMouseListener = new JoinClauseCreateMouseListener();

    enable(): void {
        this.mouseTool.register(this.joinClauseCreateMouseListener);
    }

    disable(): void {
        this.mouseTool.deregister(this.joinClauseCreateMouseListener);
    }
}

@injectable()
export class JoinClauseCreateMouseListener extends MouseListener {
    override mouseUp(target: SModelElementImpl, event: MouseEvent): Action[] {
        const relationshipParent = findParentByFeature(target, isRelationship);
        if (relationshipParent === undefined)
            return [];

        const result: Action[] = [];
        result.push(CreateJoinClauseAction.create(relationshipParent.id));

        return result;
    }
}

export function isRelationship<T extends SModelElementImpl>(element: T): element is T & SChildElementImpl & RelationshipNode {
    return element instanceof SChildElementImpl && element instanceof RelationshipNode;
}