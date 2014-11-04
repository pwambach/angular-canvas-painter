/* Author: Philipp Wambach (http://github.com/pwambach) */

'use strict';

angular.module('pwPaint')
  .directive('pwColorSelector', function () {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        var possibilities = ['#101624', '#2F3942', '#F2E5D5', '#ffffff', '#C1B0A3', '#736B68', '#517792', '#4AC3F1', '#45B29D', '#91DA63', '#EFC94C', '#E27A3F', '#DF5A49', '#FE4365'];
        var list = $("<ul class='ColorList'></ul>");

        $.each(possibilities, function(index, value){
        	var el = $('<li></li>');

          if(index == 0){
            scope.strokeStyle = value;
          }
        	
        	el.css('background-color', value);
        	
        	el.on('click', function(){
            $('.ColorList li').removeClass('Active');
            $(this).addClass('Active');
        		
            scope.$apply(function(){
        			scope.strokeStyle = value;
        		});

        	});

        	list.append(el);
        });

        element.append(list);
      }
    };
  });
