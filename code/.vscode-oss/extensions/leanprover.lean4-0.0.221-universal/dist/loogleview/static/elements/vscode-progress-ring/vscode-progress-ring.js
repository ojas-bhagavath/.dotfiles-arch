var __decorate=this&&this.__decorate||function(e,r,t,o){var s,c=arguments.length,i=c<3?r:null===o?o=Object.getOwnPropertyDescriptor(r,t):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,r,t,o);else for(var a=e.length-1;a>=0;a--)(s=e[a])&&(i=(c<3?s(i):c>3?s(r,t,i):s(r,t))||i);return c>3&&i&&Object.defineProperty(r,t,i),i};import{html}from"lit";import{customElement,property}from"lit/decorators.js";import{VscElement}from"../includes/VscElement";import styles from"./vscode-progress-ring.styles";let VscodeProgressRing=class extends VscElement{constructor(){super(...arguments),this.ariaLabel="Loading",this.ariaLive="assertive",this.role="alert"}render(){return html`<svg class="progress" part="progress" viewBox="0 0 16 16">
      <circle
        class="background"
        part="background"
        cx="8px"
        cy="8px"
        r="7px"
      ></circle>
      <circle
        class="indeterminate-indicator-1"
        part="indeterminate-indicator-1"
        cx="8px"
        cy="8px"
        r="7px"
      ></circle>
    </svg>`}};VscodeProgressRing.styles=styles,__decorate([property({reflect:!0,attribute:"aria-label"})],VscodeProgressRing.prototype,"ariaLabel",void 0),__decorate([property({reflect:!0,attribute:"aria-live"})],VscodeProgressRing.prototype,"ariaLive",void 0),__decorate([property({reflect:!0})],VscodeProgressRing.prototype,"role",void 0),VscodeProgressRing=__decorate([customElement("vscode-progress-ring")],VscodeProgressRing);export{VscodeProgressRing};