import { inject, injectable } from 'inversify';
import { Command, CommandExecutionContext, CommandReturn, TYPES } from 'sprotty';
import { Action } from 'sprotty-protocol';
import { drawCreateEdgeEnd, removeDanglingCreateEdgeEnd } from './edge-create-utils';

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

export interface DrawCreateEdgeEndAction extends Action {
    kind: typeof DrawCreateEdgeEndAction.KIND;
    sourceId: string;
}
export namespace DrawCreateEdgeEndAction {
    export const KIND = 'drawCreateEdgeEnd';

    export function create(options: { sourceId: string; }): DrawCreateEdgeEndAction {
        return {
            kind: KIND,
            ...options
        };
    }
}

@injectable()
export class DrawCreateEdgeEndCommand extends Command {
    static readonly KIND = DrawCreateEdgeEndAction.KIND;

    constructor(@inject(TYPES.Action) protected action: DrawCreateEdgeEndAction) {
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

export interface RemoveCreateEdgeEndAction extends Action {
    kind: typeof RemoveCreateEdgeEndAction.KIND;
}
export namespace RemoveCreateEdgeEndAction {
    export const KIND = 'removeCreateEdgeEnd';

    export function create(): RemoveCreateEdgeEndAction {
        return { kind: KIND };
    }
}

@injectable()
export class RemoveCreateEdgeEndCommand extends Command {
    static readonly KIND = RemoveCreateEdgeEndAction.KIND;

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