import { TemplateResult } from 'lit';
import { VscElement } from '../includes/VscElement.js';
export type VscCollapsibleToggleEvent = CustomEvent<{
    open: boolean;
}>;
/**
 * @slot - Main content.
 * @slot actions - You can place any action icon in this slot in the header, but it's also possible to use any HTML element in it. It's only visible when the component is open.
 * @slot decorations - The elements placed in the decorations slot are always visible.
 *
 * @fires {VscCollapsibleToggleEvent} vsc-collapsible-toggle - Dispatched when the content visibility is changed.
 *
 * @cssprop --vscode-sideBar-background - Background color
 * @cssprop --vscode-focusBorder - Focus border color
 * @cssprop --vscode-font-family - Header font family
 * @cssprop --vscode-sideBarSectionHeader-background - Header background
 * @cssprop --vscode-icon-foreground - Arrow icon color
 * @cssprop --vscode-sideBarTitle-foreground - Header font color
 *
 * @csspart body - Container for the toggleable content of the component. The container's overflow content is hidden by default. This CSS part can serve as an escape hatch to modify this behavior.
 */
export declare class VscodeCollapsible extends VscElement {
    static styles: import("lit").CSSResultGroup;
    /** Component heading text */
    title: string;
    /** Less prominent text than the title in the header */
    description: string;
    open: boolean;
    private _emitToggleEvent;
    private _onHeaderClick;
    private _onHeaderKeyDown;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-collapsible': VscodeCollapsible;
    }
    interface GlobalEventHandlersEventMap {
        'vsc-collapsible-toggle': VscCollapsibleToggleEvent;
    }
}
//# sourceMappingURL=vscode-collapsible.d.ts.map