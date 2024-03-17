import { inject, injectable } from 'inversify';
import { KeyListener, KeyTool, SModelElementImpl } from 'sprotty';
import { Action } from 'sprotty-protocol';
import { EnableMarqueeMouseToolAction } from '../tool-actions';
import { DiagramEditorService } from '../../../services/diagram-editor-service';

@injectable()
export class MarqueeKeyTool extends KeyTool {
    protected marqueeKeyListener: MarqueeKeyListener = new MarqueeKeyListener();

    enable(): void {
        this.register(this.marqueeKeyListener);
    }

    disable(): void {
        this.deregister(this.marqueeKeyListener);
    }
}

@injectable()
export class MarqueeKeyListener extends KeyListener {
    @inject(DiagramEditorService)
    public selectionService: DiagramEditorService;

    override keyDown(element: SModelElementImpl, event: KeyboardEvent): Action[] {
        if (event.shiftKey && !this.selectionService.hasSelectedElements()) {
            return [EnableMarqueeMouseToolAction.create()];
        }

        return [];
    }
}
