import { TemplateResult } from 'lit';
import { VscodeSelectBase } from '../includes/vscode-select/vscode-select-base.js';
import { AssociatedFormControl } from '../includes/AssociatedFormControl.js';
/**
 * Allows to select multiple items from a list of options.
 *
 * When participating in a form, it supports the `:invalid` pseudo class. Otherwise the error styles
 * can be applied through the `invalid` property.
 *
 * @prop {boolean} invalid
 * @attr {boolean} invalid
 * @attr name - Name which is used as a variable name in the data of the form-container.
 *
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
 * @cssprop --vscode-list-focusHighlightForeground
 * @cssprop --vscode-list-highlightForeground
 * @cssprop --vscode-list-hoverBackground
 * @cssprop --vscode-list-hoverForeground
 * @cssprop --vscode-list-hoverBackground
 * @cssprop --vscode-settings-textInputBackground
 * @cssprop --vscode-list-hoverBackground
 */
export declare class VscodeMultiSelect extends VscodeSelectBase implements AssociatedFormControl {
    static styles: import("lit").CSSResult[];
    /** @internal */
    static shadowRootOptions: ShadowRootInit;
    static formAssociated: boolean;
    defaultValue: string[];
    required: boolean;
    name: string | undefined;
    set selectedIndexes(val: number[]);
    get selectedIndexes(): number[];
    set value(val: string[]);
    get value(): string[];
    get form(): HTMLFormElement | null;
    /** @internal */
    get type(): string;
    get validity(): ValidityState;
    get validationMessage(): string;
    get willValidate(): boolean;
    checkValidity(): boolean;
    reportValidity(): boolean;
    private _internals;
    constructor();
    connectedCallback(): void;
    /** @internal */
    formResetCallback(): void;
    /** @internal */
    formStateRestoreCallback(state: FormData, _mode: 'restore' | 'autocomplete'): void;
    private _faceElement;
    private _setDefaultValue;
    private _manageRequired;
    private _setFormValue;
    private _onOptionClick;
    private _onMultiAcceptClick;
    private _onMultiDeselectAllClick;
    private _onMultiSelectAllClick;
    private _renderLabel;
    protected _renderSelectFace(): TemplateResult;
    protected _renderComboboxFace(): TemplateResult;
    protected _renderOptions(): TemplateResult;
    protected _renderDropdownControls(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-multi-select': VscodeMultiSelect;
    }
}
//# sourceMappingURL=vscode-multi-select.d.ts.map