import { CompositeCstNodeImpl, URI } from "langium";
import { ApplyLabelEditAction, SModelIndex } from "sprotty-protocol";
import { ER2CDSDiagramServer } from "../er2cds-diagram-server.js";
import { ER2CDSServices } from "../er2cds-module.js";
import { WorkspaceEditAction } from 'sprotty-vscode-protocol/lib/lsp/editing';
import { WorkspaceEdit } from 'vscode-languageserver-protocol';
import { Range } from 'vscode-languageserver-types';
import { ER2CDS } from "../generated/ast.js";

export class ApplyLabelEditActionHandler {
    private workspaceEdit: WorkspaceEdit | undefined;

    public handle(action: ApplyLabelEditAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
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

        const label = modelIndex.getById(action.labelId);

        if (label) {
            const labelSplit = action.labelId.split('.', 3);
            const element = labelSplit[0];
            const name = labelSplit[1];
            const type = labelSplit[2];

            // Entity-/Relationship-Label
            if (!type) {
                model.entities.forEach((e) => {
                    if (e.name === element && ((e.$cstNode) as CompositeCstNodeImpl).content[1].range) {
                        this.createWorkspaceEditReplaceAction(server, sourceUri, ((e.$cstNode) as CompositeCstNodeImpl).content[1].range, action.text);

                        model.relationships.forEach((r) => {
                            if (r.first?.target.$refText === element && r.first?.$cstNode?.range)
                                this.createWorkspaceEditReplaceAction(server, sourceUri, r.first?.$cstNode?.range, action.text);

                            if (r.second?.target.$refText === element && r.second?.$cstNode?.range)
                                this.createWorkspaceEditReplaceAction(server, sourceUri, r.second?.$cstNode?.range, action.text);
                        });
                    }
                });

                model.relationships.forEach((r) => {
                    if (r.name === element && ((r.$cstNode) as CompositeCstNodeImpl).content[1].range)
                        this.createWorkspaceEditReplaceAction(server, sourceUri, ((r.$cstNode) as CompositeCstNodeImpl).content[1].range, action.text);
                });

                // Attribute-Label
            } else {
                model.entities.filter(e => e.name === element).forEach(e => e.attributes.forEach((a) => {
                    if (a.name === name) {
                        if (type === 'name' && ((a.$cstNode) as CompositeCstNodeImpl).content[0].range)
                            this.createWorkspaceEditReplaceAction(server, sourceUri, ((a.$cstNode) as CompositeCstNodeImpl).content[0].range, action.text);

                        if (type === 'datatype' && a.datatype?.$cstNode?.range)
                            this.createWorkspaceEditReplaceAction(server, sourceUri, a.datatype?.$cstNode?.range, action.text);
                    }
                }));
            }
        }

        if (this.workspaceEdit) {
            const workspaceEditAction: WorkspaceEditAction = {
                kind: WorkspaceEditAction.KIND,
                workspaceEdit: this.workspaceEdit
            }

            server.dispatch(workspaceEditAction);
        }

        return Promise.resolve();
    }

    private createWorkspaceEditReplaceAction(server: ER2CDSDiagramServer, sourceUri: URI, range: Range, text: string) {
        if (!this.workspaceEdit) {
            this.workspaceEdit = {
                changes: {
                    [sourceUri.toString()]: []
                }
            }
        }

        const textEdit = {
            range: range,
            newText: text
        };

        if (this.workspaceEdit.changes)
            this.workspaceEdit.changes[sourceUri.toString()].push(textEdit);
    }
}