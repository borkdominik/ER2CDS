import { inject, injectable } from 'inversify';
import { Command, CommandExecutionContext, CommandReturn, TYPES } from 'sprotty';
import { Action } from 'sprotty-protocol';
import { drawCreateEdge, removeDanglingCreateEdge } from './edge-create-utils';

export interface CreateEdgeAction extends Action {
    kind: typeof CreateEdgeAction.KIND;
    sourceElementId: string;
    targetElementId: string;
}
export namespace CreateEdgeAction {
    export const KIND = 'createEdge';

    export function create(options: { sourceElementId: string; targetElementId: string; }): CreateEdgeAction {
        return {
            kind: KIND,
            ...options
        };
    }
}

export interface DrawCreateEdgeAction extends Action {
    kind: typeof DrawCreateEdgeAction.KIND;
    sourceId: string;
}
export namespace DrawCreateEdgeAction {
    export const KIND = 'drawCreateEdge';

    export function create(options: { sourceId: string; }): DrawCreateEdgeAction {
        return {
            kind: KIND,
            ...options
        };
    }
}

@injectable()
export class DrawCreateEdgeCommand extends Command {
    static readonly KIND = DrawCreateEdgeAction.KIND;

    constructor(@inject(TYPES.Action) protected action: DrawCreateEdgeAction) {
        super();
    }

    execute(context: CommandExecutionContext): CommandReturn {
        console.log("DRAW");
        drawCreateEdge(context, this.action.sourceId);
        return context.root;
    }

    undo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }

    redo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }
}

export interface RemoveCreateEdgeAction extends Action {
    kind: typeof RemoveCreateEdgeAction.KIND;
}
export namespace RemoveCreateEdgeAction {
    export const KIND = 'removeCreateEdgeCommand';

    export function create(): RemoveCreateEdgeAction {
        return { kind: KIND };
    }
}

@injectable()
export class RemoveCreateEdgeCommand extends Command {
    static readonly KIND = RemoveCreateEdgeAction.KIND;

    execute(context: CommandExecutionContext): CommandReturn {
        removeDanglingCreateEdge(context.root);
        return context.root;
    }

    undo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }

    redo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }
}