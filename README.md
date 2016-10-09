# DrawSquareOnImage
在图片上画线框，非canvas。

## 使用

```html
	<!-- 图片的父元素必须完整包裹图片，因为画布基于父元素的，所以线框可在父元素的内容范围内可画。 -->
	<div style="position: relative;float:left">
		<img id="test" src="72.jpg" alt="">
	</div>
```

```javascript
var drawSquareOnImage = new DrawSquareOnImage({
    penSize: 1, //线框大小
    penColor: 'blue', // 线框颜色
    penStyle:'solid', //线框样式（基于css border-style 的值）
    renderer: 'test' // 图片的Id
});
```

## API

#### startDraw()

开始绘画（默认未开始）

#### stopDraw()

停止绘画

#### addSquare(Object SquareData)

添加单个正方式
```javascript
{
	x:Number, //开始坐标x
	y:Number, //开始坐标y
	width:Number, 
	height:Number, 
}
```

#### addSquares(Array SquareDatas)

添加多个正方形。


#### removeSquare(Number squareId)

删除某个正方形

#### clearSquare()

清空所有正方形

#### on(String eventName,Function callback)

绑定事件

## Events

#### addSquare

添加正方形

```javascript
//callback Data
{
	x:Number, // 原图比例的坐标轴x
	y:Number,// 原图比例的坐标轴y
	widht:Number, // 原图比例的宽
	height:Number, // 原图比例的高
	id:Number,//当前square的Id
	_node:Element,//正方形元素的实体,
	draw:{  //当前绘图比例下的数据
		scale:Float, // 绘图大小:原图大小，比率
		x:Number, // 绘图比例的坐标轴x
		y:Number, // 绘图比例的坐标轴y
		w:Number, // 绘图比例的宽
		h:Number, // 绘图比例的高
		directionX:String, // x轴的方向
		directionY:String, // y轴的方向
	}
}
```

