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
    comments: [
        {body: String, date: Date, author: String}
    ],
    status: String
};

var userModel = {
    username: String,
    password: String,
    karma: Number,
    session: String
}

// Models
var Post = mongoose.model('Post',postModel);
var User = mongoose.model('User',userModel);


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

	socket.on('login', function(data) {
        User.findOne({username:data.username}, function (err,user) {
            if (!err && user) {
                if (user.password != data.password) {
                    socket.emit('login', {result: 'error - worng password'});
                } else {
                    user.session = 'inventedsession';
                    user.save();
                    socket.emit('login', {username: data.username, session: user.session, result: 'OK!'});
                }
            } else {
                socket.emit('login', {result: 'error - no user'});
            }
        })
	})

    socket.on('register', function(data) {
        data.karma=0;
        data.session = 'logged';
        var user = new User(data);
        user.save();
        socket.emit('register',{result:'OK!'});
    })

};
