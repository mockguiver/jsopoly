/* 
	Data abstraction library 
*/

// Required libraries
var mongoose = require('mongoose');
mongoose.connect('localhost', '_altDB');

// Schema
var postModel = {
	author: String,
	date: { type: Date, default: Date.now },
	title: String,
	description: String, 
	votes: Number,
	link: String,
	comments: [{body:String, date:Date, author:String}],
	status: String
}

// Models
var Post = mongoose.model('Post',postModel);

module.exports = function (socket) {

	Post.find({'status':'top'}, function (err,docs) {
		socket.emit('init', docs);		
	})


	socket.on('chgfilter', function(data) {
		Post.find({'status': data.status}, function (err,docs) {
			socket.emit('chgfilter', docs);
		});
	})

	socket.on('put:post', function(data) {
		var post = new Post(data);
		post.save();
		socket.emit('post:ok',{});
	})

	socket.on('get:post', function(data) {
		Post.findById(data.id, function(err,doc) {
			socket.emit('get:post', doc);
		})
	})

};
