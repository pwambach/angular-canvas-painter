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
