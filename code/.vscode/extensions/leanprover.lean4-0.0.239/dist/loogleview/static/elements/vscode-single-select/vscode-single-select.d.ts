import { TemplateResult } from 'lit';
import { VscodeSelectBase } from '../includes/vscode-select/vscode-select-base.js';
import { AssociatedFormControl } from '../includes/AssociatedFormControl.js';
/**
 * Allows to select an item from multiple options.
 *
 * When participating in a form, it supports the `:invalid` pseudo class. Otherwise the error styles
 * can be applied through the `invalid` property.
 *
 * ## Types
 *
 * ```typescript
 *interface Option {
 *  label: string;
 *  value: string;
 *  description: string;
 *  selected: boolean;
 *  disabled: boolean;
 *}
 * ```
 * @prop {boolean} invalid
 * @attr {boolean} invalid
 * @attr name - Name which is used as a variable name in the data of the form-container.
 * @cssprop [--dropdown-z-index=2]
 * @cssprop --vscode-badge-background
 * @cssprop --vscode-badge-foreground
 * @cssprop --vscode-settings-dropdownBorder
 * @cssprop --vscode-settings-checkboxBackground
 * @cssprop --vscode-settings-dropdownBackground
 * @cssprop --vscode-settings-dropdownListBorder
 * @cssprop --vscode-focusBorder
 * @cssprop --vscode-foreground
 * @cssprop --vscode-font-family
 * @cssprop --vscode-font-size
 * @cssprop --vscode-font-weight
 * @cssprop --vscode-list-activeSelectionBackground
 * @cssprop --vscode-list-activeSelectionForeground
 * @cssprop --vscode-list-focusOutline
 * @cssprop --vscode-list-highlightForeground
 * @cssprop --vscode-list-focusHighlightForeground
 * @cssprop --vscode-list-hoverBackground
 * @cssprop --vscode-list-hoverForeground
 * @cssprop --vscode-list-hoverBackground
 * @cssprop --vscode-settings-textInputBackground
 */
export declare class VscodeSingleSelect extends VscodeSelectBase implements AssociatedFormControl {
    static styles: import("lit").CSSResult[];
    /** @internal */
    static shadowRootOptions: ShadowRootInit;
    /** @internal */
    static formAssociated: boolean;
    defaultValue: string;
    /** @internal */
    role: string;
    name: string | undefined;
    set selectedIndex(val: number);
    get selectedIndex(): number;
    set value(val: string);
    get value(): string;
    required: boolean;
    get validity(): ValidityState;
    get validationMessage(): string;
    get willValidate(): boolean;
    checkValidity(): boolean;
    reportValidity(): boolean;
    private _labelText;
    private _face;
    private _internals;
    private updateInputValue;
    constructor();
    connectedCallback(): void;
    /** @internal */
    formResetCallback(): void;
    /** @internal */
    formStateRestoreCallback(state: string, _mode: 'restore' | 'autocomplete'): void;
    /** @internal */
    get type(): 'select-one';
    get form(): HTMLFormElement | null;
    protected _onSlotChange(): void;
    protected _onArrowUpKeyDown(): void;
    protected _onArrowDownKeyDown(): void;
    protected _onEnterKeyDown(): void;
    private _onOptionClick;
    private _manageRequired;
    private _renderLabel;
    protected _renderSelectFace(): TemplateResult;
    protected _renderComboboxFace(): TemplateResult;
    protected _renderOptions(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-single-select': VscodeSingleSelect;
    }
}
//# sourceMappingURL=vscode-single-select.d.ts.map