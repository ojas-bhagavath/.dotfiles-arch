import { TemplateResult } from 'lit';
import { VscElement } from '../includes/VscElement';
export declare class VscodeProgressRing extends VscElement {
    static styles: import("lit").CSSResultGroup;
    ariaLabel: string;
    ariaLive: string;
    role: string;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-progress-ring': VscodeProgressRing;
    }
}
//# sourceMappingURL=vscode-progress-ring.d.ts.map