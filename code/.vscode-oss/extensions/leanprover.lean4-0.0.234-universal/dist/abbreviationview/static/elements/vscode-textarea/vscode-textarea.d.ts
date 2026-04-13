import { TemplateResult, PropertyValues } from 'lit';
import { VscElement } from '../includes/VscElement.js';
import { AssociatedFormControl } from '../includes/AssociatedFormControl.js';
/**
 * Multi-line text input.
 *
 * When participating in a form, it supports the `:invalid` pseudo class. Otherwise the error styles
 * can be applied through the `invalid` property.
 *
 * @fires {InputEvent} input
 * @fires {Event} change
 *
 * @cssprop --vscode-scrollbar-shadow
 * @cssprop --vscode-settings-textInputBackground
 * @cssprop --vscode-settings-textInputBorder
 * @cssprop --vscode-settings-textInputForeground
 * @cssprop --vscode-input-placeholderForeground
 * @cssprop --vscode-font-family
 * @cssprop --vscode-font-size
 * @cssprop --vscode-font-weight
 * @cssprop --vscode-editor-background
 * @cssprop --vscode-editor-foreground
 * @cssprop --vscode-editor-font-family
 * @cssprop --vscode-editor-font-size
 * @cssprop --vscode-editor-font-weight
 * @cssprop --vscode-editor-inlineValuesForeground
 * @cssprop --vscode-focusBorder
 * @cssprop --vscode-scrollbarSlider-background
 * @cssprop --vscode-scrollbarSlider-hoverBackground
 * @cssprop --vscode-scrollbarSlider-activeBackground
 */
export declare class VscodeTextarea extends VscElement implements AssociatedFormControl {
    static styles: import("lit").CSSResultGroup;
    /**
     * @internal
     */
    static formAssociated: boolean;
    /** @internal */
    static shadowRootOptions: ShadowRootInit;
    autocomplete: 'on' | 'off' | undefined;
    autofocus: boolean;
    defaultValue: string;
    disabled: boolean;
    invalid: boolean;
    label: string;
    maxLength: number | undefined;
    minLength: number | undefined;
    rows: number | undefined;
    cols: number | undefined;
    name: string | undefined;
    placeholder: string | undefined;
    readonly: boolean;
    resize: 'both' | 'horizontal' | 'vertical' | 'none';
    required: boolean;
    spellcheck: boolean;
    /**
     * Use monospace fonts. The font family, weight, size, and color will be the same as set in the
     * VSCode code editor.
     */
    monospace: boolean;
    set value(val: string);
    get value(): string;
    /**
     * Getter for the inner textarea element if it needs to be accessed for some reason.
     */
    get wrappedElement(): HTMLTextAreaElement;
    get form(): HTMLFormElement | null;
    /** @internal */
    get type(): 'textarea';
    get validity(): ValidityState;
    get validationMessage(): string;
    get willValidate(): boolean;
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
    constructor();
    connectedCallback(): void;
    updated(changedProperties: PropertyValues<unknown> | Map<PropertyKey, unknown>): void;
    /** @internal */
    formResetCallback(): void;
    /** @internal */
    formStateRestoreCallback(state: string, _mode: 'restore' | 'autocomplete'): void;
    checkValidity(): boolean;
    reportValidity(): boolean;
    private _textareaEl;
    private _value;
    private _textareaPointerCursor;
    private _shadow;
    private _internals;
    private _setValidityFromInput;
    private _dataChanged;
    private _handleChange;
    private _handleInput;
    private _handleMouseMove;
    private _handleScroll;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-textarea': VscodeTextarea;
    }
}
//# sourceMappingURL=vscode-textarea.d.ts.map