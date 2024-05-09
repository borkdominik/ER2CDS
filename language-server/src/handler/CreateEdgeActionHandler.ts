import { WorkspaceEditAction } from 'sprotty-vscode-protocol/lib/lsp/editing';
import { WorkspaceEdit } from 'vscode-languageserver-protocol';
import { Range, Position } from 'vscode-languageserver-types';
import { URI } from 'vscode-uri';
import { ER2CDSServices } from '../er2cds-module.js';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { SModelElement, SModelIndex } from 'sprotty-protocol';
import { CreateEdgeAction } from '../actions.js';
import { NODE_RELATIONSHIP } from '../model.js';
import { ER2CDS } from '../generated/ast.js';
import { expandToString } from 'langium';

export class CreateEdgeActionHandler {
    public handle(action: CreateEdgeAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
        const sourceUriString = server.state.options?.sourceUri?.toString();
        if (!sourceUriString)
            return Promise.resolve();

        const sourceUri = URI.parse(sourceUriString);
        if (!sourceUri)
            return Promise.resolve();

        const document = services.shared.workspace.LangiumDocuments.getOrCreateDocument(sourceUri);
        if (!document)
            return Promise.resolve();

        const model = document.parseResult.value as ER2CDS;

        const modelIndex = new SModelIndex();
        modelIndex.add(server.state.currentRoot);

        const source = modelIndex.getById(action.sourceElementId);
        const target = modelIndex.getById(action.targetElementId);

        if (source?.type === NODE_RELATIONSHIP && target) {
            model.relationships.forEach((r) => {
                if (r.name === source?.id && r.second?.$cstNode?.range) {
                    server.dispatch(this.createWorkspaceEditReplaceAction(server, sourceUri, r.second?.$cstNode?.range, target));
                } else if (r.name === source?.id && r.first?.$cstNode?.range) {
                    server.dispatch(this.createWorkspaceEditEnhanceTargetAction(server, sourceUri, r.first?.$cstNode?.range, target, r.first?.$cstNode?.text));
                } else if (r.name === source?.id && r.$cstNode?.range) {
                    server.dispatch(this.createWorkspaceEditInitialTargetAction(server, sourceUri, r.$cstNode?.range, target));
                }
            });
        }

        if (target?.type === NODE_RELATIONSHIP && source) {
            model.relationships.forEach((r) => {
                if (r.name === target?.id && r.first?.$cstNode?.range) {
                    server.dispatch(this.createWorkspaceEditReplaceAction(server, sourceUri, r.first?.$cstNode?.range, source));
                } else if (r.name === target.id && r.second?.$cstNode?.range) {
                    server.dispatch(this.createWorkspaceEditEnhanceSourceAction(server, sourceUri, r.second?.$cstNode?.range, source, r.second?.$cstNode?.text));
                } else if (r.name === target?.id && r.$cstNode?.range) {
                    server.dispatch(this.createWorkspaceEditInitialSourceAction(server, sourceUri, r.$cstNode?.range, source));
                }
            });
        }

        return Promise.resolve();
    }

    private createWorkspaceEditInitialSourceAction(server: ER2CDSDiagramServer, sourceUri: URI, range: Range, source: SModelElement): WorkspaceEditAction {
        const workspaceEdit: WorkspaceEdit = {
            changes: {
                [sourceUri.toString()]: [
                    {
                        range: range,
                        newText: expandToString`
                            relationship ${this.getNewName(NODE_RELATIONSHIP, 'Relationship', server.state.currentRoot.children)} {
                                ${source.id} -> 
                            }
                            `
                    }
                ]
            }
        }

        const workspaceEditAction: WorkspaceEditAction = {
            kind: WorkspaceEditAction.KIND,
            workspaceEdit: workspaceEdit
        }

        return workspaceEditAction;
    }

    private createWorkspaceEditInitialTargetAction(server: ER2CDSDiagramServer, sourceUri: URI, range: Range, element: SModelElement): WorkspaceEditAction {
        const workspaceEdit: WorkspaceEdit = {
            changes: {
                [sourceUri.toString()]: [
                    {
                        range: range,
                        newText: expandToString`
                        relationship ${this.getNewName(NODE_RELATIONSHIP, 'Relationship', server.state.currentRoot.children)} {
                             -> ${element.id}
                        }
                        `
                    }
                ]
            }
        }

        const workspaceEditAction: WorkspaceEditAction = {
            kind: WorkspaceEditAction.KIND,
            workspaceEdit: workspaceEdit
        }

        return workspaceEditAction;
    }

    private createWorkspaceEditEnhanceSourceAction(server: ER2CDSDiagramServer, sourceUri: URI, range: Range, source: SModelElement, targetText: string): WorkspaceEditAction {
        const workspaceEdit: WorkspaceEdit = {
            changes: {
                [sourceUri.toString()]: [
                    {
                        range: Range.create(Position.create(range.start.line, 0), Position.create(range.start.line, source.id.length + 5 + targetText.length)),
                        newText: expandToString`\t${source.id} -> ${targetText}`
                    }
                ]
            }
        }

        const workspaceEditAction: WorkspaceEditAction = {
            kind: WorkspaceEditAction.KIND,
            workspaceEdit: workspaceEdit
        }

        return workspaceEditAction;
    }

    private createWorkspaceEditEnhanceTargetAction(server: ER2CDSDiagramServer, sourceUri: URI, range: Range, target: SModelElement, sourceText: string): WorkspaceEditAction {
        const workspaceEdit: WorkspaceEdit = {
            changes: {
                [sourceUri.toString()]: [
                    {
                        range: Range.create(Position.create(range.start.line, 0), Position.create(range.start.line, sourceText.length + 4 + target.id.length)),
                        newText: expandToString`\t${sourceText} -> ${target.id}`
                    }
                ]
            }
        }

        const workspaceEditAction: WorkspaceEditAction = {
            kind: WorkspaceEditAction.KIND,
            workspaceEdit: workspaceEdit
        }

        return workspaceEditAction;
    }

    private createWorkspaceEditReplaceAction(server: ER2CDSDiagramServer, sourceUri: URI, range: Range, element: SModelElement): WorkspaceEditAction {
        const workspaceEdit: WorkspaceEdit = {
            changes: {
                [sourceUri.toString()]: [
                    {
                        range: range,
                        newText: element.id
                    }
                ]
            }
        }

        const workspaceEditAction: WorkspaceEditAction = {
            kind: WorkspaceEditAction.KIND,
            workspaceEdit: workspaceEdit
        }

        return workspaceEditAction;
    }

    private getNewName(type: string, prefix: string, elements: SModelElement[] | undefined): string {
        if (!elements)
            return this.createName(prefix, 0);

        let count = 0;
        for (let i = 0; i < elements.length; i += 1) {
            let name = this.createName(prefix, count);

            if (!elements.some(e => e.id === name))
                return name;

            if (elements[i].type === type)
                count += 1
        }

        return this.createName(prefix, count);
    }

    private createName(prefix: string, count: number): string {
        return prefix + count;
    }
}