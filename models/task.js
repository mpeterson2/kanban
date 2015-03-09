var mongoose = require('mongoose');

module.exports = mongoose.model('Task', {
  description: String,
  points: Number,
  status: String,
  story: {type: mongoose.Schema.Types.ObjectId, ref: 'Story'},
  members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});