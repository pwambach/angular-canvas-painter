angular-canvas-painter
======================

Angular.js directive to paint on a canvas on desktop or touch devices

[View Demo](http://pwambach.github.io/angular-canvas-painter/)

## Usage
1. `bower install angular-canvas-painter`
2. Include `dist/angular-canvas-painter(.min).js` from `bower_components/angular-canvas-painter/dist`.
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
  undo: false // boolean or a number of versions to keep in memory
  imageSrc: 'images/example.jpg', // loads the specified image and sets it as background image,
  customCanvasId: 'myCustomId' // define a custom value for the id attribute of the canvas element (default: 'pwCanvasMain')
}
```

#### Undo
To enable the undo function set `undo: true` in the options and provide a `version` attribute:
```html
<div pw-canvas options="{undo: true, width: 400, height: 300, color: '#ff0'}" version="model.version"></div>
```
The version attribute will always be set to the amount of available versions in memory. To undo a stroke just decrease the version number in your surrounding controller e.g. `model.version = model.version - 1`. To jump back 3 versions set `model.version = model.version - 3`.

You can set a maximum number of saved versions to prevent too much memory consumption by setting a number instead of `true` in the options, e.g. `{undo: 20}`

####pwColorSelector
```html
<div pw-color-selector="['#000', '#00f', '#0f0', '#f00']" color="selectedColor"></div>
```
To use `pwColorSelector` with `pwCanvas` set the color option in `pwCanvas` to the color variable of the selecot:
```html
<div pw-canvas options="{color: model.myColor}"></div>
<div pw-color-selector="['#000', '#00f', '#0f0', '#f00']" color="model.myColor"></div>
```

## Drawing algorithm
The drawing algorithm to produce clear and smooth edges is based on a great [article](http://codetheory.in/html5-canvas-drawing-lines-with-smooth-edges/) by Rishabh


## License
MIT
