// Data library

var topData = [{i:1},{i:2},{i:3},{i:4},{i:5},{i:6},{i:7},{i:8},{i:9},{i:10}];
var popData = [{i:11},{i:22},{i:33},{i:44},{i:55},{i:66},{i:77},{i:88},{i:99},{i:100}];
var upData = [{i:111},{i:222},{i:333},{i:444},{i:555},{i:666},{i:777},{i:888},{i:999},{i:1000}];

exports.get = function (type) {

	switch(type) {
		case 'top':
			return topData;
			break;
		case 'popular':
			return popData;
			break;
		case 'upcoming':
			return upData;
			break;
		default: 
			return topData;
	}
}

