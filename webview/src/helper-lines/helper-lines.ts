import { ActionDispatcher, IActionHandler, InternalBoundsAware, SLabelImpl, SModelElementImpl, SModelRootImpl, TYPES, isDecoration } from 'sprotty';
import { isRoutable } from '../tool-palette/tools/edge-create-tool/edge-create-utils';
import { HelperLineType } from './model';
import { isVisibleOnCanvas } from '../utils/model-utils';
import { Action, MoveAction, SetBoundsAction } from 'sprotty-protocol';
import { inject, injectable } from 'inversify';
import { DrawHelperLinesAction, RemoveHelperLinesAction } from './actions';

export const DEFAULT_MOVE_DELTA = { x: 1, y: 1 };

export const ALL_ELEMENT_LINE_TYPES = Object.values(HelperLineType);
export const ALL_VIEWPORT_LINE_TYPES = [HelperLineType.Center, HelperLineType.Middle];

export const DEFAULT_ELEMENT_LINES = ALL_ELEMENT_LINE_TYPES;
export const DEFAULT_VIEWPORT_LINES = ALL_VIEWPORT_LINE_TYPES;
export const DEFAULT_EPSILON = 1;
export const DEFAULT_ALIGNABLE_ELEMENT_FILTER = (element: SModelElementImpl & InternalBoundsAware): boolean => isVisibleOnCanvas(element) && !isRoutable(element) && !(element instanceof SLabelImpl) && !(element.id === helperLineEdgeId(element.root)) && !(element.id === helperLineEdgeEndId(element.root)) && !isDecoration(element);

export const DEFAULT_HELPER_LINE_OPTIONS = {
    elementLines: DEFAULT_ELEMENT_LINES,
    viewportLines: DEFAULT_VIEWPORT_LINES,
    alignmentEpsilon: DEFAULT_EPSILON,
    alignmentElementFilter: DEFAULT_ALIGNABLE_ELEMENT_FILTER,
    minimumMoveDelta: DEFAULT_MOVE_DELTA,
};

export function helperLineEdgeId(root: SModelRootImpl): string {
    return root.id + '_helper_line_edge';
}

export function helperLineEdgeEndId(root: SModelRootImpl): string {
    return root.id + '_helper_line_anchor';
}

@injectable()
export class HelperLineManager implements IActionHandler {
    @inject(TYPES.IActionDispatcher)
    protected actionDispatcher: ActionDispatcher;

    handle(action: Action): void {
        if (action.kind === MoveAction.KIND) {
            this.handleMoveAction(action as MoveAction);
        } else if (action.kind === SetBoundsAction.KIND) {
            this.handleSetBoundsAction(action as SetBoundsAction);
        }
    }

    protected handleMoveAction(action: MoveAction): void {
        if (action.finished) {
            this.actionDispatcher.dispatch(RemoveHelperLinesAction.create());
        } else {
            const elementIds = action.moves.map(move => move.elementId);
            this.actionDispatcher.dispatch(DrawHelperLinesAction.create({ elementIds, ...DEFAULT_HELPER_LINE_OPTIONS }));
        }
    }

    protected handleSetBoundsAction(action: SetBoundsAction): void {
        const elementIds = action.bounds.map(bound => bound.elementId);
        this.actionDispatcher.dispatch(DrawHelperLinesAction.create({ elementIds, ...DEFAULT_HELPER_LINE_OPTIONS }));
    }
}
