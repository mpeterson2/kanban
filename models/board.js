var mongoose = require('mongoose');

module.exports = mongoose.model('Board', {
  name: String,
  description: String,
  members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  tasks:  [{type: mongoose.Schema.Types.ObjectId, ref: 'Task'}],
  stories: [{type: mongoose.Schema.Types.ObjectId, ref: 'Story'}],
});