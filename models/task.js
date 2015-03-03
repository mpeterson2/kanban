var mongoose = require('mongoose');

module.exports = mongoose.model('Task', {
  description: String,
  points: Number,
  status: String,
  members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});