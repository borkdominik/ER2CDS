import { inject, injectable } from 'inversify';
import { InternalBoundsAware, MouseListener, MouseTool, SModelElementImpl, isSelectable, isSelected } from 'sprotty';
import { Action, SelectAction } from 'sprotty-protocol';
import { DOMHelper } from 'sprotty/lib/base/views/dom-helper';
import { MarqueeUtil, getAbsolutePosition, toAbsoluteBounds } from './marquee-util';
import { DiagramEditorService } from '../../../services/diagram-editor-service';
import { EntityNode, RelationshipNode } from '../../../model';

@injectable()
export class MarqueeMouseTool extends MouseTool {
    protected marqueeMouseListener: MarqueeMouseListener;

    enable(): void {
        if (!this.marqueeMouseListener)
            this.marqueeMouseListener = new MarqueeMouseListener(this.domHelper)

        this.register(this.marqueeMouseListener);
    }

    disable(): void {
        this.deregister(this.marqueeMouseListener);
    }
}

@injectable()
export class MarqueeMouseListener extends MouseListener {
    @inject(DiagramEditorService)
    protected diagramEditorService: DiagramEditorService;

    protected domHelper: DOMHelper;
    protected marqueeUtil: MarqueeUtil;

    protected entities: (SModelElementImpl & InternalBoundsAware)[];
    protected relationships: (SModelElementImpl & InternalBoundsAware)[];

    protected previouslySelected: string[];
    protected isActive = false;

    constructor(domHelper: DOMHelper) {
        super();

        this.domHelper = domHelper;
        this.marqueeUtil = new MarqueeUtil();

        this.entities = Array.from(this.diagramEditorService.getModelRoot().index.all().map(e => e as SModelElementImpl & InternalBoundsAware).filter(e => isSelectable(e)).filter(e => e instanceof EntityNode));
        this.relationships = Array.from(this.diagramEditorService.getModelRoot().index.all().map(e => e as SModelElementImpl & InternalBoundsAware).filter(e => isSelectable(e)).filter(e => e instanceof RelationshipNode));

    }

    override mouseDown(target: SModelElementImpl, event: MouseEvent): Action[] {
        this.isActive = true;
        this.marqueeUtil.updateStartPoint(getAbsolutePosition(target, event));

        if (event.ctrlKey)
            this.previouslySelected = Array.from(target.root.index.all().map(e => e as SModelElementImpl & InternalBoundsAware).filter(e => isSelected(e)).map(e => e.id));

        return [];
    }

    override mouseMove(target: SModelElementImpl, event: MouseEvent): Action[] {
        this.marqueeUtil.updateCurrentPoint(getAbsolutePosition(target, event));

        if (this.isActive) {
            const entityIdsSelected = this.entities.filter(e => this.marqueeUtil.isNodeMarked(toAbsoluteBounds(e))).map(e => e.id);
            const relationshipIdsSelected = this.relationships.filter(e => this.marqueeUtil.isNodeMarked(toAbsoluteBounds(e))).map(e => e.id);
            const selected = entityIdsSelected.concat(relationshipIdsSelected);
            return [SelectAction.create({ selectedElementsIDs: selected.concat(this.previouslySelected) })];
        }

        return [];
    }

    override mouseUp(_target: SModelElementImpl, event: MouseEvent): Action[] {
        this.isActive = false;
        if (event.shiftKey) {
            return [];
        }

        return [];
    }
}