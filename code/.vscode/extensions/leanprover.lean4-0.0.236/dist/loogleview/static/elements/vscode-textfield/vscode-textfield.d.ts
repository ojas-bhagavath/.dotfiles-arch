import { TemplateResult } from 'lit';
import { VscElement } from '../includes/VscElement.js';
import { AssociatedFormControl } from '../includes/AssociatedFormControl.js';
type InputType = 'color' | 'date' | 'datetime-local' | 'email' | 'file' | 'month' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'time' | 'url' | 'week';
/**
 * A simple inline textfield
 *
 * When participating in a form, it supports the `:invalid` pseudo class. Otherwise the error styles
 * can be applied through the `invalid` property.
 *
 * @slot content-before - A slot before the editable area but inside of the component. It is used to place icons.
 * @slot content-after - A slot after the editable area but inside of the component. It is used to place icons.
 *
 * @fires {InputEvent} input
 * @fires {Event} change
 *
 * @cssprop --vscode-settings-textInputBackground
 * @cssprop --vscode-settings-textInputBorder
 * @cssprop --vscode-settings-textInputForeground
 * @cssprop --vscode-focusBorder
 * @cssprop --vscode-font-family
 * @cssprop --vscode-font-size
 * @cssprop --vscode-font-weight
 * @cssprop --vscode-input-placeholderForeground
 * @cssprop --vscode-button-background
 * @cssprop --vscode-button-foreground
 * @cssprop --vscode-button-hoverBackground
 */
export declare class VscodeTextfield extends VscElement implements AssociatedFormControl {
    static styles: import("lit").CSSResultGroup;
    /** @internal */
    static formAssociated: boolean;
    /** @internal */
    static shadowRootOptions: ShadowRootInit;
    autocomplete: 'on' | 'off' | undefined;
    autofocus: boolean;
    defaultValue: string;
    disabled: boolean;
    focused: boolean;
    invalid: boolean;
    /**
     * @internal
     * Set `aria-label` for the inner input element. Should not be set,
     * vscode-label will do it automatically.
     */
    label: string;
    max: number | undefined;
    maxLength: number | undefined;
    min: number | undefined;
    minLength: number | undefined;
    multiple: boolean;
    name: string | undefined;
    pattern: string | undefined;
    placeholder: string | undefined;
    readonly: boolean;
    required: boolean;
    step: number | undefined;
    /**
     * Same as the `type` of the native `<input>` element but only a subset of types are supported.
     * The supported ones are: `color`,`date`,`datetime-local`,`email`,`file`,`month`,`number`,`password`,`search`,`tel`,`text`,`time`,`url`,`week`
     */
    set type(val: InputType);
    get type(): InputType;
    set value(val: string);
    get value(): string;
    /**
     * Lowercase alias to minLength
     */
    set minlength(val: number);
    get minlength(): number | undefined;
    /**
     * Lowercase alias to maxLength
     */
    set maxlength(val: number);
    get maxlength(): number | undefined;
    get form(): HTMLFormElement | null;
    get validity(): ValidityState;
    get validationMessage(): string;
    get willValidate(): boolean;
    checkValidity(): boolean;
    reportValidity(): boolean;
    get wrappedElement(): HTMLInputElement;
    constructor();
    connectedCallback(): void;
    attributeChangedCallback(name: string, old: string | null, value: string | null): void;
    /** @internal */
    formResetCallback(): void;
    /** @internal */
    formStateRestoreCallback(state: string, _mode: 'restore' | 'autocomplete'): void;
    private _inputEl;
    private _value;
    private _type;
    private _internals;
    private _dataChanged;
    private _setValidityFromInput;
    private _onInput;
    private _onChange;
    private _onFocus;
    private _onBlur;
    private _onKeyDown;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-textfield': VscodeTextfield;
    }
}
export {};
//# sourceMappingURL=vscode-textfield.d.ts.map