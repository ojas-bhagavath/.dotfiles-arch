import { TemplateResult } from 'lit';
import '../../vscode-button';
import '../../vscode-option';
import type { InternalOption, Option, SearchMethod } from './types.js';
import { VscElement } from '../VscElement.js';
interface OptionListStat {
    selectedIndexes: number[];
    values: string[];
}
/**
 * @cssprop --dropdown-z-index - workaround for dropdown z-index issues
 */
export declare class VscodeSelectBase extends VscElement {
    /** @internal */
    ariaExpanded: string;
    combobox: boolean;
    set disabled(newState: boolean);
    get disabled(): boolean;
    /**
     * Sets the invalid state manually.
     */
    invalid: boolean;
    /**
     * Search method in the filtered list within the combobox mode.
     *
     * - contains - The list item includes the searched pattern at any position.
     * - fuzzy - The list item contains the letters of the search pattern in the same order, but at any position.
     * - startsWith - The search pattern matches the beginning of the searched text.
     * - startsWithPerTerm - The search pattern matches the beginning of any word in the searched text.
     *
     * @default 'fuzzy'
     */
    set filter(val: 'contains' | 'fuzzy' | 'startsWith' | 'startsWithPerTerm');
    get filter(): 'contains' | 'fuzzy' | 'startsWith' | 'startsWithPerTerm';
    focused: boolean;
    /**
     * @attr [options=[]]
     * @type {Option[]}
     */
    set options(opts: Option[]);
    get options(): Option[];
    /**
     * Position of the options list when visible.
     */
    position: 'above' | 'below';
    /** @internal */
    tabIndex: number;
    private _assignedOptions;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected _activeIndex: number;
    protected _currentDescription: string;
    protected _filter: SearchMethod;
    protected get _filteredOptions(): InternalOption[];
    protected _filterPattern: string;
    protected _selectedIndex: number;
    protected _selectedIndexes: number[];
    protected _showDropdown: boolean;
    protected _options: InternalOption[];
    protected _value: string;
    protected _values: string[];
    protected _listScrollTop: number;
    private _listElement;
    /** @internal */
    protected _multiple: boolean;
    /**
     * @internal
     * Quick-searchable map for searching a value in the options list.
     * Keys are the options values, values are the option indexes.
     */
    protected _valueOptionIndexMap: {
        [key: string]: number;
    };
    private _isHoverForbidden;
    private _disabled;
    private _originalTabIndex;
    protected get _currentOptions(): InternalOption[];
    protected _addOptionsFromSlottedElements(): OptionListStat;
    protected _toggleDropdown(visible: boolean): Promise<void>;
    protected _dispatchChangeEvent(): void;
    protected _onFaceClick(): void;
    private _onClickOutside;
    private _onMouseMove;
    private _toggleComboboxDropdown;
    protected _onComboboxButtonClick(): void;
    protected _onComboboxButtonKeyDown(ev: KeyboardEvent): void;
    protected _onOptionMouseOver(ev: MouseEvent): void;
    protected _onEnterKeyDown(): void;
    private _onSpaceKeyDown;
    private _scrollActiveElementToTop;
    private _adjustOptionListScrollPos;
    protected _onArrowUpKeyDown(): void;
    protected _onArrowDownKeyDown(): void;
    private _onComponentKeyDown;
    private _onComponentFocus;
    private _onComponentBlur;
    protected _onSlotChange(): void;
    protected _onComboboxInputFocus(ev: FocusEvent): void;
    protected _onComboboxInputInput(ev: InputEvent): void;
    protected _onComboboxInputClick(): void;
    protected _renderOptions(): TemplateResult | TemplateResult[];
    private _renderDescription;
    protected _renderSelectFace(): TemplateResult;
    protected _renderComboboxFace(): TemplateResult;
    protected _renderDropdownControls(): TemplateResult;
    private _renderDropdown;
    render(): TemplateResult;
}
export {};
//# sourceMappingURL=vscode-select-base.d.ts.map