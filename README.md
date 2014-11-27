angular-canvas-painter
======================

Angular.js directive to paint on a canvas on desktop or touch devices

[View Demo](http://pwambach.github.io/angular-canvas-painter/)

## Usage
1. `bower install angular-canvas-painter`
2. Include `canvasPaint(.min).js` from `bower_components/angular-canvas-painter/dist`.
5. Add `pw.canvas-painter` as an angular module dependency.
6. Use the `pw-canvas` directive in your template to create the painting canvas.
7. Optionally you can use the `pw-color-selector` directive to choose colors from.

####pwCanvas
```html
<div pw-canvas options="{width: 400, height: 300, color: '#ff0'}"></div>
```

##### Options

```javascript
{
  width: 400, //px
  height: 300, //px
  backgroundColor: '#fff',
  color: '#000',
  lineWidth: 1, //px
  opacity: 0.9, //0-1
  undoEnabled: false //todo
}
```

####pwColorSelector
```html
<div pw-color-selector="['#000', '#00f', '#0f0', '#f00']" color="selectedColor"></div>
```
To use `pwColorSelector` with `pwCanvas` set the color option in `pwCanvas` to the color variable of the selecot:
```html
<div pw-canvas options="{color: model.myColor}"></div>
<div pw-color-selector="['#000', '#00f', '#0f0', '#f00']" color="model.myColor"></div>
```


## License
MIT
