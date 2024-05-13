import { injectable, inject } from 'inversify';
import { TYPES, CommandExecutionContext, CommandReturn, Command, SParentElementImpl } from 'sprotty';
import { Action } from 'sprotty-protocol';
import { Marker } from '../actions';
import { IssueMarker, createIssue, getIssueMarker, getOrCreateIssueMarker } from './issue-marker';
import { addMaxSeverityCSSClassToIssueParent, removeCSSClassFromIssueParent } from './validation';

export interface ApplyMarkersAction extends Action {
    kind: typeof ApplyMarkersAction.KIND;
    markers: Marker[];
}
export namespace ApplyMarkersAction {
    export const KIND = 'applyMarkers';

    export function create(markers: Marker[]): ApplyMarkersAction {
        return {
            kind: KIND,
            markers
        };
    }
}

@injectable()
export class ApplyMarkersCommand extends Command {
    static KIND = ApplyMarkersAction.KIND;

    constructor(@inject(TYPES.Action) protected action: ApplyMarkersAction) {
        super();
    }

    execute(context: CommandExecutionContext): CommandReturn {
        this.action.markers.forEach(marker => {
            const modelElement = context.root.index.getById(marker.elementId);
            
            if (modelElement instanceof SParentElementImpl) {
                const issueMarker = getOrCreateIssueMarker(modelElement);
                const issue = createIssue(marker);

                issueMarker.issues.push(issue);
                if (issueMarker instanceof IssueMarker) {
                    issueMarker.computeProjectionCssClasses();
                }

                addMaxSeverityCSSClassToIssueParent(modelElement, issueMarker);
            }
        });

        return context.root;
    }

    undo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }

    redo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }
}

export interface DeleteMarkersAction extends Action {
    kind: typeof DeleteMarkersAction.KIND;
    markers: Marker[];
}
export namespace DeleteMarkersAction {
    export const KIND = 'deleteMarkers';

    export function create(markers: Marker[]): DeleteMarkersAction {
        return {
            kind: KIND,
            markers
        };
    }
}


@injectable()
export class DeleteMarkersCommand extends Command {
    static KIND = DeleteMarkersAction.KIND;

    constructor(@inject(TYPES.Action) protected action: DeleteMarkersAction) {
        super();
    }

    execute(context: CommandExecutionContext): CommandReturn {
        this.action.markers.forEach(marker => {
            const modelElement = context.root.index.getById(marker.elementId);
            if (modelElement instanceof SParentElementImpl) {
                const issueMarker = getIssueMarker(modelElement);

                if (issueMarker) {
                    removeCSSClassFromIssueParent(modelElement, issueMarker);

                    for (let index = 0; index < issueMarker.issues.length; ++index) {
                        const issue = issueMarker.issues[index];
                        if (issue.message === marker.description) {
                            issueMarker.issues.splice(index--, 1);
                        }
                    }

                    if (issueMarker.issues.length === 0) {
                        modelElement.remove(issueMarker);
                    } else {
                        addMaxSeverityCSSClassToIssueParent(modelElement, issueMarker);
                    }
                }
            }
        });

        return context.root;
    }

    undo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }

    redo(context: CommandExecutionContext): CommandReturn {
        throw new Error('Method not implemented.');
    }
}
