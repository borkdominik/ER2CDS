import { inject, injectable } from 'inversify';
import { InternalBoundsAware, KeyListener, MouseListener, SModelElementImpl, TYPES, isSelectable, isSelected } from 'sprotty';
import { Action, SelectAction } from 'sprotty-protocol';
import { DOMHelper } from 'sprotty/lib/base/views/dom-helper';
import { MarqueeUtil, getAbsolutePosition, toAbsoluteBounds } from './marquee-util';
import { DiagramEditorService } from '../../../services/diagram-editor-service';
import { EntityNode, RelationshipNode } from '../../../model';
import { RemoveMarqueeAction } from './actions';
import { ER2CDSMouseTool } from '../mouse-tool';
import { ER2CDSKeyTool } from '../key-tool';

@injectable()
export class MarqueeMouseTool {
    @inject(ER2CDSMouseTool)
    protected mouseTool: ER2CDSMouseTool;

    @inject(ER2CDSKeyTool)
    protected keyTool: ER2CDSKeyTool;

    @inject(DiagramEditorService)
    protected diagramEditorService: DiagramEditorService

    @inject(TYPES.DOMHelper)
    protected domHelper: DOMHelper;

    protected marqueeMouseListener: MarqueeMouseListener;
    protected shiftKeyListener: ShiftKeyListener;

    enable(): void {
        if (!this.marqueeMouseListener)
            this.marqueeMouseListener = new MarqueeMouseListener(this.domHelper, this.diagramEditorService)

        if (!this.shiftKeyListener)
            this.shiftKeyListener = new ShiftKeyListener();

        this.mouseTool.register(this.marqueeMouseListener);
        this.keyTool.register(this.shiftKeyListener);
    }

    disable(): void {
        this.mouseTool.deregister(this.marqueeMouseListener);
    }
}

@injectable()
export class MarqueeMouseListener extends MouseListener {
    protected domHelper: DOMHelper;
    protected diagramEditorService: DiagramEditorService;
    protected marqueeUtil: MarqueeUtil;

    protected entities: (SModelElementImpl & InternalBoundsAware)[];
    protected relationships: (SModelElementImpl & InternalBoundsAware)[];

    protected previouslySelected: string[];
    protected isActive: boolean = false;
    protected reinitialize: boolean = true;

    constructor(domHelper: DOMHelper, diagramEditorService: DiagramEditorService) {
        super();

        this.domHelper = domHelper;
        this.diagramEditorService = diagramEditorService;
        this.marqueeUtil = new MarqueeUtil();
    }

    override mouseDown(target: SModelElementImpl, event: MouseEvent): Action[] {
        this.isActive = true;
        this.reinitialize = true;

        this.marqueeUtil.updateStartPoint(getAbsolutePosition(target, event));

        if (event.ctrlKey)
            this.previouslySelected = Array.from(target.root.index.all().map(e => e as SModelElementImpl & InternalBoundsAware).filter(e => isSelected(e)).map(e => e.id));

        return [];
    }

    override mouseMove(target: SModelElementImpl, event: MouseEvent): Action[] {
        this.marqueeUtil.updateCurrentPoint(getAbsolutePosition(target, event));

        if (this.isActive) {
            if (this.reinitialize) {
                this.reinitialize = false;
                
                this.entities = Array.from(this.diagramEditorService.getModelRoot().index.all().map(e => e as SModelElementImpl & InternalBoundsAware).filter(e => isSelectable(e)).filter(e => e instanceof EntityNode));
                this.relationships = Array.from(this.diagramEditorService.getModelRoot().index.all().map(e => e as SModelElementImpl & InternalBoundsAware).filter(e => isSelectable(e)).filter(e => e instanceof RelationshipNode));
            }

            const entityIdsSelected = this.entities.filter(e => this.marqueeUtil.isNodeMarked(toAbsoluteBounds(e))).map(e => e.id);
            const relationshipIdsSelected = this.relationships.filter(e => this.marqueeUtil.isNodeMarked(toAbsoluteBounds(e))).map(e => e.id);
            const selected = entityIdsSelected.concat(relationshipIdsSelected);

            return [SelectAction.create({ selectedElementsIDs: selected.concat(this.previouslySelected) }), this.marqueeUtil.drawMarqueeAction()];
        }

        return [];
    }

    override mouseUp(_target: SModelElementImpl, event: MouseEvent): Action[] {
        this.isActive = false;
        this.reinitialize = true;

        if (event.shiftKey)
            return [RemoveMarqueeAction.create()];

        return [RemoveMarqueeAction.create()];
    }
}

@injectable()
export class ShiftKeyListener extends KeyListener {
    override keyUp(element: SModelElementImpl, event: KeyboardEvent): Action[] {
        if (event.shiftKey)
            return [];

        return [RemoveMarqueeAction.create()];
    }
}
