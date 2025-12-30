import { TemplateResult } from 'lit';
import { VscElement } from '../includes/VscElement.js';
/**
 * @cssprop --vscode-editorGroup-border
 * @cssprop --vscode-foreground
 * @cssprop --vscode-font-family
 * @cssprop --vscode-font-size
 */
export declare class VscodeTableCell extends VscElement {
    static styles: import("lit").CSSResultGroup;
    /** @internal */
    role: string;
    /**
     * Cell label in the compact view of the responsive mode. For internal use only.
     */
    columnLabel: string;
    /**
     * Enable compact view in the responsive mode. For internal use only.
     */
    compact: boolean;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-table-cell': VscodeTableCell;
    }
}
//# sourceMappingURL=vscode-table-cell.d.ts.map