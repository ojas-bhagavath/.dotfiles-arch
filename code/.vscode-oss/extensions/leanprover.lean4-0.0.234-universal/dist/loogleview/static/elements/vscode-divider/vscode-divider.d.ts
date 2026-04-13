import { TemplateResult } from 'lit';
import { VscElement } from '../includes/VscElement';
export declare class VscodeDivider extends VscElement {
    static styles: import("lit").CSSResultGroup;
    role: 'separator' | 'presentation';
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-divider': VscodeDivider;
    }
}
//# sourceMappingURL=vscode-divider.d.ts.map