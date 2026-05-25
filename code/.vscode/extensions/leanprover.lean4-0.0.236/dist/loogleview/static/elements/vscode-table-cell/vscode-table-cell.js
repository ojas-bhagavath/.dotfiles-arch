var __decorate=this&&this.__decorate||function(e,t,l,o){var r,c=arguments.length,s=c<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,l):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,l,o);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(s=(c<3?r(s):c>3?r(t,l,s):r(t,l))||s);return c>3&&s&&Object.defineProperty(t,l,s),s};import{html,nothing}from"lit";import{customElement,property}from"lit/decorators.js";import{VscElement}from"../includes/VscElement.js";import styles from"./vscode-table-cell.styles.js";let VscodeTableCell=class extends VscElement{constructor(){super(...arguments),this.role="cell",this.columnLabel="",this.compact=!1}render(){const e=this.columnLabel?html`<div class="column-label" role="presentation">
          ${this.columnLabel}
        </div>`:nothing;return html`
      <div class="wrapper">
        ${e}
        <slot></slot>
      </div>
    `}};VscodeTableCell.styles=styles,__decorate([property({reflect:!0})],VscodeTableCell.prototype,"role",void 0),__decorate([property({attribute:"column-label"})],VscodeTableCell.prototype,"columnLabel",void 0),__decorate([property({type:Boolean,reflect:!0})],VscodeTableCell.prototype,"compact",void 0),VscodeTableCell=__decorate([customElement("vscode-table-cell")],VscodeTableCell);export{VscodeTableCell};