var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate');

var boardSchema = mongoose.Schema({
  name: String,
  description: String,
  members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],

  todo: [{type: mongoose.Schema.Types.ObjectId, ref: 'Story'}],
  develop: [{type: mongoose.Schema.Types.ObjectId, ref: 'Story'}],
  test: [{type: mongoose.Schema.Types.ObjectId, ref: 'Story'}],
  done: [{type: mongoose.Schema.Types.ObjectId, ref: 'Story'}]
});

boardSchema.plugin(deepPopulate)

mongoose.exports = mongoose.model('Board', boardSchema);