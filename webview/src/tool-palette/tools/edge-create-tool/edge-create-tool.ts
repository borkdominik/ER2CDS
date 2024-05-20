import { injectable, inject } from 'inversify';
import { TYPES, isCtrlOrCmd, findParentByFeature, isConnectable, ActionDispatcher, MouseTool, MouseListener, SModelElementImpl, SEdgeImpl, AnchorComputerRegistry } from 'sprotty';
import { EnableDefaultToolsAction } from '../actions';
import { Action } from 'sprotty-protocol';
import { DrawCreateEdgeAction, RemoveCreateEdgeAction } from './actions';
import { EdgeCreateEndMovingMouseListener } from './edge-create-end-listener';
import { CreateEdgeAction } from '../../../actions';

@injectable()
export class EdgeCreateTool {
    @inject(MouseTool)
    protected mouseTool: MouseTool;

    @inject(TYPES.IActionDispatcher)
    protected actionDispatcher: ActionDispatcher;

    @inject(AnchorComputerRegistry)
    protected anchorRegistry: AnchorComputerRegistry;

    protected edgeCreateMouseToolListener: EdgeCreateToolMouseListener;
    protected edgeCreateEndMovingMouseListener: EdgeCreateEndMovingMouseListener;

    enable(): void {
        if (!this.edgeCreateMouseToolListener)
            this.edgeCreateMouseToolListener = new EdgeCreateToolMouseListener(this.actionDispatcher, this);

        if (!this.edgeCreateEndMovingMouseListener)
            this.edgeCreateEndMovingMouseListener = new EdgeCreateEndMovingMouseListener(this.anchorRegistry, this.actionDispatcher);

        this.edgeCreateMouseToolListener.reinitialize();

        this.mouseTool.register(this.edgeCreateMouseToolListener);
        this.mouseTool.register(this.edgeCreateEndMovingMouseListener);
    }

    disable(): void {
        this.mouseTool.deregister(this.edgeCreateMouseToolListener);
        this.mouseTool.deregister(this.edgeCreateEndMovingMouseListener);
    }
}

@injectable()
export class EdgeCreateToolMouseListener extends MouseListener {
    protected source?: string;
    protected target?: string;
    protected currentTarget?: SModelElementImpl;

    protected proxyEdge: SEdgeImpl;

    protected allowedTarget = false;

    protected isMouseDown = false;
    protected isMouseDrag = false;

    constructor(protected actionDispatcher: ActionDispatcher, protected tool: EdgeCreateTool) {
        super();

        this.proxyEdge = new SEdgeImpl();
    }

    public reinitialize(): void {
        this.source = undefined;
        this.target = undefined;
        this.currentTarget = undefined;
        this.allowedTarget = false;

        this.actionDispatcher.dispatch(RemoveCreateEdgeAction.create());
    }

    override mouseDown(target: SModelElementImpl, event: MouseEvent): (Action | Promise<Action>)[] {
        this.isMouseDown = true;
        return [];
    }

    override mouseMove(target: SModelElementImpl, event: MouseEvent): Action[] {
        if (this.isMouseDown)
            this.isMouseDrag = true;

        return [];
    }

    override mouseUp(element: SModelElementImpl, event: MouseEvent): Action[] {
        this.isMouseDown = false;

        if (this.isMouseDrag) {
            this.isMouseDrag = false;
            return [];
        }

        const result: Action[] = [];

        if (event.button === 0) {
            if (!this.isSourceSelected()) {
                if (this.currentTarget && this.allowedTarget) {
                    this.source = this.currentTarget.id;

                    result.push(DrawCreateEdgeAction.create({ sourceId: this.source }));
                }

            } else if (this.currentTarget && this.allowedTarget) {
                this.target = this.currentTarget.id;
            }

            if (this.source && this.target) {
                result.push(CreateEdgeAction.create({ sourceElementId: this.source, targetElementId: this.target }));
                
                this.reinitialize();
                result.push(EnableDefaultToolsAction.create());
            }

        } else if (event.button === 2) {
            this.reinitialize();
            result.push(EnableDefaultToolsAction.create());
        }

        return result;
    }

    override mouseOver(target: SModelElementImpl, event: MouseEvent): Action[] {
        const newCurrentTarget = findParentByFeature(target, isConnectable);

        if (newCurrentTarget !== this.currentTarget) {
            this.currentTarget = newCurrentTarget;

            if (this.currentTarget) {
                if (!this.isSourceSelected()) {
                    this.allowedTarget = this.canConnect(newCurrentTarget, 'source');
                } else if (!this.isTargetSelected()) {
                    this.allowedTarget = this.canConnect(newCurrentTarget, 'target');
                }
            } else {
                this.allowedTarget = false;
            }
        }

        return [];
    }

    protected isSourceSelected(): boolean {
        return this.source !== undefined;
    }

    protected isTargetSelected(): boolean {
        return this.target !== undefined;
    }

    protected canConnect(element: SModelElementImpl | undefined, role: 'source' | 'target'): boolean {
        if (!element || !isConnectable(element) || !element.canConnect(this.proxyEdge, role))
            return false;

        return true;
    }
}
