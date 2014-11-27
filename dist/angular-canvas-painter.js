/*!
 * angular-canvas-painter - v0.0.0
 *
 * Copyright (c) 2014, Philipp Wambach
 * Released under the MIT license.
 */
(function(window) {
angular.module('pw.canvas-painter', []);
(function(module) {
try {
  module = angular.module('pw.canvas-painter');
} catch (e) {
  module = angular.module('pw.canvas-painter', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('canvas.html',
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
  $templateCache.put('color-selector.html',
    '<ul class="pwColorSelector"><li ng-repeat="color in colorList track by $index" class="pwColor" ng-class="{\'active\': selectedIndex === $index}" style="background-color: {{color}}" ng-click="select($index, color)"></li></ul>');
}]);
})();

'use strict';

angular.module('pw.canvas-painter')
  .directive('pwCanvas', function () {
    return {
      restrict: 'AE',
      scope: {
      	options: '='
      },
      templateUrl: '../templates/canvas.html', 
      link: function postLink(scope, el, attrs) {

      		var isTouch = 'ontouchstart' in document.documentElement;

      		//set default options
      		var options = scope.options
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

			//ios check
			var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
			
			//var undoImage = [];

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


			var clearCanvas = function(){
				ctx.clearRect(0, 0, canvasTmp.width, canvasTmp.height);
				ctxTmp.clearRect(0, 0, canvasTmp.width, canvasTmp.height);
			}

/*
			scope.getImageBlob = function(){
				// Decode the dataURL    
				var binary = atob(canvas.toDataURL().split(',')[1]);
				// Create 8-bit unsigned array
				var array = [];
				for(var i = 0; i < binary.length; i++) {
				  array.push(binary.charCodeAt(i));
				}
				// Return our Blob object
				//scope.image = new Blob([new Uint8Array(array)], {type: 'image/png'});
				return new Blob([new Uint8Array(array)], {type: 'image/png'});
			}
*/

/*
			scope.undo = function(){
				if(undoImage.length > 0)
					ctx.putImageData(undoImage.pop(), 0, 0);
				
				if(undoImage.length < 1)
					scope.undoDisabled = true;
			}
*/

			var initListeners = function(){
				if(!isTouch){
					//Mouse
					window.addEventListener('mouseup', function(){
						canvasTmp.removeEventListener('mousemove', mousePaint, false);
						ctx.drawImage(canvasTmp, 0, 0);
						ctxTmp.clearRect(0, 0, canvasTmp.width, canvasTmp.height);
						ppts = [];
					}, false);

					canvasTmp.addEventListener('mousedown', function(e) {
						e.preventDefault();
						canvasTmp.addEventListener('mousemove', mousePaint, false);
						
						point.x = e.offsetX !== undefined ? e.offsetX : e.layerX;
						point.y = e.offsetY !== undefined ? e.offsetY : e.layerY;
						ppts.push({x: point.x, y: point.y});
						ppts.push({x: point.x, y: point.y});

						//save Undo Image
/*						undoImage.push(ctx.getImageData(0, 0, canvasTmp.width, canvasTmp.height));
						undoImage = undoImage.slice(-10);
						scope.$apply(function(){
							scope.undoDisabled = false;
						});
*/
						onPaint();
					}, false);

					canvasTmp.addEventListener('mouseup', function() {
						canvasTmp.removeEventListener('mousemove', mousePaint, false);
						ctx.drawImage(canvasTmp, 0, 0);
						ctxTmp.clearRect(0, 0, canvasTmp.width, canvasTmp.height);
						ppts = [];
					}, false);
				} else {
					//Touch
					canvasTmp.addEventListener('touchstart', function(e) {
						canvasTmp.addEventListener('touchmove', touchPaint, false);
						if(!iOS) {
							point.x = e.changedTouches[0].clientX + e.layerX;
							point.y = e.changedTouches[0].clientY + e.layerY;
						} else {
							point.x = e.layerX;
							point.y = e.layerY;
						}
						ppts.push({x: point.x, y: point.y});
						ppts.push({x: point.x, y: point.y});

						//save Undo Image
/*
						undoImage.push(ctx.getImageData(0, 0, canvasTmp.width, canvasTmp.height));
						undoImage = undoImage.slice(-10);
						scope.$apply(function(){
							scope.undoDisabled = false;
						});
*/

						//first point
						/*
						ctx.beginPath();
						ctx.arc(point.x, point.y, Math.round(ctxTmp.lineWidth/2), 0, 2 * Math.PI, false);
						ctx.fill();
						*/

						onPaint();
					}, false);

					canvasTmp.addEventListener('touchend', function() {
						canvasTmp.removeEventListener('touchmove', touchPaint, false);
						ctx.drawImage(canvasTmp, 0, 0);
						ctxTmp.clearRect(0, 0, canvasTmp.width, canvasTmp.height);
						ppts = [];
					}, false);
				}
			}

			var mousePaint = function (e){
				point.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
				point.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
				onPaint();
			}

			var touchPaint = function (e){
				e.preventDefault();
				if(!iOS){
					point.x = e.changedTouches[0].clientX + e.layerX;
					point.y = e.changedTouches[0].clientY + e.layerY;
				} else {
					point.x = e.layerX;
					point.y = e.layerY;	
				}
				onPaint();
			}


			var onPaint = function (){
				// Saving all the points in an array
				ppts.push({x: point.x, y: point.y});
				
				if (ppts.length == 3) {
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
			}
			initListeners();
      }
    };
  });

'use strict';

angular.module('pw.canvas-painter')
  .directive('pwColorSelector', function () {
    return {
      restrict: 'AE',
      replace: true,
      scope: {
        colorList: '=pwColorSelector',
        color: '='
      },
      templateUrl: '../templates/color-selector.html', 
      link: function postLink(scope, element, attrs) {
        scope.select = function(index, color){
          scope.selectedIndex = index;
          scope.color = color;
        };
      }
    };
  });

}(this));