var __decorate=this&&this.__decorate||function(e,t,s,l){var i,o=arguments.length,c=o<3?t:null===l?l=Object.getOwnPropertyDescriptor(t,s):l;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(e,t,s,l);else for(var n=e.length-1;n>=0;n--)(i=e[n])&&(c=(o<3?i(c):o>3?i(t,s,c):i(t,s))||c);return o>3&&c&&Object.defineProperty(t,s,c),c};import{html,LitElement}from"lit";import{customElement,property,query}from"lit/decorators.js";import{classMap}from"lit/directives/class-map.js";import{repeat}from"lit/directives/repeat.js";import{chevronDownIcon}from"../includes/vscode-select/template-elements.js";import{VscodeSelectBase}from"../includes/vscode-select/vscode-select-base.js";import styles from"./vscode-multi-select.styles.js";import{highlightRanges}from"../includes/vscode-select/helpers.js";let VscodeMultiSelect=class extends VscodeSelectBase{set selectedIndexes(e){this._selectedIndexes=e}get selectedIndexes(){return this._selectedIndexes}set value(e){const t=e.map((e=>String(e)));this._values=t,this._selectedIndexes.forEach((e=>{this._options[e].selected=!1})),this._selectedIndexes=[],t.forEach((e=>{this._valueOptionIndexMap[e]&&(this._selectedIndexes.push(this._valueOptionIndexMap[e]),this._options[this._valueOptionIndexMap[e]].selected=!0)})),this._setFormValue(),this._manageRequired()}get value(){return this._values}get form(){return this._internals.form}get type(){return"select-multiple"}get validity(){return this._internals.validity}get validationMessage(){return this._internals.validationMessage}get willValidate(){return this._internals.willValidate}checkValidity(){return this._internals.checkValidity()}reportValidity(){return this._internals.reportValidity()}constructor(){super(),this.defaultValue=[],this.required=!1,this.name=void 0,this._multiple=!0,this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.updateComplete.then((()=>{this._setDefaultValue(),this._manageRequired()}))}formResetCallback(){this.updateComplete.then((()=>{this.value=this.defaultValue}))}formStateRestoreCallback(e,t){const s=Array.from(e.entries()).map((e=>String(e[1])));this.updateComplete.then((()=>{this.value=s}))}_setDefaultValue(){if(Array.isArray(this.defaultValue)&&this.defaultValue.length>0){const e=this.defaultValue.map((e=>String(e)));this.value=e}}_manageRequired(){const{value:e}=this;0===e.length&&this.required?this._internals.setValidity({valueMissing:!0},"Please select an item in the list.",this._faceElement):this._internals.setValidity({})}_setFormValue(){const e=new FormData;this._values.forEach((t=>{e.append(this.name??"",t)})),this._internals.setFormValue(e)}_onOptionClick(e){const t=e.composedPath().find((e=>"matches"in e&&e.matches("li.option")));if(!t)return;const s=Number(t.dataset.index);this._options[s]&&(this._options[s].selected=!this._options[s].selected),this._selectedIndexes=[],this._values=[],this._options.forEach((e=>{e.selected&&(this._selectedIndexes.push(e.index),this._values.push(e.value))})),this._setFormValue(),this._manageRequired(),this._dispatchChangeEvent()}_onMultiAcceptClick(){this._toggleDropdown(!1)}_onMultiDeselectAllClick(){this._selectedIndexes=[],this._values=[],this._options=this._options.map((e=>({...e,selected:!1}))),this._manageRequired(),this._dispatchChangeEvent()}_onMultiSelectAllClick(){this._selectedIndexes=[],this._values=[],this._options=this._options.map((e=>({...e,selected:!0}))),this._options.forEach(((e,t)=>{this._selectedIndexes.push(t),this._values.push(e.value),this._dispatchChangeEvent()})),this._setFormValue(),this._manageRequired()}_renderLabel(){switch(this._selectedIndexes.length){case 0:return html`<span class="select-face-badge no-item"
          >No items selected</span
        >`;case 1:return html`<span class="select-face-badge">1 item selected</span>`;default:return html`<span class="select-face-badge"
          >${this._selectedIndexes.length} items selected</span
        >`}}_renderSelectFace(){return html`
      <div
        class="select-face face multiselect"
        @click="${this._onFaceClick}"
        tabindex="${this.tabIndex>-1?0:-1}"
      >
        ${this._renderLabel()} ${chevronDownIcon}
      </div>
    `}_renderComboboxFace(){const e=this._selectedIndex>-1?this._options[this._selectedIndex].label:"";return html`
      <div class="combobox-face face">
        ${this._renderLabel()}
        <input
          class="combobox-input"
          spellcheck="false"
          type="text"
          .value="${e}"
          @focus="${this._onComboboxInputFocus}"
          @input="${this._onComboboxInputInput}"
          @click="${this._onComboboxInputClick}"
        />
        <button
          class="combobox-button"
          type="button"
          @click="${this._onComboboxButtonClick}"
          @keydown="${this._onComboboxButtonKeyDown}"
        >
          ${chevronDownIcon}
        </button>
      </div>
    `}_renderOptions(){const e=this.combobox?this._filteredOptions:this._options;return html`
      <ul
        class="options"
        @click="${this._onOptionClick}"
        @mouseover="${this._onOptionMouseOver}"
      >
        ${repeat(e,(e=>e.index),((e,t)=>{const s=this._selectedIndexes.includes(e.index),l=classMap({active:t===this._activeIndex,option:!0,selected:s}),i=classMap({"checkbox-icon":!0,checked:s});return html`
              <li
                class="${l}"
                data-index="${e.index}"
                data-filtered-index="${t}"
              >
                <span class="${i}"></span>
                <span class="option-label"
                  >${e.ranges?.length?highlightRanges(e.label,e.ranges??[]):e.label}</span
                >
              </li>
            `}))}
      </ul>
    `}_renderDropdownControls(){return html`
      <div class="dropdown-controls">
        <button
          type="button"
          @click="${this._onMultiSelectAllClick}"
          title="Select all"
          class="action-icon"
          id="select-all"
        >
          <vscode-icon name="checklist"></vscode-icon>
        </button>
        <button
          type="button"
          @click="${this._onMultiDeselectAllClick}"
          title="Deselect all"
          class="action-icon"
          id="select-none"
        >
          <vscode-icon name="clear-all"></vscode-icon>
        </button>
        <vscode-button
          class="button-accept"
          @click="${this._onMultiAcceptClick}"
          >OK</vscode-button
        >
      </div>
    `}};VscodeMultiSelect.styles=styles,VscodeMultiSelect.shadowRootOptions={...LitElement.shadowRootOptions,delegatesFocus:!0},VscodeMultiSelect.formAssociated=!0,__decorate([property({type:Array,attribute:"default-value"})],VscodeMultiSelect.prototype,"defaultValue",void 0),__decorate([property({type:Boolean,reflect:!0})],VscodeMultiSelect.prototype,"required",void 0),__decorate([property({reflect:!0})],VscodeMultiSelect.prototype,"name",void 0),__decorate([property({type:Array,attribute:!1})],VscodeMultiSelect.prototype,"selectedIndexes",null),__decorate([property({type:Array})],VscodeMultiSelect.prototype,"value",null),__decorate([query(".face")],VscodeMultiSelect.prototype,"_faceElement",void 0),VscodeMultiSelect=__decorate([customElement("vscode-multi-select")],VscodeMultiSelect);export{VscodeMultiSelect};