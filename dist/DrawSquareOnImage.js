!function(t,e){function i(t,e){if(!e)return t;for(key in e)t[key]=e[key];return t}function r(t,e){var i,r,n,a,o=0,s=function(){i=null,a=t.apply(r,n),i||(r=n=null)},u=function(){var u=new Date,l=e-(u-o);return r=this,n=arguments,l<=0||l>e?(i&&(clearTimeout(i),i=null),o=u,a=t.apply(r,n),i||(r=n=null)):i||(i=setTimeout(s,l)),a};return u.cancel=function(){clearTimeout(i),i=r=n=null},u}function n(t){var e={penColor:"red",penSize:2,penStyle:"solid"};this.options=i(e,t),this.squareIdQueue=1,this.canDraw=!1,this._squareMap=[],this._eventMap={},this._renderer()}i(n.prototype,{_renderer:function(){var t=this.options.renderer,i=e.getElementById(t),r=i.parentElement,n=r.getBoundingClientRect(),a=i.offsetWidth,o=i.offsetHeight,s=i.getAttribute("src"),u=new Image,l=this;r.style.position||(r.style.position="relative"),u.onload=function(){l.bindEvent(i),l.scale=a/u.width,l.readyStatus=!0,l.fire("ready")},u.src=s,this.parentElement=r,this.eX=e.body.scrollLeft+n.left,this.eY=e.body.scrollTop+n.top,this.eWidth=a,this.eHeight=o},bindEvent:function(t){var i,n,a,o=this,s=t.parentElement.getBoundingClientRect(),u=e.body.scrollLeft+s.left,l=e.body.scrollTop+s.top;t.parentElement.addEventListener("mousedown",function(t){t.preventDefault(),t.stopPropagation(),!o.drawing&&o.canDraw&&(o.drawing=!0,n=t.pageX-u,a=t.pageY-l,i=o._initSquare(n,a),o.parentElement.appendChild(i))}),e.addEventListener("mousemove",r(function(t){t.preventDefault(),t.stopPropagation(),o.drawing&&o._drawSquareSize(i,t.pageX,t.pageY)},28)),e.addEventListener("mouseup",function(t){t.preventDefault(),t.stopPropagation(),o.drawing&&(o.drawing=!1,o.fire("addSquare",o._getSquareData(i)))})},startDraw:function(){this.canDraw=!0,this.parentElement.style.cursor="crosshair"},stopDraw:function(){this.canDraw=!1,this.parentElement.style.cursor="auto"},addSquares:function(t){for(var e=t.length-1;e>=0;e--)this.addSquare(t[e])},addSquare:function(t){if(!this.readyStatus){var e=this;return void this.on("ready",function(){e.addSquare(t)})}var i=this._initSquare(t.x*this.scale,t.y*this.scale);i.style.width=t.width*this.scale+"px",i.style.height=t.height*this.scale+"px",this.parentElement.appendChild(i),this.fire("addSquare",this._getSquareData(i))},removeSquare:function(t){var e=this._squareMap[t];e&&(this.parentElement.removeChild(e),delete this._squareMap[t])},clearSquare:function(){for(var t in this._squareMap)this.removeSquare(t)},_initSquare:function(t,e){var i=document.createElement("div"),r=this.options;return i.style.position="absolute",i.style.left=t+"px",i.style.top=e+"px",i.style.borderSize=r.penSize+"px",i.style.borderStyle=r.penStyle,i.style.borderColor=r.penColor,i.x=t,i.y=e,i.queueId=this.squareIdQueue++,this._squareMap[i.queueId]=i,i},_drawSquareSize:function(t,e,i){var r,n,a=this.eWidth,o=this.eHeight,s=t.x,u=t.y,l=0,h=0;curX=e-this.eX,curY=i-this.eY,curX>s?(l=this.eWidth-s,r=function(e){t.w=e,t.style.right="auto",t.style.left=s+"px",t.style.width=e+"px"}):curX<s&&(l=s,r=function(e){t.w=e,t.style.left="auto",t.style.right=a-s+"px",t.style.width=e+"px"}),curY>u?(h=this.eHeight-u,n=function(e){t.h=e,t.style.bottom="auto",t.style.top=u+"px",t.style.height=e+"px"}):curY<u&&(h=u,n=function(e){t.h=e,t.style.top="auto",t.style.bottom=o-u+"px",t.style.height=e+"px"}),r&&r(Math.min(Math.abs(s-curX),l)),n&&n(Math.min(Math.abs(u-curY),h))},_getSquareData:function(t){var e={},i=this.scale,r=t.style;return e.id=t.queueId,e._node=t,e.draw={scale:i,x:t.x,y:t.y,w:t.w,h:t.h,directionX:"auto"===r.left?"right":"left",directionY:"auto"===r.top?"bottom":"top"},e.width=Math.floor(t.w/i),e.height=Math.floor(t.h/i),"auto"===r.left?e.x=Math.floor(t.x/i-e.width):e.x=Math.floor(t.x/i),"auto"===r.top?e.y=Math.floor(t.y/i-e.height):e.y=Math.floor(t.y/i),e},on:function(t,e){if("ready"===t&&this.readyStatus)return void e.call(this);var i=this._eventMap[t]||[];i.push(e),this._eventMap[t]=i},fire:function(){for(var t=this._eventMap[arguments[0]]||[],e=t.length-1;e>=0;e--){var i=t[e];i.apply(this,Array.prototype.slice.call(arguments,1,arguments.length))}}}),t.DrawSquareOnImage=n}(this,document);