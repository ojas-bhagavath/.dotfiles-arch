var __decorate=this&&this.__decorate||function(e,t,o,n){var s,r=arguments.length,i=r<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,o):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,o,n);else for(var l=e.length-1;l>=0;l--)(s=e[l])&&(i=(r<3?s(i):r>3?s(t,o,i):s(t,o))||i);return r>3&&i&&Object.defineProperty(t,o,i),i};import{html,nothing}from"lit";import{customElement,property}from"lit/decorators.js";import{VscElement}from"../includes/VscElement.js";import styles from"./vscode-context-menu-item.styles.js";let VscodeContextMenuItem=class extends VscElement{constructor(){super(...arguments),this.label="",this.keybinding="",this.value="",this.separator=!1,this.tabindex=0}onItemClick(){this.dispatchEvent(new CustomEvent("vsc-click",{detail:{label:this.label,keybinding:this.keybinding,value:this.value||this.label,separator:this.separator,tabindex:this.tabindex},bubbles:!0,composed:!0}))}render(){return html`
      ${this.separator?html`
            <div class="context-menu-item separator">
              <span class="ruler"></span>
            </div>
          `:html`
            <div class="context-menu-item">
              <a @click="${this.onItemClick}">
                ${this.label?html`<span class="label">${this.label}</span>`:nothing}
                ${this.keybinding?html`<span class="keybinding">${this.keybinding}</span>`:nothing}
              </a>
            </div>
          `}
    `}};VscodeContextMenuItem.styles=styles,__decorate([property({type:String})],VscodeContextMenuItem.prototype,"label",void 0),__decorate([property({type:String})],VscodeContextMenuItem.prototype,"keybinding",void 0),__decorate([property({type:String})],VscodeContextMenuItem.prototype,"value",void 0),__decorate([property({type:Boolean,reflect:!0})],VscodeContextMenuItem.prototype,"separator",void 0),__decorate([property({type:Number})],VscodeContextMenuItem.prototype,"tabindex",void 0),VscodeContextMenuItem=__decorate([customElement("vscode-context-menu-item")],VscodeContextMenuItem);export{VscodeContextMenuItem};