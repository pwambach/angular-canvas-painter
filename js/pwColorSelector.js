/* Author: Philipp Wambach (http://github.com/pwambach) */

'use strict';

angular.module('pwCanvasPaint')
  .directive('pwColorSelector', function () {
    return {
      restrict: 'AE',
      replace: true,
      scope: {
        colorList: '=pwColorSelector',
        color: '='
      },
      template: '<ul class="pwColorSelector">' +
                '<li ng-repeat="color in colorList track by $index"' +
                    'class="pwColor"' +
                    'ng-class="{\'active\': selectedIndex === $index}"' +
                    'style="background-color: {{color}}"' +
                    'ng-click="select($index, color)"></li>' +
                '</ul>',
      link: function postLink(scope, element, attrs) {
        scope.select = function(index, color){
          scope.selectedIndex = index;
          scope.color = color;
        };
      }
    };
  });
