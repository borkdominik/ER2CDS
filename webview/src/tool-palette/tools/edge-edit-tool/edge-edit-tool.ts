import { inject, injectable, optional } from 'inversify';
import {
    EditEdgeRouteMovingMouseListener,
    EditEdgeSourceMovingMouseListener,
    EditEdgeTargetMovingMouseListener
} from './edge-edit-tool-feedback';
import { AnchorComputerRegistry, EdgeRouterRegistry, Connectable, isSelected, canEditRouting, findParentByFeature, isConnectable, MouseTool, TYPES, ISnapper, MouseListener, SRoutableElementImpl, SRoutingHandleImpl, SModelElementImpl, ActionDispatcher, IActionDispatcher, SModelRootImpl } from 'sprotty';
import { createEdgeId, isRoutable } from '../edge-create-tool/edge-create-utils';
import { DiagramEditorService } from '../../../services/diagram-editor-service';
import { ER2CDSMouseTool } from '../mouse-tool';
import { calcElementAndRoutingPoints, isRoutingHandle } from '../../../utils/model-utils';
import { ChangeRoutingPointsAction, DrawEditEdgeSourceAction, HideEdgeReconnectHandlesAction, ReconnectEdgeAction, ShowEdgeReconnectHandlesAction, SwitchRoutingModeAction } from './actions';
import { isReconnectHandle, isReconnectable, isSourceRoutingHandle, isTargetRoutingHandle } from './edge-edit-utils';
import { DrawCreateEdgeAction, RemoveCreateEdgeAction } from '../edge-create-tool/actions';
import { Action } from 'sprotty-protocol';

@injectable()
export class EdgeEditTool {
    static ID = 'edge-edit-tool';

    @inject(ER2CDSMouseTool)
    protected mouseTool: MouseTool;

    @inject(DiagramEditorService)
    protected diagramEditorService: DiagramEditorService;

    @inject(AnchorComputerRegistry)
    protected anchorRegistry: AnchorComputerRegistry;

    @inject(EdgeRouterRegistry)
    @optional()
    readonly edgeRouterRegistry?: EdgeRouterRegistry;

    @inject(TYPES.IActionDispatcher)
    protected actionDispatcher: ActionDispatcher;

    @inject(TYPES.ISnapper)
    @optional()
    protected snapper: ISnapper;

    protected feedbackEdgeSourceMovingListener: EditEdgeSourceMovingMouseListener;
    protected feedbackEdgeTargetMovingListener: EditEdgeTargetMovingMouseListener;
    protected feedbackMovingListener: EditEdgeRouteMovingMouseListener;
    protected edgeEditListener: EdgeEditListener;

    get id(): string {
        return EdgeEditTool.ID;
    }

    enable(): void {
        this.edgeEditListener = new EdgeEditListener(this.actionDispatcher, this);

        // install feedback move mouse listener for client-side move updates
        this.feedbackEdgeSourceMovingListener = new EditEdgeSourceMovingMouseListener(this.anchorRegistry);
        this.feedbackEdgeTargetMovingListener = new EditEdgeTargetMovingMouseListener(this.anchorRegistry);
        this.feedbackMovingListener = new EditEdgeRouteMovingMouseListener(this.snapper, this.edgeRouterRegistry);

        this.mouseTool.register(this.edgeEditListener);
        this.mouseTool.register(this.feedbackEdgeSourceMovingListener);
        this.mouseTool.register(this.feedbackEdgeTargetMovingListener);

        // this.diagramEditorService.onSelectionChanged(change => this.edgeEditListener.selectionChanged(change.root, change.selectedElements)):
    }

    disable(): void {
        this.deregisterMouseListeners();
    }

    registerMouseListeners(): void {
        this.mouseTool.register(this.feedbackMovingListener);
        this.mouseTool.register(this.feedbackEdgeSourceMovingListener);
        this.mouseTool.register(this.feedbackEdgeTargetMovingListener);
    }

    deregisterMouseListeners(): void {
        this.mouseTool.deregister(this.feedbackEdgeSourceMovingListener);
        this.mouseTool.deregister(this.feedbackEdgeTargetMovingListener);
        this.mouseTool.deregister(this.feedbackMovingListener);
    }
}

export class EdgeEditListener extends MouseListener {
    protected edge?: SRoutableElementImpl;
    protected routingHandle?: SRoutingHandleImpl;
    protected newConnectable?: SModelElementImpl & Connectable;
    protected reconnectMode?: 'NEW_SOURCE' | 'NEW_TARGET';

    protected isMouseDown = false;
    protected isMouseDrag = false;

    constructor(protected actionDispatcher: IActionDispatcher, protected tool: EdgeEditTool) {
        super();
    }

    override mouseDown(target: SModelElementImpl, event: MouseEvent): Action[] {
        this.isMouseDown = true;
        const result: Action[] = super.mouseDown(target, event) as Action[];

        if (event.button === 0) {
            const reconnectHandle = findParentByFeature(target, isReconnectHandle);
            const routingHandle = !reconnectHandle ? findParentByFeature(target, isRoutingHandle) : undefined;
            const edge = findParentByFeature(target, isRoutable);

            if (this.isEdgeSelected() && edge && reconnectHandle) {
                // PHASE 2 Reconnect: Select reconnect handle on selected edge
                this.setReconnectHandleSelected(edge, reconnectHandle);
            } else if (this.isEdgeSelected() && edge && routingHandle) {
                // PHASE 2 Reroute: Select routing handle on selected edge
                this.setRoutingHandleSelected(edge, routingHandle);
            } else if (this.isValidEdge(edge)) {
                // PHASE 1: Select edge
                this.tool.registerMouseListeners();
                this.setEdgeSelected(edge);
            }

        } else if (event.button === 2) {
            this.reset();
        }

        return result;
    }

    override mouseMove(target: SModelElementImpl, event: MouseEvent): Action[] {
        if (this.isMouseDown)
            this.isMouseDrag = true;

        const result = super.mouseMove(target, event) as Action[];

        if (this.isMouseDrag) {
            // reset any selected connectables when we are dragging, maybe the user is just panning
            this.setNewConnectable(undefined);
        }

        return result;
    }

    override mouseUp(target: SModelElementImpl, event: MouseEvent): Action[] {
        this.isMouseDown = false;

        if (this.isMouseDrag) {
            this.isMouseDrag = false;
            return [];
        }

        const result = super.mouseUp(target, event) as Action[];

        if (!this.isReadyToReconnect() && !this.isReadyToReroute())
            return result;

        if (this.edge && this.newConnectable) {
            const sourceElementId = this.isReconnectingNewSource() ? this.newConnectable.id : this.edge.sourceId;
            const targetElementId = this.isReconnectingNewSource() ? this.edge.targetId : this.newConnectable.id;

            if (this.requiresReconnect(sourceElementId, targetElementId)) {
                result.push(ReconnectEdgeAction.create({ edgeElementId: this.edge.id, sourceElementId, targetElementId }));
            }

            this.reset();
        } else if (this.edge && this.routingHandle) {
            // we need to re-retrieve the edge as it might have changed due to a server update since we do not reset the state between
            // reroute actions
            const latestEdge = target.index.getById(this.edge.id);

            if (latestEdge && isRoutable(latestEdge)) {
                const newRoutingPoints = calcElementAndRoutingPoints(latestEdge, this.tool.edgeRouterRegistry);
                result.push(ChangeRoutingPointsAction.create([newRoutingPoints]));
                this.routingHandle = undefined;
            }
        }

        return result;
    }

    override mouseOver(target: SModelElementImpl, _event: MouseEvent): Action[] {
        if (this.edge && this.isReconnecting()) {
            const currentTarget = findParentByFeature(target, isConnectable);

            if (!this.newConnectable || currentTarget !== this.newConnectable) {
                this.setNewConnectable(currentTarget);
            }
        }
        return [];
    }

    protected isValidEdge(edge?: SRoutableElementImpl): edge is SRoutableElementImpl {
        return edge !== undefined && edge.id !== createEdgeId(edge.root) && isSelected(edge);
    }

    protected setEdgeSelected(edge: SRoutableElementImpl): void {
        if (this.edge && this.edge.id !== edge.id) {
            this.reset();
        }

        this.edge = edge;

        if (canEditRouting(edge)) {
            this.actionDispatcher.dispatch(SwitchRoutingModeAction.create({ elementsToActivate: [this.edge.id] }));
        }

        if (isReconnectable(edge)) {
            this.actionDispatcher.dispatch(ShowEdgeReconnectHandlesAction.create(this.edge.id));
        }
    }

    protected isEdgeSelected(): boolean {
        return this.edge !== undefined && isSelected(this.edge);
    }

    protected setReconnectHandleSelected(edge: SRoutableElementImpl, reconnectHandle: SRoutingHandleImpl): void {
        if (this.edge && this.edge.target && this.edge.source) {
            if (isSourceRoutingHandle(edge, reconnectHandle)) {
                this.actionDispatcher.dispatch(HideEdgeReconnectHandlesAction.create());
                this.actionDispatcher.dispatch(DrawEditEdgeSourceAction.create({ targetId: this.edge.targetId }));
                this.reconnectMode = 'NEW_SOURCE';
            } else if (isTargetRoutingHandle(edge, reconnectHandle)) {
                this.actionDispatcher.dispatch(HideEdgeReconnectHandlesAction.create());
                this.actionDispatcher.dispatch(DrawCreateEdgeAction.create({ sourceId: this.edge.sourceId }))
                this.reconnectMode = 'NEW_TARGET';
            }
        }
    }

    protected isReconnecting(): boolean {
        return this.reconnectMode !== undefined;
    }

    protected isReconnectingNewSource(): boolean {
        return this.reconnectMode === 'NEW_SOURCE';
    }

    protected setRoutingHandleSelected(edge: SRoutableElementImpl, routingHandle: SRoutingHandleImpl): void {
        if (this.edge && this.edge.target && this.edge.source) {
            this.routingHandle = routingHandle;
        }
    }

    protected requiresReconnect(sourceId: string, targetId: string): boolean {
        return this.edge !== undefined && (this.edge.sourceId !== sourceId || this.edge.targetId !== targetId);
    }

    protected setNewConnectable(connectable?: SModelElementImpl & Connectable): void {
        this.newConnectable = connectable;
    }

    protected isReadyToReconnect(): boolean | undefined {
        return this.edge && this.isReconnecting() && this.newConnectable !== undefined;
    }

    protected isReadyToReroute(): boolean {
        return this.routingHandle !== undefined;
    }

    protected selectionChanged(root: Readonly<SModelRootImpl>, selectedElements: string[]): void {
        if (this.edge) {
            if (selectedElements.indexOf(this.edge.id) > -1) {
                // our active edge is still selected, nothing to do
                return;
            }

            if (this.isReconnecting()) {
                // we are reconnecting, so we may have clicked on a potential target
                return;
            }

            // try to find some other selected element and mark that active
            for (const elementId of selectedElements.reverse()) {
                const element = root.index.getById(elementId);
                if (element) {
                    const edge = findParentByFeature(element, isRoutable);
                    if (this.isValidEdge(edge)) {
                        // PHASE 1: Select edge
                        this.setEdgeSelected(edge);
                        return;
                    }
                }
            }

            this.reset();
        }
    }

    protected reset(): void {
        this.resetFeedback();
        this.resetData();
    }

    protected resetData(): void {
        this.edge = undefined;
        this.reconnectMode = undefined;
        this.newConnectable = undefined;
        this.routingHandle = undefined;
    }

    protected resetFeedback(): void {
        const result: Action[] = [];
        if (this.edge) {
            this.actionDispatcher.dispatch(SwitchRoutingModeAction.create({ elementsToDeactivate: [this.edge.id] }));
        }

        this.actionDispatcher.dispatch(HideEdgeReconnectHandlesAction.create());
        this.actionDispatcher.dispatch(RemoveCreateEdgeAction.create());
        this.tool.deregisterMouseListeners();
    }
}
