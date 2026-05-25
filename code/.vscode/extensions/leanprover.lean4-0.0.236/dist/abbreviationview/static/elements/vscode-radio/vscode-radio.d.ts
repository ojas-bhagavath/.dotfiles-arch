import { PropertyValueMap, TemplateResult } from 'lit';
import { FormButtonWidgetBase } from '../includes/form-button-widget/FormButtonWidgetBase.js';
import { AssociatedFormControl } from '../includes/AssociatedFormControl.js';
declare const VscodeRadio_base: (new (...args: any[]) => import("../includes/form-button-widget/LabelledCheckboxOrRadio.js").LabelledCheckboxOrRadioInterface) & typeof FormButtonWidgetBase;
/**
 * When participating in a form, it supports the `:invalid` pseudo class. Otherwise the error styles
 * can be applied through the `invalid` property.
 *
 * @attr name - Name which is used as a variable name in the data of the form-container.
 * @attr label - Attribute pair of the `label` property.
 *
 * @prop label - Label text. It is only applied if component's innerHTML doesn't contain any text.
 *
 * @fires {Event} change - Dispatched when checked state is changed.
 * @fires {Event} invalid - Dispatched when the element is invalid and `checkValidity()` has been called or the form containing this element is submitted.
 *
 * [MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/invalid_event)
 *
 * @cssprop --vscode-font-family
 * @cssprop --vscode-font-size
 * @cssprop --vscode-font-weight
 * @cssprop --vsc-foreground-translucent - Label font color. 90% transparency version of `--vscode-foreground` by default.
 * @cssprop --vscode-settings-checkboxBackground
 * @cssprop --vscode-settings-checkboxBorder
 * @cssprop --vscode-settings-checkboxForeground
 * @cssprop --vscode-focusBorder
 */
export declare class VscodeRadio extends VscodeRadio_base implements AssociatedFormControl {
    static styles: import("lit").CSSResultGroup;
    /** @internal */
    static formAssociated: boolean;
    /** @internal */
    static shadowRootOptions: ShadowRootInit;
    autofocus: boolean;
    checked: boolean;
    defaultChecked: boolean;
    invalid: boolean;
    /**
     * Name which is used as a variable name in the data of the form-container.
     */
    name: string;
    value: string;
    disabled: boolean;
    required: boolean;
    /** @internal */
    role: string;
    /** @internal */
    tabIndex: number;
    private _slottedText;
    private _inputEl;
    private _internals;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    update(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void;
    get form(): HTMLFormElement | null;
    /** @internal */
    get type(): string;
    get validity(): ValidityState;
    get validationMessage(): string;
    get willValidate(): boolean;
    checkValidity(): boolean;
    reportValidity(): boolean;
    /** @internal */
    formResetCallback(): void;
    /** @internal */
    formStateRestoreCallback(state: string, _mode: 'restore' | 'autocomplete'): void;
    private _dispatchCustomEvent;
    private _getRadios;
    private _uncheckOthers;
    private _checkButton;
    /**
     * @internal
     */
    setComponentValidity(isValid: boolean): void;
    private _setGroupValidity;
    private _setActualFormValue;
    private _handleValueChange;
    private _handleClick;
    protected _handleKeyDown: (ev: KeyboardEvent) => void;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-radio': VscodeRadio;
    }
}
export {};
//# sourceMappingURL=vscode-radio.d.ts.map