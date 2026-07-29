import { TemplateResult } from 'lit';
import { VscElement } from '../includes/VscElement.js';
/**
 * @cssprop --vscode-panel--background
 * @cssprop --vscode-focusBorder
 */
export declare class VscodeTabPanel extends VscElement {
    static styles: import("lit").CSSResultGroup;
    hidden: boolean;
    /** @internal */
    ariaLabelledby: string;
    /**
     * Panel-like look
     */
    panel: boolean;
    /** @internal */
    role: string;
    /** @internal */
    tabIndex: number;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-tab-panel': VscodeTabPanel;
    }
}
//# sourceMappingURL=vscode-tab-panel.d.ts.map