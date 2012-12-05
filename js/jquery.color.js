(function(o,d){var k="backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor",h=/^([\-+])=\s*(\d+\.?\d*)/,g=[{re:/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,parse:function(p){return[p[1],p[2],p[3],p[4]]}},{re:/rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,parse:function(p){return[p[1]*2.55,p[2]*2.55,p[3]*2.55,p[4]]}},{re:/#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,parse:function(p){return[parseInt(p[1],16),parseInt(p[2],16),parseInt(p[3],16)]}},{re:/#([a-f0-9])([a-f0-9])([a-f0-9])/,parse:function(p){return[parseInt(p[1]+p[1],16),parseInt(p[2]+p[2],16),parseInt(p[3]+p[3],16)]}},{re:/hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,space:"hsla",parse:function(p){return[p[1],p[2]/100,p[3]/100,p[4]]}}],e=o.Color=function(q,r,p,s){return new o.Color.fn.parse(q,r,p,s)},j={rgba:{props:{red:{idx:0,type:"byte"},green:{idx:1,type:"byte"},blue:{idx:2,type:"byte"}}},hsla:{props:{hue:{idx:0,type:"degrees"},saturation:{idx:1,type:"percent"},lightness:{idx:2,type:"percent"}}}},n={"byte":{floor:true,max:255},percent:{max:1},degrees:{mod:360,floor:true}},m=e.support={},b=o("<p>")[0],a,l=o.each;b.style.cssText="background-color:rgba(1,1,1,.5)";m.rgba=b.style.backgroundColor.indexOf("rgba")>-1;l(j,function(p,q){q.cache="_"+p;q.props.alpha={idx:3,type:"percent",def:1}});function i(q,s,r){var p=n[s.type]||{};if(q==null){return(r||!s.def)?null:s.def}q=p.floor?~~q:parseFloat(q);if(isNaN(q)){return s.def}if(p.mod){return(q+p.mod)%p.mod}return 0>q?0:p.max<q?p.max:q}function f(p){var r=e(),q=r._rgba=[];p=p.toLowerCase();l(g,function(w,x){var u,v=x.re.exec(p),t=v&&x.parse(v),s=x.space||"rgba";if(t){u=r[s](t);r[j[s].cache]=u[j[s].cache];q=r._rgba=u._rgba;return false}});if(q.length){if(q.join()==="0,0,0,0"){o.extend(q,a.transparent)}return r}return a[p]}e.fn=o.extend(e.prototype,{parse:function(v,t,p,u){if(v===d){this._rgba=[null,null,null,null];return this}if(v.jquery||v.nodeType){v=o(v).css(t);t=d}var s=this,r=o.type(v),q=this._rgba=[];if(t!==d){v=[v,t,p,u];r="array"}if(r==="string"){return this.parse(f(v)||a._default)}if(r==="array"){l(j.rgba.props,function(w,x){q[x.idx]=i(v[x.idx],x)});return this}if(r==="object"){if(v instanceof e){l(j,function(w,x){if(v[x.cache]){s[x.cache]=v[x.cache].slice()}})}else{l(j,function(x,y){var w=y.cache;l(y.props,function(z,A){if(!s[w]&&y.to){if(z==="alpha"||v[z]==null){return}s[w]=y.to(s._rgba)}s[w][A.idx]=i(v[z],A,true)});if(s[w]&&o.inArray(null,s[w].slice(0,3))<0){s[w][3]=1;if(y.from){s._rgba=y.from(s[w])}}})}return this}},is:function(r){var p=e(r),s=true,q=this;l(j,function(t,v){var w,u=p[v.cache];if(u){w=q[v.cache]||v.to&&v.to(q._rgba)||[];l(v.props,function(x,y){if(u[y.idx]!=null){s=(u[y.idx]===w[y.idx]);return s}})}return s});return s},_space:function(){var p=[],q=this;l(j,function(r,s){if(q[s.cache]){p.push(r)}});return p.pop()},transition:function(q,w){var r=e(q),s=r._space(),t=j[s],u=this.alpha()===0?e("transparent"):this,v=u[t.cache]||t.to(u._rgba),p=v.slice();r=r[t.cache];l(t.props,function(A,C){var z=C.idx,y=v[z],x=r[z],B=n[C.type]||{};if(x===null){return}if(y===null){p[z]=x}else{if(B.mod){if(x-y>B.mod/2){y+=B.mod}else{if(y-x>B.mod/2){y-=B.mod}}}p[z]=i((x-y)*w+y,C)}});return this[s](p)},blend:function(s){if(this._rgba[3]===1){return this}var r=this._rgba.slice(),q=r.pop(),p=e(s)._rgba;return e(o.map(r,function(t,u){return(1-q)*p[u]+q*t}))},toRgbaString:function(){var q="rgba(",p=o.map(this._rgba,function(r,s){return r==null?(s>2?1:0):r});if(p[3]===1){p.pop();q="rgb("}return q+p.join()+")"},toHslaString:function(){var q="hsla(",p=o.map(this.hsla(),function(r,s){if(r==null){r=s>2?1:0}if(s&&s<3){r=Math.round(r*100)+"%"}return r});if(p[3]===1){p.pop();q="hsl("}return q+p.join()+")"},toHexString:function(p){var q=this._rgba.slice(),r=q.pop();if(p){q.push(~~(r*255))}return"#"+o.map(q,function(s){s=(s||0).toString(16);return s.length===1?"0"+s:s}).join("")},toString:function(){return this._rgba[3]===0?"transparent":this.toRgbaString()}});e.fn.parse.prototype=e.fn;function c(t,s,r){r=(r+1)%1;if(r*6<1){return t+(s-t)*r*6}if(r*2<1){return s}if(r*3<2){return t+(s-t)*((2/3)-r)*6}return t}j.hsla.to=function(t){if(t[0]==null||t[1]==null||t[2]==null){return[null,null,null,t[3]]}var p=t[0]/255,w=t[1]/255,x=t[2]/255,z=t[3],y=Math.max(p,w,x),u=Math.min(p,w,x),A=y-u,B=y+u,q=B*0.5,v,C;if(u===y){v=0}else{if(p===y){v=(60*(w-x)/A)+360}else{if(w===y){v=(60*(x-p)/A)+120}else{v=(60*(p-w)/A)+240}}}if(A===0){C=0}else{if(q<=0.5){C=A/B}else{C=A/(2-B)}}return[Math.round(v)%360,C,q,z==null?1:z]};j.hsla.from=function(w){if(w[0]==null||w[1]==null||w[2]==null){return[null,null,null,w[3]]}var v=w[0]/360,u=w[1],t=w[2],r=w[3],x=t<=0.5?t*(1+u):t+u-t*u,y=2*t-x;return[Math.round(c(y,x,v+(1/3))*255),Math.round(c(y,x,v)*255),Math.round(c(y,x,v-(1/3))*255),r]};l(j,function(q,s){var r=s.props,p=s.cache,u=s.to,t=s.from;e.fn[q]=function(z){if(u&&!this[p]){this[p]=u(this._rgba)}if(z===d){return this[p].slice()}var w,y=o.type(z),v=(y==="array"||y==="object")?z:arguments,x=this[p].slice();l(r,function(A,C){var B=v[y==="object"?A:C.idx];if(B==null){B=x[C.idx]}x[C.idx]=i(B,C)});if(t){w=e(t(x));w[p]=x;return w}else{return e(x)}};l(r,function(v,w){if(e.fn[v]){return}e.fn[v]=function(A){var C=o.type(A),z=(v==="alpha"?(this._hsla?"hsla":"rgba"):q),y=this[z](),B=y[w.idx],x;if(C==="undefined"){return B}if(C==="function"){A=A.call(this,B);C=o.type(A)}if(A==null&&w.empty){return this}if(C==="string"){x=h.exec(A);if(x){A=B+parseFloat(x[2])*(x[1]==="+"?1:-1)}}y[w.idx]=A;return this[z](y)}})});e.hook=function(q){var p=q.split(" ");l(p,function(r,s){o.cssHooks[s]={set:function(w,x){var u,v,t="";if(o.type(x)!=="string"||(u=f(x))){x=e(u||x);if(!m.rgba&&x._rgba[3]!==1){v=s==="backgroundColor"?w.parentNode:w;while((t===""||t==="transparent")&&v&&v.style){try{t=o.css(v,"backgroundColor");v=v.parentNode}catch(y){}}x=x.blend(t&&t!=="transparent"?t:"_default")}x=x.toRgbaString()}try{w.style[s]=x}catch(y){}}};o.fx.step[s]=function(t){if(!t.colorInit){t.start=e(t.elem,s);t.end=e(t.end);t.colorInit=true}o.cssHooks[s].set(t.elem,t.start.transition(t.end,t.pos))}})};e.hook(k);o.cssHooks.borderColor={expand:function(q){var p={};l(["Top","Right","Bottom","Left"],function(s,r){p["border"+r+"Color"]=q});return p}}})(jQuery);