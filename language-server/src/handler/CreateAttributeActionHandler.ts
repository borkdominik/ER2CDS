import { CompositeCstNodeImpl, URI, expandToString } from 'langium';
import { SModelElement, SModelIndex } from 'sprotty-protocol';
import { CreateAttributeAction } from '../actions.js';
import { ER2CDSDiagramServer } from '../er2cds-diagram-server.js';
import { ER2CDSServices } from '../er2cds-module.js';
import { COMP_ATTRIBUTES, COMP_ATTRIBUTES_ROW } from '../model.js';
import { WorkspaceEditAction } from 'sprotty-vscode-protocol/lib/lsp/editing';
import { WorkspaceEdit } from 'vscode-languageserver-protocol';
import { Range, Position } from 'vscode-languageserver-types';
import { ER2CDS } from '../generated/ast.js';

export class CreateAttributeActionHandler {
    public async handle(action: CreateAttributeAction, server: ER2CDSDiagramServer, services: ER2CDSServices): Promise<void> {
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

        const entity = modelIndex.getById(action.elementId);
        if (!entity)
            return Promise.resolve();

        const childrenNodes = ((model.entities.find((e) => e.name === entity?.id)?.$cstNode) as CompositeCstNodeImpl).content;
        const lastChild = childrenNodes[childrenNodes.length - 1];

        const newText = this.getNewName(COMP_ATTRIBUTES_ROW, 'Attribute', entity?.id, entity?.children?.find(c => c.type === COMP_ATTRIBUTES)?.children);
        const workspaceEdit: WorkspaceEdit = {
            changes: {
                [sourceUri.toString()]: [
                    {
                        range: Range.create(Position.create(lastChild.range.start.line, 0), Position.create(lastChild.range.end.line, lastChild.range.end.character)),
                        newText: expandToString`
                            ${newText} : STRING
                        }`
                    }
                ]
            }
        }
        const workspaceEditAction: WorkspaceEditAction = {
            kind: WorkspaceEditAction.KIND,
            workspaceEdit: workspaceEdit
        }

        await server.dispatch(workspaceEditAction);

        return Promise.resolve();
    }

    private getNewName(type: string, prefix: string, entityName: string, elements: SModelElement[] | undefined): string {
        if (!elements)
            return this.createName(prefix, 0);

        let count = 0;
        for (let i = 0; i < elements.length; i += 1) {
            let name = this.createName(prefix, count);

            if (!elements.some(e => e.id === (entityName + '.' + name)))
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