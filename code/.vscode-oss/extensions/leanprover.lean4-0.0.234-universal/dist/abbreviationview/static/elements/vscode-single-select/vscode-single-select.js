var __decorate=this&&this.__decorate||function(e,t,s,i){var l,o=arguments.length,n=o<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,s):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,s,i);else for(var a=e.length-1;a>=0;a--)(l=e[a])&&(n=(o<3?l(n):o>3?l(t,s,n):l(t,s))||n);return o>3&&n&&Object.defineProperty(t,s,n),n};import{html,LitElement}from"lit";import{customElement,property,query,state}from"lit/decorators.js";import{classMap}from"lit/directives/class-map.js";import{chevronDownIcon}from"../includes/vscode-select/template-elements.js";import{VscodeSelectBase}from"../includes/vscode-select/vscode-select-base.js";import styles from"./vscode-single-select.styles.js";import{highlightRanges}from"../includes/vscode-select/helpers.js";let VscodeSingleSelect=class extends VscodeSelectBase{set selectedIndex(e){this._selectedIndex=e,this._value=this._options[this._selectedIndex]?this._options[this._selectedIndex].value:"",this._labelText=this._options[this._selectedIndex]?this._options[this._selectedIndex].label:""}get selectedIndex(){return this._selectedIndex}set value(e){this._options[this._selectedIndex]&&(this._options[this._selectedIndex].selected=!1),this._selectedIndex=this._options.findIndex((t=>t.value===e)),this._selectedIndex>-1?(this._options[this._selectedIndex].selected=!0,this._labelText=this._options[this._selectedIndex].label,this._value=e):(this._labelText="",this._value="")}get value(){return this._options[this._selectedIndex]?this._options[this._selectedIndex]?.value??"":""}get validity(){return this._internals.validity}get validationMessage(){return this._internals.validationMessage}get willValidate(){return this._internals.willValidate}checkValidity(){return this._internals.checkValidity()}reportValidity(){return this._internals.reportValidity()}updateInputValue(){if(!this.combobox)return;const e=this.renderRoot.querySelector(".combobox-input");e&&(e.value=this._options[this._selectedIndex]?this._options[this._selectedIndex].label:"")}constructor(){super(),this.defaultValue="",this.role="listbox",this.name=void 0,this.required=!1,this._labelText="",this._multiple=!1,this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.updateComplete.then((()=>{this._manageRequired()}))}formResetCallback(){this.value=this.defaultValue}formStateRestoreCallback(e,t){this.updateComplete.then((()=>{this.value=e}))}get type(){return"select-one"}get form(){return this._internals.form}_onSlotChange(){super._onSlotChange(),this._selectedIndex>-1&&(this._labelText=this._options[this._selectedIndex]?.label??""),this._selectedIndex>-1&&this._options.length>0?this._internals.setFormValue(this._options[this._selectedIndex].value):this._internals.setFormValue(null)}_onArrowUpKeyDown(){super._onArrowUpKeyDown(),this._showDropdown||this._selectedIndex<=0||(this._filterPattern="",this._selectedIndex-=1,this._activeIndex=this._selectedIndex,this._labelText=this._options[this._selectedIndex].label,this._value=this._options[this._selectedIndex].value,this._internals.setFormValue(this._value),this._manageRequired(),this._dispatchChangeEvent())}_onArrowDownKeyDown(){super._onArrowDownKeyDown(),this._showDropdown||this._selectedIndex>=this._options.length-1||(this._filterPattern="",this._selectedIndex+=1,this._activeIndex=this._selectedIndex,this._labelText=this._options[this._selectedIndex].label,this._value=this._options[this._selectedIndex].value,this._internals.setFormValue(this._value),this._manageRequired(),this._dispatchChangeEvent())}_onEnterKeyDown(){super._onEnterKeyDown(),this._selectedIndex>-1&&(this._labelText=this._options[this._selectedIndex].label),this.updateInputValue(),this._internals.setFormValue(this._value),this._manageRequired()}_onOptionClick(e){const t=e.composedPath().find((e=>e?.matches("li.option")));t&&!t.matches(".disabled")&&(this._selectedIndex=Number(t.dataset.index),this._value=this._options[this._selectedIndex].value,this._selectedIndex>-1&&(this._labelText=this._options[this._selectedIndex].label),this._toggleDropdown(!1),this._internals.setFormValue(this._value),this._manageRequired(),this._dispatchChangeEvent())}_manageRequired(){const{value:e}=this;""===e&&this.required?this._internals.setValidity({valueMissing:!0},"Please select an item in the list.",this._face):this._internals.setValidity({})}_renderLabel(){const e=this._labelText||html`<span class="empty-label-placeholder"></span>`;return html`<span class="text">${e}</span>`}_renderSelectFace(){return html`
      <div
        class="select-face face"
        @click="${this._onFaceClick}"
        tabindex="${this.tabIndex>-1?0:-1}"
      >
        ${this._renderLabel()} ${chevronDownIcon}
      </div>
    `}_renderComboboxFace(){const e=this._selectedIndex>-1?this._options[this._selectedIndex].label:"";return html`
      <div class="combobox-face face">
        <input
          class="combobox-input"
          spellcheck="false"
          type="text"
          .value="${e}"
          @focus="${this._onComboboxInputFocus}"
          @input="${this._onComboboxInputInput}"
          @click=${this._onComboboxInputClick}
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
    `}_renderOptions(){const e=(this.combobox?this._filteredOptions:this._options).map(((e,t)=>{const s=classMap({option:!0,active:t===this._activeIndex&&!e.disabled,disabled:e.disabled});return html`
        <li
          class="${s}"
          data-index="${e.index}"
          data-filtered-index="${t}"
        >
          ${e.ranges?.length?highlightRanges(e.label,e.ranges??[]):e.label}
        </li>
      `}));return html`
      <ul
        class="options"
        @mouseover="${this._onOptionMouseOver}"
        @click="${this._onOptionClick}"
      >
        ${e}
      </ul>
    `}};VscodeSingleSelect.styles=styles,VscodeSingleSelect.shadowRootOptions={...LitElement.shadowRootOptions,delegatesFocus:!0},VscodeSingleSelect.formAssociated=!0,__decorate([property({attribute:"default-value"})],VscodeSingleSelect.prototype,"defaultValue",void 0),__decorate([property({type:String,attribute:!0,reflect:!0})],VscodeSingleSelect.prototype,"role",void 0),__decorate([property({reflect:!0})],VscodeSingleSelect.prototype,"name",void 0),__decorate([property({type:Number,attribute:"selected-index"})],VscodeSingleSelect.prototype,"selectedIndex",null),__decorate([property({type:String})],VscodeSingleSelect.prototype,"value",null),__decorate([property({type:Boolean,reflect:!0})],VscodeSingleSelect.prototype,"required",void 0),__decorate([state()],VscodeSingleSelect.prototype,"_labelText",void 0),__decorate([query(".face")],VscodeSingleSelect.prototype,"_face",void 0),VscodeSingleSelect=__decorate([customElement("vscode-single-select")],VscodeSingleSelect);export{VscodeSingleSelect};