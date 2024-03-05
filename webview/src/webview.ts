import 'reflect-metadata';
import 'sprotty-vscode-webview/css/sprotty-vscode.css';

import { Container } from 'inversify';
import { TYPES, configureModelElement } from 'sprotty';
import { SprottyDiagramIdentifier, VscodeDiagramServer, VscodeDiagramWidget } from 'sprotty-vscode-webview';
import { SprottyLspEditStarter } from 'sprotty-vscode-webview/lib/lsp/editing';
import { default as createDiagramContainer } from './di.config';
import { PopupButtonView } from './views';
import { PopupButton } from './model';
import { PopupButtonListener } from './popup';
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

        container.bind(TYPES.PopupMouseListener).to(PopupButtonListener);
        configureModelElement(container, 'button:delete', PopupButton, PopupButtonView);
        configureModelElement(container, 'button:edit', PopupButton, PopupButtonView);
        configureModelElement(container, 'button:addAttribute', PopupButton, PopupButtonView);
    }
}

new ER2CDSSprottyStarter().start();