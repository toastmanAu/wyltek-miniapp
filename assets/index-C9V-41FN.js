function ne(e,t){for(var r=0;r<t.length;r++){const o=t[r];if(typeof o!="string"&&!Array.isArray(o)){for(const n in o)if(n!=="default"&&!(n in e)){const a=Object.getOwnPropertyDescriptor(o,n);a&&Object.defineProperty(e,n,a.get?a:{enumerable:!0,get:()=>o[n]})}}}return Object.freeze(Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}))}var c={},i={};Object.defineProperty(i,"__esModule",{value:!0});function p(e,t){return e??t()}function h(e){let t,r=e[0],o=1;for(;o<e.length;){const n=e[o],a=e[o+1];if(o+=2,(n==="optionalAccess"||n==="optionalCall")&&r==null)return;n==="access"||n==="optionalAccess"?(t=r,r=a(r)):(n==="call"||n==="optionalCall")&&(r=a((...s)=>r.call(t,...s)),t=void 0)}return r}var T=(e=>(e.DecodeError="Decode Error",e.InvalidParams="Invalid Params",e.UserRejected="User Rejected",e.NotAllowed="Not Allowed",e))(T||{}),P=class extends Error{constructor(e,t="Invalid Params",r=void 0){super(e),this.name=e==="User Rejected"?e:t,this.rawError=r}};function ie(e,t){let r,o,n,a="";for(r in e)if((n=e[r])!==void 0)if(Array.isArray(n))for(o=0;o<n.length;o++)a&&(a+="&"),a+=`${encodeURIComponent(r)}=${encodeURIComponent(n[o])}`;else a&&(a+="&"),a+=`${encodeURIComponent(r)}=${encodeURIComponent(n)}`;return""+a}function k(e){if(!e)return"";const t=decodeURIComponent(e);return t==="false"?!1:t==="true"?!0:+t*0===0&&`${+t}`===t?+t:t}function ae(e){let t,r;const o={},n=e.split("&");for(;t=n.shift();)t=t.split("="),r=t.shift(),o[r]!==void 0?o[r]=[].concat(o[r],k(t.shift())):o[r]=k(t.shift());return o}function M(e){return t=>{t.substring(0,1)==="?"&&(t=t.substring(1));const r=ae(t);for(const o in r){const n=r[o];if(typeof n=="string")try{r[o]=e(n)}catch{}}if(Object.keys(r).length===0)throw new P("Invalid request","Invalid Params");return r}}function I(e,t){function r(o){if(typeof o=="object"&&o!==null)try{return e(o)}catch{}else if(typeof o=="string"&&typeof t=="function")try{return t(o),e(o)}catch{}return o}return o=>{o={...o},o&&Object.keys(o).forEach(a=>{const s=o[a];typeof s>"u"||s===void 0?delete o[a]:o[a]=r(s)});const n=ie(o).toString();return n?`?${n}`:""}}var _=M(JSON.parse),B=I(JSON.stringify,JSON.parse),se=e=>{try{return e()}catch{return null}};function O(e){const t=e.replace(/-/g,"+").replace(/_/g,"/"),r=(4-t.length%4)%4,o=t.padEnd(t.length+r,"="),n=atob(o),a=new ArrayBuffer(n.length),s=new Uint8Array(a);for(let l=0;l<n.length;l++)s[l]=n.charCodeAt(l);return a}function le(e){const t=new Uint8Array(e);let r="";for(let n=0;n<t.length;n++){const a=t[n];a!=null&&(r+=String.fromCharCode(a))}return btoa(r).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"")}function N(e){const t=new Uint8Array(e.length/2);for(let r=0;r<e.length;r+=2)t[r/2]=Number.parseInt(e.substring(r,r+2),16);return t.buffer}function E(e){return[...new Uint8Array(e)].map(t=>t.toString(16).padStart(2,"0")).join("")}function ce(e,t){const r=new Uint8Array(e.byteLength+t.byteLength);return r.set(new Uint8Array(e),0),r.set(new Uint8Array(t),e.byteLength),r.buffer}function $(e){return new TextDecoder("utf-8").decode(e)}function de(e){return new TextEncoder().encode(e)}function ue(e){return $(N(e))}function pe(e){return e.startsWith("0x")?e.slice(2):e}function ge(e){return e.startsWith("0x")?e:`0x${e}`}function fe(e){let t="";for(let r=0;r<e.length;r+=2)t+=String.fromCharCode(Number.parseInt(e.substr(r,2),16));return t}function he(e){return E(O(e))}function D(){return window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone}var W=(e=>(e[e.RS256=-257]="RS256",e[e.ES256=-7]="ES256",e))(W||{}),H=(e=>(e.Auth="Auth",e.SignMessage="SignMessage",e.SignEvm="SignEvm",e.SignPsbt="SignPsbt",e.BatchSignPsbt="BatchSignPsbt",e.SignCkbTx="SignCkbTx",e.SignCotaNFT="SignCotaNFT",e.SignCkbRawTx="SignCkbRawTx",e.SignNostrEvent="SignNostrEvent",e.EncryptNostrMessage="EncryptNostrMessage",e.EvmWeb2Login="EvmWeb2Login",e.DecryptNostrMessage="DecryptNostrMessage",e.AuthMiniApp="AuthMiniApp",e.SignMiniAppMessage="SignMiniAppMessage",e.SignMiniAppEvm="SignMiniAppEvm",e))(H||{}),J=(e=>(e.Popup="popup",e.Redirect="redirect",e))(J||{}),be="00",F=(e=>(e[e.Metadata=0]="Metadata",e[e.Text=1]="Text",e[e.RecommendRelay=2]="RecommendRelay",e[e.Contacts=3]="Contacts",e[e.EncryptedDirectMessage=4]="EncryptedDirectMessage",e[e.EventDeletion=5]="EventDeletion",e[e.Repost=6]="Repost",e[e.Reaction=7]="Reaction",e[e.BadgeAward=8]="BadgeAward",e[e.ChannelCreation=40]="ChannelCreation",e[e.ChannelMetadata=41]="ChannelMetadata",e[e.ChannelMessage=42]="ChannelMessage",e[e.ChannelHideMessage=43]="ChannelHideMessage",e[e.ChannelMuteUser=44]="ChannelMuteUser",e[e.Blank=255]="Blank",e[e.Report=1984]="Report",e[e.ZapRequest=9734]="ZapRequest",e[e.Zap=9735]="Zap",e[e.RelayList=10002]="RelayList",e[e.ClientAuth=22242]="ClientAuth",e[e.HttpAuth=27235]="HttpAuth",e[e.ProfileBadge=30008]="ProfileBadge",e[e.BadgeDefinition=30009]="BadgeDefinition",e[e.Article=30023]="Article",e))(F||{}),b={joyidAppURL:"https://testnet.joyid.dev"},ye=e=>(Object.assign(b,e),b),m=()=>b,y=class z extends Error{constructor(t,r){super(r),this.error=t,this.error_description=r,Object.setPrototypeOf(this,z.prototype)}},Z=class V extends y{constructor(){super("timeout","Timeout"),Object.setPrototypeOf(this,V.prototype)}},Y=class G extends Z{constructor(t){super(),this.popup=t,Object.setPrototypeOf(this,G.prototype)}},w=class X extends y{constructor(t){super("cancelled","Popup closed"),this.popup=t,Object.setPrototypeOf(this,X.prototype)}},Q=class extends y{constructor(e){super("NotSupported","Popup window is blocked by browser. see: https://docs.joy.id/guide/best-practice#popup-window-blocked"),this.popup=e,Object.setPrototypeOf(this,w.prototype)}},q=class extends Error{constructor(e,t){super(e),this.message=e,this.state=t,this.state=t}},K="joyid-redirect",C=e=>{const r=new URL(p(e,()=>window.location.href)).searchParams.get("_data_");if(r==null)throw new Error("No data found");const o=_(r);if(o.error!=null)throw new q(o.error,o.state);return o.data},S=(e,t,r)=>{const o=p(e.joyidAppURL,()=>m().joyidAppURL),n=new URL(`${o}`);n.pathname=r;let a=e.redirectURL;if(t==="redirect"){const l=new URL(a);l.searchParams.set(K,"true"),a=l.href}n.searchParams.set("type",t);const s=B({...e,redirectURL:a});return n.searchParams.set("_data_",s),n.href},me=e=>{try{return new URL(p(e,()=>window.location.href)).searchParams.has(K)}catch{return!1}},we=3e3,U=(e="")=>{const o=window.screenX+(window.innerWidth-400)/2,n=window.screenY+(window.innerHeight-600)/2;return window.open(e,"joyid:authorize:popup",`left=${o},top=${n},width=400,height=600,resizable,scrollbars=yes,status=1`)},v=async e=>new Promise((t,r)=>{D()&&r(new Q(e.popup));let o,n;const a=setInterval(()=>{h([e,"access",s=>s.popup,"optionalAccess",s=>s.closed])&&(clearInterval(a),clearTimeout(n),window.removeEventListener("message",o,!1),r(new w(e.popup)))},1e3);n=setTimeout(()=>{clearInterval(a),r(new Y(e.popup)),window.removeEventListener("message",o,!1)},p(e.timeoutInSeconds,()=>we)*1e3),o=s=>{const l=p(e.joyidAppURL,()=>m().joyidAppURL);if(l==null)throw new Error("joyidAppURL is not set in the config");const u=new URL(l);s.origin===u.origin&&(!s.data||h([s,"access",g=>g.data,"optionalAccess",g=>g.type])!==e.type||(clearTimeout(n),clearInterval(a),window.removeEventListener("message",o,!1),e.popup.close(),s.data.error&&r(new Error(s.data.error)),t(s.data.data)))},window.addEventListener("message",o)}),Ce="joyid-block-dialog-style",R="joyid-block-dialog-approve",x="joyid-block-dialog-reject",Se=`
.joyid-block-dialog {
  position: fixed;
  top: 32px;
  left: 50%;
  width: 340px;
  margin-left: -170px;
  background: white;
  color: #333;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  height: 110px;
  z-index: 100002;
  box-sizing: border-box;
  border: 1px solid #ffffff;
  border-radius: 8px;
  padding: 16px 20px;
}
.joyid-block-dialog-bg {
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  position: fixed;
  top: 0;
  left: 0;
  display: none;
  z-index: 100001;
  display: block;
}
.joyid-block-dialog-title {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 8px;
}
.joyid-block-dialog-tip {
  font-size: 12px;
  color: #777;
}
.joyid-block-dialog-btn {
  width: 90px;
  height: 35px;
  font-size: 12px;
  text-align: center;
  border-radius: 6px;
  cursor: pointer;
}
.joyid-block-dialog-action {
  text-align: right;
}
#${R} {
  border: 1px solid #333;
  color: #333;
  background: #D2FF00;
  margin-bottom: 8px;
}

#${x} {
  background: transparent;
}
`,Ue=`
<div class="joyid-block-dialog">
  <div class="joyid-block-dialog-content">
    <div class="joyid-block-dialog-title">
      Request Pop-up
    </div>
    <div class="joyid-block-dialog-tip">
      Click Approve to complete creating or using wallet
    </div>
  </div>
  <div class="joyid-block-dialog-action">
    <button class="joyid-block-dialog-btn" id="${R}">Approve</button>
    <button class="joyid-block-dialog-btn" id="${x}">Reject</button>
  </div>
</div>
`,ee=()=>{if(document.getElementById(Ce)!=null)return;const t=document.createElement("style");t.appendChild(document.createTextNode(Se)),p(document.head,()=>document.getElementsByTagName("head")[0]).appendChild(t)},A=async e=>{ee();const t=document.createElement("div");t.innerHTML=Ue,document.body.appendChild(t);const r=document.createElement("div");r.className="joyid-block-dialog-bg",document.body.appendChild(r);const o=document.getElementById(R),n=document.getElementById(x),a=()=>{document.body.removeChild(t),document.body.removeChild(r)};return new Promise((s,l)=>{h([o,"optionalAccess",u=>u.addEventListener,"call",u=>u("click",async()=>{try{const g=await e();a(),s(g)}catch(g){a(),l(g)}})]),h([n,"optionalAccess",u=>u.addEventListener,"call",u=>u("click",()=>{a(),l(new Error("User Rejected"))})])})},L=(e,t)=>S(e,t,"/auth"),ve=e=>{window.location.assign(L(e,"redirect"))},te=async(e,t)=>(t=p(t,()=>({})),t.popup==null&&(t.popup=U(""),t.popup==null)?A(async()=>te(e,t)):(t.popup.location.href=L(e,"popup"),v({...e,...t,type:"Auth"}))),Re=e=>C(e),j=(e,t)=>S(e,t,"/sign-message"),xe=e=>{window.location.assign(j(e,"redirect"))},re=async(e,t)=>(t=p(t,()=>({})),t.popup==null&&(t.popup=U(""),t.popup==null)?A(async()=>re(e,t)):(t.popup.location.href=j(e,"popup"),v({...e,...t,type:"SignMessage"}))),Ae=e=>C(e);i.DappCommunicationType=J;i.DappError=P;i.DappErrorName=T;i.DappRequestType=H;i.EventKind=F;i.GenericError=y;i.PopupCancelledError=w;i.PopupNotSupportedError=Q;i.PopupTimeoutError=Y;i.RedirectErrorWithState=q;i.SESSION_KEY_VER=be;i.SigningAlg=W;i.TimeoutError=Z;i.append0x=ge;i.appendBuffer=ce;i.appendStyle=ee;i.authCallback=Re;i.authWithPopup=te;i.authWithRedirect=ve;i.base64URLStringToBuffer=O;i.base64urlToHex=he;i.bufferToBase64URLString=le;i.bufferToHex=E;i.bufferToUTF8String=$;i.buildJoyIDAuthURL=L;i.buildJoyIDSignMessageURL=j;i.buildJoyIDURL=S;i.createBlockDialog=A;i.decodeSearch=_;i.encodeSearch=B;i.getConfig=m;i.getRedirectResponse=C;i.hexToArrayBuffer=N;i.hexToString=fe;i.hexToUTF8String=ue;i.initConfig=ye;i.internalConfig=b;i.isRedirectFromJoyID=me;i.isStandaloneBrowser=D;i.openPopup=U;i.parseSearchWith=M;i.remove0x=pe;i.runPopup=v;i.safeExec=se;i.signMessageCallback=Ae;i.signMessageWithPopup=re;i.signMessageWithRedirect=xe;i.stringifySearchWith=I;i.utf8StringToBuffer=de;Object.defineProperty(c,"__esModule",{value:!0});function Le(e,t){return e??t()}var d=i,je=e=>(Object.assign(d.internalConfig,e),d.internalConfig),oe=()=>d.internalConfig,f=(e,t)=>{const r=Le(e.joyidAppURL,()=>oe().joyidAppURL),o=new URL(`${r}`);o.pathname=t;const n=d.encodeSearch.call(void 0,e);return o.searchParams.set("_data_",n),o.href},ke=e=>f({...d.internalConfig,...e,requestNetwork:"ethereum"},"/auth-mini-app"),Te=e=>f({...d.internalConfig,...e,requestNetwork:"nervos"},"/auth-mini-app"),Pe=(e,t)=>{const r=typeof e!="string";return f({...d.internalConfig,...t,requestNetwork:"ethereum",challenge:typeof e=="string"?e:d.bufferToHex.call(void 0,e),isData:r},"/sign-mini-app-msg")},Me=e=>f({...d.internalConfig,...e},"/sign-mini-app-evm"),Ie=e=>f({...d.internalConfig,...e},"/sign-mini-app-typed-data"),_e=c.buildCkbConnectUrl=Te,Be=c.buildConnectUrl=ke,Oe=c.buildSignMessageUrl=Pe,Ne=c.buildSignTxURL=Me,Ee=c.buildSignTypedDataUrl=Ie,$e=c.getConfig=oe,De=c.initConfig=je;const We=ne({__proto__:null,buildCkbConnectUrl:_e,buildConnectUrl:Be,buildSignMessageUrl:Oe,buildSignTxURL:Ne,buildSignTypedDataUrl:Ee,default:c,getConfig:$e,initConfig:De},[c]);export{We as i};
