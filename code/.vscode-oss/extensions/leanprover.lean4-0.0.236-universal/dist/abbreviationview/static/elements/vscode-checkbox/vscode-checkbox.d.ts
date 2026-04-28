import { PropertyValueMap, TemplateResult } from 'lit';
import { FormButtonWidgetBase } from '../includes/form-button-widget/FormButtonWidgetBase.js';
import { AssociatedFormControl } from '../includes/AssociatedFormControl.js';
declare const VscodeCheckbox_base: (new (...args: any[]) => import("../includes/form-button-widget/LabelledCheckboxOrRadio.js").LabelledCheckboxOrRadioInterface) & typeof FormButtonWidgetBase;
/**
 * When participating in a form, it supports the `:invalid` pseudo class. Otherwise the error styles
 * can be applied through the `invalid` property.
 *
 * @attr name - Name which is used as a variable name in the data of the form-container.
 * @attr label - Attribute pair of the `label` property.
 * @prop label - Label text. It is only applied if component's innerHTML doesn't contain any text.
 *
 * @fires {Event} change - Dispatched when checked state is changed. The event is bubbled, so it can be listened on a parent element like the `CheckboxGroup`.
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
export declare class VscodeCheckbox extends VscodeCheckbox_base implements AssociatedFormControl {
    static styles: import("lit").CSSResultGroup;
    /** @internal */
    static formAssociated: boolean;
    /** @internal */
    static shadowRootOptions: ShadowRootInit;
    autofocus: boolean;
    set checked(newVal: boolean);
    get checked(): boolean;
    private _checked;
    defaultChecked: boolean;
    invalid: boolean;
    name: string | undefined;
    /** @internal */
    role: string;
    /**
     * Associate a value to the checkbox. According to the native checkbox [specification](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#value_2), If the component participates in a form:
     *
     * - If it is unchecked, the value will not be submitted.
     * - If it is checked but the value is not set, `on` will be submitted.
     * - If it is checked and value is set, the value will be submitted.
     */
    value: string;
    disabled: boolean;
    indeterminate: boolean;
    set required(newVal: boolean);
    get required(): boolean;
    private _required;
    get form(): HTMLFormElement | null;
    /** @internal */
    get type(): 'checkbox';
    get validity(): ValidityState;
    get validationMessage(): string;
    get willValidate(): boolean;
    checkValidity(): boolean;
    reportValidity(): boolean;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    update(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void;
    /** @internal */
    formResetCallback(): void;
    /** @internal */
    formStateRestoreCallback(state: string, _mode: 'restore' | 'autocomplete'): void;
    private _inputEl;
    private _internals;
    private _setActualFormValue;
    private _toggleState;
    private _handleClick;
    private _handleKeyDown;
    private _manageRequired;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-checkbox': VscodeCheckbox;
    }
}
export {};
//# sourceMappingURL=vscode-checkbox.d.ts.map