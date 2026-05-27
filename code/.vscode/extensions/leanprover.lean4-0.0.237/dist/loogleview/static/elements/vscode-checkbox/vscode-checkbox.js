var __decorate=this&&this.__decorate||function(e,t,o,i){var s,r=arguments.length,c=r<3?t:null===i?i=Object.getOwnPropertyDescriptor(t,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(e,t,o,i);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(c=(r<3?s(c):r>3?s(t,o,c):s(t,o))||c);return r>3&&c&&Object.defineProperty(t,o,c),c};import{html,LitElement,nothing}from"lit";import{customElement,property,query}from"lit/decorators.js";import{classMap}from"lit/directives/class-map.js";import{FormButtonWidgetBase}from"../includes/form-button-widget/FormButtonWidgetBase.js";import{LabelledCheckboxOrRadioMixin}from"../includes/form-button-widget/LabelledCheckboxOrRadio.js";import styles from"./vscode-checkbox.styles.js";let VscodeCheckbox=class extends(LabelledCheckboxOrRadioMixin(FormButtonWidgetBase)){set checked(e){this._checked=e,this._manageRequired(),this.requestUpdate()}get checked(){return this._checked}set required(e){this._required=e,this._manageRequired(),this.requestUpdate()}get required(){return this._required}get form(){return this._internals.form}get type(){return"checkbox"}get validity(){return this._internals.validity}get validationMessage(){return this._internals.validationMessage}get willValidate(){return this._internals.willValidate}checkValidity(){return this._internals.checkValidity()}reportValidity(){return this._internals.reportValidity()}constructor(){super(),this.autofocus=!1,this._checked=!1,this.defaultChecked=!1,this.invalid=!1,this.name=void 0,this.role="checkbox",this.value="",this.disabled=!1,this.indeterminate=!1,this._required=!1,this._handleClick=e=>{e.preventDefault(),this.disabled||this._toggleState()},this._handleKeyDown=e=>{this.disabled||"Enter"!==e.key&&" "!==e.key||(e.preventDefault()," "===e.key&&this._toggleState(),"Enter"===e.key&&this._internals.form?.requestSubmit())},this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.addEventListener("keydown",this._handleKeyDown),this.updateComplete.then((()=>{this._manageRequired(),this._setActualFormValue()}))}disconnectedCallback(){this.removeEventListener("keydown",this._handleKeyDown)}update(e){super.update(e),e.has("checked")&&(this.ariaChecked=this.checked?"true":"false")}formResetCallback(){this.checked=this.defaultChecked}formStateRestoreCallback(e,t){e&&(this.checked=!0)}_setActualFormValue(){let e="";e=this.checked?this.value?this.value:"on":null,this._internals.setFormValue(e)}_toggleState(){this.checked=!this.checked,this.indeterminate=!1,this._setActualFormValue(),this._manageRequired(),this.dispatchEvent(new Event("change",{bubbles:!0})),this.dispatchEvent(new CustomEvent("vsc-change",{detail:{checked:this.checked,label:this.label,value:this.value},bubbles:!0,composed:!0}))}_manageRequired(){!this.checked&&this.required?this._internals.setValidity({valueMissing:!0},"Please check this box if you want to proceed.",this._inputEl??void 0):this._internals.setValidity({})}render(){const e=classMap({icon:!0,checked:this.checked,indeterminate:this.indeterminate}),t=classMap({"label-inner":!0}),o=html`<svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      class="check-icon"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M14.431 3.323l-8.47 10-.79-.036-3.35-4.77.818-.574 2.978 4.24 8.051-9.506.764.646z"
      />
    </svg>`,i=this.checked&&!this.indeterminate?o:nothing,s=this.indeterminate?html`<span class="indeterminate-icon"></span>`:nothing;return html`
      <div class="wrapper">
        <input
          ?autofocus=${this.autofocus}
          id="input"
          class="checkbox"
          type="checkbox"
          ?checked="${this.checked}"
          value="${this.value}"
        />
        <div class="${e}">${s}${i}</div>
        <label for="input" class="label" @click="${this._handleClick}">
          <span class="${t}">
            ${this._renderLabelAttribute()}
            <slot @slotchange="${this._handleSlotChange}"></slot>
          </span>
        </label>
      </div>
    `}};VscodeCheckbox.styles=styles,VscodeCheckbox.formAssociated=!0,VscodeCheckbox.shadowRootOptions={...LitElement.shadowRootOptions,delegatesFocus:!0},__decorate([property({type:Boolean,reflect:!0})],VscodeCheckbox.prototype,"autofocus",void 0),__decorate([property({type:Boolean,reflect:!0})],VscodeCheckbox.prototype,"checked",null),__decorate([property({type:Boolean,reflect:!0,attribute:"default-checked"})],VscodeCheckbox.prototype,"defaultChecked",void 0),__decorate([property({type:Boolean,reflect:!0})],VscodeCheckbox.prototype,"invalid",void 0),__decorate([property({reflect:!0})],VscodeCheckbox.prototype,"name",void 0),__decorate([property({reflect:!0})],VscodeCheckbox.prototype,"role",void 0),__decorate([property()],VscodeCheckbox.prototype,"value",void 0),__decorate([property({type:Boolean,reflect:!0})],VscodeCheckbox.prototype,"disabled",void 0),__decorate([property({type:Boolean,reflect:!0})],VscodeCheckbox.prototype,"indeterminate",void 0),__decorate([property({type:Boolean,reflect:!0})],VscodeCheckbox.prototype,"required",null),__decorate([query("#input")],VscodeCheckbox.prototype,"_inputEl",void 0),VscodeCheckbox=__decorate([customElement("vscode-checkbox")],VscodeCheckbox);export{VscodeCheckbox};