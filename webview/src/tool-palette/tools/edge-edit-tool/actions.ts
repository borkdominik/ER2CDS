import { injectable, inject } from 'inversify';
import { TYPES, CommandExecutionContext, CommandReturn, Command, SwitchEditModeAction, SwitchEditModeCommand } from 'sprotty';
import { Action } from 'sprotty-protocol';
import { ElementAndRoutingPoints, forEachElement } from '../../../utils/model-utils';
import { isRoutable } from '../edge-create-tool/edge-create-utils';
import { addReconnectHandles, drawEditEdgeSource, removeReconnectHandles } from './edge-edit-utils';

export interface ShowEdgeReconnectHandlesAction extends Action {
    kind: typeof ShowEdgeReconnectHandlesAction.KIND;
    readonly elementId: string;
}
export namespace ShowEdgeReconnectHandlesAction {
    export const KIND = 'showReconnectHandles';

    export function create(elementId: string): ShowEdgeReconnectHandlesAction {
        return { kind: KIND, elementId };
    }
}

@injectable()
export class ShowEdgeReconnectHandlesCommand extends Command {
    static readonly KIND = ShowEdgeReconnectHandlesAction.KIND;

    constructor(@inject(TYPES.Action) protected action: ShowEdgeReconnectHandlesAction) {
        super();
    }

    execute(context: CommandExecutionContext): CommandReturn {
        const index = context.root.index;
        forEachElement(index, isRoutable, removeReconnectHandles);

        const routableElement = index.getById(this.action.elementId);
        if (routableElement && isRoutable(routableElement)) {
            addReconnectHandles(routableElement);
        }

        return context.root;
    }

    undo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }

    redo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }
}

export interface HideEdgeReconnectHandlesAction extends Action {
    kind: typeof HideEdgeReconnectHandlesAction.KIND;
}
export namespace HideEdgeReconnectHandlesAction {
    export const KIND = 'hideReconnectHandles';

    export function create(): HideEdgeReconnectHandlesAction {
        return { kind: KIND };
    }
}

@injectable()
export class HideEdgeReconnectHandlesCommand extends Command {
    static readonly KIND = HideEdgeReconnectHandlesAction.KIND;

    constructor(@inject(TYPES.Action) protected action: HideEdgeReconnectHandlesAction) {
        super();
    }

    execute(context: CommandExecutionContext): CommandReturn {
        const index = context.root.index;
        forEachElement(index, isRoutable, removeReconnectHandles);
        return context.root;
    }

    undo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }

    redo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }
}

export interface SwitchRoutingModeAction extends Omit<SwitchEditModeAction, 'kind'> {
    kind: typeof SwitchRoutingModeAction.KIND;
}
export namespace SwitchRoutingModeAction {
    export const KIND = 'switchRoutingMode';
    export function create(options: { elementsToActivate?: string[]; elementsToDeactivate?: string[] }): SwitchRoutingModeAction {
        return {
            ...SwitchEditModeAction.create(options),
            kind: KIND
        };
    }
}

@injectable()
export class SwitchRoutingModeCommand extends SwitchEditModeCommand {
    static override KIND = SwitchRoutingModeAction.KIND;

    constructor(@inject(TYPES.Action) action: SwitchRoutingModeAction) {
        super({ ...action, kind: SwitchEditModeAction.KIND });
    }
}


export interface DrawEditEdgeSourceAction extends Action {
    kind: typeof DrawEditEdgeSourceAction.KIND;
    targetId: string;
}

export namespace DrawEditEdgeSourceAction {
    export const KIND = 'drawEditEdgeSource';

    export function create(options: { targetId: string }): DrawEditEdgeSourceAction {
        return {
            kind: KIND,
            ...options
        };
    }
}

@injectable()
export class DrawEditEdgeSourceCommand extends Command {
    static readonly KIND = DrawEditEdgeSourceAction.KIND;

    constructor(@inject(TYPES.Action) protected action: DrawEditEdgeSourceAction) {
        super();
    }

    execute(context: CommandExecutionContext): CommandReturn {
        drawEditEdgeSource(context, this.action.targetId);
        return context.root;
    }

    undo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }

    redo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }
}

export interface ReconnectEdgeAction extends Action {
    kind: typeof ReconnectEdgeAction.KIND;
    edgeElementId: string;
    sourceElementId: string;
    targetElementId: string;
}

export namespace ReconnectEdgeAction {
    export const KIND = 'reconnectEdge';

    export function create(options: { edgeElementId: string; sourceElementId: string; targetElementId: string; }): ReconnectEdgeAction {
        return {
            kind: KIND,
            ...options
        };
    }
}

export interface ChangeRoutingPointsAction extends Action {
    kind: typeof ChangeRoutingPointsAction.KIND;
    newRoutingPoints: ElementAndRoutingPoints[];
}

export namespace ChangeRoutingPointsAction {
    export const KIND = 'changeRoutingPoints';

    export function create(newRoutingPoints: ElementAndRoutingPoints[]): ChangeRoutingPointsAction {
        return {
            kind: KIND,
            newRoutingPoints
        };
    }
}
