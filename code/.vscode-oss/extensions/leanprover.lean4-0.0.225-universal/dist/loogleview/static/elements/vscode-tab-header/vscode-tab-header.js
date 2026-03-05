var __decorate=this&&this.__decorate||function(e,t,a,r){var o,s=arguments.length,c=s<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,a):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)c=Reflect.decorate(e,t,a,r);else for(var l=e.length-1;l>=0;l--)(o=e[l])&&(c=(s<3?o(c):s>3?o(t,a,c):o(t,a))||c);return s>3&&c&&Object.defineProperty(t,a,c),c};import{html}from"lit";import{customElement,property}from"lit/decorators.js";import{classMap}from"lit/directives/class-map.js";import{VscElement}from"../includes/VscElement.js";import styles from"./vscode-tab-header.styles.js";let VscodeTabHeader=class extends VscElement{constructor(){super(...arguments),this.active=!1,this.ariaControls="",this.panel=!1,this.role="tab",this.tabId=-1}attributeChangedCallback(e,t,a){if(super.attributeChangedCallback(e,t,a),"active"===e){const e=null!==a;this.ariaSelected=e?"true":"false",this.tabIndex=e?0:-1}}render(){return html`
      <div
        class=${classMap({wrapper:!0,active:this.active,panel:this.panel})}
      >
        <div class="before"><slot name="content-before"></slot></div>
        <div class="main"><slot></slot></div>
        <div class="after"><slot name="content-after"></slot></div>
        <span
          class=${classMap({"active-indicator":!0,active:this.active,panel:this.panel})}
        ></span>
      </div>
    `}};VscodeTabHeader.styles=styles,__decorate([property({type:Boolean,reflect:!0})],VscodeTabHeader.prototype,"active",void 0),__decorate([property({reflect:!0,attribute:"aria-controls"})],VscodeTabHeader.prototype,"ariaControls",void 0),__decorate([property({type:Boolean,reflect:!0})],VscodeTabHeader.prototype,"panel",void 0),__decorate([property({reflect:!0})],VscodeTabHeader.prototype,"role",void 0),__decorate([property({type:Number,reflect:!0,attribute:"tab-id"})],VscodeTabHeader.prototype,"tabId",void 0),VscodeTabHeader=__decorate([customElement("vscode-tab-header")],VscodeTabHeader);export{VscodeTabHeader};