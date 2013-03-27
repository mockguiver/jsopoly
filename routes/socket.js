/*
 * Serve content over a socket
 */

var storage = require('../storage/data');

module.exports = function (socket) {
	socket.emit('init', storage.get());

	socket.on('chgfilter', function(data) {
		socket.emit('chgfilter', storage.get(data.type));
	})
};
