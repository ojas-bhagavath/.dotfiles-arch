import { TemplateResult } from 'lit';
import { VscElement } from '../includes/VscElement.js';
export interface VscClickEventDetail {
    label: string;
    keybinding: string;
    value: string;
    separator: boolean;
    tabindex: number;
}
/**
 * Child component of [ContextMenu](/components/context-menu/).
 *
 * @cssprop --vscode-font-family
 * @cssprop --vscode-font-size
 * @cssprop --vscode-font-weight
 * @cssprop --vscode-menu-background
 * @cssprop [--vscode-menu-selectionBorder=var(--vscode-menu-selectionBackground)]
 * @cssprop --vscode-menu-foreground
 * @cssprop --vscode-menu-selectionBackground
 * @cssprop --vscode-menu-selectionForeground
 * @cssprop --vscode-menu-separatorBackground
 */
export declare class VscodeContextMenuItem extends VscElement {
    static styles: import("lit").CSSResultGroup;
    label: string;
    keybinding: string;
    value: string;
    separator: boolean;
    tabindex: number;
    private onItemClick;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-context-menu-item': VscodeContextMenuItem;
    }
}
//# sourceMappingURL=vscode-context-menu-item.d.ts.map