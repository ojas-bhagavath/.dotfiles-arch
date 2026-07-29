import { TemplateResult } from 'lit';
import { VscElement } from '../includes/VscElement.js';
/**
 * @cssprop --vscode-keybindingTable-headerBackground - Table header background
 */
export declare class VscodeTableHeader extends VscElement {
    static styles: import("lit").CSSResultGroup;
    /** @internal */
    role: string;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-table-header': VscodeTableHeader;
    }
}
//# sourceMappingURL=vscode-table-header.d.ts.map