'use strict';

/* Controllers */

function altCtrl($scope, socket, $routeParams, $window) {

	$scope.sync = function (type) {
		socket.emit('chgfilter', {type: type});
	}
}
altCtrl.$inject = ['$scope', 'socket','$routeParams','$window'];

function listCtrl($scope, socket, $routeParams, $window) {

	socket.on('init', function(data) {
		$scope.list = data;
	});

	socket.on('chgfilter', function(data) {
		$scope.list = data;
	});

}
listCtrl.$inject = ['$scope', 'socket','$routeParams','$window'];

function detailCtrl($scope, socket) {
}
detailCtrl.$inject = ['$scope', 'socket'];
