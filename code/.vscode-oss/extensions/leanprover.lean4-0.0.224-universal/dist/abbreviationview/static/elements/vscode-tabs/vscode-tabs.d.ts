import { TemplateResult } from 'lit';
import { VscElement } from '../includes/VscElement.js';
export type VscTabsSelectEvent = CustomEvent<{
    selectedIndex: number;
}>;
/**
 * @slot - Default slot. It is used for tab panels.
 * @slot header - Slot for tab headers.
 * @slot addons - Right aligned area in the header.
 *
 * @fires {VscTabSelectEvent} vsc-tabs-select - Dispatched when the active tab is changed
 *
 * @cssprop --vscode-font-family
 * @cssprop --vscode-font-size
 * @cssprop --vscode-font-weight
 * @cssprop --vscode-settings-headerBorder
 * @cssprop --vscode-panel-background
 */
export declare class VscodeTabs extends VscElement {
    static styles: import("lit").CSSResultGroup;
    /**
     * Panel-like look
     */
    panel: boolean;
    /** @internal */
    role: string;
    selectedIndex: number;
    constructor();
    attributeChangedCallback(name: string, old: string | null, value: string | null): void;
    private _headerSlotElements;
    private _mainSlotElements;
    private _tabHeaders;
    private _tabPanels;
    private _componentId;
    private _tabFocus;
    private _dispatchSelectEvent;
    private _setActiveTab;
    private _focusPrevTab;
    private _focusNextTab;
    private _onHeaderKeyDown;
    private _moveHeadersToHeaderSlot;
    private _onMainSlotChange;
    private _onHeaderSlotChange;
    private _onHeaderClick;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-tabs': VscodeTabs;
    }
    interface GlobalEventHandlersEventMap {
        'vsc-tabs-select': VscTabsSelectEvent;
    }
}
//# sourceMappingURL=vscode-tabs.d.ts.map