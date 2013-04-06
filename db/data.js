// MongoDB Configuration
var mongoose = require('mongoose');

if(process.env.VCAP_SERVICES){
  var env = JSON.parse(process.env.VCAP_SERVICES);
  var mongo = env['mongodb-1.8'][0]['credentials'];
}
else{
  var mongo = {
    "hostname":"localhost",
    "port":27017,
    "username":"",
    "password":"",
    "name":"",
    "db":"_altDB"
  }
}
var generate_mongo_url = function(obj){
  obj.hostname = (obj.hostname || 'localhost');
  obj.port = (obj.port || 27017);
  obj.db = (obj.db || 'test');
  if(obj.username && obj.password){
    return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
  else{
    return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
}
var mongourl = generate_mongo_url(mongo);

mongoose.connect(mongourl);

// Schema
var postModel = {
  author: String,
  date: { type: Date, default: Date.now },
  title: String,
  description: String,
  votes: Number,
  link: String,
  slug: String,
  anonymous: Number,
  comments: [
    {
      body: String,
      author: String,
      date:{ type: Date, default: Date.now }
    }
  ]
};

var userModel = {
  username: String,
  password: String,
  karma: Number,
  key: String
}

// Models
var Post = mongoose.model('Post',postModel);
var User = mongoose.model('User',userModel);

exports.Post = Post;
exports.User = User;
