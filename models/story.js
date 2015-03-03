var mongoose = require('mongoose');

module.exports = mongoose.model('Story', {
  description: String,
  status: {type: String, default: 'todo'},
  members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});