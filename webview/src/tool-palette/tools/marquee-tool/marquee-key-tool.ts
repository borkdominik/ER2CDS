import { inject, injectable } from 'inversify';
import { KeyListener, SModelElementImpl } from 'sprotty';
import { Action } from 'sprotty-protocol';
import { EnableMarqueeMouseToolAction } from '../actions';
import { DiagramEditorService } from '../../../services/diagram-editor-service';
import { ER2CDSKeyTool } from '../key-tool';

@injectable()
export class MarqueeKeyTool {
    @inject(ER2CDSKeyTool)
    protected keyTool: ER2CDSKeyTool;

    @inject(DiagramEditorService)
    protected diagramEditorService: DiagramEditorService

    protected marqueeKeyListener: MarqueeKeyListener;

    enable(): void {
        if (!this.marqueeKeyListener)
            this.marqueeKeyListener = new MarqueeKeyListener(this.diagramEditorService)

        this.keyTool.register(this.marqueeKeyListener);
    }

    disable(): void {
        this.keyTool.deregister(this.marqueeKeyListener);
    }
}

@injectable()
export class MarqueeKeyListener extends KeyListener {
    protected diagramEditorService: DiagramEditorService;

    constructor(diagramEditorService: DiagramEditorService) {
        super();
        this.diagramEditorService = diagramEditorService;
    }

    override keyDown(element: SModelElementImpl, event: KeyboardEvent): Action[] {
        if (event.shiftKey && !this.diagramEditorService.hasSelectedElements()) {
            return [EnableMarqueeMouseToolAction.create()];
        }

        return [];
    }
}
