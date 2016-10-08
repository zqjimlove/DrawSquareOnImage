;
(function(G, doc) {

    function _classExtend(superClass, subClass) {
        if (!subClass) return superClass;
        for (key in subClass) {
            superClass[key] = subClass[key];
        }
        return superClass;
    }

    function throttle(func, wait) {
        var timeout, context, args, result;
        var previous = 0;
        var later = function() {
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };

        var throttled = function() {
            var now = new Date();

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

        throttled.cancel = function() {
            clearTimeout(timeout);
            timeout = context = args = null;
        };

        return throttled;
    }

    function DrawSquareOnImage(options) {
        var defaultOptions = {
            penColor: 'red',
            penSize: 2,
            penStyle: 'solid'
        }
        this.options = _classExtend(defaultOptions, options)
        this.squareIdQueue = 1;
    }

    _classExtend(DrawSquareOnImage.prototype, {
        renderer: function() {
            var targetId = this.options.renderer,
                imageElement = doc.getElementById(targetId),
                parentElement = imageElement.parentElement,
                eOffset = parentElement.getBoundingClientRect(),
                eWidth = imageElement.offsetWidth,
                eHeight = imageElement.offsetHeight,
                imageSrc = imageElement.getAttribute('src'),
                natureImage = new Image(),
                _self = this;

            if (!parentElement.style.position) {
                parentElement.style.position = 'relative';
            }

            natureImage.onload = function() {
                _self.bindEvent(imageElement);
                _self.scale = eWidth / natureImage.width;
                _self.readyStatus = true;
                _self.fire('ready');
            }

            natureImage.src = imageSrc;

            this.parentElement = parentElement;
            this.eX = doc.body.scrollLeft + eOffset.left;
            this.eY = doc.body.scrollTop + eOffset.top;
            this.eWidth = eWidth;
            this.eHeight = eHeight;
        },
        rendererSquareData: function() {

        },
        bindEvent: function(el) {
            var _self = this,
                tempSquareDiv,
                eOffset = el.parentElement.getBoundingClientRect(),
                eX = doc.body.scrollLeft + eOffset.left,
                eY = doc.body.scrollTop + eOffset.top,
                startX, startY, curX, curY;

            el.parentElement.addEventListener('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();
                _self.drawing = true;
                startX = e.pageX - eX;
                startY = e.pageY - eY;
                tempSquareDiv = _self._initSquare(startX, startY);
                _self.parentElement.appendChild(tempSquareDiv);
            });

            doc.addEventListener('mousemove', throttle(function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (_self.drawing) {
                    _self._drawSquareSize(tempSquareDiv, e.pageX, e.pageY);
                }
            }, 28));

            doc.addEventListener('mouseup', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (_self.drawing) {
                    _self.drawing = false;
                    _self.fire('addSquare', _self._getSquareData(tempSquareDiv));
                }
            });
        },
        addSquare: function(data) {
            if (!this.readyStatus) {
                var self = this;
                this.on('ready', function() {
                    self.addSquare(data);
                })
                return;
            }
            var squareDiv = this._initSquare(data.x * this.scale, data.y * this.scale);
            squareDiv.style.width = (data.width * this.scale) + 'px';
            squareDiv.style.height = (data.height * this.scale) + 'px';
            this.parentElement.appendChild(squareDiv);
        },
        removeSquare: function(index) {
            var el = this._squareMap[index];
            if (!el) return;
            this.parentElement.removeChild(el);
            delete this._squareMap[index];
        },
        clearSquare: function() {
            for (var id in this._squareMap) {
                this.removeSquare(id);
            }
        },
        _squareMap: {},
        _initSquare: function(x, y) {
            var squareDiv = document.createElement('div'),
                _options = this.options;
            squareDiv.style.position = 'absolute';
            squareDiv.style.left = x + 'px';
            squareDiv.style.top = y + 'px';
            squareDiv.style.borderSize = _options.penSize + 'px';
            squareDiv.style.borderStyle = _options.penStyle;
            squareDiv.style.borderColor = _options.penColor;
            squareDiv.x = x;
            squareDiv.y = y;
            squareDiv.queueId = this.squareIdQueue++;
            this._squareMap[squareDiv.queueId] = squareDiv;
            return squareDiv;
        },
        _drawSquareSize: function(tempSquareDiv, pageX, pageY) {
            var eWidth = this.eWidth,
                eHeight = this.eHeight,
                startX = tempSquareDiv.x,
                startY = tempSquareDiv.y,
                maxWidth = 0,
                maxHeight = 0,
                setWidth, setHeight;
            curX = pageX - this.eX;
            curY = pageY - this.eY;
            if (curX > startX) {
                maxWidth = this.eWidth - startX;
                setWidth = function(w) {
                    tempSquareDiv.w = w;
                    tempSquareDiv.style.right = 'auto';
                    tempSquareDiv.style.left = startX + 'px';
                    tempSquareDiv.style.width = w + 'px';
                }
            } else
            if (curX < startX) {
                maxWidth = startX;
                setWidth = function(w) {
                    tempSquareDiv.w = w;
                    tempSquareDiv.style.left = 'auto';
                    tempSquareDiv.style.right = (eWidth - startX) + 'px';
                    tempSquareDiv.style.width = w + 'px';
                }
            }

            if (curY > startY) {
                maxHeight = this.eHeight - startY;
                setHeight = function(h) {
                    tempSquareDiv.h = h;
                    tempSquareDiv.style.bottom = 'auto';
                    tempSquareDiv.style.top = startY + 'px';
                    tempSquareDiv.style.height = h + 'px';
                }
            } else if (curY < startY) {
                maxHeight = startY;
                setHeight = function(h) {
                    tempSquareDiv.h = h;
                    tempSquareDiv.style.top = 'auto';
                    tempSquareDiv.style.bottom = (eHeight - startY) + 'px';
                    tempSquareDiv.style.height = h + 'px';
                }
            }


            setWidth && setWidth(Math.min(Math.abs(startX - curX), maxWidth));
            setHeight && setHeight(Math.min(Math.abs(startY - curY), maxHeight));
        },
        _getSquareData: function(tempSquareDiv) {
            var result = {},
                scale = this.scale,
                squareStyle = tempSquareDiv.style;

            result.id = tempSquareDiv.queueId;
            result._node = tempSquareDiv;
            result.draw = {
                scale: scale,
                x: tempSquareDiv.x,
                y: tempSquareDiv.y,
                w: tempSquareDiv.w,
                h: tempSquareDiv.h,
                directionX: (squareStyle.left === 'auto') ? 'right' : 'left',
                directionY: (squareStyle.top === 'auto') ? 'bottom' : 'top'
            };
            result.width = Math.floor(tempSquareDiv.w / scale);
            result.height = Math.floor(tempSquareDiv.h / scale);
            if (squareStyle.left === 'auto') {
                result.x = Math.floor(tempSquareDiv.x / scale - result.width);
            } else {
                result.x = Math.floor(tempSquareDiv.x / scale);
            }

            if (squareStyle.top === 'auto') {
                result.y = Math.floor(tempSquareDiv.y / scale - result.height);
            } else {
                result.y = Math.floor(tempSquareDiv.y / scale);
            }
            return result;
        },
        _eventMap: {},
        on: function(eventName, eventFn) {

            if (eventName === 'ready' && this.readyStatus) {
                eventFn.call(this);
                return;
            }

            var events = this._eventMap[eventName] || [];
            events.push(eventFn);
            this._eventMap[eventName] = events;
        },
        fire: function() {
            var events = this._eventMap[arguments[0]] || [];
            for (var i = events.length - 1; i >= 0; i--) {
                var event = events[i];
                event.apply(this, Array.prototype.slice.call(arguments, 1, arguments.length));
            }
        }
    });

    G.DrawSquareOnImage = DrawSquareOnImage;
}(this, document));
