var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate');

var sprintSchema = mongoose.Schema({
  startDate: {type: Date, default: Date.now},
  endDate: Date,
  todo: [{type: mongoose.Schema.Types.ObjectId, ref: 'Story'}],
  develop: [{type: mongoose.Schema.Types.ObjectId, ref: 'Story'}],
  test: [{type: mongoose.Schema.Types.ObjectId, ref: 'Story'}],
  done: [{type: mongoose.Schema.Types.ObjectId, ref: 'Story'}]
});

sprintSchema.plugin(deepPopulate)

mongoose.exports = mongoose.model('Sprint', sprintSchema);