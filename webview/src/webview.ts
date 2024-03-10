import 'reflect-metadata';
import 'sprotty-vscode-webview/css/sprotty-vscode.css';

import { Container } from 'inversify';
import { SprottyDiagramIdentifier, VscodeDiagramServer, VscodeDiagramWidget } from 'sprotty-vscode-webview';
import { SprottyLspEditStarter } from 'sprotty-vscode-webview/lib/lsp/editing';
import { default as createDiagramContainer } from './di.config';
import { ER2CDSDiagramServer } from './diagram-server';
import { ER2CDSDiagramWidget } from './diagram-widget';

export class ER2CDSSprottyStarter extends SprottyLspEditStarter {

    protected override createContainer(diagramIdentifier: SprottyDiagramIdentifier) {
        return createDiagramContainer(diagramIdentifier.clientId);
    }

    protected override addVscodeBindings(container: Container, diagramIdentifier: SprottyDiagramIdentifier): void {
        super.addVscodeBindings(container, diagramIdentifier);

        container.rebind(VscodeDiagramServer).to(ER2CDSDiagramServer);
        container.rebind(VscodeDiagramWidget).to(ER2CDSDiagramWidget).inSingletonScope();
    }
}

new ER2CDSSprottyStarter().start();