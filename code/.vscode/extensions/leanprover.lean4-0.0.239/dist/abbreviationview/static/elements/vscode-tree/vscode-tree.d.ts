import { TemplateResult } from 'lit';
import { VscElement } from '../includes/VscElement.js';
import '../vscode-badge/index.js';
import '../vscode-icon/index.js';
export type VscTreeActionEvent = CustomEvent<{
    actionId: string;
    item: TreeItem | null;
    value: string;
}>;
export type VscTreeSelectEvent = CustomEvent<{
    icons: {
        branch?: string;
        open?: string;
        leaf?: string;
    };
    itemType: 'branch' | 'leaf';
    label: string;
    open: boolean;
    value: string;
    path: string;
}>;
export interface TreeItemIconConfig {
    branch?: string;
    open?: string;
    leaf?: string;
}
/** Action icon configuration. */
export interface TreeItemAction {
    /** A unique name that identifies the clicked action item. */
    actionId: string;
    /** A Codicon name. */
    icon: string;
    /** Text description of the action. */
    tooltip?: string;
}
/**
 * The decoration is additional content on the right side of the tree item. It can be a short text,
 * a counter, or a small, filled circle. A color can be defined for the different states. If
 * multiple states are applied to the item, the color with higher precedence will be used. The color
 * precedence from higher to lower is selected, focused, hover, normal. Colors will not be applied
 * to the counter badge.
 */
export interface TreeItemDecoration {
    /** Text content of the decoration. If the appearance is `filled-circle`, it will be ignored. */
    content?: string;
    /** Appearance of the decoration. */
    appearance?: 'text' | 'counter-badge' | 'filled-circle';
    /**
     * When is decoration visible?
     * - `active`: visible when the tree item is focused, selected or hovered
     * - `normal`: visible when there is not any interaction on the tree item
     * - `always`: always visible
     */
    visibleWhen?: 'active' | 'normal' | 'always';
    /** A valid CSS property value to define a default color. */
    color?: string;
    /** A valid CSS property value to define the color for the mouse over state. */
    hoverColor?: string;
    /** A valid CSS property value to define the color for the focused state. */
    focusedColor?: string;
    /** A valid CSS property value to define the color for the selected state. */
    selectedColor?: string;
}
export interface TreeItem {
    label: string;
    description?: string;
    tooltip?: string;
    subItems?: TreeItem[];
    actions?: TreeItemAction[];
    open?: boolean;
    selected?: boolean;
    focused?: boolean;
    hasSelectedItem?: boolean;
    hasFocusedItem?: boolean;
    icons?: TreeItemIconConfig | boolean;
    iconUrls?: TreeItemIconConfig;
    value?: string;
    path?: number[];
    decorations?: TreeItemDecoration[];
}
/**
 * @fires vsc-select Dispatched when an item is selected.
 * @fires {CustomEvent} vsc-tree-select Dispatched when an item is selected.
 * @fires vsc-run-action Dispatched when an action icon is clicked.
 * @fires {VscTreeActionEvent} vsc-tree-action Dispatched when an action icon is clicked.
 *
 * @cssprop --vscode-focusBorder
 * @cssprop --vscode-font-family
 * @cssprop --vscode-font-size
 * @cssprop --vscode-font-weight
 * @cssprop --vscode-list-hoverForeground
 * @cssprop --vscode-list-hoverBackground
 * @cssprop --vscode-list-inactiveSelectionBackground
 * @cssprop --vscode-list-inactiveSelectionForeground
 * @cssprop --vscode-list-activeSelectionBackground
 * @cssprop --vscode-list-activeSelectionForeground
 * @cssprop --vscode-list-inactiveSelectionIconForeground
 * @cssprop --vscode-list-inactiveFocusBackground
 * @cssprop --vscode-list-inactiveFocusOutline
 * @cssprop --vscode-list-focusOutline
 * @cssprop --vscode-tree-inactiveIndentGuidesStroke
 * @cssprop --vscode-tree-indentGuidesStroke
 *
 * @csspart text-content
 * @csspart description
 * @csspart counter-badge-decoration
 * @csspart filled-circle-decoration
 * @csspart caption-decoration
 * @csspart decorations Container of decorations
 */
export declare class VscodeTree extends VscElement {
    static styles: import("lit").CSSResultGroup;
    set data(val: TreeItem[]);
    get data(): TreeItem[];
    indent: number;
    arrows: boolean;
    multiline: boolean;
    tabindex: number;
    indentGuides: boolean;
    private _data;
    private _selectedItem;
    private _focusedItem;
    private _selectedBranch;
    private _focusedBranch;
    /**
     * Closes all opened tree items recursively.
     */
    closeAll(): void;
    /**
     * Deselects all selected items.
     */
    deselectAll(): void;
    /**
     * Returns a reference to a TreeItem object by path.
     * @param path
     * @returns
     */
    getItemByPath(path: number[]): TreeItem | null;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private _getItemByPath;
    private _handleActionClick;
    private _renderIconVariant;
    private _renderIcon;
    private _renderArrow;
    private _renderActions;
    private _renderDecorations;
    private _renderTreeItem;
    private _renderTree;
    private _selectItem;
    private _focusItem;
    private _closeSubTreeRecursively;
    private _deselectItemsRecursively;
    private _emitSelectEvent;
    private _focusPrevItem;
    private _focusNextItem;
    private _handleClick;
    private _handleComponentKeyDown;
    private _handleComponentKeyDownBound;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-tree': VscodeTree;
    }
    interface GlobalEventHandlersEventMap {
        'vsc-tree-select': VscTreeSelectEvent;
        'vsc-tree-action': VscTreeActionEvent;
    }
}
//# sourceMappingURL=vscode-tree.d.ts.map