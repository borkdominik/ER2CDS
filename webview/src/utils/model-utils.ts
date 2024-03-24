import { InternalBoundsAware, ModelIndexImpl, SModelElementImpl, getAbsoluteBounds } from "sprotty";
import { FluentIterable } from "sprotty/lib/utils/iterable";
import { Selectable } from 'sprotty-protocol';

export type ModelFilterPredicate<T> = (modelElement: SModelElementImpl) => modelElement is SModelElementImpl & T;

export type SelectableBoundsAware = SModelElementImpl & InternalBoundsAware & Selectable;
export type BoundsAwareModelElement = SModelElementImpl & InternalBoundsAware;

export function forEachElement<T>(index: ModelIndexImpl, predicate: ModelFilterPredicate<T>, runnable: (modelElement: SModelElementImpl & T) => void): void {
    filter(index, predicate).forEach(runnable);
}

export function getMatchingElements<T>(index: ModelIndexImpl, predicate: ModelFilterPredicate<T>): (SModelElementImpl & T)[] {
    return Array.from(filter(index, predicate));
}

export function filter<T>(index: ModelIndexImpl, predicate: ModelFilterPredicate<T>): FluentIterable<SModelElementImpl & T> {
    return index.all().filter(predicate) as FluentIterable<SModelElementImpl & T>;
}

export function isVisibleOnCanvas(model: BoundsAwareModelElement): boolean {
    const modelBounds = getAbsoluteBounds(model);
    const canvasBounds = model.root.canvasBounds;
    return (
        modelBounds.x <= canvasBounds.width &&
        modelBounds.x + modelBounds.width >= 0 &&
        modelBounds.y <= canvasBounds.height &&
        modelBounds.y + modelBounds.height >= 0
    );
}

export function distinctAdd<T>(array: T[], ...values: T[]): void {
    values.forEach(value => {
        if (!array.includes(value)) {
            array.push(value);
        }
    });
}
