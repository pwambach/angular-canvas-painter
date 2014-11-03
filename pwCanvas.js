/* Author: Philipp Wambach (http://github.com/pwambach) */

'use strict';

angular.module('pwCanvasPaint', [])
  .directive('pwCanvas', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {

      		//ios check
      		var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
	      	//create canvas
	        var canvas = document.createElement('canvas');

	        var canvas_style = getComputedStyle(element[0]);
			canvas.width = parseInt(canvas_style.getPropertyValue('width'));
			$(element[0]).height(canvas.width-(canvas.width/10));
			canvas.height = parseInt(canvas_style.getPropertyValue('height'));

	        element.append(canvas);
	        var ctx = canvas.getContext('2d');

	        var undoImage = [];
	        scope.undoDisabled = true;

	        //white background color;
	        ctx.fillStyle = 'white';
	        ctx.fillRect(0,0,canvas.width,canvas.height);

	        //create tmp canvas
	        var tmp_canvas = document.createElement('canvas');
	        angular.element(tmp_canvas).addClass("tmp_canvas");
			tmp_canvas.width = canvas.width;
			tmp_canvas.height = canvas.height;
			element.append(tmp_canvas);
			var tmp_ctx = tmp_canvas.getContext('2d');

			//set alpha value
			tmp_ctx.globalAlpha = 0.92;

			//init variables
			var point = {x: 0, y: 0};
			var ppts = [];

			//Default stroke color and width
			tmp_ctx.lineJoin = 'round';
			tmp_ctx.lineCap = 'round';
			tmp_ctx.lineWidth = 1;
			tmp_ctx.strokeStyle = 'blue';

			scope.$watch('lineWidth', function(newValue){
				tmp_ctx.lineWidth = newValue;
			});

			scope.$watch('strokeStyle', function(newValue){
				tmp_ctx.strokeStyle = newValue;
				tmp_ctx.fillStyle = newValue;
				ctx.fillStyle = newValue;
			});

			scope.clearCanvas = function(){
				ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
				tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
			}

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

			var initListeners = function(){
				if(!Modernizr.touch){
					//Mouse
					window.addEventListener('mouseup', function(){
						tmp_canvas.removeEventListener('mousemove', mousePaint, false);
						ctx.drawImage(tmp_canvas, 0, 0);
						tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
						ppts = [];
					}, false);

					tmp_canvas.addEventListener('mousedown', function(e) {
						e.preventDefault();
						tmp_canvas.addEventListener('mousemove', mousePaint, false);
						
						point.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
						point.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
						ppts.push({x: point.x, y: point.y});
						ppts.push({x: point.x, y: point.y});

						//save Undo Image
						undoImage.push(ctx.getImageData(0, 0, tmp_canvas.width, tmp_canvas.height));
						undoImage = undoImage.slice(-10);
						scope.$apply(function(){
							scope.undoDisabled = false;
						});

						onPaint();
					}, false);

					tmp_canvas.addEventListener('mouseup', function() {
						tmp_canvas.removeEventListener('mousemove', mousePaint, false);
						ctx.drawImage(tmp_canvas, 0, 0);
						tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
						ppts = [];
					}, false);
				} else {
					//Touch
					tmp_canvas.addEventListener('touchstart', function(e) {
						tmp_canvas.addEventListener('touchmove', touchPaint, false);
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
						undoImage.push(ctx.getImageData(0, 0, tmp_canvas.width, tmp_canvas.height));
						undoImage = undoImage.slice(-10);
						scope.$apply(function(){
							scope.undoDisabled = false;
						});

						//first point
						/*
						ctx.beginPath();
						ctx.arc(point.x, point.y, Math.round(tmp_ctx.lineWidth/2), 0, 2 * Math.PI, false);
						ctx.fill();
						*/

						onPaint();
					}, false);

					tmp_canvas.addEventListener('touchend', function() {
						tmp_canvas.removeEventListener('touchmove', touchPaint, false);
						ctx.drawImage(tmp_canvas, 0, 0);
						tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
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
					tmp_ctx.beginPath();
					tmp_ctx.arc(b.x, b.y, tmp_ctx.lineWidth / 2, 0, Math.PI * 2, !0);
					tmp_ctx.fill();
					tmp_ctx.closePath();
					return;
				}
				
				// Tmp canvas is always cleared up before drawing.
				tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);

				tmp_ctx.beginPath();
				tmp_ctx.moveTo(ppts[0].x, ppts[0].y);
				
				for (var i = 1; i < ppts.length - 2; i++) {
					var c = (ppts[i].x + ppts[i + 1].x) / 2;
					var d = (ppts[i].y + ppts[i + 1].y) / 2;
					tmp_ctx.quadraticCurveTo(ppts[i].x, ppts[i].y, c, d);
				}
				
				// For the last 2 points
				tmp_ctx.quadraticCurveTo(
					ppts[i].x,
					ppts[i].y,
					ppts[i + 1].x,
					ppts[i + 1].y
				);
				tmp_ctx.stroke();
			}
			initListeners();

			scope.undo = function(){
				if(undoImage.length > 0)
					ctx.putImageData(undoImage.pop(), 0, 0);
				
				if(undoImage.length < 1)
					scope.undoDisabled = true;
			}

      } //end link function
    };
  });
