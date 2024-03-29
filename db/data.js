// MongoDB Configuration
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
var postModel = new Schema({
  author: String,
  date: { type: Date, default: Date.now },
  title: String,
  description: String,
  votes: Number,
  link: String,
  slug: String,
  anonymous: Number,
  keywords: {type:[String],index:true},
  comments: [
    {
      body: String,
      author: String,
      date:{ type: Date, default: Date.now }
    }
  ]
});

var commentModel = new Schema({
  slug: String,
  author: String,
  body: String,
  date: { type: Date, default: Date.now }
});

var userModel = new Schema ({
  username: String,
  password: String,
  karma: Number,
  key: String,
  votes: [{
    id: String
  }]
});

postModel.pre('save',function (next) {
  // Tools for full text search
  function extractKeywords(text) {
    if (!text) return [];

    return text.
      split(/\s+/).
      filter(function(v) { return v.length > 2; }).
      filter(function(v, i, a) { return a.lastIndexOf(v) === i; });
  }

  this.keywords = extractKeywords(this.title + ' ' + this.description);

  next();
});


// Models
var Post = mongoose.model('Post',postModel);
var User = mongoose.model('User',userModel);
var Comment = mongoose.model('Comment',commentModel);

exports.Post = Post;
exports.User = User;
exports.Comment = Comment;
