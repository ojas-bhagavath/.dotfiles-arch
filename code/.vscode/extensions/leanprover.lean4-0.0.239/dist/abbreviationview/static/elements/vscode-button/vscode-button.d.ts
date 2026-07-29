import { PropertyValueMap, TemplateResult } from 'lit';
import { VscElement } from '../includes/VscElement.js';
import '../vscode-icon/index.js';
/**
 * @fires vsc-click Dispatched only when button is not in disabled state.
 *
 * @cssprop --vscode-button-background
 * @cssprop --vscode-button-foreground
 * @cssprop [--vscode-button-border=var(--vscode-button-background)]
 * @cssprop --vscode-button-hoverBackground
 * @cssprop --vscode-font-family
 * @cssprop --vscode-font-size
 * @cssprop --vscode-font-weight
 * @cssprop --vscode-button-secondaryForeground
 * @cssprop --vscode-button-secondaryBackground
 * @cssprop --vscode-button-secondaryHoverBackground
 * @cssprop --vscode-focusBorder
 */
export declare class VscodeButton extends VscElement {
    static styles: import("lit").CSSResultGroup;
    /** @internal */
    static formAssociated: boolean;
    autofocus: boolean;
    /** @internal */
    tabIndex: number;
    /**
     * Button has a less prominent style.
     */
    secondary: boolean;
    /** @internal */
    role: string;
    disabled: boolean;
    /**
     * A [Codicon](https://microsoft.github.io/vscode-codicons/dist/codicon.html) before the label
     */
    icon: string;
    /**
     * Spin property for the icon
     */
    iconSpin?: boolean | undefined;
    /**
     * Duration property for the icon
     */
    iconSpinDuration?: number;
    /**
     * A [Codicon](https://microsoft.github.io/vscode-codicons/dist/codicon.html) after the label
     */
    iconAfter: string;
    /**
     * Spin property for the after icon
     */
    iconAfterSpin: boolean;
    /**
     * Duration property for the after icon
     */
    iconAfterSpinDuration?: number;
    focused: boolean;
    name: string | undefined;
    type: 'submit' | 'reset' | 'button';
    value: string;
    private _prevTabindex;
    private _internals;
    get form(): HTMLFormElement | null;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    update(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void;
    private _executeAction;
    private _handleKeyDown;
    private _handleClick;
    private _handleFocus;
    private _handleBlur;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-button': VscodeButton;
    }
}
//# sourceMappingURL=vscode-button.d.ts.map