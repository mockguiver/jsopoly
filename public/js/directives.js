'use strict';

/* Directives */


angular.module('alt.directives', []).
  directive('eatClick', function() {
  	return function(scope, element, attrs) {
  		$(element).click(function(event) {
  			event.preventDefault();
  		});
  	};
  }).
  directive('altKeypress',function() {
    return {
      restrict: 'A',
      link: function(scope, elem, attr, ctrl) {
        elem.bind('keypress', function() {
          scope.$apply(function (s) {
            s.$eval(attr.altKeypress);
          });
        });
      }
    };
  });
