var __decorate=this&&this.__decorate||function(e,t,s,o){var c,n=arguments.length,i=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,s,o);else for(var a=e.length-1;a>=0;a--)(c=e[a])&&(i=(n<3?c(i):n>3?c(t,s,i):c(t,s))||i);return n>3&&i&&Object.defineProperty(t,s,i),i};import{html,nothing}from"lit";import{customElement,property,state}from"lit/decorators.js";import{classMap}from"lit/directives/class-map.js";import{ifDefined}from"lit/directives/if-defined.js";import{styleMap}from"lit/directives/style-map.js";import{VscElement}from"../includes/VscElement.js";import"../vscode-badge/index.js";import"../vscode-icon/index.js";import styles from"./vscode-tree.styles.js";const ARROW_OUTER_WIDTH=30,ARROW_ICON_WIDTH=16,CONTENT_PADDING=3,addPath=(e,t=[])=>{const s=[];return e.forEach(((e,o)=>{const c=[...t,o],n={...e,path:c};e.subItems&&(n.subItems=addPath(e.subItems,c)),s.push(n)})),s},isBranch=e=>!!(e.subItems&&Array.isArray(e.subItems)&&e?.subItems?.length>0);let VscodeTree=class extends VscElement{constructor(){super(...arguments),this.indent=8,this.arrows=!1,this.multiline=!1,this.tabindex=0,this.indentGuides=!1,this._data=[],this._selectedItem=null,this._focusedItem=null,this._selectedBranch=null,this._focusedBranch=null,this._handleComponentKeyDownBound=this._handleComponentKeyDown.bind(this)}set data(e){const t=this._data;this._data=addPath(e),this.requestUpdate("data",t)}get data(){return this._data}closeAll(){this._closeSubTreeRecursively(this.data),this.requestUpdate()}deselectAll(){this._deselectItemsRecursively(this.data),this.requestUpdate()}getItemByPath(e){return this._getItemByPath(e)}connectedCallback(){super.connectedCallback(),this.addEventListener("keydown",this._handleComponentKeyDownBound)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("keydown",this._handleComponentKeyDownBound)}_getItemByPath(e){let t=this._data,s=null;return e.forEach(((o,c)=>{c===e.length-1?s=t[o]:t=t[o].subItems})),s}_handleActionClick(e){e.stopPropagation();const t=e.target,s=t.dataset.itemPath,o=t.dataset.index;let c=null,n="",i="";if(s){const e=s.split("/").map((e=>Number(e)));if(c=this._getItemByPath(e),c?.actions){const e=Number(o);c.actions[e]&&(n=c.actions[e].actionId)}c?.value&&(i=c.value)}this.dispatchEvent(new CustomEvent("vsc-run-action",{detail:{actionId:n,item:c,value:i}})),this.dispatchEvent(new CustomEvent("vsc-tree-action",{detail:{actionId:n,item:c,value:i}}))}_renderIconVariant(e){const{type:t,value:s}=e;return"themeicon"===t?html`<vscode-icon name=${s} class="theme-icon"></vscode-icon>`:html`<span
        class="image-icon"
        style="background-image: url(${s});"
      ></span>`}_renderIcon(e){const t={branch:{value:"folder",type:"themeicon"},open:{value:"folder-opened",type:"themeicon"},leaf:{value:"file",type:"themeicon"}};if(e.iconUrls)e.iconUrls.branch&&(t.branch={value:e.iconUrls.branch,type:"image"}),e.iconUrls.leaf&&(t.leaf={value:e.iconUrls.leaf,type:"image"}),e.iconUrls.open&&(t.open={value:e.iconUrls.open,type:"image"});else if("object"==typeof e.icons)e.icons.branch&&(t.branch={value:e.icons.branch,type:"themeicon"}),e.icons.leaf&&(t.leaf={value:e.icons.leaf,type:"themeicon"}),e.icons.open&&(t.open={value:e.icons.open,type:"themeicon"});else if(!e.icons)return html`${nothing}`;return isBranch(e)?e.open?this._renderIconVariant(t.open):this._renderIconVariant(t.branch):this._renderIconVariant(t.leaf)}_renderArrow(e){if(!this.arrows||!isBranch(e))return html`${nothing}`;const{open:t=!1}=e;return html`
      <div class="arrow-container">
        <vscode-icon name="${t?"chevron-down":"chevron-right"}" class="icon-arrow"></vscode-icon>
      </div>
    `}_renderActions(e){const t=[];return e.actions&&Array.isArray(e.actions)&&e.actions.forEach(((s,o)=>{if(s.icon){const c=html`<vscode-icon
            name=${s.icon}
            action-icon
            title=${ifDefined(s.tooltip)}
            data-item-path=${ifDefined(e.path?.join("/"))}
            data-index=${o}
            class="action-icon"
            @click=${this._handleActionClick}
          ></vscode-icon>`;t.push(c)}})),t.length>0?html`<div class="actions">${t}</div>`:html`${nothing}`}_renderDecorations(e){const t=[];return e.decorations&&Array.isArray(e.decorations)&&e.decorations.forEach((e=>{const{appearance:s="text",visibleWhen:o="always",content:c="",color:n="",focusedColor:i="",hoverColor:a="",selectedColor:r=""}=e,l=`visible-when-${o}`,h={};switch(n&&(h["--color"]=n),i&&(h["--focused-color"]=i),a&&(h["--hover-color"]=a),r&&(h["--selected-color"]=r),s){case"counter-badge":t.push(html`<vscode-badge
                variant="counter"
                class=${["counter-badge",l].join(" ")}
                part="counter-badge-decoration"
                >${c}</vscode-badge
              >`);break;case"filled-circle":t.push(html`<vscode-icon
                name="circle-filled"
                size="14"
                class=${["filled-circle",l].join(" ")}
                part="filled-circle-decoration"
                style=${styleMap(h)}
              ></vscode-icon>`);break;case"text":t.push(html`<div
                class=${["decoration-text",l].join(" ")}
                part="caption-decoration"
                style=${styleMap(h)}
              >
                ${c}
              </div>`)}})),t.length>0?html`<div class="decorations" part="decorations">
        ${t}
      </div>`:html`${nothing}`}_renderTreeItem(e,t){const{open:s=!1,label:o,description:c="",tooltip:n,selected:i=!1,focused:a=!1,subItems:r=[]}=e,{path:l,itemType:h,hasFocusedItem:d=!1,hasSelectedItem:m=!1}=t,u=["contents"],p=s?["open"]:[],_=(l.length-1)*this.indent,f=this.arrows&&"leaf"===h?30+_:_,I=this._renderArrow(e),v=this._renderIcon(e),y=this.arrows?_+16:_+3,g=s&&"branch"===h?html`<ul
            style=${styleMap({"--indent-guide-pos":`${y}px`})}
            class=${classMap({"has-active-item":d||m})}
          >
            ${this._renderTree(r,l)}
          </ul>`:nothing,b=c?html`<span class="description" part="description">${c}</span>`:nothing,$=this._renderActions(e),B=this._renderDecorations(e);return p.push(h),i&&u.push("selected"),a&&u.push("focused"),html`
      <li data-path="${l.join("/")}" class="${p.join(" ")}">
        <div
          class="${u.join(" ")}"
          style="${styleMap({paddingLeft:`${f+3}px`})}"
        >
          ${I}${v}<span
            class="text-content"
            part="text-content"
            title="${ifDefined(n)}"
            >${o}${b}</span
          >
          ${$} ${B}
        </div>
        ${g}
      </li>
    `}_renderTree(e,t=[]){const s=[];return e?(e.forEach(((e,o)=>{const c=[...t,o],n=isBranch(e)?"branch":"leaf",{selected:i=!1,focused:a=!1,hasFocusedItem:r=!1,hasSelectedItem:l=!1}=e;i&&(this._selectedItem=e),a&&(this._focusedItem=e),s.push(this._renderTreeItem(e,{path:c,itemType:n,hasFocusedItem:r,hasSelectedItem:l}))})),s):nothing}_selectItem(e){this._selectedItem&&(this._selectedItem.selected=!1),this._focusedItem&&(this._focusedItem.focused=!1),this._selectedItem=e,e.selected=!0,this._focusedItem=e,e.focused=!0,this._selectedBranch&&(this._selectedBranch.hasSelectedItem=!1);let t=null;if(e.path?.length&&e.path.length>1&&(t=this._getItemByPath(e.path.slice(0,-1))),isBranch(e))this._selectedBranch=e,e.hasSelectedItem=!0,e.open=!e.open,e.open?(this._selectedBranch=e,e.hasSelectedItem=!0):t&&(this._selectedBranch=t,t.hasSelectedItem=!0);else if(e.path?.length&&e.path.length>1){const t=this._getItemByPath(e.path.slice(0,-1));t&&(this._selectedBranch=t,t.hasSelectedItem=!0)}else this._selectedBranch=e,e.hasSelectedItem=!0;this._emitSelectEvent(this._selectedItem,this._selectedItem.path.join("/")),this.requestUpdate()}_focusItem(e){this._focusedItem&&(this._focusedItem.focused=!1),this._focusedItem=e,e.focused=!0;const t=!!e?.subItems?.length;this._focusedBranch&&(this._focusedBranch.hasFocusedItem=!1);let s=null;e.path?.length&&e.path.length>1&&(s=this._getItemByPath(e.path.slice(0,-1))),t?e.open?(this._focusedBranch=e,e.hasFocusedItem=!0):!e.open&&s&&(this._focusedBranch=s,s.hasFocusedItem=!0):s&&(this._focusedBranch=s,s.hasFocusedItem=!0)}_closeSubTreeRecursively(e){e.forEach((e=>{e.open=!1,e.subItems&&e.subItems.length>0&&this._closeSubTreeRecursively(e.subItems)}))}_deselectItemsRecursively(e){e.forEach((e=>{e.selected&&(e.selected=!1),e.subItems&&e.subItems.length>0&&this._deselectItemsRecursively(e.subItems)}))}_emitSelectEvent(e,t){const{icons:s,label:o,open:c,value:n}=e,i={icons:s,itemType:isBranch(e)?"branch":"leaf",label:o,open:c||!1,value:n||o,path:t};this.dispatchEvent(new CustomEvent("vsc-select",{bubbles:!0,composed:!0,detail:i})),this.dispatchEvent(new CustomEvent("vsc-tree-select",{detail:i}))}_focusPrevItem(){if(!this._focusedItem)return void this._focusItem(this._data[0]);const{path:e}=this._focusedItem;if(e&&e?.length>0){const t=e[e.length-1],s=e.length>1;if(t>0){const s=[...e];s[s.length-1]=t-1;const o=this._getItemByPath(s);let c=o;if(o?.open&&o.subItems?.length){const{subItems:e}=o;c=e[e.length-1]}this._focusItem(c)}else if(s){const t=[...e];t.pop(),this._focusItem(this._getItemByPath(t))}}else this._focusItem(this._data[0])}_focusNextItem(){if(!this._focusedItem)return void this._focusItem(this._data[0]);const{path:e,open:t}=this._focusedItem;if(t&&Array.isArray(this._focusedItem.subItems)&&this._focusedItem.subItems.length>0)return void this._focusItem(this._focusedItem.subItems[0]);const s=[...e];s[s.length-1]+=1;let o=this._getItemByPath(s);o?this._focusItem(o):(s.pop(),s.length>0&&(s[s.length-1]+=1,o=this._getItemByPath(s),o&&this._focusItem(o)))}_handleClick(e){const t=e.composedPath().find((e=>e.tagName&&"LI"===e.tagName.toUpperCase()));if(t){const e=(t.dataset.path||"").split("/").map((e=>Number(e))),s=this._getItemByPath(e);this._selectItem(s)}else this._focusedItem&&(this._focusedItem.focused=!1),this._focusedItem=null}_handleComponentKeyDown(e){const t=e.key;[" ","ArrowDown","ArrowUp","Enter","Escape"].includes(e.key)&&(e.stopPropagation(),e.preventDefault()),"Escape"===t&&(this._focusedItem=null),"ArrowUp"===t&&this._focusPrevItem(),"ArrowDown"===t&&this._focusNextItem(),"Enter"!==t&&" "!==t||this._focusedItem&&this._selectItem(this._focusedItem)}render(){const e=classMap({multi:this.multiline,single:!this.multiline,wrapper:!0,"has-not-focused-item":!this._focusedItem,"selection-none":!this._selectedItem,"selection-single":null!==this._selectedItem});return html`
      <div @click="${this._handleClick}" class="${e}">
        <ul>
          ${this._renderTree(this._data)}
        </ul>
      </div>
    `}};VscodeTree.styles=styles,__decorate([property({type:Array,reflect:!1})],VscodeTree.prototype,"data",null),__decorate([property({type:Number})],VscodeTree.prototype,"indent",void 0),__decorate([property({type:Boolean,reflect:!0})],VscodeTree.prototype,"arrows",void 0),__decorate([property({type:Boolean,reflect:!0})],VscodeTree.prototype,"multiline",void 0),__decorate([property({type:Number,reflect:!0})],VscodeTree.prototype,"tabindex",void 0),__decorate([property({type:Boolean,reflect:!0,attribute:"indent-guides"})],VscodeTree.prototype,"indentGuides",void 0),__decorate([state()],VscodeTree.prototype,"_selectedItem",void 0),__decorate([state()],VscodeTree.prototype,"_focusedItem",void 0),__decorate([state()],VscodeTree.prototype,"_selectedBranch",void 0),__decorate([state()],VscodeTree.prototype,"_focusedBranch",void 0),VscodeTree=__decorate([customElement("vscode-tree")],VscodeTree);export{VscodeTree};