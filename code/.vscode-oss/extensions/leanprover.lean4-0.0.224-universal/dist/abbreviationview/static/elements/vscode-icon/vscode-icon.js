var VscodeIcon_1,__decorate=this&&this.__decorate||function(e,t,o,s){var n,c=arguments.length,i=c<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,o):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,o,s);else for(var r=e.length-1;r>=0;r--)(n=e[r])&&(i=(c<3?n(i):c>3?n(t,o,i):n(t,o))||i);return c>3&&i&&Object.defineProperty(t,o,i),i};import{html}from"lit";import{customElement,property}from"lit/decorators.js";import{classMap}from"lit/directives/class-map.js";import{styleMap}from"lit/directives/style-map.js";import{ifDefined}from"lit/directives/if-defined.js";import{VscElement}from"../includes/VscElement.js";import styles from"./vscode-icon.styles.js";let VscodeIcon=VscodeIcon_1=class extends VscElement{constructor(){super(...arguments),this.label="",this.name="",this.size=16,this.spin=!1,this.spinDuration=1.5,this.actionIcon=!1,this._onButtonClick=e=>{this.dispatchEvent(new CustomEvent("vsc-click",{detail:{originalEvent:e}}))}}connectedCallback(){super.connectedCallback();const{href:e,nonce:t}=this._getStylesheetConfig();VscodeIcon_1.stylesheetHref=e,VscodeIcon_1.nonce=t}_getStylesheetConfig(){const e=document.getElementById("vscode-codicon-stylesheet"),t=e?.getAttribute("href")||void 0;return{nonce:e?.getAttribute("nonce")||void 0,href:t}}render(){const{stylesheetHref:e,nonce:t}=VscodeIcon_1,o=html`<span
      class="${classMap({codicon:!0,["codicon-"+this.name]:!0,spin:this.spin})}"
      style="${styleMap({animationDuration:String(this.spinDuration)+"s",fontSize:this.size+"px",height:this.size+"px",width:this.size+"px"})}"
    ></span>`,s=this.actionIcon?html` <button
          class="button"
          @click=${this._onButtonClick}
          aria-label=${this.label}
        >
          ${o}
        </button>`:html` <span class="icon" aria-hidden="true" role="presentation"
          >${o}</span
        >`;return html`
      <link
        rel="stylesheet"
        href="${ifDefined(e)}"
        nonce="${ifDefined(t)}"
      />
      ${s}
    `}};VscodeIcon.styles=styles,VscodeIcon.stylesheetHref="",VscodeIcon.nonce="",__decorate([property()],VscodeIcon.prototype,"label",void 0),__decorate([property({type:String})],VscodeIcon.prototype,"name",void 0),__decorate([property({type:Number})],VscodeIcon.prototype,"size",void 0),__decorate([property({type:Boolean,reflect:!0})],VscodeIcon.prototype,"spin",void 0),__decorate([property({type:Number,attribute:"spin-duration"})],VscodeIcon.prototype,"spinDuration",void 0),__decorate([property({type:Boolean,reflect:!0,attribute:"action-icon"})],VscodeIcon.prototype,"actionIcon",void 0),VscodeIcon=VscodeIcon_1=__decorate([customElement("vscode-icon")],VscodeIcon);export{VscodeIcon};