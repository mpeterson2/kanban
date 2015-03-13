var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate');

var boardSchema = mongoose.Schema({
  name: String,
  description: String,
  members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  tasks:  [{type: mongoose.Schema.Types.ObjectId, ref: 'Task'}],
  stories: [{type: mongoose.Schema.Types.ObjectId, ref: 'Story'}],
});

boardSchema.plugin(deepPopulate)

mongoose.exports = mongoose.model('Board', boardSchema);