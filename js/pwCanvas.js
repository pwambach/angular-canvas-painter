/* Author: Philipp Wambach (http://github.com/pwambach) */

'use strict';

angular.module('pwPaint')
  .directive('pwCanvas', function () {
    return {
      scope: {
      	undoEnabled: '=',
      	options: '='
      },
      template: '<div style="position:relative">' +
      			'<canvas id="pwCanvasMain"></canvas>' + 
      			'<canvas id="pwCanvasTmp" style="position:absolute;top:0;left:0"></canvas>' +
      			'</div>',
      link: function postLink(scope, el, attrs) {

      		//ios check
      		var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );

      		var undoImage = [];

	      	//create canvas
	        var canvas = document.getElementById('pwCanvasMain');
	        if(scope.options.width && scope.options.height){
      			canvas.width = scope.options.width;
      			canvas.height = scope.options.height;
      		}

	        var ctx = canvas.getContext('2d');
	        //white background color;
	        ctx.fillStyle = 'white';
	        ctx.fillRect(0,0,canvas.width,canvas.height);

	        //create tmp canvas
	        var canvasTmp = document.getElementById('pwCanvasTmp');
			canvasTmp.width = canvas.width;
			canvasTmp.height = canvas.height;
			//el.append(canvasTmp);
			var ctxTmp = canvasTmp.getContext('2d');

			//set alpha value
			ctxTmp.globalAlpha = 0.92;

			//init variables
			var point = {x: 0, y: 0};
			var ppts = [];

			//Default stroke color and width
			ctxTmp.lineJoin = 'round';
			ctxTmp.lineCap = 'round';
			ctxTmp.lineWidth = 10;
			ctxTmp.strokeStyle = 'blue';

/*			scope.$watch('lineWidth', function(newValue){
				ctxTmp.lineWidth = newValue;
			});
*/

/*
			scope.$watch('strokeStyle', function(newValue){
				ctxTmp.strokeStyle = newValue;
				ctxTmp.fillStyle = newValue;
				ctx.fillStyle = newValue;
			});
*/

			scope.clearCanvas = function(){
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

			var initListeners = function(){
				if(true || !Modernizr.touch){
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
						
						point.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
						point.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
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

/*
			scope.undo = function(){
				if(undoImage.length > 0)
					ctx.putImageData(undoImage.pop(), 0, 0);
				
				if(undoImage.length < 1)
					scope.undoDisabled = true;
			}
*/
      } //end link function
    };
  });
