import 'reflect-metadata';
import 'sprotty-vscode-webview/css/sprotty-vscode.css';

import { Container } from 'inversify';
import { configureModelElement } from 'sprotty';
import { SprottyDiagramIdentifier } from 'sprotty-vscode-webview';
import { SprottyLspEditStarter } from 'sprotty-vscode-webview/lib/lsp/editing';
import { default as createDiagramContainer } from './di.config';
import { PaletteButton } from 'sprotty-vscode-webview/lib/lsp/editing';
import { PaletteButtonView } from './views';

export class ER2CDSSprottyStarter extends SprottyLspEditStarter {

    protected override createContainer(diagramIdentifier: SprottyDiagramIdentifier) {
        return createDiagramContainer(diagramIdentifier.clientId);
    }

    protected override addVscodeBindings(container: Container, diagramIdentifier: SprottyDiagramIdentifier): void {
        super.addVscodeBindings(container, diagramIdentifier);
        configureModelElement(container, 'button:create', PaletteButton, PaletteButtonView);
    }
}

new ER2CDSSprottyStarter().start();