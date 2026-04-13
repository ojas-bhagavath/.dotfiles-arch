import { TemplateResult } from 'lit';
import { VscElement } from '../includes/VscElement.js';
/**
 * @cssprop --vscode-foreground
 * @cssprop --vscode-panelTitle-inactiveForeground
 * @cssprop --vscode-panelTitle-activeForeground
 * @cssprop --vscode-panelTitle-activeBorder
 * @cssprop --vscode-focusBorder
 * @cssprop --vscode-settings-headerForeground
 */
export declare class VscodeTabHeader extends VscElement {
    static styles: import("lit").CSSResultGroup;
    active: boolean;
    /** @internal */
    ariaControls: string;
    /**
     * Panel-like look
     */
    panel: boolean;
    /** @internal */
    role: string;
    /** @internal */
    tabId: number;
    attributeChangedCallback(name: string, old: string | null, value: string | null): void;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-tab-header': VscodeTabHeader;
    }
}
//# sourceMappingURL=vscode-tab-header.d.ts.map