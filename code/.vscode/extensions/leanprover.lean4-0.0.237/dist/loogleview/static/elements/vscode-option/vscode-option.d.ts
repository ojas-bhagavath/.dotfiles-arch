import { TemplateResult } from 'lit';
import { VscElement } from '../includes/VscElement.js';
export declare class VscodeOption extends VscElement {
    static styles: import("lit").CSSResult;
    value: string;
    description: string;
    selected: boolean;
    disabled: boolean;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-option': VscodeOption;
    }
}
//# sourceMappingURL=vscode-option.d.ts.map