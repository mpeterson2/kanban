var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate');

var boardSchema = mongoose.Schema({
  name: String,
  description: String,
  members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  sprints: [{type: mongoose.Schema.Types.ObjectId, ref: "Sprint"}],
  firstSprint: {type: mongoose.Schema.Types.ObjectId, ref: "Sprint"}
});

boardSchema.plugin(deepPopulate)

mongoose.exports = mongoose.model('Board', boardSchema);