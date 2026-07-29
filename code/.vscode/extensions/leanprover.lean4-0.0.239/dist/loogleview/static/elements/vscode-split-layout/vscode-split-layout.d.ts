import { TemplateResult } from 'lit';
import { VscElement } from '../includes/VscElement.js';
/**
 * @cssprop [--hover-border=var(--vscode-sash-hoverBorder)]
 */
export declare class VscodeSplitLayout extends VscElement {
    static styles: import("lit").CSSResultGroup;
    split: 'horizontal' | 'vertical';
    resetOnDblClick: boolean;
    /**
     * Controls the draggable area size in pixels. it is recommended to use the value of `workbench.sash.size`.
     */
    handleSize: number;
    initialHandlePosition: string;
    private _startPaneRight;
    private _startPaneBottom;
    private _endPaneTop;
    private _endPaneLeft;
    private _handleLeft;
    private _handleTop;
    private _isDragActive;
    private _hover;
    private _hide;
    private _nestedLayoutsAtStart;
    private _nestedLayoutsAtEnd;
    private _boundRect;
    private _handleOffset;
    connectedCallback(): void;
    /** @internal */
    initializeResizeHandler(): void;
    private _initPosition;
    private _handleMouseOver;
    private _handleMouseOut;
    private _handleMouseDown;
    private _handleMouseUp;
    private _handleMouseMove;
    private _handleDblClick;
    private _handleSlotChange;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-split-layout': VscodeSplitLayout;
    }
}
//# sourceMappingURL=vscode-split-layout.d.ts.map