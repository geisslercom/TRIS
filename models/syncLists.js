
var mongoose = require('mongoose');

var syncSchema = mongoose.Schema({
		list1: {
			id: String,
			name: String
		},
		list2: {
			id: String,
			name: String
		},
		cardsConnected : Array
});

module.exports = mongoose.model('SyncList', syncSchema);