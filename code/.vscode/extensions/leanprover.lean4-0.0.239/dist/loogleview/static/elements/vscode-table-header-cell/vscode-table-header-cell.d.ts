import { TemplateResult } from 'lit';
import { VscElement } from '../includes/VscElement.js';
/**
 * @cssprop --vscode-foreground
 * @cssprop --vscode-font-family
 * @cssprop --vscode-font-size
 */
export declare class VscodeTableHeaderCell extends VscElement {
    static styles: import("lit").CSSResultGroup;
    /** @internal */
    role: string;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-table-header-cell': VscodeTableHeaderCell;
    }
}
//# sourceMappingURL=vscode-table-header-cell.d.ts.map