import { injectable, inject } from 'inversify';
import { MouseListener, SChildElementImpl, SModelElementImpl, findParentByFeature } from 'sprotty';
import { Action } from 'sprotty-protocol';
import { ER2CDSMouseTool } from '../mouse-tool';
import { EntityNode } from '../../../model';
import { CreateAttributeAction } from '../../../actions';

@injectable()
export class AttributeCreateMouseTool {
    @inject(ER2CDSMouseTool)
    protected mouseTool: ER2CDSMouseTool;

    protected attributeCreateMouseListener: AttributeCreateMouseListener = new AttributeCreateMouseListener();

    enable(): void {
        this.mouseTool.register(this.attributeCreateMouseListener);
    }

    disable(): void {
        this.mouseTool.deregister(this.attributeCreateMouseListener);
    }
}

@injectable()
export class AttributeCreateMouseListener extends MouseListener {
    override mouseUp(target: SModelElementImpl, event: MouseEvent): Action[] {
        const entityParent = findParentByFeature(target, isEntity);
        if (entityParent === undefined)
            return [];

        const result: Action[] = [];
        result.push(CreateAttributeAction.create(entityParent.id));

        return result;
    }
}

export function isEntity<T extends SModelElementImpl>(element: T): element is T & SChildElementImpl & EntityNode {
    return element instanceof SChildElementImpl && element instanceof EntityNode;
}