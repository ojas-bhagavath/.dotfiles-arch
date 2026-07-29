import { TemplateResult } from 'lit';
import { VscElement } from '../includes/VscElement.js';
import '../vscode-context-menu-item';
interface MenuItemData {
    label: string;
    keybinding?: string;
    value?: string;
    separator?: boolean;
    tabindex?: number;
}
export type VscContextMenuSelectEvent = CustomEvent<{
    keybinding: string;
    label: string;
    value: string;
    separator: boolean;
    tabindex: number;
}>;
/**
 * @fires {VscMenuSelectEvent} vsc-menu-select - Emitted when a menu item is clicked
 *
 * @cssprop --vscode-font-family
 * @cssprop --vscode-font-size
 * @cssprop --vscode-font-weight
 * @cssprop --vscode-menu-background
 * @cssprop --vscode-menu-border
 * @cssprop --vscode-menu-foreground
 * @cssprop --vscode-widget-shadow
 */
export declare class VscodeContextMenu extends VscElement {
    static styles: import("lit").CSSResultGroup;
    set data(data: MenuItemData[]);
    get data(): MenuItemData[];
    set show(show: boolean);
    get show(): boolean;
    /** @internal */
    tabIndex: number;
    constructor();
    private _selectedClickableItemIndex;
    private _show;
    private _wrapperEl;
    private _data;
    private _clickableItemIndexes;
    private _onClickOutside;
    private _onClickOutsideBound;
    private _onKeyDown;
    private _handleArrowUp;
    private _handleArrowDown;
    private _handleEscape;
    private _dispatchSelectEvent;
    private _dispatchLegacySelectEvent;
    private _handleEnter;
    private _onItemClick;
    private _onItemMouseOver;
    private _onItemMouseOut;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-context-menu': VscodeContextMenu;
    }
    interface GlobalEventHandlersEventMap {
        'vsc-context-menu-select': VscContextMenuSelectEvent;
    }
}
export {};
//# sourceMappingURL=vscode-context-menu.d.ts.map