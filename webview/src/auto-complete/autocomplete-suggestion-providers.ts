import { LabeledAction, SModelElementImpl, SModelRootImpl } from "sprotty";

export interface IAutocompleteSuggestionProvider {
    retrieveSuggestions(root: Readonly<SModelRootImpl>, text: string): Promise<AutocompleteSuggestion[]>;
}

export interface AutocompleteSuggestion {
    element: SModelElementImpl;
    action: LabeledAction;
}
