import { startLanguageServer } from 'langium';
import { NodeFileSystem } from 'langium/node';
import { addDiagramHandler } from 'langium-sprotty';
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node.js';
import { createER2CDSServices } from './er2cds-module.js';

// Create a connection to the client
const connection = createConnection(ProposedFeatures.all);

// Inject the shared services and language-specific services
const { shared } = createER2CDSServices({ connection, ...NodeFileSystem });

// Start the language server with the shared services
startLanguageServer(shared);

addDiagramHandler(connection, shared);