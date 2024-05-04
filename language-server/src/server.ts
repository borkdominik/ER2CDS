import { startLanguageServer } from 'langium';
import { addDiagramHandler } from 'langium-sprotty';
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node.js';
import { createER2CDSServices } from './er2cds-module.js';
import { ER2CDSFileSystem } from './er2cds-file-system-provider.js';

// Create a connection to the client
export const connection = createConnection(ProposedFeatures.all);

// Inject the shared services and language-specific services
export const { shared } = createER2CDSServices({ connection, ...ER2CDSFileSystem });

// Start the language server with the shared services
startLanguageServer(shared);

addDiagramHandler(connection, shared);