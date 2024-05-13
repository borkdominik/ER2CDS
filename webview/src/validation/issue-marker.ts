import { isBoundsAware, SDecoration, SIssueMarkerImpl, SParentElementImpl } from 'sprotty';
import { Projectable, Bounds, SIssue, SIssueSeverity } from 'sprotty-protocol';
import { Marker, MarkerKind } from '../actions';

export class IssueMarker extends SIssueMarkerImpl implements Projectable {
    projectionCssClasses: string[];
    projectedBounds?: Bounds;

    override issues: SIssue[] = [];
    override type = 'marker';

    constructor() {
        super();
        this.features = new Set<symbol>(SDecoration.DEFAULT_FEATURES);
    }

    computeProjectionCssClasses(): void {
        const severityCss = getSeverity(this);
        this.projectionCssClasses = ['sprotty-issue', 'sprotty-' + severityCss];
    }
}

export function getOrCreateIssueMarker(modelElement: SParentElementImpl): IssueMarker {
    let issueMarker: IssueMarker | undefined;

    issueMarker = getIssueMarker(modelElement);

    if (issueMarker === undefined) {
        issueMarker = new IssueMarker();

        if (isBoundsAware(modelElement)) {
            issueMarker.projectedBounds = modelElement.parentToLocal(modelElement.bounds);
        }

        modelElement.add(issueMarker);
    }

    return issueMarker;
}

export function getIssueMarker(modelElement: SParentElementImpl): IssueMarker | undefined {
    let issueMarker: IssueMarker | undefined;

    for (const child of modelElement.children) {
        if (child instanceof IssueMarker) {
            issueMarker = child;
        }
    }

    return issueMarker;
}

export function createIssue(marker: Marker, parent?: SParentElementImpl): SIssue {
    let severity: SIssueSeverity;
    switch (marker.kind) {
        case MarkerKind.ERROR: {
            severity = 'error';
            break;
        }
        case MarkerKind.INFO: {
            severity = 'info';
            break;
        }
        case MarkerKind.WARNING: {
            severity = 'warning';
            break;
        }
    }

    const issue: SIssue = {
        message: marker.description,
        severity: severity
    };

    return issue;
}

export function getSeverity(marker: IssueMarker): SIssueSeverity {
    let currentSeverity: SIssueSeverity = 'info';

    for (const severity of marker.issues.map(s => s.severity)) {
        if (severity === 'error') {
            return severity;
        }

        if (severity === 'warning' && currentSeverity === 'info') {
            currentSeverity = severity;
        }
    }

    return currentSeverity;
}
