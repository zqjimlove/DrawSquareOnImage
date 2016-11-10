(function () {
    var DrawOnImage = (function () {
        /**
         * constructor
         * @param  {Object} _options
         */
        function DrawOnImage(_options) {
            this.defaultOptions = {
                penColor: 'red',
                penSize: 2,
                penStyle: 'solid'
            };
            this.idgen = 1; // idgenerator
            this.canDraw = false;
            this.graphArray = {}; // map of graph object 
            this.eventMap = {};
            this.readyStatus = false;
            this.options = Object.assign({}, this.defaultOptions, _options);
            this.render();
        }
        /**
         * reset options
         * @param  {Object} _options
         */
        DrawOnImage.prototype.setOptions = function (_options) {
            this.options = Object.assign({}, this.defaultOptions, _options);
        };
        /**
         * Start to draw
         */
        DrawOnImage.prototype.start = function () {
            this.canDraw = true;
            this.imageParentElement.style.cursor = 'crosshair';
        };
        /**
         * stop to draw
         */
        DrawOnImage.prototype.stop = function () {
            this.canDraw = false;
            this.imageParentElement.style.cursor = 'auto';
        };
        /**
         * Add the graphs list
         * @param  {Array} datas
         */
        DrawOnImage.prototype.addGraphs = function (datas) {
            for (var i = datas.length - 1; i >= 0; i--) {
                this.addGraph(datas[i]);
            }
        };
        /**
         * Add a graph
         * @param  {Object} data
         * @example
         *  {
                x:Number, //start X
                y:Number, //start Y
                w:Number,
                h:Number,
            }
         */
        DrawOnImage.prototype.addGraph = function (data) {
            if (!this.readyStatus) {
                var self_1 = this;
                this.on('ready', function () {
                    self_1.addGraph(data);
                });
                return;
            }
            var graphElement = this.createGraphElement(data.x * this.scale, data.y * this.scale);
            graphElement.DOI_DATA.w = (data.w * this.scale);
            graphElement.DOI_DATA.h = (data.h * this.scale);
            graphElement.style.width = graphElement.DOI_DATA.w + 'px';
            graphElement.style.height = graphElement.DOI_DATA.h + 'px';
            this.imageParentElement.appendChild(graphElement);
            this.graphArray[graphElement.DOI_DATA.id] = graphElement;
            this.fire('addedGraph', this.getGraphData(graphElement));
        };
        /**
         * removeGraph
         * @param  {} id
         */
        DrawOnImage.prototype.removeGraph = function (id) {
            var el = this.graphArray[id];
            if (!el)
                return;
            this.imageParentElement.removeChild(el);
            delete this.graphArray[id];
            this.fire('removeGraph', this.getGraphData(el));
        };
        /**
         * clearGraph
         */
        DrawOnImage.prototype.clearGraph = function () {
            for (var id in this.graphArray) {
                this.removeGraph(id);
            }
        };
        DrawOnImage.prototype.on = function (eventName, callback) {
            if (eventName === 'ready' && this.readyStatus) {
                callback.call(this);
                return;
            }
            var events = this.eventMap[eventName] || [];
            events.push(callback);
            this.eventMap[eventName] = events;
        };
        DrawOnImage.prototype.fire = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var events = this.eventMap[args[0]] || [];
            for (var i = events.length - 1; i >= 0; i--) {
                var event = events[i];
                event.apply(this, Array.prototype.slice.call(args, 1, args.length));
            }
        };
        DrawOnImage.prototype.render = function () {
            var targetId = this.options.target, imageElement = document.getElementById(targetId), imageParentElement = this.imageParentElement = imageElement.parentElement, imageSrc = imageElement.getAttribute('src');
            if (window.getComputedStyle(imageParentElement).position === 'static') {
                imageParentElement.style.position = 'relative';
            }
            this.bindEvent(imageElement, imageParentElement);
        };
        DrawOnImage.prototype.createGraphElement = function (x, y) {
            var graphElement = document.createElement('div');
            graphElement.style.position = 'absolute';
            graphElement.style.left = x + 'px';
            graphElement.style.top = y + 'px';
            graphElement.style.borderWidth = this.options.penSize + 'px';
            graphElement.style.borderStyle = this.options.penStyle;
            graphElement.style.borderColor = this.options.penColor;
            graphElement.className = 'DOI_GraphElement';
            graphElement.DOI_DATA = {
                id: this.idgen++,
                x: x,
                y: y
            };
            this.graphArray[graphElement.DOI_DATA.id] = graphElement;
            this.fire('createGraph', graphElement);
            return graphElement;
        };
        DrawOnImage.prototype.drawGraphElement = function (graphElement, cx, cy) {
            var maxWidth = 0, maxHeight = 0, wrapWidth = this.wrapWidth, wrapHeight = this.wrapHeight, startX = graphElement.DOI_DATA.x, startY = graphElement.DOI_DATA.y;
            var drawWidth = function (positiveX) {
                var w = Math.min(Math.abs(startX - cx), positiveX ? wrapWidth - startX : startX);
                graphElement.DOI_DATA.w = w;
                graphElement.style.width = w + 'px';
                if (positiveX) {
                    graphElement.style.left = 'auto';
                    graphElement.style.left = startX + 'px';
                }
                else {
                    graphElement.style.left = 'auto';
                    graphElement.style.right = (wrapWidth - startX) + 'px';
                }
            };
            var drawHeight = function (positiveY) {
                var h = Math.min(Math.abs(startY - cy), positiveY ? wrapHeight - startY : startY);
                graphElement.DOI_DATA.h = h;
                graphElement.style.height = h + 'px';
                if (positiveY) {
                    graphElement.style.bottom = 'auto';
                    graphElement.style.top = startY + 'px';
                }
                else {
                    graphElement.style.top = 'auto';
                    graphElement.style.bottom = (wrapHeight - startY) + 'px';
                }
            };
            drawWidth(cx >= startX);
            drawHeight(cy >= startY);
            this.fire('drawing', this.getGraphData(graphElement));
        };
        DrawOnImage.prototype.getGraphData = function (element) {
            var result = {}, scale = this.scale, graphStyle = element.style, DOI_DATA = element.DOI_DATA;
            result.id = DOI_DATA.id;
            result._node = element;
            result.draw = {
                scale: scale,
                x: DOI_DATA.x,
                y: DOI_DATA.y,
                w: DOI_DATA.w,
                h: DOI_DATA.h,
                directionX: (graphStyle.left === 'auto') ? 'right' : 'left',
                directionY: (graphStyle.top === 'auto') ? 'bottom' : 'top'
            };
            result.w = Math.floor(DOI_DATA.w / scale);
            result.h = Math.floor(DOI_DATA.h / scale);
            if (graphStyle.left === 'auto') {
                result.x = Math.floor(DOI_DATA.x / scale - result.w);
            }
            else {
                result.x = Math.floor(DOI_DATA.x / scale);
            }
            if (graphStyle.top === 'auto') {
                result.y = Math.floor(DOI_DATA.y / scale - result.h);
            }
            else {
                result.y = Math.floor(DOI_DATA.y / scale);
            }
            return result;
        };
        DrawOnImage.prototype.bindEvent = function (imageElement, imageParentElement) {
            var _this = this;
            var startX, startY, drawing = false, tempGraphElement;
            var getX = function (event, IPEOffset) {
                return event.pageX - (IPEOffset.left + document.body.scrollLeft);
            };
            var getY = function (event, IPEOffset) {
                return event.pageY - (IPEOffset.top + document.body.scrollTop);
            };
            // mouse down to start draw
            imageParentElement.addEventListener('mousedown', function (event) {
                event.preventDefault();
                event.stopPropagation();
                if (event.which !== 1)
                    return;
                if (!_this.canDraw || drawing)
                    return;
                var IPEOffset = imageElement.getBoundingClientRect();
                drawing = true;
                startX = getX(event, IPEOffset);
                startY = getY(event, IPEOffset);
                tempGraphElement = _this.createGraphElement(startX, startY);
                imageParentElement.appendChild(tempGraphElement);
            });
            // mouse move to draw
            document.addEventListener('mousemove', throttle(function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (drawing) {
                    var IPEOffset = imageElement.getBoundingClientRect();
                    var cx = getX(e, IPEOffset), cy = getY(e, IPEOffset);
                    _this.drawGraphElement(tempGraphElement, cx, cy);
                }
            }, 28));
            // mouse up to stop draw
            document.addEventListener('mouseup', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (drawing) {
                    drawing = false;
                    _this.fire('addedGraph', _this.getGraphData(tempGraphElement));
                }
            });
            //wati the image loaded
            imageElement.addEventListener('load', function (e) {
                _this.readyStatus = true;
                _this.resetDrawConfig(imageElement, imageParentElement);
            });
            if (imageElement.complete) {
                this.readyStatus = true;
                this.resetDrawConfig(imageElement, imageParentElement);
            }
            //It`s reset all graph size when window resize ;
            var resizeTimer;
            window.addEventListener('resize', function (e) {
                if (resizeTimer) {
                    clearTimeout(resizeTimer);
                }
                resizeTimer = setTimeout(function () {
                    _this.onWindowResize(imageElement, imageParentElement);
                }, 100);
            });
        };
        DrawOnImage.prototype.onWindowResize = function (imageElement, imageParentElement) {
            var curWrapWidth = imageElement.offsetWidth, resizeScale = curWrapWidth / this.wrapWidth;
            for (var id in this.graphArray) {
                var graphElement = this.graphArray[id], DOI_DATA = graphElement.DOI_DATA;
                DOI_DATA.x = Math.floor(parseInt(graphElement.style.left === 'auto' ? graphElement.offsetRight : graphElement.offsetLeft) * resizeScale);
                DOI_DATA.y = Math.floor(parseInt(graphElement.style.top === 'auto' ? graphElement.offsetBottom : graphElement.offsetTop) * resizeScale);
                DOI_DATA.h = Math.floor(+graphElement.offsetHeight * resizeScale);
                DOI_DATA.w = Math.floor(+graphElement.offsetWidth * resizeScale);
                graphElement.style.width = DOI_DATA.w + 'px';
                graphElement.style.height = DOI_DATA.h + 'px';
                if (graphElement.style.left === 'auto') {
                    graphElement.style.right = DOI_DATA.x + 'px';
                }
                else {
                    graphElement.style.left = DOI_DATA.x + 'px';
                }
                if (graphElement.style.top === 'auto') {
                    graphElement.style.bottom = DOI_DATA.y + 'px';
                }
                else {
                    graphElement.style.top = DOI_DATA.y + 'px';
                }
            }
            this.resetDrawConfig(imageElement, imageParentElement);
        };
        DrawOnImage.prototype.resetDrawConfig = function (imageElement, imageParentElement) {
            this.wrapWidth = imageElement.offsetWidth;
            this.wrapHeight = imageElement.offsetHeight;
            this.scale = (+this.wrapWidth / imageElement.naturalWidth);
        };
        return DrawOnImage;
    }());
    window.DrawOnImage = DrawOnImage;
    // throttle
    function throttle(func, wait) {
        var timeout, context, args, result;
        var previous = 0;
        var later = function () {
            timeout = null;
            result = func.apply(context, args);
            if (!timeout)
                context = args = null;
        };
        var throttled = function () {
            var now = (new Date()).getTime();
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                result = func.apply(context, args);
                if (!timeout)
                    context = args = null;
            }
            else if (!timeout) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
        throttled.cancel = function () {
            clearTimeout(timeout);
            timeout = context = args = null;
        };
        return throttled;
    }
    //Polyfill for Object.assign
    if (typeof Object.assign != 'function') {
        (function () {
            Object.assign = function (target) {
                'use strict';
                // We must check against these specific cases.
                if (target === undefined || target === null) {
                    throw new TypeError('Cannot convert undefined or null to object');
                }
                var output = Object(target);
                for (var index = 1; index < arguments.length; index++) {
                    var source = arguments[index];
                    if (source !== undefined && source !== null) {
                        for (var nextKey in source) {
                            if (source.hasOwnProperty(nextKey)) {
                                output[nextKey] = source[nextKey];
                            }
                        }
                    }
                }
                return output;
            };
        })();
    }
})();
