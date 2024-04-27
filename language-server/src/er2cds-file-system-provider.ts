import { URI } from 'langium';
import { NodeFileSystemProvider } from 'langium/node';
import * as fs from 'node:fs';

export class ER2CDSFileSystemProvider extends NodeFileSystemProvider {
    writeFile(uri: URI, data: string): Promise<void> {
        return fs.promises.writeFile(uri.fsPath, data, this.encoding);
    }
}

export const ER2CDSFileSystem = {
    fileSystemProvider: () => new ER2CDSFileSystemProvider()
};
