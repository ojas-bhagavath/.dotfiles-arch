import { TemplateResult } from 'lit';
import { VscElement } from '../includes/VscElement.js';
/**
 * @cssprop --vscode-font-family
 * @cssprop --vscode-badge-background - default and counter variant background color
 * @cssprop --vscode-badge-foreground - default and counter variant foreground color
 * @cssprop --vscode-activityBarBadge-background - activity bar variant background color
 * @cssprop --vscode-activityBarBadge-foreground - activity bar variant foreground color
 */
export declare class VscodeBadge extends VscElement {
    static styles: import("lit").CSSResultGroup;
    variant: 'default' | 'counter' | 'activity-bar-counter';
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-badge': VscodeBadge;
    }
}
//# sourceMappingURL=vscode-badge.d.ts.map