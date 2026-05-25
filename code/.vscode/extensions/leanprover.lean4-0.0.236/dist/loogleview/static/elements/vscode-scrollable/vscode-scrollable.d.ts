import { TemplateResult } from 'lit';
import { VscElement } from '../includes/VscElement.js';
/**
 * @cssprop [--min-thumb-height=20px] - Scrollbar thumb minimum height
 * @cssprop --vscode-scrollbar-shadow
 * @cssprop --vscode-scrollbarSlider-background
 * @cssprop --vscode-scrollbarSlider-hoverBackground
 * @cssprop --vscode-scrollbarSlider-activeBackground
 */
export declare class VscodeScrollable extends VscElement {
    static styles: import("lit").CSSResultGroup;
    shadow: boolean;
    scrolled: boolean;
    set scrollPos(val: number);
    get scrollPos(): number;
    get scrollMax(): number;
    private _isDragging;
    private _thumbHeight;
    private _thumbY;
    private _thumbVisible;
    private _thumbFade;
    private _thumbActive;
    private _contentElement;
    private _scrollThumbElement;
    private _scrollableContainer;
    private _assignedElements;
    private _hostResizeObserver;
    private _contentResizeObserver;
    private _scrollThumbStartY;
    private _mouseStartY;
    private _scrollbarVisible;
    private _scrollbarTrackZ;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private _resizeObserverCallback;
    private _updateScrollbar;
    private _zIndexFix;
    private _onSlotChange;
    private _onScrollThumbMouseDown;
    private _onScrollThumbMouseMove;
    private _onScrollThumbMouseMoveBound;
    private _onScrollThumbMouseUp;
    private _onScrollThumbMouseUpBound;
    private _onScrollableContainerScroll;
    private _onComponentMouseOver;
    private _onComponentMouseOverBound;
    private _onComponentMouseOut;
    private _onComponentMouseOutBound;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'vscode-scrollable': VscodeScrollable;
    }
}
//# sourceMappingURL=vscode-scrollable.d.ts.map