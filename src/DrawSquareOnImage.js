;
(function(G, doc) {

    function _classExtend(superClass, extendObj) {
        for (key in extendObj) {
            superClass.prototype[key] = extendObj[key];
        }
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

    function DrawSquareOnImage() {

    }

    _classExtend(DrawSquareOnImage, {
        renderer: function(id) {
            var imageElement = doc.getElementById(id),
                parentElement = imageElement.parentElement,
                imageSrc = imageElement.getAttribute('src'),
                eWidth = imageElement.offsetWidth,
                eHeight = imageElement.offsetHeight,
                natureImage = new Image(),
                _self = this;

            if (!parentElement.style.position) {
                parentElement.style.position = 'relative';
            }

            natureImage.onload = function() {
                _self.bindEvent(imageElement)
                console.log(natureImage.width, natureImage.height)
            }

            natureImage.src = imageSrc;

            console.log(imageSrc, eWidth, eHeight)

            this.parentElement = parentElement;
            this.eWidth = eWidth;
            this.eHeight = eHeight;
        },
        bindEvent: function(el) {
            var _self = this,
                tempSquareDiv,
                eOffset = el.parentElement.getBoundingClientRect(),
                eX = eOffset.left,
                eY = eOffset.top,
                startX, startY,
                drawSquareSize = throttle(function(e) {
                    var curX = e.pageX - eX,
                        curY = e.pageY - eY,
                        maxWidth = 0,
                        maxHeight = 0,
                        setWidth, setHeight;
                    if (curX > startX) {
                        maxWidth = _self.eWidth - startX;
                        setWidth = function(w) {
                            tempSquareDiv.style.right = 'auto';
                            tempSquareDiv.style.left = startX + 'px';
                            tempSquareDiv.style.width = w + 'px';
                        }
                    } else if (curX < startX) {
                        maxWidth = startX;
                        setWidth = function(w) {
                            tempSquareDiv.style.left = 'auto';
                            tempSquareDiv.style.right = (_self.eWidth - startX) + 'px';
                            tempSquareDiv.style.width = w + 'px';
                        }
                    }

                    if (curY > startY) {
                        maxHeight = _self.eHeight - startY;
                        setHeight = function(h) {
                            tempSquareDiv.style.bottom = 'auto';
                            tempSquareDiv.style.top = startY + 'px';
                            tempSquareDiv.style.height = h + 'px';
                        }
                    } else if (curY < startY) {
                        maxHeight = startY;
                        setHeight = function(h) {
                            tempSquareDiv.style.top = 'auto';
                            tempSquareDiv.style.bottom = (_self.eHeight - startY) + 'px';
                            tempSquareDiv.style.height = h + 'px';
                        }
                    }


                    setWidth && setWidth(Math.min(Math.abs(startX - curX), maxWidth));
                    setHeight && setHeight(Math.min(Math.abs(startY - curY), maxHeight));
                }, 28);

            el.parentElement.addEventListener('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();
                _self.drawing = true;
                startX = e.pageX - eX;
                startY = e.pageY - eY;
                tempSquareDiv = _self._initSquare(startX, startY);
                _self.parentElement.appendChild(tempSquareDiv);
            });

            el.parentElement.addEventListener('mouseout', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (_self.drawing) {
                    setTimeout(function() {
                        drawSquareSize(e);
                    }, 28)
                }
            });

            el.parentElement.addEventListener('mousemove', function(e) {
                e.preventDefault();
                e.stopPropagation();
                // console.log(e)
                if (_self.drawing) {
                    drawSquareSize(e);
                }
            });
            doc.addEventListener('mouseup', function(e) {
                e.preventDefault();
                e.stopPropagation();
                _self.drawing = false;
            });
        },
        _initSquare: function(x, y) {
            var squareDiv = document.createElement('div');
            squareDiv.style.position = 'absolute';
            squareDiv.style.left = x + 'px';
            squareDiv.style.top = y + 'px';
            squareDiv.style.border = '2px solid red';
            return squareDiv;
        }
    });

    G.DrawSquareOnImage = DrawSquareOnImage;
}(this, document));
