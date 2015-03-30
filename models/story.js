var mongoose = require('mongoose');

module.exports = mongoose.model('Story', {
  description: String,
  points: Number,
  tasks: [{type: mongoose.Schema.Types.ObjectId, ref: 'Task'}],
  members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});