var mongoose = require('mongoose');

module.exports = mongoose.model('Task', {
  description: String,
  done: {type: Boolean, default: false},
  story: {type: mongoose.Schema.Types.ObjectId, ref: 'Story'}
});