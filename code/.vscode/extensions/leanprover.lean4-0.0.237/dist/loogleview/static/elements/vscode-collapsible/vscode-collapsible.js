var __decorate=this&&this.__decorate||function(e,t,o,s){var l,i=arguments.length,c=i<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,o):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(e,t,o,s);else for(var r=e.length-1;r>=0;r--)(l=e[r])&&(c=(i<3?l(c):i>3?l(t,o,c):l(t,o))||c);return i>3&&c&&Object.defineProperty(t,o,c),c};import{html,nothing}from"lit";import{customElement,property}from"lit/decorators.js";import{classMap}from"lit/directives/class-map.js";import{VscElement}from"../includes/VscElement.js";import styles from"./vscode-collapsible.styles.js";let VscodeCollapsible=class extends VscElement{constructor(){super(...arguments),this.title="",this.description="",this.open=!1}_emitToggleEvent(){this.dispatchEvent(new CustomEvent("vsc-collapsible-toggle",{detail:{open:this.open}}))}_onHeaderClick(){this.open=!this.open,this._emitToggleEvent()}_onHeaderKeyDown(e){"Enter"===e.key&&(this.open=!this.open,this._emitToggleEvent())}render(){const e=classMap({collapsible:!0,open:this.open}),t=html`<svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      class="header-icon"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M10.072 8.024L5.715 3.667l.618-.62L11 7.716v.618L6.333 13l-.618-.619 4.357-4.357z"
      />
    </svg>`,o=this.description?html`<span class="description">${this.description}</span>`:nothing;return html`
      <div class="${e}">
        <div
          class="collapsible-header"
          tabindex="0"
          title="${this.title}"
          @click="${this._onHeaderClick}"
          @keydown="${this._onHeaderKeyDown}"
        >
          ${t}
          <h3 class="title">${this.title}${o}</h3>
          <div class="header-slots">
            <div class="actions"><slot name="actions"></slot></div>
            <div class="decorations"><slot name="decorations"></slot></div>
          </div>
        </div>
        <div class="collapsible-body" part="body">
          <slot></slot>
        </div>
      </div>
    `}};VscodeCollapsible.styles=styles,__decorate([property({type:String})],VscodeCollapsible.prototype,"title",void 0),__decorate([property()],VscodeCollapsible.prototype,"description",void 0),__decorate([property({type:Boolean,reflect:!0})],VscodeCollapsible.prototype,"open",void 0),VscodeCollapsible=__decorate([customElement("vscode-collapsible")],VscodeCollapsible);export{VscodeCollapsible};