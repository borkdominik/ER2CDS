import { LangiumServices, URI } from 'langium';
import { createER2CDSServices } from '../er2cds-module.js';
import { ER2CDS } from '../generated/ast.js';
import { ER2CDSFileSystem } from '../er2cds-file-system-provider.js';

export async function generateCDS(fileName: string): Promise<void> {
    const fileUri = URI.parse(fileName);

    const services = createER2CDSServices(ER2CDSFileSystem).ER2CDS;
    const model = await extractAstFromFile<ER2CDS>(fileUri, services);

    const generatedFileName = fileUri.fsPath.substring(0, fileUri.fsPath.lastIndexOf('/')) + '/' + model.name + '-generated.abapcds';
    ER2CDSFileSystem.fileSystemProvider().writeFile(URI.parse(generatedFileName), model.name);

    return Promise.resolve();
}

async function extractAstFromFile<T extends ER2CDS>(fileUri: URI, services: LangiumServices): Promise<T> {
    const document = services.shared.workspace.LangiumDocumentFactory.create(fileUri);
    await services.shared.workspace.DocumentBuilder.build([document], { validation: true });

    return document.parseResult?.value as T;
}