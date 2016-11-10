(() => {


    class DrawOnImage {
        public options: any;

        private defaultOptions: Object = {
            penColor: 'red',
            penSize: 2,
            penStyle: 'solid'
        };
        private idgen: number = 1; // idgenerator
        private canDraw: boolean = false;
        private graphArray: any = {}; // map of graph object 
        private eventMap: any = {};
        private wrapWidth: number; // Image Element width
        private wrapHeight: number;// Image Element height
        private scale: number; //Image Element Size : Nature Image Size 
        private readyStatus: Boolean = false;
        private imageParentElement: any;
        /**
         * constructor
         * @param  {Object} _options
         */
        constructor(_options) {
            this.options = (<any>Object).assign({}, this.defaultOptions, _options);
            this.render();
        }
        /**
         * reset options
         * @param  {Object} _options
         */
        public setOptions(_options) {
            this.options = (<any>Object).assign({}, this.defaultOptions, _options);
        }
        /**
         * Start to draw
         */
        public start() {
            this.canDraw = true;
            this.imageParentElement.style.cursor = 'crosshair';
        }
        /**
         * stop to draw
         */
        public stop() {
            this.canDraw = false;
            this.imageParentElement.style.cursor = 'auto';
        }
        /**
         * Add the graphs list
         * @param  {Array} datas
         */
        public addGraphs(datas) {
            for (var i = datas.length - 1; i >= 0; i--) {
                this.addGraph(datas[i]);
            }
        }
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
        public addGraph(data) {
            if (!this.readyStatus) {
                let self = this;
                this.on('ready', function () {
                    self.addGraph(data);
                })
                return;
            }
            let graphElement: any = this.createGraphElement(data.x * this.scale, data.y * this.scale);
            graphElement.DOI_DATA.w = (data.w * this.scale);
            graphElement.DOI_DATA.h = (data.h * this.scale);

            graphElement.style.width = graphElement.DOI_DATA.w + 'px';
            graphElement.style.height = graphElement.DOI_DATA.h + 'px';

            this.imageParentElement.appendChild(graphElement);
            this.graphArray[(<any>graphElement).DOI_DATA.id] = graphElement;
            this.fire('addedGraph', this.getGraphData(graphElement));
        }
        /**
         * removeGraph
         * @param  {} id
         */
        public removeGraph(id) {
            let el = this.graphArray[id];
            if (!el) return;
            this.imageParentElement.removeChild(el);
            delete this.graphArray[id];
            this.fire('removeGraph', this.getGraphData(el));
        }
        /**
         * clearGraph
         */
        public clearGraph() {
            for (var id in this.graphArray) {
                this.removeGraph(id);
            }
        }
        public on(eventName: string, callback: Function) {
            if (eventName === 'ready' && this.readyStatus) {
                callback.call(this);
                return;
            }
            var events = this.eventMap[eventName] || [];
            events.push(callback);
            this.eventMap[eventName] = events;
        }
        public fire(...args) {
            var events = this.eventMap[args[0]] || [];
            for (var i = events.length - 1; i >= 0; i--) {
                var event = events[i];
                event.apply(this, Array.prototype.slice.call(args, 1, args.length));
            }
        }
        private render() {
            let targetId = this.options.target,
                imageElement = document.getElementById(targetId),
                imageParentElement = this.imageParentElement = imageElement.parentElement,
                imageSrc = imageElement.getAttribute('src');

            if (window.getComputedStyle(imageParentElement).position === 'static') {
                imageParentElement.style.position = 'relative';
            }
            this.bindEvent(imageElement, imageParentElement);
        }
        private createGraphElement(x, y) {
            var graphElement = document.createElement('div');
            graphElement.style.position = 'absolute';
            graphElement.style.left = x + 'px';
            graphElement.style.top = y + 'px';
            graphElement.style.borderWidth = this.options.penSize + 'px';
            graphElement.style.borderStyle = this.options.penStyle;
            graphElement.style.borderColor = this.options.penColor;
            graphElement.className = 'DOI_GraphElement';
            (<any>graphElement).DOI_DATA = {
                id: this.idgen++,
                x: x,
                y: y
            }
            this.graphArray[(<any>graphElement).DOI_DATA.id] = graphElement;
            this.fire('createGraph', graphElement);
            return graphElement;
        }
        private drawGraphElement(graphElement, cx, cy) {
            let maxWidth = 0,
                maxHeight = 0,
                wrapWidth = this.wrapWidth,
                wrapHeight = this.wrapHeight,
                startX = graphElement.DOI_DATA.x,
                startY = graphElement.DOI_DATA.y;

            let drawWidth = (positiveX) => {
                let w = Math.min(Math.abs(startX - cx), positiveX ? wrapWidth - startX : startX);
                graphElement.DOI_DATA.w = w;
                graphElement.style.width = w + 'px';
                if (positiveX) {
                    graphElement.style.left = 'auto';
                    graphElement.style.left = startX + 'px';
                } else {
                    graphElement.style.left = 'auto';
                    graphElement.style.right = (wrapWidth - startX) + 'px';
                }
            };

            let drawHeight = (positiveY) => {
                let h = Math.min(Math.abs(startY - cy), positiveY ? wrapHeight - startY : startY);
                graphElement.DOI_DATA.h = h;
                graphElement.style.height = h + 'px';
                if (positiveY) {
                    graphElement.style.bottom = 'auto';
                    graphElement.style.top = startY + 'px';
                } else {
                    graphElement.style.top = 'auto';
                    graphElement.style.bottom = (wrapHeight - startY) + 'px';
                }
            };

            drawWidth(cx >= startX);
            drawHeight(cy >= startY);
            this.fire('drawing', this.getGraphData(graphElement));
        }
        private getGraphData(element) {
            var result: any = {},
                scale = this.scale,
                graphStyle = element.style,
                DOI_DATA = element.DOI_DATA;

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
            } else {
                result.x = Math.floor(DOI_DATA.x / scale);
            }

            if (graphStyle.top === 'auto') {
                result.y = Math.floor(DOI_DATA.y / scale - result.h);
            } else {
                result.y = Math.floor(DOI_DATA.y / scale);
            }
            return result;
        }
        private bindEvent(imageElement, imageParentElement) {


            let startX, startY, drawing = false, tempGraphElement;
            let getX = (event, IPEOffset) => {
                return event.pageX - (IPEOffset.left + document.body.scrollLeft);
            }

            let getY = (event, IPEOffset) => {
                return event.pageY - (IPEOffset.top + document.body.scrollTop);
            }

            // mouse down to start draw
            imageParentElement.addEventListener('mousedown', event => {
                event.preventDefault();
                event.stopPropagation();
                if (event.which !== 1) return;
                if (!this.canDraw || drawing) return;

                let IPEOffset = imageElement.getBoundingClientRect();
                drawing = true;
                startX = getX(event, IPEOffset);
                startY = getY(event, IPEOffset);
                tempGraphElement = this.createGraphElement(startX, startY);
                imageParentElement.appendChild(tempGraphElement);
            });

            // mouse move to draw
            document.addEventListener('mousemove', throttle((e) => {
                e.preventDefault();
                e.stopPropagation();
                if (drawing) {
                    let IPEOffset = imageElement.getBoundingClientRect();
                    let cx = getX(e, IPEOffset),
                        cy = getY(e, IPEOffset);
                    this.drawGraphElement(tempGraphElement, cx, cy);
                }
            }, 28));

            // mouse up to stop draw
            document.addEventListener('mouseup', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (drawing) {
                    drawing = false;
                    this.fire('addedGraph', this.getGraphData(tempGraphElement));
                }
            });

            //wati the image loaded
            imageElement.addEventListener('load', (e) => {
                this.readyStatus = true;
                this.resetDrawConfig(imageElement, imageParentElement);
            });
            if (imageElement.complete) {
                this.readyStatus = true;
                this.resetDrawConfig(imageElement, imageParentElement);
            }

            //It`s reset all graph size when window resize ;
            let resizeTimer;
            window.addEventListener('resize', (e) => {
                if (resizeTimer) {
                    clearTimeout(resizeTimer);
                }
                resizeTimer = setTimeout(() => {
                    this.onWindowResize(imageElement, imageParentElement)
                }, 100);
            });
        }
        private onWindowResize(imageElement, imageParentElement) {
            var curWrapWidth = (<any>imageElement).offsetWidth,
                resizeScale = curWrapWidth / this.wrapWidth;
            for (var id in this.graphArray) {
                let graphElement = this.graphArray[id],
                    DOI_DATA = graphElement.DOI_DATA;

                DOI_DATA.x = Math.floor(parseInt(graphElement.style.left === 'auto' ? graphElement.offsetRight : graphElement.offsetLeft) * resizeScale);
                DOI_DATA.y = Math.floor(parseInt(graphElement.style.top === 'auto' ? graphElement.offsetBottom : graphElement.offsetTop) * resizeScale);
                DOI_DATA.h = Math.floor(+graphElement.offsetHeight * resizeScale);
                DOI_DATA.w = Math.floor(+graphElement.offsetWidth * resizeScale);
                graphElement.style.width = DOI_DATA.w + 'px';
                graphElement.style.height = DOI_DATA.h + 'px';

                if (graphElement.style.left === 'auto') {
                    graphElement.style.right = DOI_DATA.x + 'px';
                } else {
                    graphElement.style.left = DOI_DATA.x + 'px';
                }
                if (graphElement.style.top === 'auto') {
                    graphElement.style.bottom = DOI_DATA.y + 'px';
                } else {
                    graphElement.style.top = DOI_DATA.y + 'px';
                }
            }

            this.resetDrawConfig(imageElement, imageParentElement);
        }
        private resetDrawConfig(imageElement, imageParentElement) {
            this.wrapWidth = (<any>imageElement).offsetWidth;
            this.wrapHeight = (<any>imageElement).offsetHeight;
            this.scale = (+this.wrapWidth / (<any>imageElement).naturalWidth);
        }
    }

    (<any>window).DrawOnImage = DrawOnImage;

    // throttle
    function throttle(func, wait) {
        var timeout, context, args, result;
        var previous = 0;
        var later = function () {
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
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
                if (!timeout) context = args = null;
            } else if (!timeout) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };

        (<any>throttled).cancel = function () {
            clearTimeout(timeout);
            timeout = context = args = null;
        };

        return throttled;
    }

    //Polyfill for Object.assign
    if (typeof (<any>Object).assign != 'function') {
        (function () {
            (<any>Object).assign = function (target) {
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