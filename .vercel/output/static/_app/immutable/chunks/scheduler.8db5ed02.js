var ot=Object.defineProperty;var ut=(e,i,u)=>i in e?ot(e,i,{enumerable:!0,configurable:!0,writable:!0,value:u}):e[i]=u;var R=(e,i,u)=>(ut(e,typeof i!="symbol"?i+"":i,u),u);function br(){}function at(e,i){for(const u in i)e[u]=i[u];return e}function Xt(e){return!!e&&(typeof e=="object"||typeof e=="function")&&typeof e.then=="function"}function ct(e){return e()}function zt(){return Object.create(null)}function ft(e){e.forEach(ct)}function st(e){return typeof e=="function"}function Jt(e,i){return e!=e?i==i:e!==i||e&&typeof e=="object"||typeof e=="function"}function Qt(e){return Object.keys(e).length===0}function lt(e,...i){if(e==null){for(const f of i)f(void 0);return br}const u=e.subscribe(...i);return u.unsubscribe?()=>u.unsubscribe():u}function Vt(e,i,u){e.$$.on_destroy.push(lt(i,u))}function Kt(e,i,u,f){if(e){const h=Ur(e,i,u,f);return e[0](h)}}function Ur(e,i,u,f){return e[1]&&f?at(u.ctx.slice(),e[1](f(i))):u.ctx}function Zt(e,i,u,f){if(e[2]&&f){const h=e[2](f(u));if(i.dirty===void 0)return h;if(typeof h=="object"){const y=[],p=Math.max(i.dirty.length,h.length);for(let c=0;c<p;c+=1)y[c]=i.dirty[c]|h[c];return y}return i.dirty|h}return i.dirty}function $t(e,i,u,f,h,y){if(h){const p=Ur(i,u,f,y);e.p(p,h)}}function re(e){if(e.ctx.length>32){const i=[],u=e.ctx.length/32;for(let f=0;f<u;f++)i[f]=-1;return i}return-1}function te(e){const i={};for(const u in e)u[0]!=="$"&&(i[u]=e[u]);return i}function ee(e,i){const u={};i=new Set(i);for(const f in e)!i.has(f)&&f[0]!=="$"&&(u[f]=e[f]);return u}function ne(e){const i={};for(const u in e)i[u]=!0;return i}function ie(e){return e??""}function oe(e,i,u){return e.set(u),i}function ue(e){return e&&st(e.destroy)?e.destroy:br}const ht=["",!0,1,"true","contenteditable"];var ae=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function pt(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var yt={},K={};K.byteLength=xt;K.toByteArray=_t;K.fromByteArray=vt;var L=[],U=[],mt=typeof Uint8Array<"u"?Uint8Array:Array,er="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";for(var O=0,wt=er.length;O<wt;++O)L[O]=er[O],U[er.charCodeAt(O)]=O;U["-".charCodeAt(0)]=62;U["_".charCodeAt(0)]=63;function Ir(e){var i=e.length;if(i%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var u=e.indexOf("=");u===-1&&(u=i);var f=u===i?0:4-u%4;return[u,f]}function xt(e){var i=Ir(e),u=i[0],f=i[1];return(u+f)*3/4-f}function dt(e,i,u){return(i+u)*3/4-u}function _t(e){var i,u=Ir(e),f=u[0],h=u[1],y=new mt(dt(e,f,h)),p=0,c=h>0?f-4:f,m;for(m=0;m<c;m+=4)i=U[e.charCodeAt(m)]<<18|U[e.charCodeAt(m+1)]<<12|U[e.charCodeAt(m+2)]<<6|U[e.charCodeAt(m+3)],y[p++]=i>>16&255,y[p++]=i>>8&255,y[p++]=i&255;return h===2&&(i=U[e.charCodeAt(m)]<<2|U[e.charCodeAt(m+1)]>>4,y[p++]=i&255),h===1&&(i=U[e.charCodeAt(m)]<<10|U[e.charCodeAt(m+1)]<<4|U[e.charCodeAt(m+2)]>>2,y[p++]=i>>8&255,y[p++]=i&255),y}function Et(e){return L[e>>18&63]+L[e>>12&63]+L[e>>6&63]+L[e&63]}function gt(e,i,u){for(var f,h=[],y=i;y<u;y+=3)f=(e[y]<<16&16711680)+(e[y+1]<<8&65280)+(e[y+2]&255),h.push(Et(f));return h.join("")}function vt(e){for(var i,u=e.length,f=u%3,h=[],y=16383,p=0,c=u-f;p<c;p+=y)h.push(gt(e,p,p+y>c?c:p+y));return f===1?(i=e[u-1],h.push(L[i>>2]+L[i<<4&63]+"==")):f===2&&(i=(e[u-2]<<8)+e[u-1],h.push(L[i>>10]+L[i>>4&63]+L[i<<2&63]+"=")),h.join("")}var sr={};/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */sr.read=function(e,i,u,f,h){var y,p,c=h*8-f-1,m=(1<<c)-1,d=m>>1,_=-7,F=u?h-1:0,I=u?-1:1,T=e[i+F];for(F+=I,y=T&(1<<-_)-1,T>>=-_,_+=c;_>0;y=y*256+e[i+F],F+=I,_-=8);for(p=y&(1<<-_)-1,y>>=-_,_+=f;_>0;p=p*256+e[i+F],F+=I,_-=8);if(y===0)y=1-d;else{if(y===m)return p?NaN:(T?-1:1)*(1/0);p=p+Math.pow(2,f),y=y-d}return(T?-1:1)*p*Math.pow(2,y-f)};sr.write=function(e,i,u,f,h,y){var p,c,m,d=y*8-h-1,_=(1<<d)-1,F=_>>1,I=h===23?Math.pow(2,-24)-Math.pow(2,-77):0,T=f?0:y-1,Y=f?1:-1,P=i<0||i===0&&1/i<0?1:0;for(i=Math.abs(i),isNaN(i)||i===1/0?(c=isNaN(i)?1:0,p=_):(p=Math.floor(Math.log(i)/Math.LN2),i*(m=Math.pow(2,-p))<1&&(p--,m*=2),p+F>=1?i+=I/m:i+=I*Math.pow(2,1-F),i*m>=2&&(p++,m/=2),p+F>=_?(c=0,p=_):p+F>=1?(c=(i*m-1)*Math.pow(2,h),p=p+F):(c=i*Math.pow(2,F-1)*Math.pow(2,h),p=0));h>=8;e[u+T]=c&255,T+=Y,c/=256,h-=8);for(p=p<<h|c,d+=h;d>0;e[u+T]=p&255,T+=Y,p/=256,d-=8);e[u+T-Y]|=P*128};/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */(function(e){var i=K,u=sr,f=typeof Symbol=="function"&&typeof Symbol.for=="function"?Symbol.for("nodejs.util.inspect.custom"):null;e.Buffer=c,e.SlowBuffer=Wr,e.INSPECT_MAX_BYTES=50;var h=2147483647;e.kMaxLength=h,c.TYPED_ARRAY_SUPPORT=y(),!c.TYPED_ARRAY_SUPPORT&&typeof console<"u"&&typeof console.error=="function"&&console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");function y(){try{var n=new Uint8Array(1),r={foo:function(){return 42}};return Object.setPrototypeOf(r,Uint8Array.prototype),Object.setPrototypeOf(n,r),n.foo()===42}catch{return!1}}Object.defineProperty(c.prototype,"parent",{enumerable:!0,get:function(){if(c.isBuffer(this))return this.buffer}}),Object.defineProperty(c.prototype,"offset",{enumerable:!0,get:function(){if(c.isBuffer(this))return this.byteOffset}});function p(n){if(n>h)throw new RangeError('The value "'+n+'" is invalid for option "size"');var r=new Uint8Array(n);return Object.setPrototypeOf(r,c.prototype),r}function c(n,r,t){if(typeof n=="number"){if(typeof r=="string")throw new TypeError('The "string" argument must be of type string. Received type number');return F(n)}return m(n,r,t)}c.poolSize=8192;function m(n,r,t){if(typeof n=="string")return I(n,r);if(ArrayBuffer.isView(n))return Y(n);if(n==null)throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof n);if(C(n,ArrayBuffer)||n&&C(n.buffer,ArrayBuffer)||typeof SharedArrayBuffer<"u"&&(C(n,SharedArrayBuffer)||n&&C(n.buffer,SharedArrayBuffer)))return P(n,r,t);if(typeof n=="number")throw new TypeError('The "value" argument must not be of type number. Received type number');var o=n.valueOf&&n.valueOf();if(o!=null&&o!==n)return c.from(o,r,t);var a=jr(n);if(a)return a;if(typeof Symbol<"u"&&Symbol.toPrimitive!=null&&typeof n[Symbol.toPrimitive]=="function")return c.from(n[Symbol.toPrimitive]("string"),r,t);throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type "+typeof n)}c.from=function(n,r,t){return m(n,r,t)},Object.setPrototypeOf(c.prototype,Uint8Array.prototype),Object.setPrototypeOf(c,Uint8Array);function d(n){if(typeof n!="number")throw new TypeError('"size" argument must be of type number');if(n<0)throw new RangeError('The value "'+n+'" is invalid for option "size"')}function _(n,r,t){return d(n),n<=0?p(n):r!==void 0?typeof t=="string"?p(n).fill(r,t):p(n).fill(r):p(n)}c.alloc=function(n,r,t){return _(n,r,t)};function F(n){return d(n),p(n<0?0:$(n)|0)}c.allocUnsafe=function(n){return F(n)},c.allocUnsafeSlow=function(n){return F(n)};function I(n,r){if((typeof r!="string"||r==="")&&(r="utf8"),!c.isEncoding(r))throw new TypeError("Unknown encoding: "+r);var t=pr(n,r)|0,o=p(t),a=o.write(n,r);return a!==t&&(o=o.slice(0,a)),o}function T(n){for(var r=n.length<0?0:$(n.length)|0,t=p(r),o=0;o<r;o+=1)t[o]=n[o]&255;return t}function Y(n){if(C(n,Uint8Array)){var r=new Uint8Array(n);return P(r.buffer,r.byteOffset,r.byteLength)}return T(n)}function P(n,r,t){if(r<0||n.byteLength<r)throw new RangeError('"offset" is outside of buffer bounds');if(n.byteLength<r+(t||0))throw new RangeError('"length" is outside of buffer bounds');var o;return r===void 0&&t===void 0?o=new Uint8Array(n):t===void 0?o=new Uint8Array(n,r):o=new Uint8Array(n,r,t),Object.setPrototypeOf(o,c.prototype),o}function jr(n){if(c.isBuffer(n)){var r=$(n.length)|0,t=p(r);return t.length===0||n.copy(t,0,0,r),t}if(n.length!==void 0)return typeof n.length!="number"||tr(n.length)?p(0):T(n);if(n.type==="Buffer"&&Array.isArray(n.data))return T(n.data)}function $(n){if(n>=h)throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+h.toString(16)+" bytes");return n|0}function Wr(n){return+n!=n&&(n=0),c.alloc(+n)}c.isBuffer=function(r){return r!=null&&r._isBuffer===!0&&r!==c.prototype},c.compare=function(r,t){if(C(r,Uint8Array)&&(r=c.from(r,r.offset,r.byteLength)),C(t,Uint8Array)&&(t=c.from(t,t.offset,t.byteLength)),!c.isBuffer(r)||!c.isBuffer(t))throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');if(r===t)return 0;for(var o=r.length,a=t.length,s=0,l=Math.min(o,a);s<l;++s)if(r[s]!==t[s]){o=r[s],a=t[s];break}return o<a?-1:a<o?1:0},c.isEncoding=function(r){switch(String(r).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},c.concat=function(r,t){if(!Array.isArray(r))throw new TypeError('"list" argument must be an Array of Buffers');if(r.length===0)return c.alloc(0);var o;if(t===void 0)for(t=0,o=0;o<r.length;++o)t+=r[o].length;var a=c.allocUnsafe(t),s=0;for(o=0;o<r.length;++o){var l=r[o];if(C(l,Uint8Array))s+l.length>a.length?c.from(l).copy(a,s):Uint8Array.prototype.set.call(a,l,s);else if(c.isBuffer(l))l.copy(a,s);else throw new TypeError('"list" argument must be an Array of Buffers');s+=l.length}return a};function pr(n,r){if(c.isBuffer(n))return n.length;if(ArrayBuffer.isView(n)||C(n,ArrayBuffer))return n.byteLength;if(typeof n!="string")throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type '+typeof n);var t=n.length,o=arguments.length>2&&arguments[2]===!0;if(!o&&t===0)return 0;for(var a=!1;;)switch(r){case"ascii":case"latin1":case"binary":return t;case"utf8":case"utf-8":return rr(n).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return t*2;case"hex":return t>>>1;case"base64":return gr(n).length;default:if(a)return o?-1:rr(n).length;r=(""+r).toLowerCase(),a=!0}}c.byteLength=pr;function qr(n,r,t){var o=!1;if((r===void 0||r<0)&&(r=0),r>this.length||((t===void 0||t>this.length)&&(t=this.length),t<=0)||(t>>>=0,r>>>=0,t<=r))return"";for(n||(n="utf8");;)switch(n){case"hex":return Zr(this,r,t);case"utf8":case"utf-8":return wr(this,r,t);case"ascii":return Vr(this,r,t);case"latin1":case"binary":return Kr(this,r,t);case"base64":return Jr(this,r,t);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return $r(this,r,t);default:if(o)throw new TypeError("Unknown encoding: "+n);n=(n+"").toLowerCase(),o=!0}}c.prototype._isBuffer=!0;function D(n,r,t){var o=n[r];n[r]=n[t],n[t]=o}c.prototype.swap16=function(){var r=this.length;if(r%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var t=0;t<r;t+=2)D(this,t,t+1);return this},c.prototype.swap32=function(){var r=this.length;if(r%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(var t=0;t<r;t+=4)D(this,t,t+3),D(this,t+1,t+2);return this},c.prototype.swap64=function(){var r=this.length;if(r%8!==0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(var t=0;t<r;t+=8)D(this,t,t+7),D(this,t+1,t+6),D(this,t+2,t+5),D(this,t+3,t+4);return this},c.prototype.toString=function(){var r=this.length;return r===0?"":arguments.length===0?wr(this,0,r):qr.apply(this,arguments)},c.prototype.toLocaleString=c.prototype.toString,c.prototype.equals=function(r){if(!c.isBuffer(r))throw new TypeError("Argument must be a Buffer");return this===r?!0:c.compare(this,r)===0},c.prototype.inspect=function(){var r="",t=e.INSPECT_MAX_BYTES;return r=this.toString("hex",0,t).replace(/(.{2})/g,"$1 ").trim(),this.length>t&&(r+=" ... "),"<Buffer "+r+">"},f&&(c.prototype[f]=c.prototype.inspect),c.prototype.compare=function(r,t,o,a,s){if(C(r,Uint8Array)&&(r=c.from(r,r.offset,r.byteLength)),!c.isBuffer(r))throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type '+typeof r);if(t===void 0&&(t=0),o===void 0&&(o=r?r.length:0),a===void 0&&(a=0),s===void 0&&(s=this.length),t<0||o>r.length||a<0||s>this.length)throw new RangeError("out of range index");if(a>=s&&t>=o)return 0;if(a>=s)return-1;if(t>=o)return 1;if(t>>>=0,o>>>=0,a>>>=0,s>>>=0,this===r)return 0;for(var l=s-a,w=o-t,x=Math.min(l,w),E=this.slice(a,s),B=r.slice(t,o),g=0;g<x;++g)if(E[g]!==B[g]){l=E[g],w=B[g];break}return l<w?-1:w<l?1:0};function yr(n,r,t,o,a){if(n.length===0)return-1;if(typeof t=="string"?(o=t,t=0):t>2147483647?t=2147483647:t<-2147483648&&(t=-2147483648),t=+t,tr(t)&&(t=a?0:n.length-1),t<0&&(t=n.length+t),t>=n.length){if(a)return-1;t=n.length-1}else if(t<0)if(a)t=0;else return-1;if(typeof r=="string"&&(r=c.from(r,o)),c.isBuffer(r))return r.length===0?-1:mr(n,r,t,o,a);if(typeof r=="number")return r=r&255,typeof Uint8Array.prototype.indexOf=="function"?a?Uint8Array.prototype.indexOf.call(n,r,t):Uint8Array.prototype.lastIndexOf.call(n,r,t):mr(n,[r],t,o,a);throw new TypeError("val must be string, number or Buffer")}function mr(n,r,t,o,a){var s=1,l=n.length,w=r.length;if(o!==void 0&&(o=String(o).toLowerCase(),o==="ucs2"||o==="ucs-2"||o==="utf16le"||o==="utf-16le")){if(n.length<2||r.length<2)return-1;s=2,l/=2,w/=2,t/=2}function x(vr,Fr){return s===1?vr[Fr]:vr.readUInt16BE(Fr*s)}var E;if(a){var B=-1;for(E=t;E<l;E++)if(x(n,E)===x(r,B===-1?0:E-B)){if(B===-1&&(B=E),E-B+1===w)return B*s}else B!==-1&&(E-=E-B),B=-1}else for(t+w>l&&(t=l-w),E=t;E>=0;E--){for(var g=!0,J=0;J<w;J++)if(x(n,E+J)!==x(r,J)){g=!1;break}if(g)return E}return-1}c.prototype.includes=function(r,t,o){return this.indexOf(r,t,o)!==-1},c.prototype.indexOf=function(r,t,o){return yr(this,r,t,o,!0)},c.prototype.lastIndexOf=function(r,t,o){return yr(this,r,t,o,!1)};function Gr(n,r,t,o){t=Number(t)||0;var a=n.length-t;o?(o=Number(o),o>a&&(o=a)):o=a;var s=r.length;o>s/2&&(o=s/2);for(var l=0;l<o;++l){var w=parseInt(r.substr(l*2,2),16);if(tr(w))return l;n[t+l]=w}return l}function Yr(n,r,t,o){return z(rr(r,n.length-t),n,t,o)}function Pr(n,r,t,o){return z(et(r),n,t,o)}function Xr(n,r,t,o){return z(gr(r),n,t,o)}function zr(n,r,t,o){return z(nt(r,n.length-t),n,t,o)}c.prototype.write=function(r,t,o,a){if(t===void 0)a="utf8",o=this.length,t=0;else if(o===void 0&&typeof t=="string")a=t,o=this.length,t=0;else if(isFinite(t))t=t>>>0,isFinite(o)?(o=o>>>0,a===void 0&&(a="utf8")):(a=o,o=void 0);else throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");var s=this.length-t;if((o===void 0||o>s)&&(o=s),r.length>0&&(o<0||t<0)||t>this.length)throw new RangeError("Attempt to write outside buffer bounds");a||(a="utf8");for(var l=!1;;)switch(a){case"hex":return Gr(this,r,t,o);case"utf8":case"utf-8":return Yr(this,r,t,o);case"ascii":case"latin1":case"binary":return Pr(this,r,t,o);case"base64":return Xr(this,r,t,o);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return zr(this,r,t,o);default:if(l)throw new TypeError("Unknown encoding: "+a);a=(""+a).toLowerCase(),l=!0}},c.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function Jr(n,r,t){return r===0&&t===n.length?i.fromByteArray(n):i.fromByteArray(n.slice(r,t))}function wr(n,r,t){t=Math.min(n.length,t);for(var o=[],a=r;a<t;){var s=n[a],l=null,w=s>239?4:s>223?3:s>191?2:1;if(a+w<=t){var x,E,B,g;switch(w){case 1:s<128&&(l=s);break;case 2:x=n[a+1],(x&192)===128&&(g=(s&31)<<6|x&63,g>127&&(l=g));break;case 3:x=n[a+1],E=n[a+2],(x&192)===128&&(E&192)===128&&(g=(s&15)<<12|(x&63)<<6|E&63,g>2047&&(g<55296||g>57343)&&(l=g));break;case 4:x=n[a+1],E=n[a+2],B=n[a+3],(x&192)===128&&(E&192)===128&&(B&192)===128&&(g=(s&15)<<18|(x&63)<<12|(E&63)<<6|B&63,g>65535&&g<1114112&&(l=g))}}l===null?(l=65533,w=1):l>65535&&(l-=65536,o.push(l>>>10&1023|55296),l=56320|l&1023),o.push(l),a+=w}return Qr(o)}var xr=4096;function Qr(n){var r=n.length;if(r<=xr)return String.fromCharCode.apply(String,n);for(var t="",o=0;o<r;)t+=String.fromCharCode.apply(String,n.slice(o,o+=xr));return t}function Vr(n,r,t){var o="";t=Math.min(n.length,t);for(var a=r;a<t;++a)o+=String.fromCharCode(n[a]&127);return o}function Kr(n,r,t){var o="";t=Math.min(n.length,t);for(var a=r;a<t;++a)o+=String.fromCharCode(n[a]);return o}function Zr(n,r,t){var o=n.length;(!r||r<0)&&(r=0),(!t||t<0||t>o)&&(t=o);for(var a="",s=r;s<t;++s)a+=it[n[s]];return a}function $r(n,r,t){for(var o=n.slice(r,t),a="",s=0;s<o.length-1;s+=2)a+=String.fromCharCode(o[s]+o[s+1]*256);return a}c.prototype.slice=function(r,t){var o=this.length;r=~~r,t=t===void 0?o:~~t,r<0?(r+=o,r<0&&(r=0)):r>o&&(r=o),t<0?(t+=o,t<0&&(t=0)):t>o&&(t=o),t<r&&(t=r);var a=this.subarray(r,t);return Object.setPrototypeOf(a,c.prototype),a};function A(n,r,t){if(n%1!==0||n<0)throw new RangeError("offset is not uint");if(n+r>t)throw new RangeError("Trying to access beyond buffer length")}c.prototype.readUintLE=c.prototype.readUIntLE=function(r,t,o){r=r>>>0,t=t>>>0,o||A(r,t,this.length);for(var a=this[r],s=1,l=0;++l<t&&(s*=256);)a+=this[r+l]*s;return a},c.prototype.readUintBE=c.prototype.readUIntBE=function(r,t,o){r=r>>>0,t=t>>>0,o||A(r,t,this.length);for(var a=this[r+--t],s=1;t>0&&(s*=256);)a+=this[r+--t]*s;return a},c.prototype.readUint8=c.prototype.readUInt8=function(r,t){return r=r>>>0,t||A(r,1,this.length),this[r]},c.prototype.readUint16LE=c.prototype.readUInt16LE=function(r,t){return r=r>>>0,t||A(r,2,this.length),this[r]|this[r+1]<<8},c.prototype.readUint16BE=c.prototype.readUInt16BE=function(r,t){return r=r>>>0,t||A(r,2,this.length),this[r]<<8|this[r+1]},c.prototype.readUint32LE=c.prototype.readUInt32LE=function(r,t){return r=r>>>0,t||A(r,4,this.length),(this[r]|this[r+1]<<8|this[r+2]<<16)+this[r+3]*16777216},c.prototype.readUint32BE=c.prototype.readUInt32BE=function(r,t){return r=r>>>0,t||A(r,4,this.length),this[r]*16777216+(this[r+1]<<16|this[r+2]<<8|this[r+3])},c.prototype.readIntLE=function(r,t,o){r=r>>>0,t=t>>>0,o||A(r,t,this.length);for(var a=this[r],s=1,l=0;++l<t&&(s*=256);)a+=this[r+l]*s;return s*=128,a>=s&&(a-=Math.pow(2,8*t)),a},c.prototype.readIntBE=function(r,t,o){r=r>>>0,t=t>>>0,o||A(r,t,this.length);for(var a=t,s=1,l=this[r+--a];a>0&&(s*=256);)l+=this[r+--a]*s;return s*=128,l>=s&&(l-=Math.pow(2,8*t)),l},c.prototype.readInt8=function(r,t){return r=r>>>0,t||A(r,1,this.length),this[r]&128?(255-this[r]+1)*-1:this[r]},c.prototype.readInt16LE=function(r,t){r=r>>>0,t||A(r,2,this.length);var o=this[r]|this[r+1]<<8;return o&32768?o|4294901760:o},c.prototype.readInt16BE=function(r,t){r=r>>>0,t||A(r,2,this.length);var o=this[r+1]|this[r]<<8;return o&32768?o|4294901760:o},c.prototype.readInt32LE=function(r,t){return r=r>>>0,t||A(r,4,this.length),this[r]|this[r+1]<<8|this[r+2]<<16|this[r+3]<<24},c.prototype.readInt32BE=function(r,t){return r=r>>>0,t||A(r,4,this.length),this[r]<<24|this[r+1]<<16|this[r+2]<<8|this[r+3]},c.prototype.readFloatLE=function(r,t){return r=r>>>0,t||A(r,4,this.length),u.read(this,r,!0,23,4)},c.prototype.readFloatBE=function(r,t){return r=r>>>0,t||A(r,4,this.length),u.read(this,r,!1,23,4)},c.prototype.readDoubleLE=function(r,t){return r=r>>>0,t||A(r,8,this.length),u.read(this,r,!0,52,8)},c.prototype.readDoubleBE=function(r,t){return r=r>>>0,t||A(r,8,this.length),u.read(this,r,!1,52,8)};function b(n,r,t,o,a,s){if(!c.isBuffer(n))throw new TypeError('"buffer" argument must be a Buffer instance');if(r>a||r<s)throw new RangeError('"value" argument is out of bounds');if(t+o>n.length)throw new RangeError("Index out of range")}c.prototype.writeUintLE=c.prototype.writeUIntLE=function(r,t,o,a){if(r=+r,t=t>>>0,o=o>>>0,!a){var s=Math.pow(2,8*o)-1;b(this,r,t,o,s,0)}var l=1,w=0;for(this[t]=r&255;++w<o&&(l*=256);)this[t+w]=r/l&255;return t+o},c.prototype.writeUintBE=c.prototype.writeUIntBE=function(r,t,o,a){if(r=+r,t=t>>>0,o=o>>>0,!a){var s=Math.pow(2,8*o)-1;b(this,r,t,o,s,0)}var l=o-1,w=1;for(this[t+l]=r&255;--l>=0&&(w*=256);)this[t+l]=r/w&255;return t+o},c.prototype.writeUint8=c.prototype.writeUInt8=function(r,t,o){return r=+r,t=t>>>0,o||b(this,r,t,1,255,0),this[t]=r&255,t+1},c.prototype.writeUint16LE=c.prototype.writeUInt16LE=function(r,t,o){return r=+r,t=t>>>0,o||b(this,r,t,2,65535,0),this[t]=r&255,this[t+1]=r>>>8,t+2},c.prototype.writeUint16BE=c.prototype.writeUInt16BE=function(r,t,o){return r=+r,t=t>>>0,o||b(this,r,t,2,65535,0),this[t]=r>>>8,this[t+1]=r&255,t+2},c.prototype.writeUint32LE=c.prototype.writeUInt32LE=function(r,t,o){return r=+r,t=t>>>0,o||b(this,r,t,4,4294967295,0),this[t+3]=r>>>24,this[t+2]=r>>>16,this[t+1]=r>>>8,this[t]=r&255,t+4},c.prototype.writeUint32BE=c.prototype.writeUInt32BE=function(r,t,o){return r=+r,t=t>>>0,o||b(this,r,t,4,4294967295,0),this[t]=r>>>24,this[t+1]=r>>>16,this[t+2]=r>>>8,this[t+3]=r&255,t+4},c.prototype.writeIntLE=function(r,t,o,a){if(r=+r,t=t>>>0,!a){var s=Math.pow(2,8*o-1);b(this,r,t,o,s-1,-s)}var l=0,w=1,x=0;for(this[t]=r&255;++l<o&&(w*=256);)r<0&&x===0&&this[t+l-1]!==0&&(x=1),this[t+l]=(r/w>>0)-x&255;return t+o},c.prototype.writeIntBE=function(r,t,o,a){if(r=+r,t=t>>>0,!a){var s=Math.pow(2,8*o-1);b(this,r,t,o,s-1,-s)}var l=o-1,w=1,x=0;for(this[t+l]=r&255;--l>=0&&(w*=256);)r<0&&x===0&&this[t+l+1]!==0&&(x=1),this[t+l]=(r/w>>0)-x&255;return t+o},c.prototype.writeInt8=function(r,t,o){return r=+r,t=t>>>0,o||b(this,r,t,1,127,-128),r<0&&(r=255+r+1),this[t]=r&255,t+1},c.prototype.writeInt16LE=function(r,t,o){return r=+r,t=t>>>0,o||b(this,r,t,2,32767,-32768),this[t]=r&255,this[t+1]=r>>>8,t+2},c.prototype.writeInt16BE=function(r,t,o){return r=+r,t=t>>>0,o||b(this,r,t,2,32767,-32768),this[t]=r>>>8,this[t+1]=r&255,t+2},c.prototype.writeInt32LE=function(r,t,o){return r=+r,t=t>>>0,o||b(this,r,t,4,2147483647,-2147483648),this[t]=r&255,this[t+1]=r>>>8,this[t+2]=r>>>16,this[t+3]=r>>>24,t+4},c.prototype.writeInt32BE=function(r,t,o){return r=+r,t=t>>>0,o||b(this,r,t,4,2147483647,-2147483648),r<0&&(r=4294967295+r+1),this[t]=r>>>24,this[t+1]=r>>>16,this[t+2]=r>>>8,this[t+3]=r&255,t+4};function dr(n,r,t,o,a,s){if(t+o>n.length)throw new RangeError("Index out of range");if(t<0)throw new RangeError("Index out of range")}function _r(n,r,t,o,a){return r=+r,t=t>>>0,a||dr(n,r,t,4),u.write(n,r,t,o,23,4),t+4}c.prototype.writeFloatLE=function(r,t,o){return _r(this,r,t,!0,o)},c.prototype.writeFloatBE=function(r,t,o){return _r(this,r,t,!1,o)};function Er(n,r,t,o,a){return r=+r,t=t>>>0,a||dr(n,r,t,8),u.write(n,r,t,o,52,8),t+8}c.prototype.writeDoubleLE=function(r,t,o){return Er(this,r,t,!0,o)},c.prototype.writeDoubleBE=function(r,t,o){return Er(this,r,t,!1,o)},c.prototype.copy=function(r,t,o,a){if(!c.isBuffer(r))throw new TypeError("argument should be a Buffer");if(o||(o=0),!a&&a!==0&&(a=this.length),t>=r.length&&(t=r.length),t||(t=0),a>0&&a<o&&(a=o),a===o||r.length===0||this.length===0)return 0;if(t<0)throw new RangeError("targetStart out of bounds");if(o<0||o>=this.length)throw new RangeError("Index out of range");if(a<0)throw new RangeError("sourceEnd out of bounds");a>this.length&&(a=this.length),r.length-t<a-o&&(a=r.length-t+o);var s=a-o;return this===r&&typeof Uint8Array.prototype.copyWithin=="function"?this.copyWithin(t,o,a):Uint8Array.prototype.set.call(r,this.subarray(o,a),t),s},c.prototype.fill=function(r,t,o,a){if(typeof r=="string"){if(typeof t=="string"?(a=t,t=0,o=this.length):typeof o=="string"&&(a=o,o=this.length),a!==void 0&&typeof a!="string")throw new TypeError("encoding must be a string");if(typeof a=="string"&&!c.isEncoding(a))throw new TypeError("Unknown encoding: "+a);if(r.length===1){var s=r.charCodeAt(0);(a==="utf8"&&s<128||a==="latin1")&&(r=s)}}else typeof r=="number"?r=r&255:typeof r=="boolean"&&(r=Number(r));if(t<0||this.length<t||this.length<o)throw new RangeError("Out of range index");if(o<=t)return this;t=t>>>0,o=o===void 0?this.length:o>>>0,r||(r=0);var l;if(typeof r=="number")for(l=t;l<o;++l)this[l]=r;else{var w=c.isBuffer(r)?r:c.from(r,a),x=w.length;if(x===0)throw new TypeError('The value "'+r+'" is invalid for argument "value"');for(l=0;l<o-t;++l)this[l+t]=w[l%x]}return this};var rt=/[^+/0-9A-Za-z-_]/g;function tt(n){if(n=n.split("=")[0],n=n.trim().replace(rt,""),n.length<2)return"";for(;n.length%4!==0;)n=n+"=";return n}function rr(n,r){r=r||1/0;for(var t,o=n.length,a=null,s=[],l=0;l<o;++l){if(t=n.charCodeAt(l),t>55295&&t<57344){if(!a){if(t>56319){(r-=3)>-1&&s.push(239,191,189);continue}else if(l+1===o){(r-=3)>-1&&s.push(239,191,189);continue}a=t;continue}if(t<56320){(r-=3)>-1&&s.push(239,191,189),a=t;continue}t=(a-55296<<10|t-56320)+65536}else a&&(r-=3)>-1&&s.push(239,191,189);if(a=null,t<128){if((r-=1)<0)break;s.push(t)}else if(t<2048){if((r-=2)<0)break;s.push(t>>6|192,t&63|128)}else if(t<65536){if((r-=3)<0)break;s.push(t>>12|224,t>>6&63|128,t&63|128)}else if(t<1114112){if((r-=4)<0)break;s.push(t>>18|240,t>>12&63|128,t>>6&63|128,t&63|128)}else throw new Error("Invalid code point")}return s}function et(n){for(var r=[],t=0;t<n.length;++t)r.push(n.charCodeAt(t)&255);return r}function nt(n,r){for(var t,o,a,s=[],l=0;l<n.length&&!((r-=2)<0);++l)t=n.charCodeAt(l),o=t>>8,a=t%256,s.push(a),s.push(o);return s}function gr(n){return i.toByteArray(tt(n))}function z(n,r,t,o){for(var a=0;a<o&&!(a+t>=r.length||a>=n.length);++a)r[a+t]=n[a];return a}function C(n,r){return n instanceof r||n!=null&&n.constructor!=null&&n.constructor.name!=null&&n.constructor.name===r.name}function tr(n){return n!==n}var it=function(){for(var n="0123456789abcdef",r=new Array(256),t=0;t<16;++t)for(var o=t*16,a=0;a<16;++a)r[o+a]=n[t]+n[a];return r}()})(yt);var Cr={exports:{}},v=Cr.exports={},k,S;function or(){throw new Error("setTimeout has not been defined")}function ur(){throw new Error("clearTimeout has not been defined")}(function(){try{typeof setTimeout=="function"?k=setTimeout:k=or}catch{k=or}try{typeof clearTimeout=="function"?S=clearTimeout:S=ur}catch{S=ur}})();function kr(e){if(k===setTimeout)return setTimeout(e,0);if((k===or||!k)&&setTimeout)return k=setTimeout,setTimeout(e,0);try{return k(e,0)}catch{try{return k.call(null,e,0)}catch{return k.call(this,e,0)}}}function Ft(e){if(S===clearTimeout)return clearTimeout(e);if((S===ur||!S)&&clearTimeout)return S=clearTimeout,clearTimeout(e);try{return S(e)}catch{try{return S.call(null,e)}catch{return S.call(this,e)}}}var M=[],W=!1,H,Q=-1;function At(){!W||!H||(W=!1,H.length?M=H.concat(M):Q=-1,M.length&&Sr())}function Sr(){if(!W){var e=kr(At);W=!0;for(var i=M.length;i;){for(H=M,M=[];++Q<i;)H&&H[Q].run();Q=-1,i=M.length}H=null,W=!1,Ft(e)}}v.nextTick=function(e){var i=new Array(arguments.length-1);if(arguments.length>1)for(var u=1;u<arguments.length;u++)i[u-1]=arguments[u];M.push(new Lr(e,i)),M.length===1&&!W&&kr(Sr)};function Lr(e,i){this.fun=e,this.array=i}Lr.prototype.run=function(){this.fun.apply(null,this.array)};v.title="browser";v.browser=!0;v.env={};v.argv=[];v.version="";v.versions={};function N(){}v.on=N;v.addListener=N;v.once=N;v.off=N;v.removeListener=N;v.removeAllListeners=N;v.emit=N;v.prependListener=N;v.prependOnceListener=N;v.listeners=function(e){return[]};v.binding=function(e){throw new Error("process.binding is not supported")};v.cwd=function(){return"/"};v.chdir=function(e){throw new Error("process.chdir is not supported")};v.umask=function(){return 0};var Bt=Cr.exports;const ce=pt(Bt);var Tt=function(e){function i(){var f=this||self;return delete e.prototype.__magic__,f}if(typeof globalThis=="object")return globalThis;if(this)return i();e.defineProperty(e.prototype,"__magic__",{configurable:!0,get:i});var u=__magic__;return u}(Object),fe=Tt;let Z=!1;function se(){Z=!0}function le(){Z=!1}function bt(e,i,u,f){for(;e<i;){const h=e+(i-e>>1);u(h)<=f?e=h+1:i=h}return e}function Ut(e){if(e.hydrate_init)return;e.hydrate_init=!0;let i=e.childNodes;if(e.nodeName==="HEAD"){const m=[];for(let d=0;d<i.length;d++){const _=i[d];_.claim_order!==void 0&&m.push(_)}i=m}const u=new Int32Array(i.length+1),f=new Int32Array(i.length);u[0]=-1;let h=0;for(let m=0;m<i.length;m++){const d=i[m].claim_order,_=(h>0&&i[u[h]].claim_order<=d?h+1:bt(1,h,I=>i[u[I]].claim_order,d))-1;f[m]=u[_]+1;const F=_+1;u[F]=m,h=Math.max(F,h)}const y=[],p=[];let c=i.length-1;for(let m=u[h]+1;m!=0;m=f[m-1]){for(y.push(i[m-1]);c>=m;c--)p.push(i[c]);c--}for(;c>=0;c--)p.push(i[c]);y.reverse(),p.sort((m,d)=>m.claim_order-d.claim_order);for(let m=0,d=0;m<p.length;m++){for(;d<y.length&&p[m].claim_order>=y[d].claim_order;)d++;const _=d<y.length?y[d]:null;e.insertBefore(p[m],_)}}function It(e,i){if(Z){for(Ut(e),(e.actual_end_child===void 0||e.actual_end_child!==null&&e.actual_end_child.parentNode!==e)&&(e.actual_end_child=e.firstChild);e.actual_end_child!==null&&e.actual_end_child.claim_order===void 0;)e.actual_end_child=e.actual_end_child.nextSibling;i!==e.actual_end_child?(i.claim_order!==void 0||i.parentNode!==e)&&e.insertBefore(i,e.actual_end_child):e.actual_end_child=i.nextSibling}else(i.parentNode!==e||i.nextSibling!==null)&&e.appendChild(i)}function Ct(e,i,u){e.insertBefore(i,u||null)}function kt(e,i,u){Z&&!u?It(e,i):(i.parentNode!==e||i.nextSibling!=u)&&e.insertBefore(i,u||null)}function ar(e){e.parentNode&&e.parentNode.removeChild(e)}function he(e,i){for(let u=0;u<e.length;u+=1)e[u]&&e[u].d(i)}function Mr(e){return document.createElement(e)}function Nr(e){return document.createElementNS("http://www.w3.org/2000/svg",e)}function lr(e){return document.createTextNode(e)}function pe(){return lr(" ")}function ye(){return lr("")}function me(e,i,u,f){return e.addEventListener(i,u,f),()=>e.removeEventListener(i,u,f)}function we(e){return function(i){return i.preventDefault(),e.call(this,i)}}function hr(e,i,u){u==null?e.removeAttribute(i):e.getAttribute(i)!==u&&e.setAttribute(i,u)}const St=["width","height"];function Lt(e,i){const u=Object.getOwnPropertyDescriptors(e.__proto__);for(const f in i)i[f]==null?e.removeAttribute(f):f==="style"?e.style.cssText=i[f]:f==="__value"?e.value=e[f]=i[f]:u[f]&&u[f].set&&St.indexOf(f)===-1?e[f]=i[f]:hr(e,f,i[f])}function xe(e,i){for(const u in i)hr(e,u,i[u])}function Mt(e,i){Object.keys(i).forEach(u=>{Nt(e,u,i[u])})}function Nt(e,i,u){i in e?e[i]=typeof e[i]=="boolean"&&u===""?!0:u:hr(e,i,u)}function de(e){return/-/.test(e)?Mt:Lt}function _e(e){return e.dataset.svelteH}function Ee(e){return Array.from(e.childNodes)}function Dr(e){e.claim_info===void 0&&(e.claim_info={last_index:0,total_claimed:0})}function Rr(e,i,u,f,h=!1){Dr(e);const y=(()=>{for(let p=e.claim_info.last_index;p<e.length;p++){const c=e[p];if(i(c)){const m=u(c);return m===void 0?e.splice(p,1):e[p]=m,h||(e.claim_info.last_index=p),c}}for(let p=e.claim_info.last_index-1;p>=0;p--){const c=e[p];if(i(c)){const m=u(c);return m===void 0?e.splice(p,1):e[p]=m,h?m===void 0&&e.claim_info.last_index--:e.claim_info.last_index=p,c}}return f()})();return y.claim_order=e.claim_info.total_claimed,e.claim_info.total_claimed+=1,y}function Hr(e,i,u,f){return Rr(e,h=>h.nodeName===i,h=>{const y=[];for(let p=0;p<h.attributes.length;p++){const c=h.attributes[p];u[c.name]||y.push(c.name)}y.forEach(p=>h.removeAttribute(p))},()=>f(i))}function ge(e,i,u){return Hr(e,i,u,Mr)}function ve(e,i,u){return Hr(e,i,u,Nr)}function Dt(e,i){return Rr(e,u=>u.nodeType===3,u=>{const f=""+i;if(u.data.startsWith(f)){if(u.data.length!==f.length)return u.splitText(f.length)}else u.data=f},()=>lr(i),!0)}function Fe(e){return Dt(e," ")}function Ar(e,i,u){for(let f=u;f<e.length;f+=1){const h=e[f];if(h.nodeType===8&&h.textContent.trim()===i)return f}return-1}function Ae(e,i){const u=Ar(e,"HTML_TAG_START",0),f=Ar(e,"HTML_TAG_END",u+1);if(u===-1||f===-1)return new Br(i);Dr(e);const h=e.splice(u,f-u+1);ar(h[0]),ar(h[h.length-1]);const y=h.slice(1,h.length-1);for(const p of y)p.claim_order=e.claim_info.total_claimed,e.claim_info.total_claimed+=1;return new Br(i,y)}function Rt(e,i){i=""+i,e.data!==i&&(e.data=i)}function Ht(e,i){i=""+i,e.wholeText!==i&&(e.data=i)}function Be(e,i,u){~ht.indexOf(u)?Ht(e,i):Rt(e,i)}function Te(e,i){e.value=i??""}function be(e,i,u,f){u==null?e.style.removeProperty(i):e.style.setProperty(i,u,f?"important":"")}function Ue(e,i,u){for(let f=0;f<e.options.length;f+=1){const h=e.options[f];if(h.__value===i){h.selected=!0;return}}(!u||i!==void 0)&&(e.selectedIndex=-1)}function Ie(e){const i=e.querySelector(":checked");return i&&i.__value}function Ot(e,i,{bubbles:u=!1,cancelable:f=!1}={}){return new CustomEvent(e,{detail:i,bubbles:u,cancelable:f})}function Ce(e,i){const u=[];let f=0;for(const h of i.childNodes)if(h.nodeType===8){const y=h.textContent.trim();y===`HEAD_${e}_END`?(f-=1,u.push(h)):y===`HEAD_${e}_START`&&(f+=1,u.push(h))}else f>0&&u.push(h);return u}class jt{constructor(i=!1){R(this,"is_svg",!1);R(this,"e");R(this,"n");R(this,"t");R(this,"a");this.is_svg=i,this.e=this.n=null}c(i){this.h(i)}m(i,u,f=null){this.e||(this.is_svg?this.e=Nr(u.nodeName):this.e=Mr(u.nodeType===11?"TEMPLATE":u.nodeName),this.t=u.tagName!=="TEMPLATE"?u:u.content,this.c(i)),this.i(f)}h(i){this.e.innerHTML=i,this.n=Array.from(this.e.nodeName==="TEMPLATE"?this.e.content.childNodes:this.e.childNodes)}i(i){for(let u=0;u<this.n.length;u+=1)Ct(this.t,this.n[u],i)}p(i){this.d(),this.h(i),this.i(this.a)}d(){this.n.forEach(ar)}}class Br extends jt{constructor(u=!1,f){super(u);R(this,"l");this.e=this.n=null,this.l=f}c(u){this.l?this.n=this.l:super.c(u)}i(u){for(let f=0;f<this.n.length;f+=1)kt(this.t,this.n[f],u)}}function ke(e,i){return new e(i)}let V;function nr(e){V=e}function G(){if(!V)throw new Error("Function called outside component initialization");return V}function Se(e){G().$$.on_mount.push(e)}function Le(e){G().$$.after_update.push(e)}function Me(e){G().$$.on_destroy.push(e)}function Ne(){const e=G();return(i,u,{cancelable:f=!1}={})=>{const h=e.$$.callbacks[i];if(h){const y=Ot(i,u,{cancelable:f});return h.slice().forEach(p=>{p.call(e,y)}),!y.defaultPrevented}return!0}}function De(e,i){return G().$$.context.set(e,i),i}function Re(e){return G().$$.context.get(e)}function He(e,i){const u=e.$$.callbacks[i.type];u&&u.slice().forEach(f=>f.call(this,i))}const X=[],Tr=[];let q=[];const cr=[],Or=Promise.resolve();let fr=!1;function Wt(){fr||(fr=!0,Or.then(Gt))}function Oe(){return Wt(),Or}function qt(e){q.push(e)}function je(e){cr.push(e)}const ir=new Set;let j=0;function Gt(){if(j!==0)return;const e=V;do{try{for(;j<X.length;){const i=X[j];j++,nr(i),Yt(i.$$)}}catch(i){throw X.length=0,j=0,i}for(nr(null),X.length=0,j=0;Tr.length;)Tr.pop()();for(let i=0;i<q.length;i+=1){const u=q[i];ir.has(u)||(ir.add(u),u())}q.length=0}while(X.length);for(;cr.length;)cr.pop()();fr=!1,ir.clear(),nr(e)}function Yt(e){if(e.fragment!==null){e.update(),ft(e.before_update);const i=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,i),e.after_update.forEach(qt)}}function We(e){const i=[],u=[];q.forEach(f=>e.indexOf(f)===-1?i.push(f):u.push(f)),u.forEach(f=>f()),q=i}export{de as $,st as A,ft as B,ee as C,G as D,De as E,te as F,me as G,pt as H,yt as I,je as J,Vt as K,_e as L,br as M,Nr as N,ve as O,It as P,ie as Q,we as R,Ce as S,Re as T,Be as U,ne as V,oe as W,Me as X,He as Y,xe as Z,fe as _,pe as a,he as a0,Br as a1,Ae as a2,Te as a3,Xt as a4,nr as a5,Gt as a6,Ne as a7,Ie as a8,qt as a9,Ue as aa,ae as ab,ce as ac,lt as ad,zt as ae,Qt as af,We as ag,V as ah,ct as ai,X as aj,Wt as ak,se as al,le as am,Le as b,Fe as c,ar as d,ye as e,Mr as f,ge as g,Ee as h,kt as i,hr as j,be as k,lr as l,Dt as m,Rt as n,Se as o,Tr as p,ke as q,Kt as r,Jt as s,Oe as t,at as u,Lt as v,ue as w,$t as x,re as y,Zt as z};
