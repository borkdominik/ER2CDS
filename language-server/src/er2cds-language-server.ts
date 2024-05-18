import { DefaultLanguageServer } from "langium";
import { InitializeParams, InitializeResult } from "vscode-languageserver-protocol";

export class ER2CDSLanguageServer extends DefaultLanguageServer {

    override async initialize(params: InitializeParams): Promise<InitializeResult> {
        this.eagerLoadServices();
        
        this.onInitializeEmitter.fire(params);
        this.onInitializeEmitter.dispose();
        
        const result = this.buildInitializeResult(params);
        console.log(result);
        return result;
    }

}