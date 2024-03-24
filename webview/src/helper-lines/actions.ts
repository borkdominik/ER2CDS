import { inject, injectable } from 'inversify';
import { partition } from 'lodash';
import { HelperLine, HelperLineType, SelectionBounds, isHelperLine, isSelectionBounds } from './model';
import { Command, CommandExecutionContext, CommandReturn, InternalBoundsAware, SModelElementImpl, SModelRootImpl, TYPES, findParentByFeature, isBoundsAware, isViewport } from 'sprotty';
import { Action, Bounds, Viewport } from 'sprotty-protocol';
import { getMatchingElements, forEachElement } from '../utils/model-utils';
import { center, topCenter, bottomCenter, middle, middleLeft, middleRight, left, bottomLeft, topLeft, right, bottomRight, topRight, bottom, isAbove, isBefore, sortBy, top } from '../utils/geometry-utils';
import { getViewportBounds, toAbsoluteBounds } from '../utils/viewpoint-utils';

import '../../css/helper-lines.css';

export interface DrawHelperLinesAction extends Action {
    kind: typeof DrawHelperLinesAction.KIND;
    elementIds: string[];
    elementLines?: HelperLineType[];
    viewportLines?: (typeof HelperLineType.Center | typeof HelperLineType.Middle | string)[];
    alignmentEpsilon?: number;
    alignmentElementFilter?: ((element: SModelElementImpl & InternalBoundsAware, referenceElementIds: string[]) => boolean);
}
export namespace DrawHelperLinesAction {
    export const KIND = 'drawHelperLines';

    export function create(options: Omit<DrawHelperLinesAction, 'kind'>): DrawHelperLinesAction {
        return {
            kind: KIND,
            ...options
        };
    }
}

@injectable()
export class DrawHelperLinesCommand extends Command {
    static readonly KIND = DrawHelperLinesAction.KIND;

    protected elementIds: string[];
    protected elementLines: HelperLineType[];
    protected viewportLines: (typeof HelperLineType.Center | typeof HelperLineType.Middle | string)[];
    protected alignmentEpsilon: number;
    protected alignableElementFilter: ((element: SModelElementImpl & InternalBoundsAware, referenceElementIds: string[]) => boolean);
    protected isAlignableElementPredicate: (element: SModelElementImpl) => element is (SModelElementImpl & InternalBoundsAware);

    constructor(@inject(TYPES.Action) action: DrawHelperLinesAction) {
        super();

        this.elementIds = action.elementIds;
        this.elementLines = action.elementLines;
        this.viewportLines = action.viewportLines;
        this.alignmentEpsilon = action.alignmentEpsilon;
        this.alignableElementFilter = action.alignmentElementFilter;
        this.isAlignableElementPredicate = this.isAlignableElement.bind(this);
    }

    execute(context: CommandExecutionContext): CommandReturn {
        this.removeHelperLines(context.root);
        this.removeSelectionBounds(context.root);

        const alignableElements = getMatchingElements(context.root.index, this.isAlignableElementPredicate);
        const [referenceElements, elements] = partition(alignableElements, element => this.elementIds.includes(element.id));

        if (referenceElements.length === 0)
            return context.root;

        const referenceBounds = this.calcReferenceBounds(referenceElements);
        const helperLines = this.calcHelperLines(elements, referenceBounds, context);

        if (referenceElements.length > 1)
            context.root.add(new SelectionBounds(referenceBounds));

        helperLines.forEach(helperLine => context.root.add(helperLine));

        return context.root;
    }

    undo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }

    redo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }

    protected isAlignableElement(element: SModelElementImpl): element is (SModelElementImpl & InternalBoundsAware) {
        return isBoundsAware(element) && this.alignableElementFilter(element, this.elementIds);
    }

    protected calcReferenceBounds(referenceElements: (SModelElementImpl & InternalBoundsAware)[]): Bounds {
        return referenceElements.map(element => this.calcBounds(element)).reduce(Bounds.combine, Bounds.EMPTY);
    }

    protected calcBounds(element: (SModelElementImpl & InternalBoundsAware)): Bounds {
        return toAbsoluteBounds(element);
    }

    protected calcHelperLines(elements: (SModelElementImpl & InternalBoundsAware)[], bounds: Bounds, context: CommandExecutionContext): HelperLine[] {
        const helperLines: HelperLine[] = [];
        const viewport = findParentByFeature(context.root, isViewport);

        if (viewport) {
            helperLines.push(...this.calcHelperLinesForViewport(viewport, bounds, this.viewportLines));
        }

        elements.flatMap(element => this.calcHelperLinesForElement(element, bounds, this.elementLines)).forEach(line => helperLines.push(line));

        return helperLines;
    }

    protected calcHelperLinesForViewport(root: Viewport & SModelRootImpl, bounds: Bounds, lineTypes: HelperLineType[]): HelperLine[] {
        const helperLines: HelperLine[] = [];
        const viewportBounds = getViewportBounds(root, root.canvasBounds);

        if (lineTypes.includes(HelperLineType.Center) && this.isAligned(center, viewportBounds, bounds, 2)) {
            helperLines.push(new HelperLine(topCenter(viewportBounds), bottomCenter(viewportBounds), HelperLineType.Center));
        }

        if (lineTypes.includes(HelperLineType.Middle) && this.isAligned(middle, viewportBounds, bounds, 2)) {
            helperLines.push(new HelperLine(middleLeft(viewportBounds), middleRight(viewportBounds), HelperLineType.Middle));
        }

        return helperLines;
    }

    protected calcHelperLinesForElement(element: (SModelElementImpl & InternalBoundsAware), bounds: Bounds, lineTypes: HelperLineType[]): HelperLine[] {
        return this.calcHelperLinesForBounds(this.calcBounds(element), bounds, lineTypes);
    }

    protected calcHelperLinesForBounds(elementBounds: Bounds, bounds: Bounds, lineTypes: HelperLineType[]): HelperLine[] {
        const helperLines: HelperLine[] = [];

        if (lineTypes.includes(HelperLineType.Left) && this.isAligned(left, elementBounds, bounds, this.alignmentEpsilon)) {
            const [above, below] = sortBy(top, elementBounds, bounds); // higher top-value ==> lower
            helperLines.push(new HelperLine(bottomLeft(below), topLeft(above), HelperLineType.Left));
        }

        if (lineTypes.includes(HelperLineType.Center) && this.isAligned(center, elementBounds, bounds, this.alignmentEpsilon)) {
            const [above, below] = sortBy(top, elementBounds, bounds); // higher top-value ==> lower
            helperLines.push(new HelperLine(topCenter(above), bottomCenter(below), HelperLineType.Center));
        }

        if (lineTypes.includes(HelperLineType.Right) && this.isAligned(right, elementBounds, bounds, this.alignmentEpsilon)) {
            const [above, below] = sortBy(top, elementBounds, bounds); // higher top-value ==> lower
            helperLines.push(new HelperLine(bottomRight(below), topRight(above), HelperLineType.Right));
        }

        if (lineTypes.includes(HelperLineType.Bottom) && this.isAligned(bottom, elementBounds, bounds, this.alignmentEpsilon)) {
            const [before, after] = sortBy(left, elementBounds, bounds); // higher left-value ==> more to the right
            helperLines.push(new HelperLine(bottomLeft(before), bottomRight(after), HelperLineType.Bottom));
        }

        if (lineTypes.includes(HelperLineType.Middle) && this.isAligned(middle, elementBounds, bounds, this.alignmentEpsilon)) {
            const [before, after] = sortBy(left, elementBounds, bounds); // higher left-value ==> more to the right
            helperLines.push(new HelperLine(middleLeft(before), middleRight(after), HelperLineType.Middle));
        }

        if (lineTypes.includes(HelperLineType.Top) && this.isAligned(top, elementBounds, bounds, this.alignmentEpsilon)) {
            const [before, after] = sortBy(left, elementBounds, bounds); // higher left-value ==> more to the right
            helperLines.push(new HelperLine(topLeft(before), topRight(after), HelperLineType.Top));
        }

        if (lineTypes.includes(HelperLineType.LeftRight) && this.isMatch(left(elementBounds), right(bounds), this.alignmentEpsilon)) {
            if (isAbove(bounds, elementBounds)) {
                helperLines.push(new HelperLine(bottomLeft(elementBounds), topRight(bounds), HelperLineType.RightLeft));
            } else {
                helperLines.push(new HelperLine(topLeft(elementBounds), bottomRight(bounds), HelperLineType.RightLeft));
            }
        }

        if (lineTypes.includes(HelperLineType.LeftRight) && this.isMatch(right(elementBounds), left(bounds), this.alignmentEpsilon)) {
            if (isAbove(bounds, elementBounds)) {
                helperLines.push(new HelperLine(bottomRight(elementBounds), topLeft(bounds), HelperLineType.LeftRight));
            } else {
                helperLines.push(new HelperLine(topRight(elementBounds), bottomLeft(bounds), HelperLineType.LeftRight));
            }
        }

        if (lineTypes.includes(HelperLineType.TopBottom) && this.isMatch(top(elementBounds), bottom(bounds), this.alignmentEpsilon)) {
            if (isBefore(bounds, elementBounds)) {
                helperLines.push(new HelperLine(topRight(elementBounds), bottomLeft(bounds), HelperLineType.BottomTop));
            } else {
                helperLines.push(new HelperLine(topLeft(elementBounds), bottomRight(bounds), HelperLineType.BottomTop));
            }
        }

        if (lineTypes.includes(HelperLineType.TopBottom) && this.isMatch(bottom(elementBounds), top(bounds), this.alignmentEpsilon)) {
            if (isBefore(bounds, elementBounds)) {
                helperLines.push(new HelperLine(bottomRight(elementBounds), topLeft(bounds), HelperLineType.TopBottom));
            } else {
                helperLines.push(new HelperLine(bottomLeft(elementBounds), topRight(bounds), HelperLineType.TopBottom));
            }
        }

        return helperLines;
    }

    protected isAligned(coordinate: (elem: Bounds) => number, leftBounds: Bounds, rightBounds: Bounds, epsilon: number): boolean {
        return this.isMatch(coordinate(leftBounds), coordinate(rightBounds), epsilon);
    }

    protected isMatch(leftCoordinate: number, rightCoordinate: number, epsilon: number): boolean {
        return Math.abs(leftCoordinate - rightCoordinate) <= epsilon;
    }

    private removeHelperLines(root: SModelRootImpl): void {
        forEachElement(root.index, isHelperLine, line => root.remove(line));
    }

    private removeSelectionBounds(root: SModelRootImpl): void {
        forEachElement(root.index, isSelectionBounds, line => root.remove(line));
    }
}

export interface RemoveHelperLinesAction extends Action {
    kind: typeof RemoveHelperLinesAction.KIND;
}

export namespace RemoveHelperLinesAction {
    export const KIND = 'removeHelperLines';

    export function create(options: Omit<RemoveHelperLinesAction, 'kind'> = {}): RemoveHelperLinesAction {
        return {
            kind: KIND,
            ...options
        };
    }
}

@injectable()
export class RemoveHelperLinesCommand extends Command {
    static readonly KIND = RemoveHelperLinesAction.KIND;

    constructor(@inject(TYPES.Action) public action: RemoveHelperLinesAction) {
        super();
    }

    override execute(context: CommandExecutionContext): CommandReturn {
        this.removeHelperLines(context.root);
        this.removeSelectionBounds(context.root);
        return context.root;
    }

    undo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }

    redo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }

    private removeHelperLines(root: SModelRootImpl): void {
        forEachElement(root.index, isHelperLine, line => root.remove(line));
    }

    private removeSelectionBounds(root: SModelRootImpl): void {
        forEachElement(root.index, isSelectionBounds, line => root.remove(line));
    }
}