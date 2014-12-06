/*!
 * angular-canvas-painter - v0.0.0
 *
 * Copyright (c) 2014, Philipp Wambach
 * Released under the MIT license.
 */
'use strict';
(function(window) {
angular.module('pw.canvas-painter', []);
(function(module) {
try {
  module = angular.module('pw.canvas-painter');
} catch (e) {
  module = angular.module('pw.canvas-painter', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('../templates/canvas.html',
    '<div class="pwCanvasPaint" style="position:relative"><canvas id="pwCanvasMain"></canvas><canvas id="pwCanvasTmp" style="position:absolute;top:0;left:0"></canvas></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('pw.canvas-painter');
} catch (e) {
  module = angular.module('pw.canvas-painter', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('../templates/color-selector.html',
    '<ul class="pwColorSelector"><li ng-repeat="color in colorList track by $index" class="pwColor" ng-class="{\'active\': (selectedColor === color)}" style="background-color: {{color}}" ng-click="setColor(color)"></li></ul>');
}]);
})();



angular.module('pw.canvas-painter')
  .directive('pwCanvas', function () {
    return {
      restrict: 'AE',
      scope: {
        options: '='
      },
      templateUrl: '../templates/canvas.html',
      link: function postLink(scope) {

        var isTouch = !!('ontouchstart' in window);
        var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );

        var PAINT_START = isTouch ? 'touchstart' : 'mousedown';
        var PAINT_MOVE = isTouch ? 'touchmove' : 'mousemove';
        var PAINT_END = isTouch ? 'touchend' : 'mouseup';

        //set default options
        var options = scope.options;
        options.width = options.width || 400;
        options.height = options.height || 300;
        options.backgroundColor = options.backgroundColor || '#fff';
        options.color = options.color || '#000';
        options.undoEnabled = options.undoEnabled || false;
        options.opacity = options.opacity || 0.9;
        options.lineWidth = options.lineWidth || 1;

        //create canvas and context
        var canvas = document.getElementById('pwCanvasMain');
        var canvasTmp = document.getElementById('pwCanvasTmp');
        var ctx = canvas.getContext('2d');
        var ctxTmp = canvasTmp.getContext('2d');

        //inti variables
        var point = {x: 0, y: 0};
        var ppts = [];

        //set canvas size
        canvas.width = canvasTmp.width = options.width;
        canvas.height = canvasTmp.height = options.height;

        //set context style
        ctx.fillStyle = options.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctxTmp.globalAlpha = options.opacity;
        ctxTmp.lineJoin = ctxTmp.lineCap = 'round';
        ctxTmp.lineWidth = 10;
        ctxTmp.strokeStyle = options.color;


        //Watch options
        scope.$watch('options.lineWidth', function(newValue){
        	if(typeof newValue === 'string'){
        		newValue = parseInt(newValue, 10);
        	}
          if(newValue && typeof newValue === 'number'){
            ctxTmp.lineWidth = options.lineWidth = newValue;
          }
        });

        scope.$watch('options.color', function(newValue){
          if(newValue){
            //ctx.fillStyle = newValue;
            ctxTmp.strokeStyle = ctxTmp.fillStyle = newValue;
          }
        });

        scope.$watch('options.opacity', function(newValue){
          if(newValue){
            ctxTmp.globalAlpha = newValue;
          }
        });


				/* var clearCanvas = function(){
          ctx.clearRect(0, 0, canvasTmp.width, canvasTmp.height);
          ctxTmp.clearRect(0, 0, canvasTmp.width, canvasTmp.height);
        };*/


        var setPointFromEvent = function(point, e) {
          if(isTouch){
            if(iOS){
              point.x = e.layerX;
              point.y = e.layerY;
            } else {
              point.x = e.changedTouches[0].clientX - e.target.offsetParent.offsetLeft;
              point.y = e.changedTouches[0].clientY - e.target.offsetParent.offsetTop;
            }
          } else {
            point.x = e.offsetX !== undefined ? e.offsetX : e.layerX;
            point.y = e.offsetY !== undefined ? e.offsetY : e.layerY;
          }
        };


        var paint = function (e){
          if(e){
            e.preventDefault();
            setPointFromEvent(point, e);
          }

          // Saving all the points in an array
          ppts.push({x: point.x, y: point.y});

          if (ppts.length === 3) {
            var b = ppts[0];
            ctxTmp.beginPath();
            ctxTmp.arc(b.x, b.y, ctxTmp.lineWidth / 2, 0, Math.PI * 2, !0);
            ctxTmp.fill();
            ctxTmp.closePath();
            return;
          }

          // Tmp canvas is always cleared up before drawing.
          ctxTmp.clearRect(0, 0, canvasTmp.width, canvasTmp.height);

          ctxTmp.beginPath();
          ctxTmp.moveTo(ppts[0].x, ppts[0].y);

          for (var i = 1; i < ppts.length - 2; i++) {
            var c = (ppts[i].x + ppts[i + 1].x) / 2;
            var d = (ppts[i].y + ppts[i + 1].y) / 2;
            ctxTmp.quadraticCurveTo(ppts[i].x, ppts[i].y, c, d);
          }

          // For the last 2 points
          ctxTmp.quadraticCurveTo(
            ppts[i].x,
            ppts[i].y,
            ppts[i + 1].x,
            ppts[i + 1].y
          );
          ctxTmp.stroke();
        };


        var initListeners = function(){
          if(!isTouch){
            window.addEventListener(PAINT_END, function(){
              canvasTmp.removeEventListener(PAINT_MOVE, paint, false);
              ctx.drawImage(canvasTmp, 0, 0);
              ctxTmp.clearRect(0, 0, canvasTmp.width, canvasTmp.height);
              ppts = [];
            }, false);
          }

          canvasTmp.addEventListener(PAINT_START, function(e) {
            e.preventDefault();
            canvasTmp.addEventListener(PAINT_MOVE, paint, false);

            setPointFromEvent(point, e);
            ppts.push({x: point.x, y: point.y});
            ppts.push({x: point.x, y: point.y});

            paint();
          }, false);

          canvasTmp.addEventListener(PAINT_END, function() {
            canvasTmp.removeEventListener(PAINT_MOVE, paint, false);
            ctx.drawImage(canvasTmp, 0, 0);
            ctxTmp.clearRect(0, 0, canvasTmp.width, canvasTmp.height);
            ppts = [];
          }, false);
        };
        initListeners();
      }
    };
  });



angular.module('pw.canvas-painter')
  .directive('pwColorSelector', function () {
    return {
      restrict: 'AE',
      scope: {
        colorList: '=pwColorSelector',
        selectedColor: '=color'
      },
      templateUrl: '../templates/color-selector.html',
      link: function(scope){
      	scope.setColor = function(col){
      		scope.selectedColor = col;
      	};
      }
    };
  });

}(this));