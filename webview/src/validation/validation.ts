import { injectable, inject } from 'inversify';
import { IActionDispatcher, IActionHandler, ICommand, SModelElementImpl, SParentElementImpl, TYPES } from 'sprotty';
import { SetMarkersAction, Marker } from '../actions';
import { IssueMarker, getSeverity } from './issue-marker';
import { Action } from 'sprotty-protocol';
import { ApplyMarkersAction, DeleteMarkersAction } from './actions';
import { remove } from 'lodash';

@injectable()
export class SetMarkersActionHandler implements IActionHandler {
    @inject(TYPES.IActionDispatcher)
    protected actionDispatcher: IActionDispatcher;

    protected previousMarkers: Marker[];

    handle(action: SetMarkersAction): void | Action | ICommand {
        this.setMarkers(action.markers);
    }

    async setMarkers(markers: Marker[]): Promise<void> {
        if(this.previousMarkers)
            await this.actionDispatcher.dispatch(DeleteMarkersAction.create(this.previousMarkers));

        this.previousMarkers = markers;
        this.actionDispatcher.dispatch(ApplyMarkersAction.create(markers));
    }
}

export function addMaxSeverityCSSClassToIssueParent(modelElement: SParentElementImpl, issueMarker: IssueMarker): void {
    const maxSeverityCSSClass = getSeverity(issueMarker);

    if (!modelElement.cssClasses) {
        modelElement.cssClasses = [maxSeverityCSSClass];
    } else {
        modelElement.cssClasses = modelElement.cssClasses.filter((value: string) => !value.match('info|warning|error'));
        modelElement.cssClasses.push(maxSeverityCSSClass);
    }
}

export function removeCSSClassFromIssueParent(modelElement: SParentElementImpl, issueMarker: IssueMarker): void {
    const severity = getSeverity(issueMarker);
    removeCssClasses(modelElement, [severity]);
}

export function removeCssClasses(root: SModelElementImpl, cssClasses: string[]): void {
    if (!root.cssClasses || root.cssClasses.length === 0) {
        return;
    }

    remove(root.cssClasses, ...cssClasses);
}