import 'reflect-metadata';
import 'sprotty-vscode-webview/css/sprotty-vscode.css';

import { Container } from 'inversify';
import { SprottyDiagramIdentifier, VscodeDiagramServer, VscodeDiagramWidget } from 'sprotty-vscode-webview';
import { SprottyLspEditStarter } from 'sprotty-vscode-webview/lib/lsp/editing';
import { default as createDiagramContainer } from './di.config';
import { ER2CDSDiagramServer } from './diagram-server';
import { ER2CDSDiagramWidget } from './diagram-widget';
import { KeyTool, MouseTool, ScrollMouseListener } from 'sprotty';
import { ER2CDSKeyTool } from './tool-palette/tools/key-tool';
import { ER2CDSMouseTool } from './tool-palette/tools/mouse-tool';
import { ER2CDSScrollMouseListener } from './tool-palette/tools/scroll-mouse-listener';

export class ER2CDSSprottyStarter extends SprottyLspEditStarter {

    protected override createContainer(diagramIdentifier: SprottyDiagramIdentifier) {
        return createDiagramContainer(diagramIdentifier.clientId);
    }

    protected override addVscodeBindings(container: Container, diagramIdentifier: SprottyDiagramIdentifier): void {
        super.addVscodeBindings(container, diagramIdentifier);

        container.rebind(VscodeDiagramServer).to(ER2CDSDiagramServer);
        container.rebind(VscodeDiagramWidget).to(ER2CDSDiagramWidget).inSingletonScope();

        container.rebind(KeyTool).toService(ER2CDSKeyTool);
        container.rebind(MouseTool).toService(ER2CDSMouseTool);
        container.rebind(ScrollMouseListener).toService(ER2CDSScrollMouseListener);
    }
}

new ER2CDSSprottyStarter().start();