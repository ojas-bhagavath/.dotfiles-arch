import { TemplateResult } from 'lit';
import { VscElement } from '../includes/VscElement.js';
/**
 * @fires {Event} change - Dispatched when a child radio button is changed.
 */
export declare class VscodeRadioGroup extends VscElement {
    static styles: import("lit").CSSResultGroup;
    variant: 'horizontal' | 'vertical';
    /** @internal */
    role: string;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private _radios;
    private _focusedRadio;
    private _checkedRadio;
    private _firstContentLoaded;
    private _uncheckPreviousChecked;
    private _afterCheck;
    private _checkPrev;
    private _checkNext;
    private _onKeyDown;
    private _onKeyDownBound;
    private _onChange;
    private _onSlotChange;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-radio-group': VscodeRadioGroup;
    }
}
//# sourceMappingURL=vscode-radio-group.d.ts.map