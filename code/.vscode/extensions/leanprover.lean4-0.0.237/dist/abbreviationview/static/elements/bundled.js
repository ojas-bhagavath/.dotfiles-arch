const t=globalThis,e=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),i=new WeakMap;let o=class{constructor(e,t,o){if(this._$cssResult$=!0,o!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let t=this.o;const s=this.t;if(e&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=i.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&i.set(s,t))}return t}toString(){return this.cssText}};const r=(e,...t)=>{const i=1===e.length?e[0]:t.reduce(((t,s,o)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+e[o+1]),e[0]);return new o(i,e,s)},n=e?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const s of e.cssRules)t+=s.cssText;return(e=>new o("string"==typeof e?e:e+"",void 0,s))(t)})(e):e,{is:l,defineProperty:a,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:d,getPrototypeOf:u}=Object,v=globalThis,p=v.trustedTypes,b=p?p.emptyScript:"",f=v.reactiveElementPolyfillSupport,g=(e,t)=>e,m={toAttribute(e,t){switch(t){case Boolean:e=e?b:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let s=e;switch(t){case Boolean:s=null!==e;break;case Number:s=null===e?null:Number(e);break;case Object:case Array:try{s=JSON.parse(e)}catch(e){s=null}}return s}},x=(e,t)=>!l(e,t),y={attribute:!0,type:String,converter:m,reflect:!1,hasChanged:x};Symbol.metadata??=Symbol("metadata"),v.litPropertyMetadata??=new WeakMap;class w extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=y){if(t.state&&(t.attribute=!1),this._$Ei(),this.elementProperties.set(e,t),!t.noAccessor){const s=Symbol(),o=this.getPropertyDescriptor(e,s,t);void 0!==o&&a(this.prototype,e,o)}}static getPropertyDescriptor(e,t,s){const{get:o,set:i}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get(){return o?.call(this)},set(t){const n=o?.call(this);i.call(this,t),this.requestUpdate(e,n,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??y}static _$Ei(){if(this.hasOwnProperty(g("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(g("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(g("properties"))){const e=this.properties,t=[...h(e),...d(e)];for(const s of t)this.createProperty(s,e[s])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,s]of t)this.elementProperties.set(e,s)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const s=this._$Eu(e,t);void 0!==s&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const e of s)t.unshift(n(e))}else void 0!==e&&t.push(n(e));return t}static _$Eu(e,t){const s=t.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((e=>e(this)))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const s=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((s,o)=>{if(e)s.adoptedStyleSheets=o.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet));else for(const e of o){const o=document.createElement("style"),i=t.litNonce;void 0!==i&&o.setAttribute("nonce",i),o.textContent=e.cssText,s.appendChild(o)}})(s,this.constructor.elementStyles),s}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((e=>e.hostConnected?.()))}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach((e=>e.hostDisconnected?.()))}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$EC(e,t){const s=this.constructor.elementProperties.get(e),o=this.constructor._$Eu(e,s);if(void 0!==o&&!0===s.reflect){const i=(void 0!==s.converter?.toAttribute?s.converter:m).toAttribute(t,s.type);this._$Em=e,null==i?this.removeAttribute(o):this.setAttribute(o,i),this._$Em=null}}_$AK(e,t){const s=this.constructor,o=s._$Eh.get(e);if(void 0!==o&&this._$Em!==o){const e=s.getPropertyOptions(o),i="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:m;this._$Em=o,this[o]=i.fromAttribute(t,e.type),this._$Em=null}}requestUpdate(e,t,s){if(void 0!==e){if(s??=this.constructor.getPropertyOptions(e),!(s.hasChanged??x)(this[e],t))return;this.P(e,t,s)}!1===this.isUpdatePending&&(this._$ES=this._$ET())}P(e,t,s){this._$AL.has(e)||this._$AL.set(e,t),!0===s.reflect&&this._$Em!==e&&(this._$Ej??=new Set).add(e)}async _$ET(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,s]of e)!0!==s.wrapped||this._$AL.has(t)||void 0===this[t]||this.P(t,this[t],s)}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach((e=>e.hostUpdate?.())),this.update(t)):this._$EU()}catch(t){throw e=!1,this._$EU(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach((e=>e.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EU(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Ej&&=this._$Ej.forEach((e=>this._$EC(e,this[e]))),this._$EU()}updated(e){}firstUpdated(e){}}w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[g("elementProperties")]=new Map,w[g("finalized")]=new Map,f?.({ReactiveElement:w}),(v.reactiveElementVersions??=[]).push("2.0.4");const k=globalThis,$=k.trustedTypes,_=$?$.createPolicy("lit-html",{createHTML:e=>e}):void 0,C="$lit$",B=`lit$${Math.random().toFixed(9).slice(2)}$`,S="?"+B,z=`<${S}>`,A=document,O=()=>A.createComment(""),E=e=>null===e||"object"!=typeof e&&"function"!=typeof e,j=Array.isArray,I=e=>j(e)||"function"==typeof e?.[Symbol.iterator],M="[ \t\n\f\r]",F=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,D=/-->/g,N=/>/g,T=RegExp(`>|${M}(?:([^\\s"'>=/]+)(${M}*=${M}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),P=/'/g,V=/"/g,R=/^(?:script|style|textarea|title)$/i,L=(e,...t)=>({_$litType$:1,strings:e,values:t}),U=Symbol.for("lit-noChange"),q=Symbol.for("lit-nothing"),H=new WeakMap,K=A.createTreeWalker(A,129);function W(e,t){if(!j(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==_?_.createHTML(t):t}const G=(e,t)=>{const s=e.length-1,o=[];let i,n=2===t?"<svg>":3===t?"<math>":"",r=F;for(let t=0;t<s;t++){const s=e[t];let a,l,d=-1,c=0;for(;c<s.length&&(r.lastIndex=c,l=r.exec(s),null!==l);)c=r.lastIndex,r===F?"!--"===l[1]?r=D:void 0!==l[1]?r=N:void 0!==l[2]?(R.test(l[2])&&(i=RegExp("</"+l[2],"g")),r=T):void 0!==l[3]&&(r=T):r===T?">"===l[0]?(r=i??F,d=-1):void 0===l[1]?d=-2:(d=r.lastIndex-l[2].length,a=l[1],r=void 0===l[3]?T:'"'===l[3]?V:P):r===V||r===P?r=T:r===D||r===N?r=F:(r=T,i=void 0);const h=r===T&&e[t+1].startsWith("/>")?" ":"";n+=r===F?s+z:d>=0?(o.push(a),s.slice(0,d)+C+s.slice(d)+B+h):s+B+(-2===d?t:h)}return[W(e,n+(e[s]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),o]};class J{constructor({strings:e,_$litType$:t},s){let o;this.parts=[];let i=0,n=0;const r=e.length-1,a=this.parts,[l,d]=G(e,t);if(this.el=J.createElement(l,s),K.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(o=K.nextNode())&&a.length<r;){if(1===o.nodeType){if(o.hasAttributes())for(const e of o.getAttributeNames())if(e.endsWith(C)){const t=d[n++],s=o.getAttribute(e).split(B),r=/([.?@])?(.*)/.exec(t);a.push({type:1,index:i,name:r[2],strings:s,ctor:"."===r[1]?tt:"?"===r[1]?et:"@"===r[1]?st:Q}),o.removeAttribute(e)}else e.startsWith(B)&&(a.push({type:6,index:i}),o.removeAttribute(e));if(R.test(o.tagName)){const e=o.textContent.split(B),t=e.length-1;if(t>0){o.textContent=$?$.emptyScript:"";for(let s=0;s<t;s++)o.append(e[s],O()),K.nextNode(),a.push({type:2,index:++i});o.append(e[t],O())}}}else if(8===o.nodeType)if(o.data===S)a.push({type:2,index:i});else{let e=-1;for(;-1!==(e=o.data.indexOf(B,e+1));)a.push({type:7,index:i}),e+=B.length-1}i++}}static createElement(e,t){const s=A.createElement("template");return s.innerHTML=e,s}}function Y(e,t,s=e,o){if(t===U)return t;let i=void 0!==o?s.o?.[o]:s.l;const n=E(t)?void 0:t._$litDirective$;return i?.constructor!==n&&(i?._$AO?.(!1),void 0===n?i=void 0:(i=new n(e),i._$AT(e,s,o)),void 0!==o?(s.o??=[])[o]=i:s.l=i),void 0!==i&&(t=Y(e,i._$AS(e,t.values),i,o)),t}class X{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:s}=this._$AD,o=(e?.creationScope??A).importNode(t,!0);K.currentNode=o;let i=K.nextNode(),n=0,r=0,a=s[0];for(;void 0!==a;){if(n===a.index){let t;2===a.type?t=new Z(i,i.nextSibling,this,e):1===a.type?t=new a.ctor(i,a.name,a.strings,this,e):6===a.type&&(t=new it(i,this,e)),this._$AV.push(t),a=s[++r]}n!==a?.index&&(i=K.nextNode(),n++)}return K.currentNode=A,o}p(e){let t=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}}let Z=class e{get _$AU(){return this._$AM?._$AU??this.v}constructor(e,t,s,o){this.type=2,this._$AH=q,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=o,this.v=o?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Y(this,e,t),E(e)?e===q||null==e||""===e?(this._$AH!==q&&this._$AR(),this._$AH=q):e!==this._$AH&&e!==U&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):I(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==q&&E(this._$AH)?this._$AA.nextSibling.data=e:this.T(A.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:s}=e,o="number"==typeof s?this._$AC(e):(void 0===s.el&&(s.el=J.createElement(W(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===o)this._$AH.p(t);else{const e=new X(o,this),s=e.u(this.options);e.p(t),this.T(s),this._$AH=e}}_$AC(e){let t=H.get(e.strings);return void 0===t&&H.set(e.strings,t=new J(e)),t}k(t){j(this._$AH)||(this._$AH=[],this._$AR());const s=this._$AH;let o,i=0;for(const n of t)i===s.length?s.push(o=new e(this.O(O()),this.O(O()),this,this.options)):o=s[i],o._$AI(n),i++;i<s.length&&(this._$AR(o&&o._$AB.nextSibling,i),s.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e&&e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){void 0===this._$AM&&(this.v=e,this._$AP?.(e))}};class Q{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,o,i){this.type=1,this._$AH=q,this._$AN=void 0,this.element=e,this.name=t,this._$AM=o,this.options=i,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=q}_$AI(e,t=this,s,o){const i=this.strings;let n=!1;if(void 0===i)e=Y(this,e,t,0),n=!E(e)||e!==this._$AH&&e!==U,n&&(this._$AH=e);else{const o=e;let r,a;for(e=i[0],r=0;r<i.length-1;r++)a=Y(this,o[s+r],t,r),a===U&&(a=this._$AH[r]),n||=!E(a)||a!==this._$AH[r],a===q?e=q:e!==q&&(e+=(a??"")+i[r+1]),this._$AH[r]=a}n&&!o&&this.j(e)}j(e){e===q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class tt extends Q{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===q?void 0:e}}class et extends Q{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==q)}}class st extends Q{constructor(e,t,s,o,i){super(e,t,s,o,i),this.type=5}_$AI(e,t=this){if((e=Y(this,e,t,0)??q)===U)return;const s=this._$AH,o=e===q&&s!==q||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,i=e!==q&&(s===q||o);o&&this.element.removeEventListener(this.name,this,s),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class it{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){Y(this,e)}}const ot={M:C,P:B,A:S,C:1,L:G,R:X,D:I,V:Y,I:Z,H:Q,N:et,U:st,B:tt,F:it},rt=k.litHtmlPolyfillSupport;rt?.(J,Z),(k.litHtmlVersions??=[]).push("3.2.0");class nt extends w{constructor(){super(...arguments),this.renderOptions={host:this},this.o=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this.o=((e,t,s)=>{const o=s?.renderBefore??t;let i=o._$litPart$;if(void 0===i){const e=s?.renderBefore??null;o._$litPart$=i=new Z(t.insertBefore(O(),e),e,void 0,s??{})}return i._$AI(e),i})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this.o?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this.o?.setConnected(!1)}render(){return U}}nt._$litElement$=!0,nt.finalized=!0,globalThis.litElementHydrateSupport?.({LitElement:nt});const lt=globalThis.litElementPolyfillSupport;lt?.({LitElement:nt}),(globalThis.litElementVersions??=[]).push("4.1.0");const at=e=>(t,s)=>{void 0!==s?s.addInitializer((()=>{customElements.define(e,t)})):customElements.define(e,t)},ct={attribute:!0,type:String,converter:m,reflect:!1,hasChanged:x},ht=(e=ct,t,s)=>{const{kind:o,metadata:i}=s;let n=globalThis.litPropertyMetadata.get(i);if(void 0===n&&globalThis.litPropertyMetadata.set(i,n=new Map),n.set(s.name,e),"accessor"===o){const{name:o}=s;return{set(s){const i=t.get.call(this);t.set.call(this,s),this.requestUpdate(o,i,e)},init(t){return void 0!==t&&this.P(o,void 0,e),t}}}if("setter"===o){const{name:o}=s;return function(s){const i=this[o];t.call(this,s),this.requestUpdate(o,i,e)}}throw Error("Unsupported decorator location: "+o)};function dt(e){return(t,s)=>"object"==typeof s?ht(e,t,s):((e,t,s)=>{const o=t.hasOwnProperty(s);return t.constructor.createProperty(s,o?{...e,wrapped:!0}:e),o?Object.getOwnPropertyDescriptor(t,s):void 0})(e,t,s)}function ut(e){return dt({...e,state:!0,attribute:!1})}const vt=(e,t,s)=>(s.configurable=!0,s.enumerable=!0,s);function pt(e,t){return(t,s,o)=>vt(0,0,{get(){return(t=>t.renderRoot?.querySelector(e)??null)(this)}})}let bt;function ft(e){return(t,s)=>{const{slot:o,selector:i}=e??{},n="slot"+(o?`[name=${o}]`:":not([name])");return vt(0,0,{get(){const t=this.renderRoot?.querySelector(n),s=t?.assignedElements(e)??[];return void 0===i?s:s.filter((e=>e.matches(i)))}})}}class gt extends nt{constructor(){super(...arguments),this._version="1.7.1"}get version(){return this._version}}var mt=r`
  :host([hidden]) {
    display: none;
  }

  :host([disabled]),
  :host(:disabled) {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }
`;const xt=[mt,r`
    :host {
      background-color: var(--vscode-badge-background);
      border: 1px solid var(--vscode-contrastBorder, transparent);
      border-radius: 2px;
      box-sizing: border-box;
      color: var(--vscode-badge-foreground);
      display: inline-block;
      font-family: var(--vscode-font-family);
      font-size: 11px;
      font-weight: 400;
      line-height: 14px;
      min-width: 18px;
      padding: 2px 3px;
      text-align: center;
      white-space: nowrap;
    }

    :host([variant='counter']) {
      border-radius: 11px;
      box-sizing: border-box;
      height: 18px;
      line-height: 1;
      padding: 3px 5px;
    }

    :host([variant='activity-bar-counter']) {
      background-color: var(--vscode-activityBarBadge-background);
      border-radius: 20px;
      color: var(--vscode-activityBarBadge-foreground);
      font-size: 9px;
      font-weight: 600;
      line-height: 16px;
      padding: 0 4px;
    }
  `];var yt=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let wt=class extends gt{constructor(){super(...arguments),this.variant="default"}render(){return L` <slot></slot> `}};wt.styles=xt,yt([dt({reflect:!0})],wt.prototype,"variant",void 0),wt=yt([at("vscode-badge")],wt);const kt=1,$t=2,_t=e=>(...t)=>({_$litDirective$:e,values:t});class Ct{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,s){this.t=e,this._$AM=t,this.i=s}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}const Bt=_t(class extends Ct{constructor(e){if(super(e),1!==e.type||"class"!==e.name||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter((t=>e[t])).join(" ")+" "}update(e,[t]){if(void 0===this.st){this.st=new Set,void 0!==e.strings&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter((e=>""!==e))));for(const e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}const s=e.element.classList;for(const e of this.st)e in t||(s.remove(e),this.st.delete(e));for(const e in t){const o=!!t[e];o===this.st.has(e)||this.nt?.has(e)||(o?(s.add(e),this.st.add(e)):(s.remove(e),this.st.delete(e)))}return U}}),St="important",zt=" !"+St,At=_t(class extends Ct{constructor(e){if(super(e),1!==e.type||"style"!==e.name||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce(((t,s)=>{const o=e[s];return null==o?t:t+`${s=s.includes("-")?s:s.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${o};`}),"")}update(e,[t]){const{style:s}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(t)),this.render(t);for(const e of this.ft)null==t[e]&&(this.ft.delete(e),e.includes("-")?s.removeProperty(e):s[e]=null);for(const e in t){const o=t[e];if(null!=o){this.ft.add(e);const t="string"==typeof o&&o.endsWith(zt);e.includes("-")||t?s.setProperty(e,t?o.slice(0,-11):o,t?St:""):s[e]=o}}return U}}),Ot=e=>e??q,Et=[mt,r`
    :host {
      color: var(--vscode-icon-foreground);
      display: inline-block;
    }

    .codicon[class*='codicon-'] {
      display: block;
    }

    .icon,
    .button {
      background-color: transparent;
      display: block;
      padding: 0;
    }

    .button {
      border-color: transparent;
      border-style: solid;
      border-width: 1px;
      border-radius: 5px;
      color: currentColor;
      cursor: pointer;
      padding: 2px;
    }

    .button:hover {
      background-color: var(--vscode-toolbar-hoverBackground);
    }

    .button:active {
      background-color: var(--vscode-toolbar-activeBackground);
    }

    .button:focus {
      outline: none;
    }

    .button:focus-visible {
      border-color: var(--vscode-focusBorder);
    }

    @keyframes icon-spin {
      100% {
        transform: rotate(360deg);
      }
    }

    .spin {
      animation-name: icon-spin;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
  `];var jt,It=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let Mt=jt=class extends gt{constructor(){super(...arguments),this.label="",this.name="",this.size=16,this.spin=!1,this.spinDuration=1.5,this.actionIcon=!1,this._onButtonClick=e=>{this.dispatchEvent(new CustomEvent("vsc-click",{detail:{originalEvent:e}}))}}connectedCallback(){super.connectedCallback();const{href:e,nonce:t}=this._getStylesheetConfig();jt.stylesheetHref=e,jt.nonce=t}_getStylesheetConfig(){const e=document.getElementById("vscode-codicon-stylesheet"),t=e?.getAttribute("href")||void 0;return{nonce:e?.getAttribute("nonce")||void 0,href:t}}render(){const{stylesheetHref:e,nonce:t}=jt,s=L`<span
      class="${Bt({codicon:!0,["codicon-"+this.name]:!0,spin:this.spin})}"
      style="${At({animationDuration:String(this.spinDuration)+"s",fontSize:this.size+"px",height:this.size+"px",width:this.size+"px"})}"
    ></span>`,o=this.actionIcon?L` <button
          class="button"
          @click=${this._onButtonClick}
          aria-label=${this.label}
        >
          ${s}
        </button>`:L` <span class="icon" aria-hidden="true" role="presentation"
          >${s}</span
        >`;return L`
      <link
        rel="stylesheet"
        href="${Ot(e)}"
        nonce="${Ot(t)}"
      />
      ${o}
    `}};Mt.styles=Et,Mt.stylesheetHref="",Mt.nonce="",It([dt()],Mt.prototype,"label",void 0),It([dt({type:String})],Mt.prototype,"name",void 0),It([dt({type:Number})],Mt.prototype,"size",void 0),It([dt({type:Boolean,reflect:!0})],Mt.prototype,"spin",void 0),It([dt({type:Number,attribute:"spin-duration"})],Mt.prototype,"spinDuration",void 0),It([dt({type:Boolean,reflect:!0,attribute:"action-icon"})],Mt.prototype,"actionIcon",void 0),Mt=jt=It([at("vscode-icon")],Mt);const Ft=[mt,r`
    :host {
      background-color: var(--vscode-button-background);
      border-color: var(--vscode-button-border, var(--vscode-button-background));
      border-style: solid;
      border-radius: 2px;
      border-width: 1px;
      color: var(--vscode-button-foreground);
      cursor: pointer;
      display: inline-block;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      font-weight: var(--vscode-font-weight);
      line-height: 22px;
      overflow: hidden;
      padding: 1px 13px;
      user-select: none;
      white-space: nowrap;
    }

    :host([secondary]) {
      color: var(--vscode-button-secondaryForeground);
      background-color: var(--vscode-button-secondaryBackground);
      border-color: var(--vscode-button-border, var(--vscode-button-secondaryBackground));
    }

    :host([disabled]) {
      cursor: default;
      opacity: 0.4;
      pointer-events: none;
    }

    :host(:hover) {
      background-color: var(--vscode-button-hoverBackground);
    }

    :host([disabled]:hover) {
      background-color: var(--vscode-button-background);
    }

    :host([secondary]:hover) {
      background-color: var(--vscode-button-secondaryHoverBackground);
    }

    :host([secondary][disabled]:hover) {
      background-color: var(--vscode-button-secondaryBackground);
    }

    :host(:focus),
    :host(:active) {
      outline: none;
    }

    :host(:focus) {
      background-color: var(--vscode-button-hoverBackground);
      outline: 1px solid var(--vscode-focusBorder);
      outline-offset: 2px;
    }

    :host([disabled]:focus) {
      background-color: var(--vscode-button-background);
      outline: 0;
    }

    :host([secondary]:focus) {
      background-color: var(--vscode-button-secondaryHoverBackground);
    }

    :host([secondary][disabled]:focus) {
      background-color: var(--vscode-button-secondaryBackground);
    }

    ::slotted(*) {
      display: inline-block;
      margin-left: 4px;
      margin-right: 4px;
    }

    ::slotted(*:first-child) {
      margin-left: 0;
    }

    ::slotted(vscode-icon) {
      color: inherit;
    }

    .wrapper {
      align-items: center;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      position: relative;
      width: 100%;
    }

    slot {
      align-items: center;
      display: flex;
      height: 100%;
    }

    .icon {
      color: inherit;
      display: block;
      margin-right: 3px;
    }

    .icon-after {
      color: inherit;
      display: block;
      margin-left: 3px;
    }
  `];var Dt=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let Nt=class extends gt{get form(){return this._internals.form}constructor(){super(),this.autofocus=!1,this.tabIndex=0,this.secondary=!1,this.role="button",this.disabled=!1,this.icon="",this.iconSpin=!1,this.iconAfter="",this.iconAfterSpin=!1,this.focused=!1,this.name=void 0,this.type="button",this.value="",this._prevTabindex=0,this._handleFocus=()=>{this.focused=!0},this._handleBlur=()=>{this.focused=!1},this.addEventListener("keydown",this._handleKeyDown.bind(this)),this.addEventListener("click",this._handleClick.bind(this)),this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.autofocus&&(this.tabIndex<0&&(this.tabIndex=0),this.updateComplete.then((()=>{this.focus(),this.requestUpdate()}))),this.addEventListener("focus",this._handleFocus),this.addEventListener("blur",this._handleBlur)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("focus",this._handleFocus),this.removeEventListener("blur",this._handleBlur)}update(e){super.update(e),e.has("value")&&this._internals.setFormValue(this.value),e.has("disabled")&&(this.disabled?(this._prevTabindex=this.tabIndex,this.tabIndex=-1):this.tabIndex=this._prevTabindex)}_executeAction(){"submit"===this.type&&this._internals.form&&this._internals.form.requestSubmit(),"reset"===this.type&&this._internals.form&&this._internals.form.reset()}_handleKeyDown(e){"Enter"!==e.key&&" "!==e.key||this.hasAttribute("disabled")||(this.dispatchEvent(new CustomEvent("vsc-click",{detail:{originalEvent:new MouseEvent("click")}})),this._executeAction())}_handleClick(e){this.hasAttribute("disabled")||(this.dispatchEvent(new CustomEvent("vsc-click",{detail:{originalEvent:e}})),this._executeAction())}render(){const e=""!==this.icon,t=""!==this.iconAfter,s={wrapper:!0,"has-icon-before":e,"has-icon-after":t},o=e?L`<vscode-icon
          name="${this.icon}"
          ?spin="${this.iconSpin}"
          spin-duration="${Ot(this.iconSpinDuration)}"
          class="icon"
        ></vscode-icon>`:q,i=t?L`<vscode-icon
          name="${this.iconAfter}"
          ?spin="${this.iconAfterSpin}"
          spin-duration="${Ot(this.iconAfterSpinDuration)}"
          class="icon-after"
        ></vscode-icon>`:q;return L`
      <span class="${Bt(s)}">
        ${o}
        <slot></slot>
        ${i}
      </span>
    `}};Nt.styles=Ft,Nt.formAssociated=!0,Dt([dt({type:Boolean,reflect:!0})],Nt.prototype,"autofocus",void 0),Dt([dt({type:Number,reflect:!0})],Nt.prototype,"tabIndex",void 0),Dt([dt({type:Boolean,reflect:!0})],Nt.prototype,"secondary",void 0),Dt([dt({reflect:!0})],Nt.prototype,"role",void 0),Dt([dt({type:Boolean,reflect:!0})],Nt.prototype,"disabled",void 0),Dt([dt()],Nt.prototype,"icon",void 0),Dt([dt({type:Boolean,reflect:!0,attribute:"icon-spin"})],Nt.prototype,"iconSpin",void 0),Dt([dt({type:Number,reflect:!0,attribute:"icon-spin-duration"})],Nt.prototype,"iconSpinDuration",void 0),Dt([dt({attribute:"icon-after"})],Nt.prototype,"iconAfter",void 0),Dt([dt({type:Boolean,reflect:!0,attribute:"icon-after-spin"})],Nt.prototype,"iconAfterSpin",void 0),Dt([dt({type:Number,reflect:!0,attribute:"icon-after-spin-duration"})],Nt.prototype,"iconAfterSpinDuration",void 0),Dt([dt({type:Boolean,reflect:!0})],Nt.prototype,"focused",void 0),Dt([dt({type:String,reflect:!0})],Nt.prototype,"name",void 0),Dt([dt({reflect:!0})],Nt.prototype,"type",void 0),Dt([dt()],Nt.prototype,"value",void 0),Nt=Dt([at("vscode-button")],Nt);const Tt="__vscode-webview-elements_custom-properties__";let Pt;const Vt=()=>{Rt(Lt())},Rt=e=>{const t=document.getElementById(Tt);if(t)t.innerHTML=e;else{const t=document.createElement("style");t.setAttribute("id",Tt),t.innerHTML=e,document.querySelector("head")?.appendChild(t)}},Lt=()=>{const e=document.documentElement.style.getPropertyValue("--vscode-foreground");let t="";var s;return e?/rgba\([0-9, .]+\)/g.test(e)?t=e:(s=e.trim(),t=`rgba(${parseInt(s.substring(1,3),16)}, ${parseInt(s.substring(3,5),16)}, ${parseInt(s.substring(5,7),16)}, 0.9)`):t="rgba(0, 0, 0, 0.9)",`:root{--vsc-foreground-translucent: ${t};}`};function Ut(){Pt||(Pt=new MutationObserver(Vt),Pt.observe(document.documentElement,{attributes:!0,attributeFilter:["style"]})),Rt(Lt())}var qt=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};class Ht extends gt{constructor(){super(),this.focused=!1,this._prevTabindex=0,this._handleFocus=()=>{this.focused=!0},this._handleBlur=()=>{this.focused=!1},Ut()}connectedCallback(){super.connectedCallback(),this.addEventListener("focus",this._handleFocus),this.addEventListener("blur",this._handleBlur)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("focus",this._handleFocus),this.removeEventListener("blur",this._handleBlur)}attributeChangedCallback(e,t,s){super.attributeChangedCallback(e,t,s),"disabled"===e&&this.hasAttribute("disabled")?(this._prevTabindex=this.tabIndex,this.tabIndex=-1):"disabled"!==e||this.hasAttribute("disabled")||(this.tabIndex=this._prevTabindex)}}qt([dt({type:Boolean,reflect:!0})],Ht.prototype,"focused",void 0);var Kt=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};const Wt=e=>{class t extends e{constructor(){super(...arguments),this._label="",this._slottedText=""}set label(e){this._label=e,""===this._slottedText&&this.setAttribute("aria-label",e)}get label(){return this._label}_handleSlotChange(){this._slottedText=this.textContent?this.textContent.trim():"",""!==this._slottedText&&this.setAttribute("aria-label",this._slottedText)}_renderLabelAttribute(){return""===this._slottedText?L`<span class="label-attr">${this._label}</span>`:L`${q}`}}return Kt([dt()],t.prototype,"label",null),t};var Gt=[r`
    :host {
      color: var(--vsc-foreground-translucent);
      display: inline-block;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      font-weight: var(--vscode-font-weight);
      line-height: 18px;
    }

    :host(:focus) {
      outline: none;
    }

    :host([disabled]) {
      opacity: 0.4;
    }

    .wrapper {
      cursor: pointer;
      display: block;
      font-size: var(--vscode-font-size);
      margin-bottom: 4px;
      margin-top: 4px;
      min-height: 18px;
      position: relative;
      user-select: none;
    }

    :host([disabled]) .wrapper {
      cursor: default;
    }

    input {
      position: absolute;
      height: 1px;
      left: 9px;
      margin: 0;
      top: 17px;
      width: 1px;
      overflow: hidden;
      clip: rect(1px, 1px, 1px, 1px);
      white-space: nowrap;
    }

    .icon {
      align-items: center;
      background-color: var(--vscode-settings-checkboxBackground);
      background-size: 16px;
      border: 1px solid var(--vscode-settings-checkboxBorder);
      box-sizing: border-box;
      color: var(--vscode-settings-checkboxForeground);
      display: flex;
      height: 18px;
      justify-content: center;
      left: 0;
      margin-left: 0;
      margin-right: 9px;
      padding: 0;
      pointer-events: none;
      position: absolute;
      top: 0;
      width: 18px;
    }

    .icon.before-empty-label {
      margin-right: 0;
    }

    .label {
      cursor: pointer;
      display: block;
      min-height: 18px;
      min-width: 18px;
    }

    .label-inner {
      display: block;
      padding-left: 27px;
    }

    .label-inner.empty {
      padding-left: 0;
    }

    :host([disabled]) .label {
      cursor: default;
    }
  `],Jt=r`
  ::slotted(*) {
    margin: 0;
  }

  ::slotted(a) {
    color: var(--vscode-textLink-foreground);
    text-decoration: none;
  }

  ::slotted(code) {
    color: var(--vscode-textPreformat-foreground);
    line-height: 15px;
  }

  ::slotted(.error) {
    color: var(--vscode-errorForeground);
  }
`;const Yt=[mt,Gt,r`
    :host(:invalid) .icon,
    :host([invalid]) .icon {
      background-color: var(--vscode-inputValidation-errorBackground);
      border-color: var(--vscode-inputValidation-errorBorder, #be1100);
    }

    .icon {
      border-radius: 3px;
    }

    .indeterminate-icon {
      background-color: currentColor;
      position: absolute;
      height: 1px;
      width: 12px;
    }

    :host(:focus):host(:not([disabled])) .icon {
      outline: 1px solid var(--focus-border);
      outline-offset: -1px;
    }
  `,Jt];var Xt=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let Zt=class extends(Wt(Ht)){set checked(e){this._checked=e,this._manageRequired(),this.requestUpdate()}get checked(){return this._checked}set required(e){this._required=e,this._manageRequired(),this.requestUpdate()}get required(){return this._required}get form(){return this._internals.form}get type(){return"checkbox"}get validity(){return this._internals.validity}get validationMessage(){return this._internals.validationMessage}get willValidate(){return this._internals.willValidate}checkValidity(){return this._internals.checkValidity()}reportValidity(){return this._internals.reportValidity()}constructor(){super(),this.autofocus=!1,this._checked=!1,this.defaultChecked=!1,this.invalid=!1,this.name=void 0,this.role="checkbox",this.value="",this.disabled=!1,this.indeterminate=!1,this._required=!1,this._handleClick=e=>{e.preventDefault(),this.disabled||this._toggleState()},this._handleKeyDown=e=>{this.disabled||"Enter"!==e.key&&" "!==e.key||(e.preventDefault()," "===e.key&&this._toggleState(),"Enter"===e.key&&this._internals.form?.requestSubmit())},this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.addEventListener("keydown",this._handleKeyDown),this.updateComplete.then((()=>{this._manageRequired(),this._setActualFormValue()}))}disconnectedCallback(){this.removeEventListener("keydown",this._handleKeyDown)}update(e){super.update(e),e.has("checked")&&(this.ariaChecked=this.checked?"true":"false")}formResetCallback(){this.checked=this.defaultChecked}formStateRestoreCallback(e,t){e&&(this.checked=!0)}_setActualFormValue(){let e="";e=this.checked?this.value?this.value:"on":null,this._internals.setFormValue(e)}_toggleState(){this.checked=!this.checked,this.indeterminate=!1,this._setActualFormValue(),this._manageRequired(),this.dispatchEvent(new Event("change",{bubbles:!0})),this.dispatchEvent(new CustomEvent("vsc-change",{detail:{checked:this.checked,label:this.label,value:this.value},bubbles:!0,composed:!0}))}_manageRequired(){!this.checked&&this.required?this._internals.setValidity({valueMissing:!0},"Please check this box if you want to proceed.",this._inputEl??void 0):this._internals.setValidity({})}render(){const e=Bt({icon:!0,checked:this.checked,indeterminate:this.indeterminate}),t=Bt({"label-inner":!0}),s=L`<svg
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
    </svg>`,o=this.checked&&!this.indeterminate?s:q,i=this.indeterminate?L`<span class="indeterminate-icon"></span>`:q;return L`
      <div class="wrapper">
        <input
          ?autofocus=${this.autofocus}
          id="input"
          class="checkbox"
          type="checkbox"
          ?checked="${this.checked}"
          value="${this.value}"
        />
        <div class="${e}">${i}${o}</div>
        <label for="input" class="label" @click="${this._handleClick}">
          <span class="${t}">
            ${this._renderLabelAttribute()}
            <slot @slotchange="${this._handleSlotChange}"></slot>
          </span>
        </label>
      </div>
    `}};Zt.styles=Yt,Zt.formAssociated=!0,Zt.shadowRootOptions={...nt.shadowRootOptions,delegatesFocus:!0},Xt([dt({type:Boolean,reflect:!0})],Zt.prototype,"autofocus",void 0),Xt([dt({type:Boolean,reflect:!0})],Zt.prototype,"checked",null),Xt([dt({type:Boolean,reflect:!0,attribute:"default-checked"})],Zt.prototype,"defaultChecked",void 0),Xt([dt({type:Boolean,reflect:!0})],Zt.prototype,"invalid",void 0),Xt([dt({reflect:!0})],Zt.prototype,"name",void 0),Xt([dt({reflect:!0})],Zt.prototype,"role",void 0),Xt([dt()],Zt.prototype,"value",void 0),Xt([dt({type:Boolean,reflect:!0})],Zt.prototype,"disabled",void 0),Xt([dt({type:Boolean,reflect:!0})],Zt.prototype,"indeterminate",void 0),Xt([dt({type:Boolean,reflect:!0})],Zt.prototype,"required",null),Xt([pt("#input")],Zt.prototype,"_inputEl",void 0),Zt=Xt([at("vscode-checkbox")],Zt);const Qt=[mt,r`
    :host {
      display: block;
    }

    .wrapper {
      display: flex;
      flex-wrap: wrap;
    }

    :host([variant='vertical']) .wrapper {
      display: block;
    }

    ::slotted(vscode-checkbox) {
      margin-right: 20px;
    }

    ::slotted(vscode-checkbox:last-child) {
      margin-right: 0;
    }

    :host([variant='vertical']) ::slotted(vscode-checkbox) {
      display: block;
      margin-bottom: 15px;
    }

    :host([variant='vertical']) ::slotted(vscode-checkbox:last-child) {
      margin-bottom: 0;
    }
  `,Jt];var te=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let ee=class extends gt{constructor(){super(...arguments),this.role="group",this.variant="horizontal"}render(){return L`
      <div class="wrapper">
        <slot></slot>
      </div>
    `}};ee.styles=Qt,te([dt({reflect:!0})],ee.prototype,"role",void 0),te([dt({reflect:!0})],ee.prototype,"variant",void 0),ee=te([at("vscode-checkbox-group")],ee);const se=[mt,r`
    .collapsible {
      background-color: var(--vscode-sideBar-background);
    }

    .collapsible-header {
      align-items: center;
      background-color: var(--vscode-sideBarSectionHeader-background);
      cursor: pointer;
      display: flex;
      height: 22px;
      line-height: 22px;
      user-select: none;
    }

    .collapsible-header:focus {
      opacity: 1;
      outline-offset: -1px;
      outline-style: solid;
      outline-width: 1px;
      outline-color: var(--vscode-focusBorder);
    }

    .title {
      color: var(--vscode-sideBarTitle-foreground);
      display: block;
      font-family: var(--vscode-font-family);
      font-size: 11px;
      font-weight: 700;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .title .description {
      font-weight: 400;
      margin-left: 10px;
      text-transform: none;
      opacity: .6;
    }

    .header-icon {
      color: var(--vscode-icon-foreground);
      display: block;
      flex-shrink: 0;
      margin: 0 3px;
    }

    .collapsible.open .header-icon {
      transform: rotate(90deg);
    }

    .header-slots {
      align-items: center;
      display: flex;
      height: 22px;
      margin-left: auto;
      margin-right: 4px;
    }

    .actions {
      display: none;
    }

    .collapsible.open .actions {
      display: block;
    }

    .header-slots slot {
      display: flex;
      max-height: 22px;
      overflow: hidden;
    }

    .header-slots slot::slotted(div) {
      align-items: center;
      display: flex;
    }

    .collapsible-body {
      display: none;
      overflow: hidden;
    }

    .collapsible.open .collapsible-body {
      display: block;
    }
  `];var ie=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let oe=class extends gt{constructor(){super(...arguments),this.title="",this.description="",this.open=!1}_emitToggleEvent(){this.dispatchEvent(new CustomEvent("vsc-collapsible-toggle",{detail:{open:this.open}}))}_onHeaderClick(){this.open=!this.open,this._emitToggleEvent()}_onHeaderKeyDown(e){"Enter"===e.key&&(this.open=!this.open,this._emitToggleEvent())}render(){const e=Bt({collapsible:!0,open:this.open}),t=L`<svg
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
    </svg>`,s=this.description?L`<span class="description">${this.description}</span>`:q;return L`
      <div class="${e}">
        <div
          class="collapsible-header"
          tabindex="0"
          title="${this.title}"
          @click="${this._onHeaderClick}"
          @keydown="${this._onHeaderKeyDown}"
        >
          ${t}
          <h3 class="title">${this.title}${s}</h3>
          <div class="header-slots">
            <div class="actions"><slot name="actions"></slot></div>
            <div class="decorations"><slot name="decorations"></slot></div>
          </div>
        </div>
        <div class="collapsible-body" part="body">
          <slot></slot>
        </div>
      </div>
    `}};oe.styles=se,ie([dt({type:String})],oe.prototype,"title",void 0),ie([dt()],oe.prototype,"description",void 0),ie([dt({type:Boolean,reflect:!0})],oe.prototype,"open",void 0),oe=ie([at("vscode-collapsible")],oe);const re=[mt,r`
    :host {
      display: block;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      font-weight: var(--vscode-font-weight);
      line-height: 1.4em;
      outline: none;
      position: relative;
    }

    .context-menu-item {
      background-color: var(--vscode-menu-background);
      color: var(--vscode-menu-foreground);
      display: flex;
      user-select: none;
      white-space: nowrap;
    }

    .ruler {
      border-bottom: 1px solid var(--vscode-menu-separatorBackground);
      display: block;
      margin: 0 0 4px;
      padding-top: 4px;
      width: 100%;
    }

    .context-menu-item a {
      align-items: center;
      border-color: transparent;
      border-radius: 3px;
      border-style: solid;
      border-width: 1px;
      box-sizing: border-box;
      color: var(--vscode-menu-foreground);
      cursor: default;
      display: flex;
      flex: 1 1 auto;
      height: 2em;
      margin-left: 4px;
      margin-right: 4px;
      outline: none;
      position: relative;
      text-decoration: inherit;
    }

    :host([selected]) .context-menu-item a {
      background-color: var(--vscode-menu-selectionBackground);
      border-color: var(--vscode-menu-selectionBorder, var(--vscode-menu-selectionBackground));
      color: var(--vscode-menu-selectionForeground);
    }

    .label {
      background: none;
      display: flex;
      flex: 1 1 auto;
      font-size: 12px;
      line-height: 1;
      padding: 0 22px;
      text-decoration: none;
    }

    .keybinding {
      display: block;
      flex: 2 1 auto;
      line-height: 1;
      padding: 0 22px;
      text-align: right;
    }
  `];var ne=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let le=class extends gt{constructor(){super(...arguments),this.label="",this.keybinding="",this.value="",this.separator=!1,this.tabindex=0}onItemClick(){this.dispatchEvent(new CustomEvent("vsc-click",{detail:{label:this.label,keybinding:this.keybinding,value:this.value||this.label,separator:this.separator,tabindex:this.tabindex},bubbles:!0,composed:!0}))}render(){return L`
      ${this.separator?L`
            <div class="context-menu-item separator">
              <span class="ruler"></span>
            </div>
          `:L`
            <div class="context-menu-item">
              <a @click="${this.onItemClick}">
                ${this.label?L`<span class="label">${this.label}</span>`:q}
                ${this.keybinding?L`<span class="keybinding">${this.keybinding}</span>`:q}
              </a>
            </div>
          `}
    `}};le.styles=re,ne([dt({type:String})],le.prototype,"label",void 0),ne([dt({type:String})],le.prototype,"keybinding",void 0),ne([dt({type:String})],le.prototype,"value",void 0),ne([dt({type:Boolean,reflect:!0})],le.prototype,"separator",void 0),ne([dt({type:Number})],le.prototype,"tabindex",void 0),le=ne([at("vscode-context-menu-item")],le);const ae=[mt,r`
    :host {
      display: block;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      font-weight: var(--vscode-font-weight);
      line-height: 1.4em;
      position: relative;
    }

    .context-menu {
      background-color: var(--vscode-menu-background);
      border-color: var(--vscode-menu-border);
      border-radius: 5px;
      border-style: solid;
      border-width: 1px;
      box-shadow: 0 2px 8px var(--vscode-widget-shadow);
      color: var(--vscode-menu-foreground);
      padding: 4px 0;
      white-space: nowrap;
    }

    .context-menu:focus {
      outline: 0;
    }
  `];var ce=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let he=class extends gt{set data(e){this._data=e;const t=[];e.forEach(((e,s)=>{e.separator||t.push(s)})),this._clickableItemIndexes=t}get data(){return this._data}set show(e){this._show=e,this._selectedClickableItemIndex=-1,e&&this.updateComplete.then((()=>{this._wrapperEl&&this._wrapperEl.focus(),requestAnimationFrame((()=>{document.addEventListener("click",this._onClickOutsideBound,{once:!0})}))}))}get show(){return this._show}constructor(){super(),this.tabIndex=0,this._selectedClickableItemIndex=-1,this._show=!1,this._data=[],this._clickableItemIndexes=[],this._onClickOutsideBound=this._onClickOutside.bind(this),this.addEventListener("keydown",this._onKeyDown)}_onClickOutside(e){e.composedPath().includes(this)||(this._show=!1)}_onKeyDown(e){const{key:t}=e;switch("ArrowUp"!==t&&"ArrowDown"!==t&&"Escape"!==t&&"Enter"!==t||e.preventDefault(),t){case"ArrowUp":this._handleArrowUp();break;case"ArrowDown":this._handleArrowDown();break;case"Escape":this._handleEscape();break;case"Enter":this._handleEnter()}}_handleArrowUp(){0===this._selectedClickableItemIndex?this._selectedClickableItemIndex=this._clickableItemIndexes.length-1:this._selectedClickableItemIndex-=1}_handleArrowDown(){this._selectedClickableItemIndex+1<this._clickableItemIndexes.length?this._selectedClickableItemIndex+=1:this._selectedClickableItemIndex=0}_handleEscape(){this._show=!1,document.removeEventListener("click",this._onClickOutsideBound)}_dispatchSelectEvent(e){const{keybinding:t,label:s,value:o,separator:i,tabindex:n}=e;this.dispatchEvent(new CustomEvent("vsc-context-menu-select",{detail:{keybinding:t,label:s,separator:i,tabindex:n,value:o}}))}_dispatchLegacySelectEvent(e){const{keybinding:t,label:s,value:o,separator:i,tabindex:n}=e,r={keybinding:t,label:s,value:o,separator:i,tabindex:n};this.dispatchEvent(new CustomEvent("vsc-select",{detail:r,bubbles:!0,composed:!0}))}_handleEnter(){if(-1===this._selectedClickableItemIndex)return;const e=this._clickableItemIndexes[this._selectedClickableItemIndex],t=this._wrapperEl.querySelectorAll("vscode-context-menu-item")[e];this._dispatchLegacySelectEvent(t),this._dispatchSelectEvent(t),this._show=!1,document.removeEventListener("click",this._onClickOutsideBound)}_onItemClick(e){const t=e.currentTarget;this._dispatchLegacySelectEvent(t),this._dispatchSelectEvent(t),this._show=!1}_onItemMouseOver(e){const t=e.target,s=t.dataset.index?+t.dataset.index:-1,o=this._clickableItemIndexes.findIndex((e=>e===s));-1!==o&&(this._selectedClickableItemIndex=o)}_onItemMouseOut(){this._selectedClickableItemIndex=-1}render(){if(!this._show)return L`${q}`;const e=this._clickableItemIndexes[this._selectedClickableItemIndex];return L`
      <div class="context-menu" tabindex="0">
        ${this.data?this.data.map((({label:t="",keybinding:s="",value:o="",separator:i=!1,tabindex:n=0},r)=>L`
                <vscode-context-menu-item
                  label="${t}"
                  keybinding="${s}"
                  value="${o}"
                  ?separator="${i}"
                  ?selected="${r===e}"
                  tabindex="${n}"
                  @vsc-click="${this._onItemClick}"
                  @mouseover=${this._onItemMouseOver}
                  @mouseout=${this._onItemMouseOut}
                  data-index=${r}
                ></vscode-context-menu-item>
              `)):L`<slot></slot>`}
      </div>
    `}};he.styles=ae,ce([dt({type:Array,attribute:!1})],he.prototype,"data",null),ce([dt({type:Boolean,reflect:!0})],he.prototype,"show",null),ce([dt({type:Number,reflect:!0})],he.prototype,"tabIndex",void 0),ce([ut()],he.prototype,"_selectedClickableItemIndex",void 0),ce([ut()],he.prototype,"_show",void 0),ce([pt(".context-menu")],he.prototype,"_wrapperEl",void 0),he=ce([at("vscode-context-menu")],he);const de=[mt,r`
    :host {
      background-color: var(--vscode-widget-border);
      display: block;
      height: 1px;
      margin-bottom: 10px;
      margin-top: 10px;
    }
  `];var ue=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let ve=class extends gt{constructor(){super(...arguments),this.role="separator"}render(){return L``}};ve.styles=de,ue([dt({reflect:!0})],ve.prototype,"role",void 0),ve=ue([at("vscode-divider")],ve);const pe=[mt,r`
    :host {
      display: block;
      max-width: 727px;
    }
  `];var be,fe=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};!function(e){e.HORIZONTAL="horizontal",e.VERTICAL="vertical"}(be||(be={}));const ge=e=>"vscode-checkbox"===e.tagName.toLocaleLowerCase(),me=e=>"vscode-radio"===e.tagName.toLocaleLowerCase();let xe=class extends gt{constructor(){super(...arguments),this.breakpoint=490,this._responsive=!1,this._firstUpdateComplete=!1,this._resizeObserverCallbackBound=this._resizeObserverCallback.bind(this)}set responsive(e){this._responsive=e,this._firstUpdateComplete&&(e?this._activateResponsiveLayout():this._deactivateResizeObserver())}get responsive(){return this._responsive}get data(){return this._collectFormData()}_collectFormData(){const e=["vscode-textfield","vscode-textarea","vscode-single-select","vscode-multi-select","vscode-checkbox","vscode-radio"].join(","),t=this.querySelectorAll(e),s={};return t.forEach((e=>{if(!e.hasAttribute("name"))return;const t=e.getAttribute("name");t&&(ge(e)&&e.checked?s[t]=Array.isArray(s[t])?[...s[t],e.value]:[e.value]:"vscode-multi-select"===e.tagName.toLocaleLowerCase()?s[t]=e.value:ge(e)&&!e.checked?s[t]=Array.isArray(s[t])?s[t]:[]:me(e)&&e.checked||(e=>["vscode-textfield","vscode-textarea"].includes(e.tagName.toLocaleLowerCase()))(e)||(e=>"vscode-single-select"===e.tagName.toLocaleLowerCase())(e)?s[t]=e.value:me(e)&&!e.checked&&(s[t]=s[t]?s[t]:""))})),s}_toggleCompactLayout(e){this._assignedFormGroups.forEach((t=>{t.dataset.originalVariant||(t.dataset.originalVariant=t.variant);const s=t.dataset.originalVariant;e===be.VERTICAL&&"horizontal"===s?t.variant="vertical":t.variant=s,t.querySelectorAll("vscode-checkbox-group, vscode-radio-group").forEach((t=>{t.dataset.originalVariant||(t.dataset.originalVariant=t.variant);const s=t.dataset.originalVariant;e===be.HORIZONTAL&&s===be.HORIZONTAL?t.variant="horizontal":t.variant="vertical"}))}))}_resizeObserverCallback(e){let t=0;for(const s of e)t=s.contentRect.width;const s=t<this.breakpoint?be.VERTICAL:be.HORIZONTAL;s!==this._currentFormGroupLayout&&(this._toggleCompactLayout(s),this._currentFormGroupLayout=s)}_activateResponsiveLayout(){this._resizeObserver=new ResizeObserver(this._resizeObserverCallbackBound),this._resizeObserver.observe(this._wrapperElement)}_deactivateResizeObserver(){this._resizeObserver?.disconnect(),this._resizeObserver=null}firstUpdated(){this._firstUpdateComplete=!0,this._responsive&&this._activateResponsiveLayout()}render(){return L`
      <div class="wrapper">
        <slot></slot>
      </div>
    `}};xe.styles=pe,fe([dt({type:Boolean,reflect:!0})],xe.prototype,"responsive",null),fe([dt({type:Number})],xe.prototype,"breakpoint",void 0),fe([dt({type:Object})],xe.prototype,"data",null),fe([pt(".wrapper")],xe.prototype,"_wrapperElement",void 0),fe([ft({selector:"vscode-form-group"})],xe.prototype,"_assignedFormGroups",void 0),xe=fe([at("vscode-form-container")],xe);const ye=[mt,r`
    :host {
      --label-right-margin: 14px;
      --label-width: 150px;

      display: block;
      margin: 15px 0;
    }

    :host([variant='settings-group']) {
      margin: 0;
      padding: 12px 14px 18px;
      max-width: 727px;
    }

    .wrapper {
      display: flex;
      flex-wrap: wrap;
    }

    :host([variant='vertical']) .wrapper,
    :host([variant='settings-group']) .wrapper {
      display: block;
    }

    :host([variant='horizontal']) ::slotted(vscode-checkbox-group),
    :host([variant='horizontal']) ::slotted(vscode-radio-group) {
      width: calc(100% - calc(var(--label-width) + var(--label-right-margin)));
    }

    :host([variant='horizontal']) ::slotted(vscode-label) {
      margin-right: var(--label-right-margin);
      text-align: right;
      width: var(--label-width);
    }

    :host([variant='settings-group']) ::slotted(vscode-label) {
      height: 18px;
      line-height: 18px;
      margin-bottom: 4px;
      margin-right: 0;
      padding: 0;
    }

    ::slotted(vscode-form-helper) {
      margin-left: calc(var(--label-width) + var(--label-right-margin));
    }

    :host([variant='vertical']) ::slotted(vscode-form-helper),
    :host([variant='settings-group']) ::slotted(vscode-form-helper) {
      display: block;
      margin-left: 0;
    }

    :host([variant='settings-group']) ::slotted(vscode-form-helper) {
      margin-bottom: 0;
      margin-top: 0;
    }

    :host([variant='vertical']) ::slotted(vscode-label),
    :host([variant='settings-group']) ::slotted(vscode-label) {
      display: block;
      margin-left: 0;
      text-align: left;
    }

    :host([variant='settings-group']) ::slotted(vscode-inputbox),
    :host([variant='settings-group']) ::slotted(vscode-textfield),
    :host([variant='settings-group']) ::slotted(vscode-textarea),
    :host([variant='settings-group']) ::slotted(vscode-single-select),
    :host([variant='settings-group']) ::slotted(vscode-multi-select) {
      margin-top: 9px;
    }

    ::slotted(vscode-button:first-child) {
      margin-left: calc(var(--label-width) + var(--label-right-margin));
    }

    :host([variant='vertical']) ::slotted(vscode-button) {
      margin-left: 0;
    }

    ::slotted(vscode-button) {
      margin-right: 4px;
    }
  `];var we=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let ke=class extends gt{constructor(){super(...arguments),this.variant="horizontal"}render(){return L`
      <div class="wrapper">
        <slot></slot>
      </div>
    `}};ke.styles=ye,we([dt({reflect:!0})],ke.prototype,"variant",void 0),ke=we([at("vscode-form-group")],ke);const $e=[mt,r`
    :host {
      color: var(--vsc-foreground-translucent);
      display: block;
      margin-bottom: 4px;
      margin-top: 4px;
      max-width: 720px;
    }

    :host([vertical]) {
      margin-left: 0;
    }
  `,Jt];var _e=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let Ce=class extends gt{constructor(){super(),Ut()}render(){return L`<slot></slot>`}};Ce.styles=$e,Ce=_e([at("vscode-form-helper")],Ce);let Be=0;const Se=(e="")=>(Be++,`${e}${Be}`),ze=[mt,r`
    :host {
      display: block;
    }

    .wrapper {
      display: flex;
      flex-wrap: wrap;
    }

    :host([variant='vertical']) .wrapper {
      display: block;
    }

    ::slotted(vscode-radio) {
      margin-right: 20px;
    }

    ::slotted(vscode-radio:last-child) {
      margin-right: 0;
    }

    :host([variant='vertical']) ::slotted(vscode-radio) {
      display: block;
      margin-bottom: 15px;
    }

    :host([variant='vertical']) ::slotted(vscode-radio:last-child) {
      margin-bottom: 0;
    }
  `];var Ae=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let Oe=class extends gt{constructor(){super(...arguments),this.variant="horizontal",this.role="radiogroup",this._focusedRadio=-1,this._checkedRadio=-1,this._firstContentLoaded=!1,this._onKeyDownBound=this._onKeyDown.bind(this)}connectedCallback(){super.connectedCallback(),this.addEventListener("keydown",this._onKeyDownBound)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("keydown",this._onKeyDownBound)}_uncheckPreviousChecked(e,t){-1!==e&&(this._radios[e].checked=!1),-1!==t&&(this._radios[t].tabIndex=-1)}_afterCheck(){this._focusedRadio=this._checkedRadio,this._radios[this._checkedRadio].checked=!0,this._radios[this._checkedRadio].tabIndex=0,this._radios[this._checkedRadio].focus()}_checkPrev(){const e=this._radios.findIndex((e=>e.checked)),t=this._radios.findIndex((e=>e.focused)),s=-1!==t?t:e;this._uncheckPreviousChecked(e,t),this._checkedRadio=-1===s?this._radios.length-1:s-1>=0?s-1:this._radios.length-1,this._afterCheck()}_checkNext(){const e=this._radios.findIndex((e=>e.checked)),t=this._radios.findIndex((e=>e.focused)),s=-1!==t?t:e;this._uncheckPreviousChecked(e,t),-1===s?this._checkedRadio=0:s+1<this._radios.length?this._checkedRadio=s+1:this._checkedRadio=0,this._afterCheck()}_onKeyDown(e){const{key:t}=e;["ArrowLeft","ArrowUp","ArrowRight","ArrowDown"].includes(t)&&e.preventDefault(),"ArrowRight"!==t&&"ArrowDown"!==t||this._checkNext(),"ArrowLeft"!==t&&"ArrowUp"!==t||this._checkPrev()}_onChange(e){const t=this._radios.findIndex((t=>t===e.target));-1!==t&&(-1!==this._focusedRadio&&(this._radios[this._focusedRadio].tabIndex=-1),-1!==this._checkedRadio&&this._checkedRadio!==t&&(this._radios[this._checkedRadio].checked=!1),this._focusedRadio=t,this._checkedRadio=t,this._radios[t].tabIndex=0)}_onSlotChange(){if(!this._firstContentLoaded){const e=this._radios.findIndex((e=>e.autofocus));e>-1&&(this._focusedRadio=e),this._firstContentLoaded=!0}this._radios.forEach(((e,t)=>{this._focusedRadio>-1?e.tabIndex=t===this._focusedRadio?0:-1:e.tabIndex=0===t?0:-1}))}render(){return L`
      <div class="wrapper">
        <slot
          @slotchange=${this._onSlotChange}
          @vsc-change=${this._onChange}
        ></slot>
      </div>
    `}};Oe.styles=ze,Ae([dt({reflect:!0})],Oe.prototype,"variant",void 0),Ae([dt({reflect:!0})],Oe.prototype,"role",void 0),Ae([ft({selector:"vscode-radio"})],Oe.prototype,"_radios",void 0),Ae([ut()],Oe.prototype,"_focusedRadio",void 0),Ae([ut()],Oe.prototype,"_checkedRadio",void 0),Oe=Ae([at("vscode-radio-group")],Oe);const Ee=[mt,r`
    :host {
      display: inline-block;
      height: 40px;
      position: relative;
      width: 320px;
    }

    :host([cols]) {
      width: auto;
    }

    :host([rows]) {
      height: auto;
    }

    .shadow {
      box-shadow: var(--vscode-scrollbar-shadow) 0 6px 6px -6px inset;
      display: none;
      inset: 0 0 auto 0;
      height: 6px;
      pointer-events: none;
      position: absolute;
      width: 100%;
    }

    .shadow.visible {
      display: block;
    }

    textarea {
      background-color: var(--vscode-settings-textInputBackground);
      border-color: var(--vscode-settings-textInputBorder, var(--vscode-settings-textInputBackground));
      border-radius: 2px;
      border-style: solid;
      border-width: 1px;
      box-sizing: border-box;
      color: var(--vscode-settings-textInputForeground);
      display: block;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      font-weight: var(--vscode-font-weight);
      height: 100%;
      width: 100%;
    }

    :host([cols]) textarea {
      width: auto;
    }

    :host([rows]) textarea {
      height: auto;
    }

    :host([invalid]) textarea,
    :host(:invalid) textarea {
      background-color: var(--vscode-inputValidation-errorBackground);
      border-color: var(--vscode-inputValidation-errorBorder, #be1100);
    }

    textarea.monospace {
      background-color: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      font-family: var(--vscode-editor-font-family);
      font-size: var(--vscode-editor-font-size);
      font-weight: var(--vscode-editor-font-weight);
    }

    .textarea.monospace::placeholder {
      color: var(--vscode-editor-inlineValuesForeground);
    }

    textarea.cursor-pointer {
      cursor: pointer;
    }

    textarea:focus {
      border-color: var(--vscode-focusBorder);
      outline: none;
    }

    textarea::placeholder {
      color: var(--vscode-input-placeholderForeground);
      opacity: 1;
    }

    textarea::-webkit-scrollbar-track {
      background-color: transparent;
    }

    textarea::-webkit-scrollbar {
      width: 14px;
    }

    textarea::-webkit-scrollbar-thumb {
      background-color: transparent;
    }

    textarea:hover::-webkit-scrollbar-thumb {
      background-color: var(--vscode-scrollbarSlider-background);
    }

    textarea::-webkit-scrollbar-thumb:hover {
      background-color: var(--vscode-scrollbarSlider-hoverBackground);
    }

    textarea::-webkit-scrollbar-thumb:active {
      background-color: var(--vscode-scrollbarSlider-activeBackground);
    }

    textarea::-webkit-scrollbar-corner {
      background-color: transparent;
    }

    textarea::-webkit-resizer {
      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAYAAADEUlfTAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAACJJREFUeJxjYMAOZuIQZ5j5//9/rJJESczEKYGsG6cEXgAAsEEefMxkua4AAAAASUVORK5CYII=');
      background-repeat: no-repeat;
      background-position: right bottom;
    }
  `];var je=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let Ie=class extends gt{set value(e){this._value=e,this._internals.setFormValue(e)}get value(){return this._value}get wrappedElement(){return this._textareaEl}get form(){return this._internals.form}get type(){return"textarea"}get validity(){return this._internals.validity}get validationMessage(){return this._internals.validationMessage}get willValidate(){return this._internals.willValidate}set minlength(e){this.minLength=e}get minlength(){return this.minLength}set maxlength(e){this.maxLength=e}get maxlength(){return this.maxLength}constructor(){super(),this.autocomplete=void 0,this.autofocus=!1,this.defaultValue="",this.disabled=!1,this.invalid=!1,this.label="",this.maxLength=void 0,this.minLength=void 0,this.rows=void 0,this.cols=void 0,this.name=void 0,this.placeholder=void 0,this.readonly=!1,this.resize="none",this.required=!1,this.spellcheck=!1,this.monospace=!1,this._value="",this._textareaPointerCursor=!1,this._shadow=!1,this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.updateComplete.then((()=>{this._textareaEl.checkValidity(),this._setValidityFromInput(),this._internals.setFormValue(this._textareaEl.value)}))}updated(e){const t=["maxLength","minLength","required"];for(const s of e.keys())if(t.includes(String(s))){this.updateComplete.then((()=>{this._setValidityFromInput()}));break}}formResetCallback(){this.value=this.defaultValue}formStateRestoreCallback(e,t){this.updateComplete.then((()=>{this._value=e}))}checkValidity(){return this._internals.checkValidity()}reportValidity(){return this._internals.reportValidity()}_setValidityFromInput(){this._internals.setValidity(this._textareaEl.validity,this._textareaEl.validationMessage,this._textareaEl)}_dataChanged(){this._value=this._textareaEl.value,this._internals.setFormValue(this._textareaEl.value)}_handleChange(e){this._dataChanged(),this._setValidityFromInput(),this.dispatchEvent(new Event("change")),this.dispatchEvent(new CustomEvent("vsc-change",{detail:{data:this.value,originalEvent:e}}))}_handleInput(e){this._dataChanged(),this._setValidityFromInput(),this.dispatchEvent(new CustomEvent("vsc-input",{detail:{data:e.data,originalEvent:e}}))}_handleMouseMove(e){if(this._textareaEl.clientHeight>=this._textareaEl.scrollHeight)return void(this._textareaPointerCursor=!1);const t=this._textareaEl.getBoundingClientRect(),s=e.clientX;this._textareaPointerCursor=s>=t.left+t.width-14-2}_handleScroll(){this._shadow=this._textareaEl.scrollTop>0}render(){return L`
      <div
        class=${Bt({shadow:!0,visible:this._shadow})}
      ></div>
      <textarea
        autocomplete=${Ot(this.autocomplete)}
        ?autofocus=${this.autofocus}
        ?disabled=${this.disabled}
        aria-label=${this.label}
        id="textarea"
        class=${Bt({monospace:this.monospace,"cursor-pointer":this._textareaPointerCursor})}
        maxlength=${Ot(this.maxLength)}
        minlength=${Ot(this.minLength)}
        rows=${Ot(this.rows)}
        cols=${Ot(this.cols)}
        name=${Ot(this.name)}
        placeholder=${Ot(this.placeholder)}
        ?readonly=${this.readonly}
        style=${At({resize:this.resize})}
        ?required=${this.required}
        spellcheck=${this.spellcheck}
        @change=${this._handleChange}
        @input=${this._handleInput}
        @mousemove=${this._handleMouseMove}
        @scroll=${this._handleScroll}
        .value=${this._value}
      ></textarea>
    `}};Ie.styles=Ee,Ie.formAssociated=!0,Ie.shadowRootOptions={...nt.shadowRootOptions,delegatesFocus:!0},je([dt()],Ie.prototype,"autocomplete",void 0),je([dt({type:Boolean,reflect:!0})],Ie.prototype,"autofocus",void 0),je([dt({attribute:"default-value"})],Ie.prototype,"defaultValue",void 0),je([dt({type:Boolean,reflect:!0})],Ie.prototype,"disabled",void 0),je([dt({type:Boolean,reflect:!0})],Ie.prototype,"invalid",void 0),je([dt({attribute:!1})],Ie.prototype,"label",void 0),je([dt({type:Number})],Ie.prototype,"maxLength",void 0),je([dt({type:Number})],Ie.prototype,"minLength",void 0),je([dt({type:Number})],Ie.prototype,"rows",void 0),je([dt({type:Number})],Ie.prototype,"cols",void 0),je([dt()],Ie.prototype,"name",void 0),je([dt()],Ie.prototype,"placeholder",void 0),je([dt({type:Boolean,reflect:!0})],Ie.prototype,"readonly",void 0),je([dt()],Ie.prototype,"resize",void 0),je([dt({type:Boolean,reflect:!0})],Ie.prototype,"required",void 0),je([dt({type:Boolean})],Ie.prototype,"spellcheck",void 0),je([dt({type:Boolean,reflect:!0})],Ie.prototype,"monospace",void 0),je([dt()],Ie.prototype,"value",null),je([pt("#textarea")],Ie.prototype,"_textareaEl",void 0),je([ut()],Ie.prototype,"_value",void 0),je([ut()],Ie.prototype,"_textareaPointerCursor",void 0),je([ut()],Ie.prototype,"_shadow",void 0),Ie=je([at("vscode-textarea")],Ie);const Me=[mt,r`
    :host {
      align-items: center;
      background-color: var(--vscode-settings-textInputBackground);
      border-color: var(--vscode-settings-textInputBorder, var(--vscode-settings-textInputBackground));
      border-radius: 2px;
      border-style: solid;
      border-width: 1px;
      box-sizing: border-box;
      color: var(--vscode-settings-textInputForeground);
      display: inline-flex;
      max-width: 100%;
      position: relative;
      width: 320px;
    }

    :host([focused]) {
      border-color: var(--vscode-focusBorder);
    }

    :host([invalid]),
    :host(:invalid) {
      border-color: var(--vscode-inputValidation-errorBorder, #be1100);
    }

    :host([invalid]) input,
    :host(:invalid) input {
      background-color: var(--vscode-inputValidation-errorBackground);
    }

    ::slotted([slot='content-before']) {
      display: block;
      margin-left: 2px;
    }

    ::slotted([slot='content-after']) {
      display: block;
      margin-right: 2px;
    }

    slot[name='content-before'],
    slot[name='content-after'] {
      align-items: center;
      display: flex;
    }

    input {
      background-color: var(--vscode-settings-textInputBackground);
      border: 0;
      box-sizing: border-box;
      color: var(--vscode-settings-textInputForeground);
      display: block;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      font-weight: var(--vscode-font-weight);
      line-height: 18px;
      outline: none;
      padding-bottom: 3px;
      padding-left: 4px;
      padding-right: 4px;
      padding-top: 3px;
      width: 100%;
    }

    input:read-only:not([type="file"]) {
      cursor: not-allowed;
    }

    input::placeholder {
      color: var(--vscode-input-placeholderForeground);
      opacity: 1;
    }

    input[type='file'] {
      line-height: 24px;
      padding-bottom: 0;
      padding-left: 2px;
      padding-top: 0;
    }

    input[type='file']::file-selector-button {
      background-color: var(--vscode-button-background);
      border: 0;
      border-radius: 2px;
      color: var(--vscode-button-foreground);
      cursor: pointer;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      font-weight: var(--vscode-font-weight);
      line-height: 20px;
      padding: 0 14px;
    }

    input[type='file']::file-selector-button:hover {
      background-color: var(--vscode-button-hoverBackground);
    }
  `];var Fe=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let De=class extends gt{set type(e){this._type=["color","date","datetime-local","email","file","month","number","password","search","tel","text","time","url","week"].includes(e)?e:"text"}get type(){return this._type}set value(e){"file"!==this.type&&(this._value=e,this._internals.setFormValue(e)),this.updateComplete.then((()=>{this._setValidityFromInput()}))}get value(){return this._value}set minlength(e){this.minLength=e}get minlength(){return this.minLength}set maxlength(e){this.maxLength=e}get maxlength(){return this.maxLength}get form(){return this._internals.form}get validity(){return this._internals.validity}get validationMessage(){return this._internals.validationMessage}get willValidate(){return this._internals.willValidate}checkValidity(){return this._setValidityFromInput(),this._internals.checkValidity()}reportValidity(){return this._setValidityFromInput(),this._internals.reportValidity()}get wrappedElement(){return this._inputEl}constructor(){super(),this.autocomplete=void 0,this.autofocus=!1,this.defaultValue="",this.disabled=!1,this.focused=!1,this.invalid=!1,this.label="",this.max=void 0,this.maxLength=void 0,this.min=void 0,this.minLength=void 0,this.multiple=!1,this.name=void 0,this.pattern=void 0,this.placeholder=void 0,this.readonly=!1,this.required=!1,this.step=void 0,this._value="",this._type="text",this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.updateComplete.then((()=>{this._inputEl.checkValidity(),this._setValidityFromInput(),this._internals.setFormValue(this._inputEl.value)}))}attributeChangedCallback(e,t,s){super.attributeChangedCallback(e,t,s),["max","maxlength","min","minlength","pattern","required","step"].includes(e)&&this.updateComplete.then((()=>{this._setValidityFromInput()}))}formResetCallback(){this.value=this.defaultValue,this.requestUpdate()}formStateRestoreCallback(e,t){this.value=e}_dataChanged(){if(this._value=this._inputEl.value,"file"===this.type&&this._inputEl.files)for(const e of this._inputEl.files)this._internals.setFormValue(e);else this._internals.setFormValue(this._inputEl.value)}_setValidityFromInput(){this._inputEl&&this._internals.setValidity(this._inputEl.validity,this._inputEl.validationMessage,this._inputEl)}_onInput(e){this._dataChanged(),this._setValidityFromInput(),this.dispatchEvent(new CustomEvent("vsc-input",{detail:{data:e.data,originalEvent:e}}))}_onChange(e){this._dataChanged(),this._setValidityFromInput(),this.dispatchEvent(new Event("change")),this.dispatchEvent(new CustomEvent("vsc-change",{detail:{data:this.value,originalEvent:e}}))}_onFocus(){this.focused=!0}_onBlur(){this.focused=!1}_onKeyDown(e){"Enter"===e.key&&this._internals.form&&this._internals.form?.requestSubmit()}render(){return L`
      <slot name="content-before"></slot>
      <input
        id="input"
        type=${this.type}
        ?autofocus=${this.autofocus}
        autocomplete=${Ot(this.autocomplete)}
        aria-label=${this.label}
        ?disabled=${this.disabled}
        max=${Ot(this.max)}
        maxlength=${Ot(this.maxLength)}
        min=${Ot(this.min)}
        minlength=${Ot(this.minLength)}
        ?multiple=${this.multiple}
        name=${Ot(this.name)}
        pattern=${Ot(this.pattern)}
        placeholder=${Ot(this.placeholder)}
        ?readonly=${this.readonly}
        ?required=${this.required}
        step=${Ot(this.step)}
        .value=${Ot("file"!==this.type?this._value:void 0)}
        @blur=${this._onBlur}
        @change=${this._onChange}
        @focus=${this._onFocus}
        @input=${this._onInput}
        @keydown=${this._onKeyDown}
      />
      <slot name="content-after"></slot>
    `}};De.styles=Me,De.formAssociated=!0,De.shadowRootOptions={...nt.shadowRootOptions,delegatesFocus:!0},Fe([dt()],De.prototype,"autocomplete",void 0),Fe([dt({type:Boolean,reflect:!0})],De.prototype,"autofocus",void 0),Fe([dt({attribute:"default-value"})],De.prototype,"defaultValue",void 0),Fe([dt({type:Boolean,reflect:!0})],De.prototype,"disabled",void 0),Fe([dt({type:Boolean,reflect:!0})],De.prototype,"focused",void 0),Fe([dt({type:Boolean,reflect:!0})],De.prototype,"invalid",void 0),Fe([dt({attribute:!1})],De.prototype,"label",void 0),Fe([dt({type:Number})],De.prototype,"max",void 0),Fe([dt({type:Number})],De.prototype,"maxLength",void 0),Fe([dt({type:Number})],De.prototype,"min",void 0),Fe([dt({type:Number})],De.prototype,"minLength",void 0),Fe([dt({type:Boolean,reflect:!0})],De.prototype,"multiple",void 0),Fe([dt({reflect:!0})],De.prototype,"name",void 0),Fe([dt()],De.prototype,"pattern",void 0),Fe([dt()],De.prototype,"placeholder",void 0),Fe([dt({type:Boolean,reflect:!0})],De.prototype,"readonly",void 0),Fe([dt({type:Boolean,reflect:!0})],De.prototype,"required",void 0),Fe([dt({type:Number})],De.prototype,"step",void 0),Fe([dt({reflect:!0})],De.prototype,"type",null),Fe([dt()],De.prototype,"value",null),Fe([pt("#input")],De.prototype,"_inputEl",void 0),Fe([ut()],De.prototype,"_value",void 0),Fe([ut()],De.prototype,"_type",void 0),De=Fe([at("vscode-textfield")],De);const Ne=[mt,r`
    :host {
      color: var(--vscode-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      font-weight: 600;
      line-height: ${1.2307692307692308};
      cursor: default;
      display: block;
      padding: 5px 0;
    }

    .wrapper {
      display: block;
    }

    .wrapper.required:after {
      content: ' *';
    }

    ::slotted(.normal) {
      font-weight: normal;
    }

    ::slotted(.lightened) {
      color: var(--vscode-foreground);
      opacity: 0.9;
    }
  `];var Te=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let Pe=class extends gt{constructor(){super(...arguments),this.required=!1,this._id="",this._htmlFor="",this._connected=!1}set htmlFor(e){this._htmlFor=e,this.setAttribute("for",e),this._connected&&this._connectWithTarget()}get htmlFor(){return this._htmlFor}set id(e){this._id=e}get id(){return this._id}attributeChangedCallback(e,t,s){super.attributeChangedCallback(e,t,s)}connectedCallback(){super.connectedCallback(),this._connected=!0,""===this._id&&(this._id=Se("vscode-label-"),this.setAttribute("id",this._id)),this._connectWithTarget()}_getTarget(){let e=null;if(this._htmlFor){const t=this.getRootNode({composed:!1});t&&(e=t.querySelector(`#${this._htmlFor}`))}return e}async _connectWithTarget(){await this.updateComplete;const e=this._getTarget();(e instanceof Oe||e instanceof ee)&&e.setAttribute("aria-labelledby",this._id);let t="";this.textContent&&(t=this.textContent.trim()),(e instanceof De||e instanceof Ie)&&(e.label=t)}_handleClick(){const e=this._getTarget();e&&"focus"in e&&e.focus()}render(){return L`
      <label
        class="${Bt({wrapper:!0,required:this.required})}"
        @click=${this._handleClick}
        ><slot></slot
      ></label>
    `}};Pe.styles=Ne,Te([dt({reflect:!0,attribute:"for"})],Pe.prototype,"htmlFor",null),Te([dt()],Pe.prototype,"id",null),Te([dt({type:Boolean,reflect:!0})],Pe.prototype,"required",void 0),Pe=Te([at("vscode-label")],Pe);const{I:Ve}=ot,Re=()=>document.createComment(""),Le=(e,t,s)=>{const o=e._$AA.parentNode,i=void 0===t?e._$AB:t._$AA;if(void 0===s){const t=o.insertBefore(Re(),i),n=o.insertBefore(Re(),i);s=new Ve(t,n,e,e.options)}else{const t=s._$AB.nextSibling,n=s._$AM,r=n!==e;if(r){let t;s._$AQ?.(e),s._$AM=e,void 0!==s._$AP&&(t=e._$AU)!==n._$AU&&s._$AP(t)}if(t!==i||r){let e=s._$AA;for(;e!==t;){const t=e.nextSibling;o.insertBefore(e,i),e=t}}}return s},Ue=(e,t,s=e)=>(e._$AI(t,s),e),qe={},He=e=>{e._$AP?.(!1,!0);let t=e._$AA;const s=e._$AB.nextSibling;for(;t!==s;){const e=t.nextSibling;t.remove(),t=e}},Ke=(e,t,s)=>{const o=new Map;for(let i=t;i<=s;i++)o.set(e[i],i);return o},We=_t(class extends Ct{constructor(e){if(super(e),2!==e.type)throw Error("repeat() can only be used in text expressions")}dt(e,t,s){let o;void 0===s?s=t:void 0!==t&&(o=t);const i=[],n=[];let r=0;for(const t of e)i[r]=o?o(t,r):r,n[r]=s(t,r),r++;return{values:n,keys:i}}render(e,t,s){return this.dt(e,t,s).values}update(e,[t,s,o]){const i=(e=>e._$AH)(e),{values:n,keys:r}=this.dt(t,s,o);if(!Array.isArray(i))return this.ut=r,n;const a=this.ut??=[],l=[];let d,c,h=0,p=i.length-1,u=0,v=n.length-1;for(;h<=p&&u<=v;)if(null===i[h])h++;else if(null===i[p])p--;else if(a[h]===r[u])l[u]=Ue(i[h],n[u]),h++,u++;else if(a[p]===r[v])l[v]=Ue(i[p],n[v]),p--,v--;else if(a[h]===r[v])l[v]=Ue(i[h],n[v]),Le(e,l[v+1],i[h]),h++,v--;else if(a[p]===r[u])l[u]=Ue(i[p],n[u]),Le(e,i[h],i[p]),p--,u++;else if(void 0===d&&(d=Ke(r,u,v),c=Ke(a,h,p)),d.has(a[h]))if(d.has(a[p])){const t=c.get(r[u]),s=void 0!==t?i[t]:null;if(null===s){const t=Le(e,i[h]);Ue(t,n[u]),l[u]=t}else l[u]=Ue(s,n[u]),Le(e,i[h],s),i[t]=null;u++}else He(i[p]),p--;else He(i[h]),h++;for(;u<=v;){const t=Le(e,l[v+1]);Ue(t,n[u]),l[u++]=t}for(;h<=p;){const e=i[h++];null!==e&&He(e)}return this.ut=r,((e,t=qe)=>{e._$AH=t})(e,l),U}}),Ge=L`
  <span class="icon">
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M7.976 10.072l4.357-4.357.62.618L8.284 11h-.618L3 6.333l.619-.618 4.357 4.357z"
      />
    </svg>
  </span>
`;var Je=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let Ye=class extends gt{constructor(){super(...arguments),this.value="",this.description="",this.selected=!1,this.disabled=!1}render(){return L`<slot></slot>`}};Ye.styles=mt,Je([dt({type:String})],Ye.prototype,"value",void 0),Je([dt({type:String})],Ye.prototype,"description",void 0),Je([dt({type:Boolean,reflect:!0})],Ye.prototype,"selected",void 0),Je([dt({type:Boolean,reflect:!0})],Ye.prototype,"disabled",void 0),Ye=Je([at("vscode-option")],Ye);const Xe=(e,t,s)=>{const o=[];return e.forEach((e=>{let i;switch(s){case"startsWithPerTerm":i=((e,t)=>{const s={match:!1,ranges:[]},o=e.toLowerCase(),i=t.toLowerCase(),n=o.split(" ");let r=0;return n.forEach(((t,o)=>{if(o>0&&(r+=n[o-1].length+1),s.match)return;const a=t.indexOf(i),l=i.length;0===a&&(s.match=!0,s.ranges.push([r+a,Math.min(r+a+l,e.length)]))})),s})(e.label,t);break;case"startsWith":i=((e,t)=>{const s={match:!1,ranges:[]};return 0===e.toLowerCase().indexOf(t.toLowerCase())&&(s.match=!0,s.ranges=[[0,t.length]]),s})(e.label,t);break;case"contains":i=((e,t)=>{const s={match:!1,ranges:[]},o=e.toLowerCase().indexOf(t.toLowerCase());return o>-1&&(s.match=!0,s.ranges=[[o,o+t.length]]),s})(e.label,t);break;default:i=((e,t)=>{const s={match:!1,ranges:[]};let o=0,i=0;const n=t.length-1,r=e.toLowerCase(),a=t.toLowerCase();for(let e=0;e<=n;e++){if(i=r.indexOf(a[e],o),-1===i)return{match:!1,ranges:[]};s.match=!0,s.ranges.push([i,i+1]),o=i+1}return s})(e.label,t)}i.match&&o.push({...e,ranges:i.ranges})})),o},Ze=e=>{const t=[];return" "===e?(t.push(L`&nbsp;`),t):(0===e.indexOf(" ")&&t.push(L`&nbsp;`),t.push(L`${e.trimStart().trimEnd()}`),e.lastIndexOf(" ")===e.length-1&&t.push(L`&nbsp;`),t)},Qe=(e,t)=>{const s=[],o=t.length;return o<1?L`${e}`:(t.forEach(((i,n)=>{const r=e.substring(i[0],i[1]);0===n&&0!==i[0]&&s.push(...Ze(e.substring(0,t[0][0]))),n>0&&n<o&&i[0]-t[n-1][1]!=0&&s.push(...Ze(e.substring(t[n-1][1],i[0]))),s.push(L`<b>${Ze(r)}</b>`),n===o-1&&i[1]<e.length&&s.push(...Ze(e.substring(i[1],e.length)))})),s)};var ts=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};const es=22;class ss extends gt{constructor(){super(...arguments),this.ariaExpanded="false",this.combobox=!1,this.invalid=!1,this.focused=!1,this.position="below",this.tabIndex=0,this._activeIndex=-1,this._currentDescription="",this._filter="fuzzy",this._filterPattern="",this._selectedIndex=-1,this._selectedIndexes=[],this._showDropdown=!1,this._options=[],this._value="",this._values=[],this._listScrollTop=0,this._multiple=!1,this._valueOptionIndexMap={},this._isHoverForbidden=!1,this._disabled=!1,this._originalTabIndex=void 0,this._onClickOutside=e=>{-1===e.composedPath().findIndex((e=>e===this))&&(this._toggleDropdown(!1),window.removeEventListener("click",this._onClickOutside))},this._onMouseMove=()=>{this._isHoverForbidden=!1,window.removeEventListener("mousemove",this._onMouseMove)}}set disabled(e){this._disabled=e,this.ariaDisabled=e?"true":"false",!0===e?(this._originalTabIndex=this.tabIndex,this.tabIndex=-1):(this.tabIndex=this._originalTabIndex??0,this._originalTabIndex=void 0),this.requestUpdate()}get disabled(){return this._disabled}set filter(e){["contains","fuzzy","startsWith","startsWithPerTerm"].includes(e)?this._filter=e:(this._filter="fuzzy",console.warn(`[VSCode Webview Elements] Invalid filter: "${e}", fallback to default. Valid values are: "contains", "fuzzy", "startsWith", "startsWithPerm".`,this))}get filter(){return this._filter}set options(e){this._options=e.map(((e,t)=>({...e,index:t})))}get options(){return this._options.map((({label:e,value:t,description:s,selected:o,disabled:i})=>({label:e,value:t,description:s,selected:o,disabled:i})))}connectedCallback(){super.connectedCallback(),this.addEventListener("keydown",this._onComponentKeyDown),this.addEventListener("focus",this._onComponentFocus),this.addEventListener("blur",this._onComponentBlur)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("keydown",this._onComponentKeyDown),this.removeEventListener("focus",this._onComponentFocus),this.removeEventListener("blur",this._onComponentBlur)}get _filteredOptions(){return this.combobox&&""!==this._filterPattern?Xe(this._options,this._filterPattern,this._filter):this._options}get _currentOptions(){return this.combobox?this._filteredOptions:this._options}_addOptionsFromSlottedElements(){const e=[];let t=0;const s=this._assignedOptions??[],o={selectedIndexes:[],values:[]};return this._valueOptionIndexMap={},s.forEach((s=>{const{innerText:i,description:n,disabled:r}=s,a=s.value?s.value:i.trim(),l=s.selected??!1,d={label:i.trim(),value:a,description:n,selected:l,index:t,disabled:r};t=e.push(d),l&&(o.selectedIndexes.push(e.length-1),o.values.push(a)),this._valueOptionIndexMap[d.value]=d.index})),this._options=e,o}async _toggleDropdown(e){this._showDropdown=e,this.ariaExpanded=String(e),!e||this._multiple||this.combobox||(this._activeIndex=this._selectedIndex,this._activeIndex>9&&(await this.updateComplete,this._listElement.scrollTop=Math.floor(22*this._activeIndex))),e?window.addEventListener("click",this._onClickOutside):window.removeEventListener("click",this._onClickOutside)}_dispatchChangeEvent(){this._multiple?this.dispatchEvent(new CustomEvent("vsc-change",{detail:{selectedIndexes:this._selectedIndexes,value:this._values}})):this.dispatchEvent(new CustomEvent("vsc-change",{detail:{selectedIndex:this._selectedIndex,value:this._value}})),this.dispatchEvent(new Event("change"))}_onFaceClick(){this._toggleDropdown(!this._showDropdown),this._multiple&&(this._activeIndex=0)}_toggleComboboxDropdown(){this._filterPattern="",this._toggleDropdown(!this._showDropdown),this._multiple&&(this._activeIndex=-1)}_onComboboxButtonClick(){this._toggleComboboxDropdown()}_onComboboxButtonKeyDown(e){"Enter"===e.key&&this._toggleComboboxDropdown()}_onOptionMouseOver(e){if(this._isHoverForbidden)return;const t=e.target;t.matches(".option")&&(this._activeIndex=Number(this.combobox?t.dataset.filteredIndex:t.dataset.index))}_onEnterKeyDown(){const e=this.combobox?this._filteredOptions:this._options,t=!this._showDropdown;this._toggleDropdown(t),this._multiple||t||this._selectedIndex===this._activeIndex||(this._selectedIndex=e[this._activeIndex].index,this._value=this._options[this._selectedIndex].value,this._dispatchChangeEvent()),this.combobox&&(this._multiple||t||(this._selectedIndex=this._filteredOptions[this._activeIndex].index),!this._multiple&&t&&this.updateComplete.then((()=>{this._scrollActiveElementToTop()}))),this._multiple&&t&&(this._activeIndex=0)}_onSpaceKeyDown(){if(this._showDropdown){if(this._showDropdown&&this._multiple&&this._activeIndex>-1){const e=this.combobox?this._filteredOptions:this._options,{selected:t}=e[this._activeIndex];e[this._activeIndex].selected=!t,this._selectedIndexes=[],e.forEach((({index:e,selected:t})=>{t&&this._selectedIndexes.push(e)}))}}else this._toggleDropdown(!0)}_scrollActiveElementToTop(){this._listElement.scrollTop=Math.floor(22*this._activeIndex)}async _adjustOptionListScrollPos(e){if((this.combobox?this._filteredOptions.length:this._options.length)<=10)return;this._isHoverForbidden=!0,window.addEventListener("mousemove",this._onMouseMove),this._listElement||await this.updateComplete;const t=this._listElement.scrollTop,s=22*this._activeIndex;"down"===e&&s+22>=34+t&&(this._listElement.scrollTop=22*(this._activeIndex-9)),"up"===e&&s<=t-22&&this._scrollActiveElementToTop()}_onArrowUpKeyDown(){if(this._showDropdown){if(this._activeIndex<=0)return;this._activeIndex-=1,this._adjustOptionListScrollPos("up")}}_onArrowDownKeyDown(){if(this._showDropdown){if(this._activeIndex>=this._currentOptions.length-1)return;this._activeIndex+=1,this._adjustOptionListScrollPos("down")}}_onComponentKeyDown(e){[" ","ArrowUp","ArrowDown","Escape"].includes(e.key)&&(e.stopPropagation(),e.preventDefault()),"Enter"===e.key&&this._onEnterKeyDown()," "===e.key&&this._onSpaceKeyDown(),"Escape"===e.key&&this._toggleDropdown(!1),"ArrowUp"===e.key&&this._onArrowUpKeyDown(),"ArrowDown"===e.key&&this._onArrowDownKeyDown()}_onComponentFocus(){this.focused=!0}_onComponentBlur(){this.focused=!1}_onSlotChange(){const e=this._addOptionsFromSlottedElements();e.selectedIndexes.length>0&&(this._selectedIndex=e.selectedIndexes[0],this._selectedIndexes=e.selectedIndexes,this._value=e.values[0],this._values=e.values),this._multiple||this.combobox||0!==e.selectedIndexes.length||(this._selectedIndex=0),this.requestUpdate()}_onComboboxInputFocus(e){e.target.select()}_onComboboxInputInput(e){this._filterPattern=e.target.value,this._activeIndex=-1,this._toggleDropdown(!0)}_onComboboxInputClick(){this._toggleDropdown(!0)}_renderOptions(){return[]}_renderDescription(){if(!this._options[this._activeIndex])return q;const{description:e}=this._options[this._activeIndex];return e?L`<div class="description">${e}</div>`:q}_renderSelectFace(){return L`${q}`}_renderComboboxFace(){return L`${q}`}_renderDropdownControls(){return L`${q}`}_renderDropdown(){const e=Bt({dropdown:!0,multiple:this._multiple});return L`
      <div class="${e}">
        ${"above"===this.position?this._renderDescription():q}
        ${this._renderOptions()} ${this._renderDropdownControls()}
        ${"below"===this.position?this._renderDescription():q}
      </div>
    `}render(){return L`
      <slot class="main-slot" @slotchange="${this._onSlotChange}"></slot>
      ${this.combobox?this._renderComboboxFace():this._renderSelectFace()}
      ${this._showDropdown?this._renderDropdown():q}
    `}}ts([dt({type:String,reflect:!0,attribute:"aria-expanded"})],ss.prototype,"ariaExpanded",void 0),ts([dt({type:Boolean,reflect:!0})],ss.prototype,"combobox",void 0),ts([dt({type:Boolean,reflect:!0})],ss.prototype,"disabled",null),ts([dt({type:Boolean,reflect:!0})],ss.prototype,"invalid",void 0),ts([dt()],ss.prototype,"filter",null),ts([dt({type:Boolean,reflect:!0})],ss.prototype,"focused",void 0),ts([dt({type:Array})],ss.prototype,"options",null),ts([dt({reflect:!0})],ss.prototype,"position",void 0),ts([dt({type:Number,attribute:!0,reflect:!0})],ss.prototype,"tabIndex",void 0),ts([ft({flatten:!0,selector:"vscode-option"})],ss.prototype,"_assignedOptions",void 0),ts([ut()],ss.prototype,"_activeIndex",void 0),ts([ut()],ss.prototype,"_currentDescription",void 0),ts([ut()],ss.prototype,"_filter",void 0),ts([ut()],ss.prototype,"_filteredOptions",null),ts([ut()],ss.prototype,"_filterPattern",void 0),ts([ut()],ss.prototype,"_selectedIndex",void 0),ts([ut()],ss.prototype,"_selectedIndexes",void 0),ts([ut()],ss.prototype,"_showDropdown",void 0),ts([ut()],ss.prototype,"_options",void 0),ts([ut()],ss.prototype,"_value",void 0),ts([ut()],ss.prototype,"_values",void 0),ts([ut()],ss.prototype,"_listScrollTop",void 0),ts([pt(".options")],ss.prototype,"_listElement",void 0);var is=[mt,r`
    :host {
      display: inline-block;
      max-width: 100%;
      outline: none;
      position: relative;
      width: 320px;
    }

    .main-slot {
      display: none;
    }

    .select-face,
    .combobox-face {
      background-color: var(--vscode-settings-dropdownBackground);
      border-color: var(--vscode-settings-dropdownBorder);
      border-radius: 2px;
      border-style: solid;
      border-width: 1px;
      box-sizing: border-box;
      color: var(--vscode-settings-dropdownForeground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      font-weight: var(--vscode-font-weight);
      line-height: 18px;
      position: relative;
      user-select: none;
      width: 100%;
    }

    :host([invalid]) .select-face,
    :host(:invalid) .select-face,
    :host([invalid]) .combobox-face,
    :host(:invalid) .combobox-face {
      background-color: var(--vscode-inputValidation-errorBackground);
      border-color: var(--vscode-inputValidation-errorBorder, #be1100);
    }

    .select-face {
      cursor: pointer;
      padding: 3px 4px;
    }

    .select-face.multiselect {
      padding: 0;
    }

    .select-face-badge {
      background-color: var(--vscode-badge-background);
      border-radius: 2px;
      color: var(--vscode-badge-foreground);
      display: inline-block;
      flex-shrink: 0;
      font-size: 11px;
      line-height: 16px;
      margin: 2px;
      padding: 2px 3px;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .select-face-badge.no-item {
      background-color: transparent;
      color: inherit;
    }

    .combobox-face {
      display: flex;
    }

    .empty-label-placeholder {
      display: block;
      height: 16px;
    }

    :host(:focus) .select-face,
    :host(:focus) .combobox-face,
    :host([focused]) .select-face,
    :host([focused]) .combobox-face {
      border-color: var(--vscode-focusBorder);
      outline: none;
    }

    .combobox-input {
      background-color: transparent;
      box-sizing: border-box;
      border: 0;
      color: var(--vscode-foreground);
      display: block;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      line-height: 16px;
      padding: 4px;
      width: 100%;
    }

    .combobox-input:focus {
      outline: none;
    }

    .combobox-button {
      background-color: transparent;
      border: 0;
      color: var(--vscode-foreground);
      cursor: pointer;
      flex-shrink: 0;
      height: 24px;
      margin: 0;
      padding: 0;
      width: 30px;
    }

    .combobox-button:focus,
    .combobox-button:hover {
      background-color: var(--vscode-list-hoverBackground);
    }

    .combobox-button:focus {
      outline: 0;
    }

    .icon {
      color: var(--vscode-foreground);
      display: block;
      height: 14px;
      pointer-events: none;
      position: absolute;
      right: 8px;
      top: 5px;
      width: 14px;
    }

    .icon svg {
      color: var(--vscode-foreground);
      height: 100%;
      width: 100%;
    }

    .select-face:empty:before {
      content: '\\00a0';
    }

    .dropdown {
      background-color: var(--vscode-settings-dropdownBackground);
      border-color: var(--vscode-settings-dropdownListBorder);
      border-radius: 0 0 3px 3px;
      border-style: solid;
      border-width: 1px;
      box-sizing: border-box;
      left: 0;
      padding-bottom: 2px;
      position: absolute;
      top: 100%;
      width: 100%;
      z-index: var(--dropdown-z-index, 2);
    }

    :host([position="above"]) .dropdown {
      border-radius: 3px 3px 0 0;
      bottom: 26px;
      padding-bottom: 0;
      padding-top: 2px;
      top: auto;
    }

    :host(:focus) .dropdown,
    :host([focused]) .dropdown {
      border-color: var(--vscode-focusBorder);
    }

    .options {
      box-sizing: border-box;
      cursor: pointer;
      list-style: none;
      margin: 0;
      max-height: 222px;
      overflow: auto;
      padding: 1px;
    }

    .option {
      align-items: center;
      color: var(--vscode-foreground);
      cursor: pointer;
      display: flex;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      font-weight: var(--vscode-font-weight);
      line-height: 18px;
      min-height: calc(var(--vscode-font-size) * 1.3);
      padding: 1px 3px;
      user-select: none;
      border-width: 1px;
      border-style: solid;
      border-color: transparent;
    }

    .option b {
      color: var(--vscode-list-highlightForeground);
    }

    .option.active b {
      color: var(--vscode-list-focusHighlightForeground);
    }

    .option:hover {
      background-color: var(--vscode-list-hoverBackground);
      color: var(--vscode-list-hoverForeground);
    }

    :host-context(body[data-vscode-theme-kind='vscode-high-contrast'])
      .option:hover,
    :host-context(body[data-vscode-theme-kind='vscode-high-contrast-light'])
      .option:hover {
      border-style: dotted;
      border-color: var(--vscode-list-focusOutline);
    }

    .option.disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }

    .option.active,
    .option.active:hover {
      background-color: var(--vscode-list-activeSelectionBackground);
      color: var(--vscode-list-activeSelectionForeground);
      border-color: var(--vscode-list-activeSelectionBackground);
      border-style: solid;
      border-width: 1px;
    }

    :host-context(body[data-vscode-theme-kind='vscode-high-contrast'])
      .option.active,
    :host-context(body[data-vscode-theme-kind='vscode-high-contrast-light'])
      .option.active:hover {
      border-color: var(--vscode-list-focusOutline);
      border-style: dashed;
    }

    .option-label {
      display: block;
      pointer-events: none;
      width: 100%;
    }

    .dropdown.multiple .option.selected {
      background-color: var(--vscode-list-hoverBackground);
      border-color:  var(--vscode-list-hoverBackground);
    }

    .dropdown.multiple .option.selected.active {
      background-color: var(--vscode-list-activeSelectionBackground);
      color: var(--vscode-list-activeSelectionForeground);
      border-color:  var(--vscode-list-activeSelectionBackground);
    }

    .checkbox-icon {
      background-color: var(--vscode-settings-checkboxBackground);
      border: 1px solid currentColor;
      border-radius: 2px;
      box-sizing: border-box;
      height: 14px;
      margin-right: 5px;
      overflow: hidden;
      position: relative;
      width: 14px;
    }

    .checkbox-icon.checked:before,
    .checkbox-icon.checked:after {
      content: '';
      display: block;
      height: 5px;
      position: absolute;
      transform: rotate(-45deg);
      width: 10px;
    }

    .checkbox-icon.checked:before {
      background-color: var(--vscode-foreground);
      left: 1px;
      top: 2.5px;
    }

    .checkbox-icon.checked:after {
      background-color: var(--vscode-settings-checkboxBackground);
      left: 1px;
      top: -0.5px;
    }

    .dropdown-controls {
      display: flex;
      justify-content: flex-end;
      padding: 4px;
    }

    .dropdown-controls :not(:last-child) {
      margin-right: 4px;
    }

    .action-icon {
      align-items: center;
      background-color: transparent;
      border: 0;
      color: var(--vscode-foreground);
      cursor: pointer;
      display: flex;
      height: 24px;
      justify-content: center;
      padding: 0;
      width: 24px;
    }

    .action-icon:focus {
      outline: none;
    }

    .action-icon:focus-visible {
      outline: 1px solid var(--vscode-focusBorder);
      outline-offset: -1px;
    }

    .description {
      border-color: var(--vscode-settings-dropdownBorder);
      border-style: solid;
      border-width: 1px 0 0;
      color: var(--vscode-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      font-weight: var(--vscode-font-weight);
      line-height: 1.3;
      padding: 6px 4px;
      word-wrap:break-word;
    }

    :host([position="above"]) .description {
      border-width: 0 0 1px;
    }
  `],os=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let rs=class extends ss{set selectedIndexes(e){this._selectedIndexes=e}get selectedIndexes(){return this._selectedIndexes}set value(e){const t=e.map((e=>String(e)));this._values=t,this._selectedIndexes.forEach((e=>{this._options[e].selected=!1})),this._selectedIndexes=[],t.forEach((e=>{this._valueOptionIndexMap[e]&&(this._selectedIndexes.push(this._valueOptionIndexMap[e]),this._options[this._valueOptionIndexMap[e]].selected=!0)})),this._setFormValue(),this._manageRequired()}get value(){return this._values}get form(){return this._internals.form}get type(){return"select-multiple"}get validity(){return this._internals.validity}get validationMessage(){return this._internals.validationMessage}get willValidate(){return this._internals.willValidate}checkValidity(){return this._internals.checkValidity()}reportValidity(){return this._internals.reportValidity()}constructor(){super(),this.defaultValue=[],this.required=!1,this.name=void 0,this._multiple=!0,this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.updateComplete.then((()=>{this._setDefaultValue(),this._manageRequired()}))}formResetCallback(){this.updateComplete.then((()=>{this.value=this.defaultValue}))}formStateRestoreCallback(e,t){const s=Array.from(e.entries()).map((e=>String(e[1])));this.updateComplete.then((()=>{this.value=s}))}_setDefaultValue(){if(Array.isArray(this.defaultValue)&&this.defaultValue.length>0){const e=this.defaultValue.map((e=>String(e)));this.value=e}}_manageRequired(){const{value:e}=this;0===e.length&&this.required?this._internals.setValidity({valueMissing:!0},"Please select an item in the list.",this._faceElement):this._internals.setValidity({})}_setFormValue(){const e=new FormData;this._values.forEach((t=>{e.append(this.name??"",t)})),this._internals.setFormValue(e)}_onOptionClick(e){const t=e.composedPath().find((e=>"matches"in e&&e.matches("li.option")));if(!t)return;const s=Number(t.dataset.index);this._options[s]&&(this._options[s].selected=!this._options[s].selected),this._selectedIndexes=[],this._values=[],this._options.forEach((e=>{e.selected&&(this._selectedIndexes.push(e.index),this._values.push(e.value))})),this._setFormValue(),this._manageRequired(),this._dispatchChangeEvent()}_onMultiAcceptClick(){this._toggleDropdown(!1)}_onMultiDeselectAllClick(){this._selectedIndexes=[],this._values=[],this._options=this._options.map((e=>({...e,selected:!1}))),this._manageRequired(),this._dispatchChangeEvent()}_onMultiSelectAllClick(){this._selectedIndexes=[],this._values=[],this._options=this._options.map((e=>({...e,selected:!0}))),this._options.forEach(((e,t)=>{this._selectedIndexes.push(t),this._values.push(e.value),this._dispatchChangeEvent()})),this._setFormValue(),this._manageRequired()}_renderLabel(){switch(this._selectedIndexes.length){case 0:return L`<span class="select-face-badge no-item"
          >No items selected</span
        >`;case 1:return L`<span class="select-face-badge">1 item selected</span>`;default:return L`<span class="select-face-badge"
          >${this._selectedIndexes.length} items selected</span
        >`}}_renderSelectFace(){return L`
      <div
        class="select-face face multiselect"
        @click="${this._onFaceClick}"
        tabindex="${this.tabIndex>-1?0:-1}"
      >
        ${this._renderLabel()} ${Ge}
      </div>
    `}_renderComboboxFace(){const e=this._selectedIndex>-1?this._options[this._selectedIndex].label:"";return L`
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
          ${Ge}
        </button>
      </div>
    `}_renderOptions(){const e=this.combobox?this._filteredOptions:this._options;return L`
      <ul
        class="options"
        @click="${this._onOptionClick}"
        @mouseover="${this._onOptionMouseOver}"
      >
        ${We(e,(e=>e.index),((e,t)=>{const s=this._selectedIndexes.includes(e.index),o=Bt({active:t===this._activeIndex,option:!0,selected:s}),i=Bt({"checkbox-icon":!0,checked:s});return L`
              <li
                class="${o}"
                data-index="${e.index}"
                data-filtered-index="${t}"
              >
                <span class="${i}"></span>
                <span class="option-label"
                  >${e.ranges?.length?Qe(e.label,e.ranges??[]):e.label}</span
                >
              </li>
            `}))}
      </ul>
    `}_renderDropdownControls(){return L`
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
    `}};rs.styles=is,rs.shadowRootOptions={...nt.shadowRootOptions,delegatesFocus:!0},rs.formAssociated=!0,os([dt({type:Array,attribute:"default-value"})],rs.prototype,"defaultValue",void 0),os([dt({type:Boolean,reflect:!0})],rs.prototype,"required",void 0),os([dt({reflect:!0})],rs.prototype,"name",void 0),os([dt({type:Array,attribute:!1})],rs.prototype,"selectedIndexes",null),os([dt({type:Array})],rs.prototype,"value",null),os([pt(".face")],rs.prototype,"_faceElement",void 0),rs=os([at("vscode-multi-select")],rs);const ns=[mt,r`
    :host {
      align-items: center;
      display: block;
      height: 28px;
      margin: 0;
      outline: none;
      width: 28px;
    }

    .progress {
      height: 100%;
      width: 100%;
    }

    .background {
      fill: none;
      stroke: transparent;
      stroke-width: 2px;
    }

    .indeterminate-indicator-1 {
      fill: none;
      stroke: var(--vscode-progressBar-background);
      stroke-width: 2px;
      stroke-linecap: square;
      transform-origin: 50% 50%;
      transform: rotate(-90deg);
      transition: all 0.2s ease-in-out;
      animation: spin-infinite 2s linear infinite;
    }

    @keyframes spin-infinite {
      0% {
        stroke-dasharray: 0.01px 43.97px;
        transform: rotate(0deg);
      }
      50% {
        stroke-dasharray: 21.99px 21.99px;
        transform: rotate(450deg);
      }
      100% {
        stroke-dasharray: 0.01px 43.97px;
        transform: rotate(1080deg);
      }
    }
  `];var ls=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let as=class extends gt{constructor(){super(...arguments),this.ariaLabel="Loading",this.ariaLive="assertive",this.role="alert"}render(){return L`<svg class="progress" part="progress" viewBox="0 0 16 16">
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
    </svg>`}};as.styles=ns,ls([dt({reflect:!0,attribute:"aria-label"})],as.prototype,"ariaLabel",void 0),ls([dt({reflect:!0,attribute:"aria-live"})],as.prototype,"ariaLive",void 0),ls([dt({reflect:!0})],as.prototype,"role",void 0),as=ls([at("vscode-progress-ring")],as);const cs=[mt,Gt,r`
    :host(:invalid) .icon,
    :host([invalid]) .icon {
      background-color: var(--vscode-inputValidation-errorBackground);
      border-color: var(--vscode-inputValidation-errorBorder, #be1100);
    }

    .icon {
      border-radius: 9px;
    }

    .icon.checked:before {
      background-color: currentColor;
      border-radius: 4px;
      content: '';
      height: 8px;
      left: 50%;
      margin: -4px 0 0 -4px;
      position: absolute;
      top: 50%;
      width: 8px;
    }

    :host(:focus):host(:not([disabled])) .icon {
      outline: 1px solid var(--vscode-focusBorder);
      outline-offset: -1px;
    }
  `,Jt];var hs=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let ds=class extends(Wt(Ht)){constructor(){super(),this.autofocus=!1,this.checked=!1,this.defaultChecked=!1,this.invalid=!1,this.name="",this.value="",this.disabled=!1,this.required=!1,this.role="radio",this.tabIndex=0,this._slottedText="",this._handleClick=()=>{this.disabled||this.checked||(this._checkButton(),this._handleValueChange(),this._dispatchCustomEvent(),this.dispatchEvent(new Event("change",{bubbles:!0})))},this._handleKeyDown=e=>{this.disabled||"Enter"!==e.key&&" "!==e.key||(e.preventDefault()," "!==e.key||this.checked||(this.checked=!0,this._handleValueChange(),this._dispatchCustomEvent(),this.dispatchEvent(new Event("change",{bubbles:!0}))),"Enter"===e.key&&this._internals.form?.requestSubmit())},this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.addEventListener("keydown",this._handleKeyDown),this.addEventListener("click",this._handleClick),this._handleValueChange()}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("keydown",this._handleKeyDown),this.removeEventListener("click",this._handleClick)}update(e){super.update(e),e.has("checked")&&this._handleValueChange(),e.has("required")&&this._handleValueChange()}get form(){return this._internals.form}get type(){return"radio"}get validity(){return this._internals.validity}get validationMessage(){return this._internals.validationMessage}get willValidate(){return this._internals.willValidate}checkValidity(){return this._internals.checkValidity()}reportValidity(){return this._internals.reportValidity()}formResetCallback(){this._getRadios().forEach((e=>{e.checked=e.defaultChecked})),this.updateComplete.then((()=>{this._handleValueChange()}))}formStateRestoreCallback(e,t){this.value===e&&""!==e&&(this.checked=!0)}_dispatchCustomEvent(){this.dispatchEvent(new CustomEvent("vsc-change",{detail:{checked:this.checked,label:this.label,value:this.value},bubbles:!0,composed:!0}))}_getRadios(){const e=this.getRootNode({composed:!0});if(!e)return[];const t=e.querySelectorAll(`vscode-radio[name="${this.name}"]`);return Array.from(t)}_uncheckOthers(e){e.forEach((e=>{e!==this&&(e.checked=!1)}))}_checkButton(){const e=this._getRadios();this.checked=!0,e.forEach((e=>{e!==this&&(e.checked=!1)}))}setComponentValidity(e){e?this._internals.setValidity({}):this._internals.setValidity({valueMissing:!0},"Please select one of these options.",this._inputEl)}_setGroupValidity(e,t){this.updateComplete.then((()=>{e.forEach((e=>{e.setComponentValidity(t)}))}))}_setActualFormValue(){let e="";e=this.checked?this.value?this.value:"on":null,this._internals.setFormValue(e)}_handleValueChange(){const e=this._getRadios(),t=e.some((e=>e.required));if(this._setActualFormValue(),this.checked)this._uncheckOthers(e),this._setGroupValidity(e,!0);else{const s=!!e.find((e=>e.checked)),o=t&&!s;this._setGroupValidity(e,!o)}}render(){const e=Bt({icon:!0,checked:this.checked}),t=Bt({"label-inner":!0,"is-slot-empty":""===this._slottedText});return L`
      <div class="wrapper">
        <input
          ?autofocus=${this.autofocus}
          id="input"
          class="radio"
          type="checkbox"
          ?checked="${this.checked}"
          value="${this.value}"
          tabindex=${this.tabIndex}
        />
        <div class="${e}"></div>
        <label for="input" class="label" @click="${this._handleClick}">
          <span class="${t}">
            ${this._renderLabelAttribute()}
            <slot @slotchange="${this._handleSlotChange}"></slot>
          </span>
        </label>
      </div>
    `}};ds.styles=cs,ds.formAssociated=!0,ds.shadowRootOptions={...nt.shadowRootOptions,delegatesFocus:!0},hs([dt({type:Boolean,reflect:!0})],ds.prototype,"autofocus",void 0),hs([dt({type:Boolean,reflect:!0})],ds.prototype,"checked",void 0),hs([dt({type:Boolean,reflect:!0,attribute:"default-checked"})],ds.prototype,"defaultChecked",void 0),hs([dt({type:Boolean,reflect:!0})],ds.prototype,"invalid",void 0),hs([dt({reflect:!0})],ds.prototype,"name",void 0),hs([dt()],ds.prototype,"value",void 0),hs([dt({type:Boolean,reflect:!0})],ds.prototype,"disabled",void 0),hs([dt({type:Boolean,reflect:!0})],ds.prototype,"required",void 0),hs([dt({reflect:!0})],ds.prototype,"role",void 0),hs([dt({type:Number,reflect:!0})],ds.prototype,"tabIndex",void 0),hs([ut()],ds.prototype,"_slottedText",void 0),hs([pt("#input")],ds.prototype,"_inputEl",void 0),ds=hs([at("vscode-radio")],ds);var us=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let vs=class extends ss{set selectedIndex(e){this._selectedIndex=e,this._value=this._options[this._selectedIndex]?this._options[this._selectedIndex].value:"",this._labelText=this._options[this._selectedIndex]?this._options[this._selectedIndex].label:""}get selectedIndex(){return this._selectedIndex}set value(e){this._options[this._selectedIndex]&&(this._options[this._selectedIndex].selected=!1),this._selectedIndex=this._options.findIndex((t=>t.value===e)),this._selectedIndex>-1?(this._options[this._selectedIndex].selected=!0,this._labelText=this._options[this._selectedIndex].label,this._value=e):(this._labelText="",this._value="")}get value(){return this._options[this._selectedIndex]?this._options[this._selectedIndex]?.value??"":""}get validity(){return this._internals.validity}get validationMessage(){return this._internals.validationMessage}get willValidate(){return this._internals.willValidate}checkValidity(){return this._internals.checkValidity()}reportValidity(){return this._internals.reportValidity()}updateInputValue(){if(!this.combobox)return;const e=this.renderRoot.querySelector(".combobox-input");e&&(e.value=this._options[this._selectedIndex]?this._options[this._selectedIndex].label:"")}constructor(){super(),this.defaultValue="",this.role="listbox",this.name=void 0,this.required=!1,this._labelText="",this._multiple=!1,this._internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.updateComplete.then((()=>{this._manageRequired()}))}formResetCallback(){this.value=this.defaultValue}formStateRestoreCallback(e,t){this.updateComplete.then((()=>{this.value=e}))}get type(){return"select-one"}get form(){return this._internals.form}_onSlotChange(){super._onSlotChange(),this._selectedIndex>-1&&(this._labelText=this._options[this._selectedIndex]?.label??""),this._selectedIndex>-1&&this._options.length>0?this._internals.setFormValue(this._options[this._selectedIndex].value):this._internals.setFormValue(null)}_onArrowUpKeyDown(){super._onArrowUpKeyDown(),this._showDropdown||this._selectedIndex<=0||(this._filterPattern="",this._selectedIndex-=1,this._activeIndex=this._selectedIndex,this._labelText=this._options[this._selectedIndex].label,this._value=this._options[this._selectedIndex].value,this._internals.setFormValue(this._value),this._manageRequired(),this._dispatchChangeEvent())}_onArrowDownKeyDown(){super._onArrowDownKeyDown(),this._showDropdown||this._selectedIndex>=this._options.length-1||(this._filterPattern="",this._selectedIndex+=1,this._activeIndex=this._selectedIndex,this._labelText=this._options[this._selectedIndex].label,this._value=this._options[this._selectedIndex].value,this._internals.setFormValue(this._value),this._manageRequired(),this._dispatchChangeEvent())}_onEnterKeyDown(){super._onEnterKeyDown(),this._selectedIndex>-1&&(this._labelText=this._options[this._selectedIndex].label),this.updateInputValue(),this._internals.setFormValue(this._value),this._manageRequired()}_onOptionClick(e){const t=e.composedPath().find((e=>e?.matches("li.option")));t&&!t.matches(".disabled")&&(this._selectedIndex=Number(t.dataset.index),this._value=this._options[this._selectedIndex].value,this._selectedIndex>-1&&(this._labelText=this._options[this._selectedIndex].label),this._toggleDropdown(!1),this._internals.setFormValue(this._value),this._manageRequired(),this._dispatchChangeEvent())}_manageRequired(){const{value:e}=this;""===e&&this.required?this._internals.setValidity({valueMissing:!0},"Please select an item in the list.",this._face):this._internals.setValidity({})}_renderLabel(){const e=this._labelText||L`<span class="empty-label-placeholder"></span>`;return L`<span class="text">${e}</span>`}_renderSelectFace(){return L`
      <div
        class="select-face face"
        @click="${this._onFaceClick}"
        tabindex="${this.tabIndex>-1?0:-1}"
      >
        ${this._renderLabel()} ${Ge}
      </div>
    `}_renderComboboxFace(){const e=this._selectedIndex>-1?this._options[this._selectedIndex].label:"";return L`
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
          ${Ge}
        </button>
      </div>
    `}_renderOptions(){const e=(this.combobox?this._filteredOptions:this._options).map(((e,t)=>{const s=Bt({option:!0,active:t===this._activeIndex&&!e.disabled,disabled:e.disabled});return L`
        <li
          class="${s}"
          data-index="${e.index}"
          data-filtered-index="${t}"
        >
          ${e.ranges?.length?Qe(e.label,e.ranges??[]):e.label}
        </li>
      `}));return L`
      <ul
        class="options"
        @mouseover="${this._onOptionMouseOver}"
        @click="${this._onOptionClick}"
      >
        ${e}
      </ul>
    `}};vs.styles=is,vs.shadowRootOptions={...nt.shadowRootOptions,delegatesFocus:!0},vs.formAssociated=!0,us([dt({attribute:"default-value"})],vs.prototype,"defaultValue",void 0),us([dt({type:String,attribute:!0,reflect:!0})],vs.prototype,"role",void 0),us([dt({reflect:!0})],vs.prototype,"name",void 0),us([dt({type:Number,attribute:"selected-index"})],vs.prototype,"selectedIndex",null),us([dt({type:String})],vs.prototype,"value",null),us([dt({type:Boolean,reflect:!0})],vs.prototype,"required",void 0),us([ut()],vs.prototype,"_labelText",void 0),us([pt(".face")],vs.prototype,"_face",void 0),vs=us([at("vscode-single-select")],vs);const ps=[mt,r`
    :host {
      display: block;
      position: relative;
    }

    .scrollable-container {
      height: 100%;
      overflow: auto;
    }

    .scrollable-container::-webkit-scrollbar {
      cursor: default;
      width: 0;
    }

    .scrollable-container {
      scrollbar-width: none;
    }

    .shadow {
      box-shadow: var(--vscode-scrollbar-shadow) 0 6px 6px -6px inset;
      display: none;
      height: 3px;
      left: 0;
      pointer-events: none;
      position: absolute;
      top: 0;
      z-index: 1;
      width: 100%;
    }

    .shadow.visible {
      display: block;
    }

    .scrollbar-track {
      height: 100%;
      position: absolute;
      right: 0;
      top: 0;
      width: 10px;
      z-index: 100;
    }

    .scrollbar-track.hidden {
      display: none;
    }

    .scrollbar-thumb {
      background-color: transparent;
      min-height: var(--min-thumb-height, 20px);
      opacity: 0;
      position: absolute;
      right: 0;
      width: 10px;
    }

    .scrollbar-thumb.visible {
      background-color: var(--vscode-scrollbarSlider-background);
      opacity: 1;
      transition: opacity 100ms;
    }

    .scrollbar-thumb.fade {
      background-color: var(--vscode-scrollbarSlider-background);
      opacity: 0;
      transition: opacity 800ms;
    }

    .scrollbar-thumb.visible:hover {
      background-color: var(--vscode-scrollbarSlider-hoverBackground);
    }

    .scrollbar-thumb.visible.active,
    .scrollbar-thumb.visible.active:hover {
      background-color: var(--vscode-scrollbarSlider-activeBackground);
    }

    .prevent-interaction {
      bottom: 0;
      left: 0;
      right: 0;
      top: 0;
      position: absolute;
      z-index: 99;
    }

    .content {
      overflow: hidden;
    }
  `];var bs=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let fs=class extends gt{constructor(){super(...arguments),this.shadow=!0,this.scrolled=!1,this._isDragging=!1,this._thumbHeight=0,this._thumbY=0,this._thumbVisible=!1,this._thumbFade=!1,this._thumbActive=!1,this._scrollThumbStartY=0,this._mouseStartY=0,this._scrollbarVisible=!0,this._scrollbarTrackZ=0,this._resizeObserverCallback=()=>{this._updateScrollbar()},this._onScrollThumbMouseMoveBound=this._onScrollThumbMouseMove.bind(this),this._onScrollThumbMouseUpBound=this._onScrollThumbMouseUp.bind(this),this._onComponentMouseOverBound=this._onComponentMouseOver.bind(this),this._onComponentMouseOutBound=this._onComponentMouseOut.bind(this)}set scrollPos(e){this._scrollableContainer.scrollTop=e}get scrollPos(){return this._scrollableContainer?this._scrollableContainer.scrollTop:0}get scrollMax(){return this._scrollableContainer?this._scrollableContainer.scrollHeight:0}connectedCallback(){super.connectedCallback(),this._hostResizeObserver=new ResizeObserver(this._resizeObserverCallback),this._contentResizeObserver=new ResizeObserver(this._resizeObserverCallback),this.requestUpdate(),this.updateComplete.then((()=>{this._scrollableContainer.addEventListener("scroll",this._onScrollableContainerScroll.bind(this)),this._hostResizeObserver.observe(this),this._contentResizeObserver.observe(this._contentElement)})),this.addEventListener("mouseover",this._onComponentMouseOverBound),this.addEventListener("mouseout",this._onComponentMouseOutBound)}disconnectedCallback(){super.disconnectedCallback(),this._hostResizeObserver.unobserve(this),this._hostResizeObserver.disconnect(),this._contentResizeObserver.unobserve(this._contentElement),this._contentResizeObserver.disconnect(),this.removeEventListener("mouseover",this._onComponentMouseOverBound),this.removeEventListener("mouseout",this._onComponentMouseOutBound)}_updateScrollbar(){const e=this.getBoundingClientRect(),t=this._contentElement.getBoundingClientRect();e.height>=t.height?this._scrollbarVisible=!1:(this._scrollbarVisible=!0,this._thumbHeight=e.height*(e.height/t.height)),this.requestUpdate()}_zIndexFix(){let e=0;this._assignedElements.forEach((t=>{if("style"in t){const s=window.getComputedStyle(t).zIndex;/([0-9-])+/g.test(s)&&(e=Number(s)>e?Number(s):e)}})),this._scrollbarTrackZ=e+1,this.requestUpdate()}_onSlotChange(){this._zIndexFix()}_onScrollThumbMouseDown(e){const t=this.getBoundingClientRect(),s=this._scrollThumbElement.getBoundingClientRect();this._mouseStartY=e.screenY,this._scrollThumbStartY=s.top-t.top,this._isDragging=!0,this._thumbActive=!0,document.addEventListener("mousemove",this._onScrollThumbMouseMoveBound),document.addEventListener("mouseup",this._onScrollThumbMouseUpBound)}_onScrollThumbMouseMove(e){const t=this._scrollThumbStartY+(e.screenY-this._mouseStartY);let s=0;const o=this.getBoundingClientRect().height,i=this._scrollThumbElement.getBoundingClientRect().height,n=this._contentElement.getBoundingClientRect().height;s=t<0?0:t>o-i?o-i:t,this._thumbY=s,this._scrollableContainer.scrollTop=s/(o-i)*(n-o)}_onScrollThumbMouseUp(e){this._isDragging=!1,this._thumbActive=!1;const t=this.getBoundingClientRect(),{x:s,y:o,width:i,height:n}=t,{pageX:r,pageY:a}=e;(r>s+i||r<s||a>o+n||a<o)&&(this._thumbFade=!0,this._thumbVisible=!1),document.removeEventListener("mousemove",this._onScrollThumbMouseMoveBound),document.removeEventListener("mouseup",this._onScrollThumbMouseUpBound)}_onScrollableContainerScroll(){const e=this._scrollableContainer.scrollTop;this.scrolled=e>0;const t=this.getBoundingClientRect().height,s=this._scrollThumbElement.getBoundingClientRect().height,o=e/(this._contentElement.getBoundingClientRect().height-t);this._thumbY=o*(t-s)}_onComponentMouseOver(){this._thumbVisible=!0,this._thumbFade=!1}_onComponentMouseOut(){this._thumbActive||(this._thumbVisible=!1,this._thumbFade=!0)}render(){return L`
      <div
        class="scrollable-container"
        style="${At({"user-select":this._isDragging?"none":"auto"})}"
      >
        <div class="${Bt({shadow:!0,visible:this.scrolled})}"></div>
        ${this._isDragging?L`<div class="prevent-interaction"></div>`:q}
        <div
          class="${Bt({"scrollbar-track":!0,hidden:!this._scrollbarVisible})}"
          style="${At({"z-index":String(this._scrollbarTrackZ)})}"
        >
          <div
            class="${Bt({"scrollbar-thumb":!0,visible:this._thumbVisible,fade:this._thumbFade,active:this._thumbActive})}"
            style="${At({height:`${this._thumbHeight}px`,top:`${this._thumbY}px`})}"
            @mousedown=${this._onScrollThumbMouseDown}
          ></div>
        </div>
        <div class="content">
          <slot @slotchange="${this._onSlotChange}"></slot>
        </div>
      </div>
    `}};fs.styles=ps,bs([dt({type:Boolean,reflect:!0})],fs.prototype,"shadow",void 0),bs([dt({type:Boolean,reflect:!0})],fs.prototype,"scrolled",void 0),bs([dt({type:Number,attribute:"scroll-pos"})],fs.prototype,"scrollPos",null),bs([dt({type:Number,attribute:"scroll-max"})],fs.prototype,"scrollMax",null),bs([ut()],fs.prototype,"_isDragging",void 0),bs([ut()],fs.prototype,"_thumbHeight",void 0),bs([ut()],fs.prototype,"_thumbY",void 0),bs([ut()],fs.prototype,"_thumbVisible",void 0),bs([ut()],fs.prototype,"_thumbFade",void 0),bs([ut()],fs.prototype,"_thumbActive",void 0),bs([pt(".content")],fs.prototype,"_contentElement",void 0),bs([pt(".scrollbar-thumb")],fs.prototype,"_scrollThumbElement",void 0),bs([pt(".scrollable-container")],fs.prototype,"_scrollableContainer",void 0),bs([ft()],fs.prototype,"_assignedElements",void 0),fs=bs([at("vscode-scrollable")],fs);const gs=[mt,r`
    :host {
      --separator-border: var(--vscode-editorWidget-border, transparent);

      border: 1px solid var(--vscode-editorWidget-border);
      display: block;
      overflow: hidden;
      position: relative;
    }

    ::slotted(*) {
      height: 100%;
      width: 100%;
    }

    ::slotted(vscode-split-layout) {
      border: 0;
    }

    .start {
      box-sizing: border-box;
      left: 0;
      top: 0;
      overflow: hidden;
      position: absolute;
    }

    :host([split='vertical']) .start {
      border-right: 1px solid var(--separator-border);
    }

    :host([split='horizontal']) .start {
      border-bottom: 1px solid var(--separator-border);
    }

    .end {
      bottom: 0;
      box-sizing: border-box;
      overflow: hidden;
      position: absolute;
      right: 0;
    }

    .handle-overlay {
      display: none;
      height: 100%;
      left: 0;
      position: absolute;
      top: 0;
      width: 100%;
      z-index: 1;
    }

    .handle-overlay.active {
      display: block;
    }

    .handle-overlay.split-vertical {
      cursor: ew-resize;
    }

    .handle-overlay.split-horizontal {
      cursor: ns-resize;
    }

    .handle {
      position: absolute;
      z-index: 2;
    }

    .handle.hover {
      background-color: var(--vscode-sash-hoverBorder);
      transition: background-color 100ms linear 300ms;
    }

    .handle.hide {
      background-color: transparent;
      transition: background-color 100ms linear;
    }

    .handle.split-vertical {
      cursor: ew-resize;
      height: 100%;
    }

    .handle.split-horizontal {
      cursor: ns-resize;
      width: 100%;
    }
  `];var ms,xs=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let ys=ms=class extends gt{constructor(){super(...arguments),this.split="vertical",this.resetOnDblClick=!1,this.handleSize=4,this.initialHandlePosition="50%",this._startPaneRight=0,this._startPaneBottom=0,this._endPaneTop=0,this._endPaneLeft=0,this._handleLeft=0,this._handleTop=0,this._isDragActive=!1,this._hover=!1,this._hide=!1,this._boundRect=new DOMRect,this._handleOffset=0,this._handleMouseUp=()=>{this._isDragActive=!1,window.removeEventListener("mouseup",this._handleMouseUp),window.removeEventListener("mousemove",this._handleMouseMove)},this._handleMouseMove=e=>{const{clientX:t,clientY:s}=e,{left:o,top:i,height:n,width:r}=this._boundRect;if("vertical"===this.split){const e=t-o,s=Math.max(0,Math.min(e-this._handleOffset,r)),i=s/r*100,n=Math.max(0,r-s)/r*100;this._handleLeft=i,this._startPaneRight=n,this._endPaneLeft=this._handleLeft}if("horizontal"===this.split){const e=s-i,t=Math.max(0,Math.min(e-this._handleOffset,n)),o=t/n*100,r=Math.max(0,n-t)/n*100;this._handleTop=o,this._startPaneBottom=r,this._endPaneTop=this._handleTop}}}connectedCallback(){super.connectedCallback(),this._initPosition()}initializeResizeHandler(){this._initPosition()}_initPosition(){this._boundRect=this.getBoundingClientRect();const{height:e,width:t}=this._boundRect,s="vertical"===this.split?t:e,o=/(^[0-9.]+)(%{0,1})$/.exec(this.initialHandlePosition);let i=0,n=0;o&&(n=parseFloat(o[1])),i=o&&"%"===o[2]?Math.min(s,s/100*n):o&&"%"!==o[2]?Math.min(n,s):s/2,"vertical"===this.split&&(this._startPaneRight=(s-i)/t*100,this._endPaneLeft=i/t*100,this._handleLeft=i/t*100),"horizontal"===this.split&&(this._startPaneBottom=(s-i)/e*100,this._endPaneTop=i/e*100,this._handleTop=i/e*100)}_handleMouseOver(){this._hover=!0,this._hide=!1}_handleMouseOut(e){1!==e.buttons&&(this._hover=!1,this._hide=!0)}_handleMouseDown(e){e.stopPropagation(),e.preventDefault(),this._boundRect=this.getBoundingClientRect();const{left:t,top:s,width:o,height:i}=this._boundRect,n=(e.clientX-t)/o*100,r=(e.clientY-s)/i*100;"vertical"===this.split&&(this._handleOffset=n-this._handleLeft),"horizontal"===this.split&&(this._handleOffset=r-this._handleTop),this._boundRect=this.getBoundingClientRect(),this._isDragActive=!0,window.addEventListener("mouseup",this._handleMouseUp),window.addEventListener("mousemove",this._handleMouseMove)}_handleDblClick(){this.resetOnDblClick&&this._initPosition()}_handleSlotChange(){[...this._nestedLayoutsAtStart,...this._nestedLayoutsAtEnd].forEach((e=>{e instanceof ms&&e.initializeResizeHandler()}))}render(){const e=At({bottom:`${this._startPaneBottom}%`,right:`${this._startPaneRight}%`}),t=At({left:`${this._endPaneLeft}%`,top:`${this._endPaneTop}%`}),s={left:`${this._handleLeft}%`,top:`${this._handleTop}%`};"vertical"===this.split&&(s.marginLeft=0-this.handleSize/2+"px",s.width=`${this.handleSize}px`),"horizontal"===this.split&&(s.height=`${this.handleSize}px`,s.marginTop=0-this.handleSize/2+"px");const o=At(s),i=Bt({"handle-overlay":!0,active:this._isDragActive,"split-vertical":"vertical"===this.split,"split-horizontal":"horizontal"===this.split}),n=Bt({handle:!0,hover:this._hover,hide:this._hide,"split-vertical":"vertical"===this.split,"split-horizontal":"horizontal"===this.split});return L`
      <div class="start" style="${e}">
        <slot name="start" @slotchange=${this._handleSlotChange}></slot>
      </div>
      <div class="end" style="${t}">
        <slot name="end" @slotchange=${this._handleSlotChange}></slot>
      </div>
      <div class="${i}"></div>
      <div
        class="${n}"
        style="${o}"
        @mouseover="${this._handleMouseOver}"
        @mouseout="${this._handleMouseOut}"
        @mousedown="${this._handleMouseDown}"
        @dblclick="${this._handleDblClick}"
      ></div>
    `}};ys.styles=gs,xs([dt({reflect:!0})],ys.prototype,"split",void 0),xs([dt({type:Boolean,reflect:!0,attribute:"reset-on-dbl-click"})],ys.prototype,"resetOnDblClick",void 0),xs([dt({type:Number,reflect:!0,attribute:"handle-size"})],ys.prototype,"handleSize",void 0),xs([dt({reflect:!0,attribute:"initial-handle-position"})],ys.prototype,"initialHandlePosition",void 0),xs([ut()],ys.prototype,"_startPaneRight",void 0),xs([ut()],ys.prototype,"_startPaneBottom",void 0),xs([ut()],ys.prototype,"_endPaneTop",void 0),xs([ut()],ys.prototype,"_endPaneLeft",void 0),xs([ut()],ys.prototype,"_handleLeft",void 0),xs([ut()],ys.prototype,"_handleTop",void 0),xs([ut()],ys.prototype,"_isDragActive",void 0),xs([ut()],ys.prototype,"_hover",void 0),xs([ut()],ys.prototype,"_hide",void 0),xs([ft({slot:"start",selector:"vscode-split-layout"})],ys.prototype,"_nestedLayoutsAtStart",void 0),xs([ft({slot:"end",selector:"vscode-split-layout"})],ys.prototype,"_nestedLayoutsAtEnd",void 0),ys=ms=xs([at("vscode-split-layout")],ys);const ws=[mt,r`
    :host {
      border-bottom: 1px solid transparent;
      cursor: pointer;
      display: block;
      margin-bottom: -1px;
      overflow: hidden;
      padding: 7px 8px;
      text-overflow: ellipsis;
      user-select: none;
      white-space: nowrap;
    }

    :host([active]) {
      border-bottom-color: var(--vscode-panelTitle-activeForeground);
      color: var(--vscode-panelTitle-activeForeground);
    }

    :host([panel]) {
      border-bottom: 0;
      margin-bottom: 0;
      padding: 0;
    }

    :host(:focus-visible) {
      outline: none;
    }

    .wrapper {
      align-items: center;
      color: var(--vscode-foreground);
      display: flex;
      min-height: 20px;
      overflow: inherit;
      text-overflow: inherit;
      position: relative;
    }

    .wrapper.panel {
      color: var(--vscode-panelTitle-inactiveForeground);
    }

    .wrapper.panel.active,
    .wrapper.panel:hover {
      color: var(--vscode-panelTitle-inactiveForeground);
    }

    :host([panel]) .wrapper {
      display: flex;
      font-size: 11px;
      height: 31px;
      padding: 2px 10px;
      text-transform: uppercase;
    }

    .main {
      overflow: inherit;
      text-overflow: inherit;
    }

    .active-indicator {
      display: none;
    }

    .active-indicator.panel.active {
      border-top: 1px solid var(--vscode-panelTitle-activeBorder);
      bottom: 4px;
      display: block;
      left: 8px;
      pointer-events: none;
      position: absolute;
      right: 8px;
    }

    :host(:focus-visible) .wrapper {
      outline-color: var(--vscode-focusBorder);
      outline-offset: 3px;
      outline-style: solid;
      outline-width: 1px;
    }

    :host(:focus-visible) .wrapper.panel {
      outline-offset: -2px;
    }

    slot[name='content-before']::slotted(vscode-badge) {
      margin-right: 8px;
    }

    slot[name='content-after']::slotted(vscode-badge) {
      margin-left: 8px;
    }
  `];var ks=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let $s=class extends gt{constructor(){super(...arguments),this.active=!1,this.ariaControls="",this.panel=!1,this.role="tab",this.tabId=-1}attributeChangedCallback(e,t,s){if(super.attributeChangedCallback(e,t,s),"active"===e){const e=null!==s;this.ariaSelected=e?"true":"false",this.tabIndex=e?0:-1}}render(){return L`
      <div
        class=${Bt({wrapper:!0,active:this.active,panel:this.panel})}
      >
        <div class="before"><slot name="content-before"></slot></div>
        <div class="main"><slot></slot></div>
        <div class="after"><slot name="content-after"></slot></div>
        <span
          class=${Bt({"active-indicator":!0,active:this.active,panel:this.panel})}
        ></span>
      </div>
    `}};$s.styles=ws,ks([dt({type:Boolean,reflect:!0})],$s.prototype,"active",void 0),ks([dt({reflect:!0,attribute:"aria-controls"})],$s.prototype,"ariaControls",void 0),ks([dt({type:Boolean,reflect:!0})],$s.prototype,"panel",void 0),ks([dt({reflect:!0})],$s.prototype,"role",void 0),ks([dt({type:Number,reflect:!0,attribute:"tab-id"})],$s.prototype,"tabId",void 0),$s=ks([at("vscode-tab-header")],$s);const _s=[mt,r`
    :host {
      display: block;
      overflow: hidden;
    }

    :host(:focus-visible) {
      outline-color: var(--vscode-focusBorder);
      outline-offset: 3px;
      outline-style: solid;
      outline-width: 1px;
    }

    :host([panel]) {
      background-color: var(--vscode-panel-background);
    }
  `];var Cs=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let Bs=class extends gt{constructor(){super(...arguments),this.hidden=!1,this.ariaLabelledby="",this.panel=!1,this.role="tabpanel",this.tabIndex=0}render(){return L` <slot></slot> `}};Bs.styles=_s,Cs([dt({type:Boolean,reflect:!0})],Bs.prototype,"hidden",void 0),Cs([dt({reflect:!0,attribute:"aria-labelledby"})],Bs.prototype,"ariaLabelledby",void 0),Cs([dt({type:Boolean,reflect:!0})],Bs.prototype,"panel",void 0),Cs([dt({reflect:!0})],Bs.prototype,"role",void 0),Cs([dt({type:Number,reflect:!0})],Bs.prototype,"tabIndex",void 0),Bs=Cs([at("vscode-tab-panel")],Bs);const Ss=[mt,r`
    :host {
      display: table;
      table-layout: fixed;
      width: 100%;
    }


      ::slotted(vscode-table-row:nth-child(even)) {
      background-color: var(--vsc-row-even-background);
    }

    ::slotted(vscode-table-row:nth-child(odd)) {
      background-color: var(--vsc-row-odd-background);
    }
  `];var zs=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let As=class extends gt{constructor(){super(...arguments),this.role="rowgroup"}render(){return L` <slot></slot> `}};As.styles=Ss,zs([dt({reflect:!0})],As.prototype,"role",void 0),As=zs([at("vscode-table-body")],As);const Os=[mt,r`
    :host {
      border-bottom-color: var(--vscode-editorGroup-border);
      border-bottom-style: solid;
      border-bottom-width: var(--vsc-row-border-bottom-width);
      box-sizing: border-box;
      color: var(--vscode-foreground);
      display: table-cell;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      height: 24px;
      overflow: hidden;
      padding-left: 10px;
      text-overflow: ellipsis;
      vertical-align: middle;
      white-space: nowrap;
    }

    :host([compact]) {
      display: block;
      height: auto;
      padding-bottom: 5px;
      width: 100% !important;
    }

    :host([compact]:first-child) {
      padding-top: 10px;
    }

    :host([compact]:last-child) {
      padding-bottom: 10px;
    }

    .wrapper {
      overflow: inherit;
      text-overflow: inherit;
      white-space: inherit;
      width: 100%;
    }

    .column-label {
      font-weight: bold;
    }
  `];var Es=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let js=class extends gt{constructor(){super(...arguments),this.role="cell",this.columnLabel="",this.compact=!1}render(){const e=this.columnLabel?L`<div class="column-label" role="presentation">
          ${this.columnLabel}
        </div>`:q;return L`
      <div class="wrapper">
        ${e}
        <slot></slot>
      </div>
    `}};js.styles=Os,Es([dt({reflect:!0})],js.prototype,"role",void 0),Es([dt({attribute:"column-label"})],js.prototype,"columnLabel",void 0),Es([dt({type:Boolean,reflect:!0})],js.prototype,"compact",void 0),js=Es([at("vscode-table-cell")],js);const Is=[mt,r`
    :host {
      background-color: var(--vscode-keybindingTable-headerBackground);
      display: table;
      table-layout: fixed;
      width: 100%;
    }
  `];var Ms=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let Fs=class extends gt{constructor(){super(...arguments),this.role="rowgroup"}render(){return L` <slot></slot> `}};Fs.styles=Is,Ms([dt({reflect:!0})],Fs.prototype,"role",void 0),Fs=Ms([at("vscode-table-header")],Fs);const Ds=[mt,r`
    :host {
      box-sizing: border-box;
      color: var(--vscode-foreground);
      display: table-cell;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      font-weight: bold;
      line-height: 20px;
      overflow: hidden;
      padding-bottom: 5px;
      padding-left: 10px;
      padding-right: 0;
      padding-top: 5px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .wrapper {
      box-sizing: inherit;
      overflow: inherit;
      text-overflow: inherit;
      white-space: inherit;
      width: 100%;
    }
  `];var Ns=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let Ts=class extends gt{constructor(){super(...arguments),this.role="columnheader"}render(){return L`
      <div class="wrapper">
        <slot></slot>
      </div>
    `}};Ts.styles=Ds,Ns([dt({reflect:!0})],Ts.prototype,"role",void 0),Ts=Ns([at("vscode-table-header-cell")],Ts);const Ps=[mt,r`
    :host {
      border-top-color: var(--vscode-editorGroup-border);
      border-top-style: solid;
      border-top-width: var(--vsc-row-border-top-width);
      display: var(--vsc-row-display);
      width: 100%;
    }
  `];var Vs=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let Rs=class extends gt{constructor(){super(...arguments),this.role="row"}render(){return L` <slot></slot> `}};Rs.styles=Ps,Vs([dt({reflect:!0})],Rs.prototype,"role",void 0),Rs=Vs([at("vscode-table-row")],Rs);const Ls=(e,t)=>"number"!=typeof e||Number.isNaN(e)?"string"==typeof e&&/^[0-9.]+$/.test(e)?Number(e)/t*100:"string"==typeof e&&/^[0-9.]+%$/.test(e)?Number(e.substring(0,e.length-1)):"string"==typeof e&&/^[0-9.]+px$/.test(e)?Number(e.substring(0,e.length-2))/t*100:null:e/t*100,Us=[mt,r`
    :host {
      display: block;
      --vsc-row-even-background: transparent;
      --vsc-row-odd-background: transparent;
      --vsc-row-border-bottom-width: 0;
      --vsc-row-border-top-width: 0;
      --vsc-row-display: table-row;
    }

    :host([bordered]),
    :host([bordered-rows]) {
      --vsc-row-border-bottom-width: 1px;
    }

    :host([compact]) {
      --vsc-row-display: block;
    }

    :host([bordered][compact]),
    :host([bordered-rows][compact]) {
      --vsc-row-border-bottom-width: 0;
      --vsc-row-border-top-width: 1px;
    }

    :host([zebra]) {
      --vsc-row-even-background: var(--vscode-keybindingTable-rowsBackground);
    }

    :host([zebra-odd]) {
      --vsc-row-odd-background: var(--vscode-keybindingTable-rowsBackground);
    }

    ::slotted(vscode-table-row) {
      width: 100%;
    }

    .wrapper {
      height: 100%;
      max-width: 100%;
      overflow: hidden;
      position: relative;
      width: 100%;
    }

    .wrapper.select-disabled {
      user-select: none;
    }

    .wrapper.resize-cursor {
      cursor: ew-resize;
    }

    .wrapper.compact-view .header-slot-wrapper {
      height: 0;
      overflow: hidden;
    }

    .scrollable {
      height: 100%;
    }

    .scrollable:before {
      background-color: transparent;
      content: '';
      display: block;
      height: 1px;
      position: absolute;
      width: 100%;
    }

    .wrapper:not(.compact-view) .scrollable:not([scrolled]):before {
      background-color: var(--vscode-editorGroup-border);
    }

    .sash {
      visibility: hidden;
    }

    :host([bordered-columns]) .sash,
    :host([bordered]) .sash {
      visibility: visible;
    }

    :host([resizable]) .wrapper:hover .sash {
      visibility: visible;
    }

    .sash {
      height: 100%;
      position: absolute;
      top: 0;
      width: 1px;
    }

    .wrapper.compact-view .sash {
      display: none;
    }

    .sash.resizable {
      cursor: ew-resize;
    }

    .sash-visible {
      background-color: var(--vscode-editorGroup-border);
      height: 100%;
      position: absolute;
      top: 30px;
      width: 1px;
    }

    .sash.hover .sash-visible {
      background-color: var(--vscode-sash-hoverBorder);
      transition: background-color 50ms linear 300ms;
    }

    .sash .sash-clickable {
      background-color: transparent;
      height: 100%;
      left: -2px;
      position: absolute;
      width: 5px;
    }
  `];var qs=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let Hs=class extends gt{constructor(){super(...arguments),this.role="table",this.resizable=!1,this.responsive=!1,this.breakpoint=300,this.minColumnWidth="50px",this.delayedResizing=!1,this.compact=!1,this._sashPositions=[],this._isDragging=!1,this._sashHovers=[],this._columns=[],this._activeSashElementIndex=-1,this._activeSashCursorOffset=0,this._componentX=0,this._componentH=0,this._componentW=0,this._headerCells=[],this._cellsOfFirstRow=[],this._prevHeaderHeight=0,this._prevComponentHeight=0,this._componentResizeObserverCallback=()=>{this._memoizeComponentDimensions(),this._updateResizeHandlersSize(),this.responsive&&this._toggleCompactView()},this._headerResizeObserverCallback=()=>{this._updateResizeHandlersSize()},this._bodyResizeObserverCallback=()=>{let e=0,t=0;const s=this.getBoundingClientRect().height;this._assignedHeaderElements&&this._assignedHeaderElements.length&&(e=this._assignedHeaderElements[0].getBoundingClientRect().height),this._assignedBodyElements&&this._assignedBodyElements.length&&(t=this._assignedBodyElements[0].getBoundingClientRect().height);const o=t-e-s;this._scrollableElement.style.height=o>0?s-e+"px":"auto"},this._onResizingMouseMove=e=>{e.stopPropagation(),this._updateActiveSashPosition(e.pageX),this.delayedResizing?this._resizeColumns(!1):this._resizeColumns(!0)},this._onResizingMouseUp=e=>{this._resizeColumns(!0),this._updateActiveSashPosition(e.pageX),this._sashHovers[this._activeSashElementIndex]=!1,this._isDragging=!1,this._activeSashElementIndex=-1,document.removeEventListener("mousemove",this._onResizingMouseMove),document.removeEventListener("mouseup",this._onResizingMouseUp)}}set columns(e){this._columns=e,this.isConnected&&this._initDefaultColumnSizes()}get columns(){return this._columns}connectedCallback(){super.connectedCallback(),this._memoizeComponentDimensions(),this._initDefaultColumnSizes()}disconnectedCallback(){super.disconnectedCallback(),this._componentResizeObserver.unobserve(this),this._componentResizeObserver.disconnect(),this._bodyResizeObserver?.disconnect()}_px2Percent(e){return e/this._componentW*100}_percent2Px(e){return this._componentW*e/100}_memoizeComponentDimensions(){const e=this.getBoundingClientRect();this._componentH=e.height,this._componentW=e.width,this._componentX=e.x}_queryHeaderCells(){const e=this._assignedHeaderElements;return e&&e[0]?Array.from(e[0].querySelectorAll("vscode-table-header-cell")):[]}_getHeaderCells(){return this._headerCells.length||(this._headerCells=this._queryHeaderCells()),this._headerCells}_queryCellsOfFirstRow(){const e=this._assignedBodyElements;return e&&e[0]?Array.from(e[0].querySelectorAll("vscode-table-row:first-child vscode-table-cell")):[]}_getCellsOfFirstRow(){return this._cellsOfFirstRow.length||(this._cellsOfFirstRow=this._queryCellsOfFirstRow()),this._cellsOfFirstRow}_initResizeObserver(){this._componentResizeObserver=new ResizeObserver(this._componentResizeObserverCallback),this._componentResizeObserver.observe(this),this._headerResizeObserver=new ResizeObserver(this._headerResizeObserverCallback),this._headerResizeObserver.observe(this._headerElement)}_calcColWidthPercentages(){const e=this._getHeaderCells().length;let t=this.columns.slice(0,e);const s=t.filter((e=>"auto"===e)).length+e-t.length;let o=100;if(t=t.map((e=>{const t=Ls(e,this._componentW);return null===t?"auto":(o-=t,t)})),t.length<e)for(let s=t.length;s<e;s++)t.push("auto");return t=t.map((e=>"auto"===e?o/s:e)),t}_initHeaderCellSizes(e){this._getHeaderCells().forEach(((t,s)=>{t.style.width=`${e[s]}%`}))}_initBodyColumnSizes(e){this._getCellsOfFirstRow().forEach(((t,s)=>{t.style.width=`${e[s]}%`}))}_initSashes(e){const t=e.length;let s=0;this._sashPositions=[],e.forEach(((e,o)=>{if(o<t-1){const t=s+e;this._sashPositions.push(t),s=t}}))}_initDefaultColumnSizes(){const e=this._calcColWidthPercentages();this._initHeaderCellSizes(e),this._initBodyColumnSizes(e),this._initSashes(e)}_updateResizeHandlersSize(){const e=this._headerElement.getBoundingClientRect();if(e.height===this._prevHeaderHeight&&this._componentH===this._prevComponentHeight)return;this._prevHeaderHeight=e.height,this._prevComponentHeight=this._componentH;const t=this._componentH-e.height;this._sashVisibleElements.forEach((s=>{s.style.height=`${t}px`,s.style.top=`${e.height}px`}))}_applyCompactViewColumnLabels(){const e=this._getHeaderCells().map((e=>e.innerText));this.querySelectorAll("vscode-table-row").forEach((t=>{t.querySelectorAll("vscode-table-cell").forEach(((t,s)=>{t.columnLabel=e[s],t.compact=!0}))}))}_clearCompactViewColumnLabels(){this.querySelectorAll("vscode-table-cell").forEach((e=>{e.columnLabel="",e.compact=!1}))}_toggleCompactView(){const e=this.getBoundingClientRect().width<this.breakpoint;this.compact!==e&&(this.compact=e,e?this._applyCompactViewColumnLabels():this._clearCompactViewColumnLabels())}_onHeaderSlotChange(){this._headerCells=this._queryHeaderCells()}_onBodySlotChange(){if(this._initDefaultColumnSizes(),this._initResizeObserver(),this._updateResizeHandlersSize(),!this._bodyResizeObserver){const e=this._assignedBodyElements[0]??null;e&&(this._bodyResizeObserver=new ResizeObserver(this._bodyResizeObserverCallback),this._bodyResizeObserver.observe(e))}}_onSashMouseOver(e){if(this._isDragging)return;const t=e.currentTarget,s=Number(t.dataset.index);this._sashHovers[s]=!0,this.requestUpdate()}_onSashMouseOut(e){if(e.stopPropagation(),this._isDragging)return;const t=e.currentTarget,s=Number(t.dataset.index);this._sashHovers[s]=!1,this.requestUpdate()}_onSashMouseDown(e){e.stopPropagation();const{pageX:t,currentTarget:s}=e,o=s,i=Number(o.dataset.index),n=o.getBoundingClientRect().x;this._isDragging=!0,this._activeSashElementIndex=i,this._sashHovers[this._activeSashElementIndex]=!0,this._activeSashCursorOffset=this._px2Percent(t-n);const r=this._getHeaderCells();this._headerCellsToResize=[],this._headerCellsToResize.push(r[i]),r[i+1]&&(this._headerCellsToResize[1]=r[i+1]);const a=this._bodySlot.assignedElements()[0].querySelectorAll("vscode-table-row:first-child > vscode-table-cell");this._cellsToResize=[],this._cellsToResize.push(a[i]),a[i+1]&&this._cellsToResize.push(a[i+1]),document.addEventListener("mousemove",this._onResizingMouseMove),document.addEventListener("mouseup",this._onResizingMouseUp)}_updateActiveSashPosition(e){const{prevSashPos:t,nextSashPos:s}=this._getSashPositions();let o=Ls(this.minColumnWidth,this._componentW);null===o&&(o=0);const i=t?t+o:o,n=s?s-o:100-o;let r=this._px2Percent(e-this._componentX-this._percent2Px(this._activeSashCursorOffset));r=Math.max(r,i),r=Math.min(r,n),this._sashPositions[this._activeSashElementIndex]=r,this.requestUpdate()}_getSashPositions(){return{sashPos:this._sashPositions[this._activeSashElementIndex],prevSashPos:this._sashPositions[this._activeSashElementIndex-1]||0,nextSashPos:this._sashPositions[this._activeSashElementIndex+1]||100}}_resizeColumns(e=!0){const{sashPos:t,prevSashPos:s,nextSashPos:o}=this._getSashPositions(),i=t-s+"%",n=o-t+"%";this._headerCellsToResize[0].style.width=i,this._headerCellsToResize[1]&&(this._headerCellsToResize[1].style.width=n),e&&(this._cellsToResize[0].style.width=i,this._cellsToResize[1]&&(this._cellsToResize[1].style.width=n))}render(){const e=this._sashPositions.map(((e,t)=>{const s=Bt({sash:!0,hover:this._sashHovers[t],resizable:this.resizable}),o=`${e}%`;return this.resizable?L`
            <div
              class="${s}"
              data-index="${t}"
              style="${At({left:o})}"
              @mousedown="${this._onSashMouseDown}"
              @mouseover="${this._onSashMouseOver}"
              @mouseout="${this._onSashMouseOut}"
            >
              <div class="sash-visible"></div>
              <div class="sash-clickable"></div>
            </div>
          `:L`<div
            class="${s}"
            data-index="${t}"
            style="${At({left:o})}"
          >
            <div class="sash-visible"></div>
          </div>`})),t=Bt({wrapper:!0,"select-disabled":this._isDragging,"resize-cursor":this._isDragging,"compact-view":this.compact});return L`
      <div class="${t}">
        <div class="header" @slotchange="${this._onHeaderSlotChange}">
          <slot name="caption"></slot>
          <div class="header-slot-wrapper">
            <slot name="header"></slot>
          </div>
        </div>
        <vscode-scrollable class="scrollable">
          <div>
            <slot name="body" @slotchange="${this._onBodySlotChange}"></slot>
          </div>
        </vscode-scrollable>
        ${e}
      </div>
    `}};Hs.styles=Us,qs([dt({reflect:!0})],Hs.prototype,"role",void 0),qs([dt({type:Boolean,reflect:!0})],Hs.prototype,"resizable",void 0),qs([dt({type:Boolean,reflect:!0})],Hs.prototype,"responsive",void 0),qs([dt({type:Number})],Hs.prototype,"breakpoint",void 0),qs([dt({type:Array})],Hs.prototype,"columns",null),qs([dt({attribute:"min-column-width"})],Hs.prototype,"minColumnWidth",void 0),qs([dt({type:Boolean,reflect:!0,attribute:"delayed-resizing"})],Hs.prototype,"delayedResizing",void 0),qs([dt({type:Boolean,reflect:!0})],Hs.prototype,"compact",void 0),qs([pt('slot[name="body"]')],Hs.prototype,"_bodySlot",void 0),qs([pt(".header")],Hs.prototype,"_headerElement",void 0),qs([pt(".scrollable")],Hs.prototype,"_scrollableElement",void 0),qs([(e,t)=>vt(0,0,{get(){return(this.renderRoot??(bt??=document.createDocumentFragment())).querySelectorAll(".sash-visible")}})],Hs.prototype,"_sashVisibleElements",void 0),qs([ft({slot:"header",flatten:!0,selector:"vscode-table-header"})],Hs.prototype,"_assignedHeaderElements",void 0),qs([ft({slot:"body",flatten:!0,selector:"vscode-table-body"})],Hs.prototype,"_assignedBodyElements",void 0),qs([ut()],Hs.prototype,"_sashPositions",void 0),qs([ut()],Hs.prototype,"_isDragging",void 0),Hs=qs([at("vscode-table")],Hs);const Ks=[mt,r`
    :host {
      display: block;
    }

    .header {
      align-items: center;
      display: flex;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      font-weight: var(--vscode-font-weight);
      width: 100%;
    }

    .header {
      border-bottom-color: var(--vscode-settings-headerBorder);
      border-bottom-style: solid;
      border-bottom-width: 1px;
    }

    .header.panel {
      background-color: var(--vscode-panel-background);
      border-bottom-width: 0;
      box-sizing: border-box;
      padding-left: 8px;
      padding-right: 8px;
    }

    slot[name='addons'] {
      display: block;
      margin-left: auto;
    }
  `];var Ws=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};let Gs=class extends gt{constructor(){super(),this.panel=!1,this.role="tablist",this.selectedIndex=0,this._tabHeaders=[],this._tabPanels=[],this._componentId="",this._tabFocus=0,this._componentId=Se()}attributeChangedCallback(e,t,s){super.attributeChangedCallback(e,t,s),"selected-index"===e&&this._setActiveTab(),"panel"===e&&(this._tabHeaders.forEach((e=>e.panel=null!==s)),this._tabPanels.forEach((e=>e.panel=null!==s)))}_dispatchSelectEvent(){this.dispatchEvent(new CustomEvent("vsc-select",{detail:{selectedIndex:this.selectedIndex},composed:!0})),this.dispatchEvent(new CustomEvent("vsc-tabs-select",{detail:{selectedIndex:this.selectedIndex},composed:!0}))}_setActiveTab(){this._tabFocus=this.selectedIndex,this._tabPanels.forEach(((e,t)=>{e.hidden=t!==this.selectedIndex})),this._tabHeaders.forEach(((e,t)=>{e.active=t===this.selectedIndex}))}_focusPrevTab(){0===this._tabFocus?this._tabFocus=this._tabHeaders.length-1:this._tabFocus-=1}_focusNextTab(){this._tabFocus===this._tabHeaders.length-1?this._tabFocus=0:this._tabFocus+=1}_onHeaderKeyDown(e){"ArrowLeft"!==e.key&&"ArrowRight"!==e.key||(e.preventDefault(),this._tabHeaders[this._tabFocus].setAttribute("tabindex","-1"),"ArrowLeft"===e.key?this._focusPrevTab():"ArrowRight"===e.key&&this._focusNextTab(),this._tabHeaders[this._tabFocus].setAttribute("tabindex","0"),this._tabHeaders[this._tabFocus].focus()),"Enter"===e.key&&(e.preventDefault(),this.selectedIndex=this._tabFocus,this._dispatchSelectEvent())}_moveHeadersToHeaderSlot(){const e=this._mainSlotElements.filter((e=>e instanceof $s));e.length>0&&e.forEach((e=>e.setAttribute("slot","header")))}_onMainSlotChange(){this._moveHeadersToHeaderSlot(),this._tabPanels=this._mainSlotElements.filter((e=>e instanceof Bs)),this._tabPanels.forEach(((e,t)=>{e.ariaLabelledby=`t${this._componentId}-h${t}`,e.id=`t${this._componentId}-p${t}`,e.panel=this.panel})),this._setActiveTab()}_onHeaderSlotChange(){this._tabHeaders=this._headerSlotElements.filter((e=>e instanceof $s)),this._tabHeaders.forEach(((e,t)=>{e.tabId=t,e.id=`t${this._componentId}-h${t}`,e.ariaControls=`t${this._componentId}-p${t}`,e.panel=this.panel,e.active=t===this.selectedIndex}))}_onHeaderClick(e){const t=e.composedPath().find((e=>e instanceof $s));t&&(this.selectedIndex=t.tabId,this._setActiveTab(),this._dispatchSelectEvent())}render(){return L`
      <div
        class=${Bt({header:!0,panel:this.panel})}
        @click="${this._onHeaderClick}"
        @keydown=${this._onHeaderKeyDown}
      >
        <slot name="header" @slotchange=${this._onHeaderSlotChange}></slot>
        <slot name="addons"></slot>
      </div>
      <slot @slotchange=${this._onMainSlotChange}></slot>
    `}};Gs.styles=Ks,Ws([dt({type:Boolean,reflect:!0})],Gs.prototype,"panel",void 0),Ws([dt({reflect:!0})],Gs.prototype,"role",void 0),Ws([dt({type:Number,reflect:!0,attribute:"selected-index"})],Gs.prototype,"selectedIndex",void 0),Ws([ft({slot:"header"})],Gs.prototype,"_headerSlotElements",void 0),Ws([ft()],Gs.prototype,"_mainSlotElements",void 0),Gs=Ws([at("vscode-tabs")],Gs);const Js=[mt,r`
    :host {
      --hover-outline-color: transparent;
      --hover-outline-style: solid;
      --hover-outline-width: 0;
      --selected-outline-color: transparent;
      --selected-outline-style: solid;
      --selected-outline-width: 0;

      display: block;
      outline: none;
      user-select: none;
    }

    .wrapper {
      height: 100%;
    }

    li {
      list-style: none;
    }

    ul,
    li {
      margin: 0;
      padding: 0;
    }

    ul {
      position: relative;
    }

    :host([indent-guides]) ul ul:before {
      content: '';
      display: block;
      height: 100%;
      position: absolute;
      bottom: 0;
      left: var(--indent-guide-pos);
      top: 0;
      pointer-events: none;
      width: 1px;
      z-index: 1;
    }

    .contents {
      align-items: center;
      display: flex;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      font-weight: var(--vscode-font-weight);
      outline-offset: -1px;
      padding-right: 12px;
    }

    .multi .contents {
      align-items: flex-start;
    }

    .contents:hover {
      cursor: pointer;
    }

    .arrow-container {
      align-items: center;
      display: flex;
      height: 22px;
      justify-content: center;
      padding-left: 8px;
      padding-right: 6px;
      width: 16px;
    }

    .icon-arrow {
      color: currentColor;
      display: block;
    }

    .theme-icon {
      display: block;
      flex-shrink: 0;
      margin-right: 6px;
    }

    .image-icon {
      background-repeat: no-repeat;
      background-position: 0 center;
      background-size: 16px;
      display: block;
      flex-shrink: 0;
      margin-right: 6px;
      height: 22px;
      width: 16px;
    }

    .multi .contents .theme-icon {
      margin-top: 3px;
    }

    .text-content {
      display: flex;
      line-height: 22px;
    }

    .single .text-content {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      width: 100%;
    }

    .description {
      font-size: 0.9em;
      line-height: 22px;
      margin-left: 0.5em;
      opacity: 0.95;
      white-space: pre;
    }

    .actions {
      display: none;
    }

    .contents.selected > .actions,
    .contents.focused > .actions,
    .contents:hover > .actions {
      display: flex;
    }

    .decorations {
      align-items: center;
      display: flex;
      height: 22px;
      margin-left: 5px;
    }

    .filled-circle {
      margin-right: 3px;
      opacity: 0.4;
    }

    .decoration-text {
      font-size: 90%;
      font-weight: 600;
      margin-right: 3px;
      opacity: 0.75;
    }

    .filled-circle,
    .decoration-text {
      color: var(--color, currentColor);
    }

    .contents:hover .filled-circle,
    .contents:hover .decoration-text {
      color: var(--hover-color, var(--color));
    }

    .contents.focused .filled-circle,
    .contents.focused .decoration-text {
      color: var(--focused-color, var(--color));
    }

    .contents.selected .filled-circle,
    .contents.selected .decoration-text {
      color: var(--selected-color, var(--color));
    }

    /* Theme colors */
    :host(:focus) .wrapper.has-not-focused-item {
      outline: 1px solid var(--vscode-focusBorder);
    }

    :host(:focus) .contents.selected,
    :host(:focus) .contents.focused.selected {
      color: var(--vscode-list-activeSelectionForeground);
      background-color: var(--vscode-list-activeSelectionBackground);
    }

    :host(:focus) .contents.selected .icon-arrow,
    :host(:focus) .contents.selected.focused .icon-arrow,
    :host(:focus) .contents.selected .theme-icon,
    :host(:focus) .contents.selected.focused .theme-icon,
    :host(:focus) .contents.selected .action-icon,
    :host(:focus) .contents.selected.focused .action-icon {
      color: var(--vscode-list-activeSelectionIconForeground);
    }

    :host(:focus) .contents.focused {
      color: var(--vscode-list-focusForeground);
      background-color: var(--vscode-list-focusBackground);
    }

    :host(:focus) .contents.selected.focused {
      outline-color: var(--vscode-list-focusAndSelectionOutline, var(--vscode-list-focusOutline));
    }

    .contents:hover {
      background-color: var(--vscode-list-hoverBackground);
      color: var(--vscode-list-hoverForeground);
    }

    .contents:hover,
    .contents.selected:hover {
      outline-color: var(--hover-outline-color);
      outline-style: var(--hover-outline-style);
      outline-width: var(--hover-outline-width);
    }

    .contents.selected,
    .contents.selected.focused {
      background-color: var(--vscode-list-inactiveSelectionBackground);
      color: var(--vscode-list-inactiveSelectionForeground);
    }

    .contents.selected,
    .contents.selected.focused {
      outline-color: var(--selected-outline-color);
      outline-style: var(--selected-outline-style);
      outline-width: var(--selected-outline-width);
    }

    .contents.selected .theme-icon {
      color: var(--vscode-list-inactiveSelectionIconForeground);
    }

    .contents.focused {
      background-color: var(--vscode-list-inactiveFocusBackground);
      outline: 1px dotted var(--vscode-list-inactiveFocusOutline);
    }

    :host(:focus) .contents.focused {
      outline: 1px solid var(--vscode-list-focusOutline);
    }

    :host([indent-guides]) ul ul:before {
      background-color: var(--vscode-tree-inactiveIndentGuidesStroke);
    }

    :host([indent-guides]) ul ul.has-active-item:before {
      background-color: var(--vscode-tree-indentGuidesStroke);
    }
  `];var Ys=function(e,t,s,o){for(var i,n=arguments.length,r=n<3?t:null===o?o=Object.getOwnPropertyDescriptor(t,s):o,a=e.length-1;a>=0;a--)(i=e[a])&&(r=(n<3?i(r):n>3?i(t,s,r):i(t,s))||r);return n>3&&r&&Object.defineProperty(t,s,r),r};const Xs=(e,t=[])=>{const s=[];return e.forEach(((e,o)=>{const i=[...t,o],n={...e,path:i};e.subItems&&(n.subItems=Xs(e.subItems,i)),s.push(n)})),s},Zs=e=>!!(e.subItems&&Array.isArray(e.subItems)&&e?.subItems?.length>0);let Qs=class extends gt{constructor(){super(...arguments),this.indent=8,this.arrows=!1,this.multiline=!1,this.tabindex=0,this.indentGuides=!1,this._data=[],this._selectedItem=null,this._focusedItem=null,this._selectedBranch=null,this._focusedBranch=null,this._handleComponentKeyDownBound=this._handleComponentKeyDown.bind(this)}set data(e){const t=this._data;this._data=Xs(e),this.requestUpdate("data",t)}get data(){return this._data}closeAll(){this._closeSubTreeRecursively(this.data),this.requestUpdate()}deselectAll(){this._deselectItemsRecursively(this.data),this.requestUpdate()}getItemByPath(e){return this._getItemByPath(e)}connectedCallback(){super.connectedCallback(),this.addEventListener("keydown",this._handleComponentKeyDownBound)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("keydown",this._handleComponentKeyDownBound)}_getItemByPath(e){let t=this._data,s=null;return e.forEach(((o,i)=>{i===e.length-1?s=t[o]:t=t[o].subItems})),s}_handleActionClick(e){e.stopPropagation();const t=e.target,s=t.dataset.itemPath,o=t.dataset.index;let i=null,n="",r="";if(s){const e=s.split("/").map((e=>Number(e)));if(i=this._getItemByPath(e),i?.actions){const e=Number(o);i.actions[e]&&(n=i.actions[e].actionId)}i?.value&&(r=i.value)}this.dispatchEvent(new CustomEvent("vsc-run-action",{detail:{actionId:n,item:i,value:r}})),this.dispatchEvent(new CustomEvent("vsc-tree-action",{detail:{actionId:n,item:i,value:r}}))}_renderIconVariant(e){const{type:t,value:s}=e;return"themeicon"===t?L`<vscode-icon name=${s} class="theme-icon"></vscode-icon>`:L`<span
        class="image-icon"
        style="background-image: url(${s});"
      ></span>`}_renderIcon(e){const t={branch:{value:"folder",type:"themeicon"},open:{value:"folder-opened",type:"themeicon"},leaf:{value:"file",type:"themeicon"}};if(e.iconUrls)e.iconUrls.branch&&(t.branch={value:e.iconUrls.branch,type:"image"}),e.iconUrls.leaf&&(t.leaf={value:e.iconUrls.leaf,type:"image"}),e.iconUrls.open&&(t.open={value:e.iconUrls.open,type:"image"});else if("object"==typeof e.icons)e.icons.branch&&(t.branch={value:e.icons.branch,type:"themeicon"}),e.icons.leaf&&(t.leaf={value:e.icons.leaf,type:"themeicon"}),e.icons.open&&(t.open={value:e.icons.open,type:"themeicon"});else if(!e.icons)return L`${q}`;return Zs(e)?e.open?this._renderIconVariant(t.open):this._renderIconVariant(t.branch):this._renderIconVariant(t.leaf)}_renderArrow(e){if(!this.arrows||!Zs(e))return L`${q}`;const{open:t=!1}=e;return L`
      <div class="arrow-container">
        <vscode-icon name="${t?"chevron-down":"chevron-right"}" class="icon-arrow"></vscode-icon>
      </div>
    `}_renderActions(e){const t=[];return e.actions&&Array.isArray(e.actions)&&e.actions.forEach(((s,o)=>{if(s.icon){const i=L`<vscode-icon
            name=${s.icon}
            action-icon
            title=${Ot(s.tooltip)}
            data-item-path=${Ot(e.path?.join("/"))}
            data-index=${o}
            class="action-icon"
            @click=${this._handleActionClick}
          ></vscode-icon>`;t.push(i)}})),t.length>0?L`<div class="actions">${t}</div>`:L`${q}`}_renderDecorations(e){const t=[];return e.decorations&&Array.isArray(e.decorations)&&e.decorations.forEach((e=>{const{appearance:s="text",visibleWhen:o="always",content:i="",color:n="",focusedColor:r="",hoverColor:a="",selectedColor:l=""}=e,d=`visible-when-${o}`,c={};switch(n&&(c["--color"]=n),r&&(c["--focused-color"]=r),a&&(c["--hover-color"]=a),l&&(c["--selected-color"]=l),s){case"counter-badge":t.push(L`<vscode-badge
                variant="counter"
                class=${["counter-badge",d].join(" ")}
                part="counter-badge-decoration"
                >${i}</vscode-badge
              >`);break;case"filled-circle":t.push(L`<vscode-icon
                name="circle-filled"
                size="14"
                class=${["filled-circle",d].join(" ")}
                part="filled-circle-decoration"
                style=${At(c)}
              ></vscode-icon>`);break;case"text":t.push(L`<div
                class=${["decoration-text",d].join(" ")}
                part="caption-decoration"
                style=${At(c)}
              >
                ${i}
              </div>`)}})),t.length>0?L`<div class="decorations" part="decorations">
        ${t}
      </div>`:L`${q}`}_renderTreeItem(e,t){const{open:s=!1,label:o,description:i="",tooltip:n,selected:r=!1,focused:a=!1,subItems:l=[]}=e,{path:d,itemType:c,hasFocusedItem:h=!1,hasSelectedItem:p=!1}=t,u=["contents"],v=s?["open"]:[],b=(d.length-1)*this.indent,g=this.arrows&&"leaf"===c?30+b:b,_=this._renderArrow(e),m=this._renderIcon(e),f=this.arrows?b+16:b+3,y=s&&"branch"===c?L`<ul
            style=${At({"--indent-guide-pos":`${f}px`})}
            class=${Bt({"has-active-item":h||p})}
          >
            ${this._renderTree(l,d)}
          </ul>`:q,x=i?L`<span class="description" part="description">${i}</span>`:q,w=this._renderActions(e),k=this._renderDecorations(e);return v.push(c),r&&u.push("selected"),a&&u.push("focused"),L`
      <li data-path="${d.join("/")}" class="${v.join(" ")}">
        <div
          class="${u.join(" ")}"
          style="${At({paddingLeft:`${g+3}px`})}"
        >
          ${_}${m}<span
            class="text-content"
            part="text-content"
            title="${Ot(n)}"
            >${o}${x}</span
          >
          ${w} ${k}
        </div>
        ${y}
      </li>
    `}_renderTree(e,t=[]){const s=[];return e?(e.forEach(((e,o)=>{const i=[...t,o],n=Zs(e)?"branch":"leaf",{selected:r=!1,focused:a=!1,hasFocusedItem:l=!1,hasSelectedItem:d=!1}=e;r&&(this._selectedItem=e),a&&(this._focusedItem=e),s.push(this._renderTreeItem(e,{path:i,itemType:n,hasFocusedItem:l,hasSelectedItem:d}))})),s):q}_selectItem(e){this._selectedItem&&(this._selectedItem.selected=!1),this._focusedItem&&(this._focusedItem.focused=!1),this._selectedItem=e,e.selected=!0,this._focusedItem=e,e.focused=!0,this._selectedBranch&&(this._selectedBranch.hasSelectedItem=!1);let t=null;if(e.path?.length&&e.path.length>1&&(t=this._getItemByPath(e.path.slice(0,-1))),Zs(e))this._selectedBranch=e,e.hasSelectedItem=!0,e.open=!e.open,e.open?(this._selectedBranch=e,e.hasSelectedItem=!0):t&&(this._selectedBranch=t,t.hasSelectedItem=!0);else if(e.path?.length&&e.path.length>1){const t=this._getItemByPath(e.path.slice(0,-1));t&&(this._selectedBranch=t,t.hasSelectedItem=!0)}else this._selectedBranch=e,e.hasSelectedItem=!0;this._emitSelectEvent(this._selectedItem,this._selectedItem.path.join("/")),this.requestUpdate()}_focusItem(e){this._focusedItem&&(this._focusedItem.focused=!1),this._focusedItem=e,e.focused=!0;const t=!!e?.subItems?.length;this._focusedBranch&&(this._focusedBranch.hasFocusedItem=!1);let s=null;e.path?.length&&e.path.length>1&&(s=this._getItemByPath(e.path.slice(0,-1))),t?e.open?(this._focusedBranch=e,e.hasFocusedItem=!0):!e.open&&s&&(this._focusedBranch=s,s.hasFocusedItem=!0):s&&(this._focusedBranch=s,s.hasFocusedItem=!0)}_closeSubTreeRecursively(e){e.forEach((e=>{e.open=!1,e.subItems&&e.subItems.length>0&&this._closeSubTreeRecursively(e.subItems)}))}_deselectItemsRecursively(e){e.forEach((e=>{e.selected&&(e.selected=!1),e.subItems&&e.subItems.length>0&&this._deselectItemsRecursively(e.subItems)}))}_emitSelectEvent(e,t){const{icons:s,label:o,open:i,value:n}=e,r={icons:s,itemType:Zs(e)?"branch":"leaf",label:o,open:i||!1,value:n||o,path:t};this.dispatchEvent(new CustomEvent("vsc-select",{bubbles:!0,composed:!0,detail:r})),this.dispatchEvent(new CustomEvent("vsc-tree-select",{detail:r}))}_focusPrevItem(){if(!this._focusedItem)return void this._focusItem(this._data[0]);const{path:e}=this._focusedItem;if(e&&e?.length>0){const t=e[e.length-1],s=e.length>1;if(t>0){const s=[...e];s[s.length-1]=t-1;const o=this._getItemByPath(s);let i=o;if(o?.open&&o.subItems?.length){const{subItems:e}=o;i=e[e.length-1]}this._focusItem(i)}else if(s){const t=[...e];t.pop(),this._focusItem(this._getItemByPath(t))}}else this._focusItem(this._data[0])}_focusNextItem(){if(!this._focusedItem)return void this._focusItem(this._data[0]);const{path:e,open:t}=this._focusedItem;if(t&&Array.isArray(this._focusedItem.subItems)&&this._focusedItem.subItems.length>0)return void this._focusItem(this._focusedItem.subItems[0]);const s=[...e];s[s.length-1]+=1;let o=this._getItemByPath(s);o?this._focusItem(o):(s.pop(),s.length>0&&(s[s.length-1]+=1,o=this._getItemByPath(s),o&&this._focusItem(o)))}_handleClick(e){const t=e.composedPath().find((e=>e.tagName&&"LI"===e.tagName.toUpperCase()));if(t){const e=(t.dataset.path||"").split("/").map((e=>Number(e))),s=this._getItemByPath(e);this._selectItem(s)}else this._focusedItem&&(this._focusedItem.focused=!1),this._focusedItem=null}_handleComponentKeyDown(e){const t=e.key;[" ","ArrowDown","ArrowUp","Enter","Escape"].includes(e.key)&&(e.stopPropagation(),e.preventDefault()),"Escape"===t&&(this._focusedItem=null),"ArrowUp"===t&&this._focusPrevItem(),"ArrowDown"===t&&this._focusNextItem(),"Enter"!==t&&" "!==t||this._focusedItem&&this._selectItem(this._focusedItem)}render(){const e=Bt({multi:this.multiline,single:!this.multiline,wrapper:!0,"has-not-focused-item":!this._focusedItem,"selection-none":!this._selectedItem,"selection-single":null!==this._selectedItem});return L`
      <div @click="${this._handleClick}" class="${e}">
        <ul>
          ${this._renderTree(this._data)}
        </ul>
      </div>
    `}};Qs.styles=Js,Ys([dt({type:Array,reflect:!1})],Qs.prototype,"data",null),Ys([dt({type:Number})],Qs.prototype,"indent",void 0),Ys([dt({type:Boolean,reflect:!0})],Qs.prototype,"arrows",void 0),Ys([dt({type:Boolean,reflect:!0})],Qs.prototype,"multiline",void 0),Ys([dt({type:Number,reflect:!0})],Qs.prototype,"tabindex",void 0),Ys([dt({type:Boolean,reflect:!0,attribute:"indent-guides"})],Qs.prototype,"indentGuides",void 0),Ys([ut()],Qs.prototype,"_selectedItem",void 0),Ys([ut()],Qs.prototype,"_focusedItem",void 0),Ys([ut()],Qs.prototype,"_selectedBranch",void 0),Ys([ut()],Qs.prototype,"_focusedBranch",void 0),Qs=Ys([at("vscode-tree")],Qs);export{wt as VscodeBadge,Nt as VscodeButton,Zt as VscodeCheckbox,ee as VscodeCheckboxGroup,oe as VscodeCollapsible,he as VscodeContextMenu,le as VscodeContextMenuItem,ve as VscodeDivider,xe as VscodeFormContainer,ke as VscodeFormGroup,Ce as VscodeFormHelper,Mt as VscodeIcon,Pe as VscodeLabel,rs as VscodeMultiSelect,Ye as VscodeOption,as as VscodeProgressRing,ds as VscodeRadio,Oe as VscodeRadioGroup,fs as VscodeScrollable,vs as VscodeSingleSelect,ys as VscodeSplitLayout,$s as VscodeTabHeader,Bs as VscodeTabPanel,Hs as VscodeTable,As as VscodeTableBody,js as VscodeTableCell,Fs as VscodeTableHeader,Ts as VscodeTableHeaderCell,Rs as VscodeTableRow,Gs as VscodeTabs,Ie as VscodeTextarea,De as VscodeTextfield,Qs as VscodeTree};