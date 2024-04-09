import { inject, injectable } from 'inversify';
import { Command, CommandExecutionContext, CommandReturn, TYPES } from 'sprotty';
import { Action } from 'sprotty-protocol';
import { drawCreateEdgeEnd, removeDanglingCreateEdgeEnd } from './edge-create-utils';

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
        drawCreateEdgeEnd(context, this.action.sourceId);
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
    export const KIND = 'removeCreateEdgeEnd';

    export function create(): RemoveCreateEdgeAction {
        return { kind: KIND };
    }
}

@injectable()
export class RemoveCreateEdgeCommand extends Command {
    static readonly KIND = RemoveCreateEdgeAction.KIND;

    execute(context: CommandExecutionContext): CommandReturn {
        removeDanglingCreateEdgeEnd(context.root);
        return context.root;
    }

    undo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }

    redo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }
}