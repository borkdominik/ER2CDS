import { LabeledAction } from "sprotty";

export interface ToolPaletteItem extends LabeledAction {
    readonly id: string;
    readonly sortString: string;
    readonly children?: ToolPaletteItem[];
}