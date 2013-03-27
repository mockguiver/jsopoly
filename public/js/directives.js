'use strict';

/* Directives */


angular.module('alt.directives', []).
  directive('eatClick', function() {
  	return function(scope, element, attrs) {
  		$(element).click(function(event) {
  			event.preventDefault();
  		});
  	};
  });
