import { TemplateResult } from 'lit';
import { VscElement } from '../includes/VscElement.js';
/**
 * Display a [Codicon](https://microsoft.github.io/vscode-codicons/dist/codicon.html).
 * In "action-icon" mode it behaves like a button. In this case, it is
 * recommended that a meaningful label is specified with the `label` property.
 *
 * @cssprop --vscode-icon-foreground
 * @cssprop --vscode-toolbar-hoverBackground - Hover state background color in `active-icon` mode
 * @cssprop --vscode-toolbar-activeBackground - Active state background color in `active-icon` mode
 * @cssprop --vscode-focusBorder
 */
export declare class VscodeIcon extends VscElement {
    static styles: import("lit").CSSResultGroup;
    /**
     * Set a meaningful label in `action-icon` mode for the screen readers
     */
    label: string;
    /**
     * [Codicon](https://microsoft.github.io/vscode-codicons/dist/codicon.html) icon name.
     */
    name: string;
    /**
     * Icon size in pixels
     */
    size: number;
    /**
     * Enable rotation animation
     */
    spin: boolean;
    /**
     * Animation duration in seconds
     */
    spinDuration: number;
    /**
     * Behaves like a button
     */
    actionIcon: boolean;
    private static stylesheetHref;
    private static nonce;
    connectedCallback(): void;
    /**
     * For using web fonts in web components, the font stylesheet must be included
     * twice: on the page and in the web component. This function looks for the
     * font stylesheet on the page and returns the stylesheet URL and the nonce
     * id.
     */
    private _getStylesheetConfig;
    private _onButtonClick;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-icon': VscodeIcon;
    }
}
//# sourceMappingURL=vscode-icon.d.ts.map