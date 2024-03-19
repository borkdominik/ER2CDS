import { inject, injectable } from 'inversify';
import { Command, CommandExecutionContext, CommandReturn, TYPES } from 'sprotty';
import { Action } from 'sprotty-protocol';
import { Point } from 'sprotty-protocol';
import { MarqueeUtil } from './marquee-util';

export interface DrawMarqueeAction extends Action {
    kind: typeof DrawMarqueeAction.KIND;
    startPoint: Point;
    endPoint: Point;
}
export namespace DrawMarqueeAction {
    export const KIND = 'drawMarquee';

    export function create(options: { startPoint: Point; endPoint: Point }): DrawMarqueeAction {
        return {
            kind: KIND,
            ...options
        };
    }
}

export interface RemoveMarqueeAction extends Action {
    kind: typeof RemoveMarqueeAction.KIND;
}
export namespace RemoveMarqueeAction {
    export const KIND = 'removeMarquee';

    export function create(): RemoveMarqueeAction {
        return { kind: KIND };
    }
}

@injectable()
export class DrawMarqueeCommand extends Command {
    static readonly KIND = DrawMarqueeAction.KIND;

    protected marqueeUtil: MarqueeUtil = new MarqueeUtil();

    constructor(@inject(TYPES.Action) protected action: DrawMarqueeAction) {
        super();
    }

    execute(context: CommandExecutionContext): CommandReturn {
        this.marqueeUtil.drawMarquee(context, this.action.startPoint, this.action.endPoint);
        return context.root;
    }

    undo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }
    redo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }
}

@injectable()
export class RemoveMarqueeCommand extends Command {
    static readonly KIND = RemoveMarqueeAction.KIND;

    protected marqueeUtil: MarqueeUtil = new MarqueeUtil();

    execute(context: CommandExecutionContext): CommandReturn {
        this.marqueeUtil.removeMarquee(context.root);
        return context.root;
    }

    undo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }
    redo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }
}
