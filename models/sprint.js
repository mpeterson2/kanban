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

sprintSchema.plugin(deepPopulate);

sprintSchema.method('containsStory', function(story) {
  var found = false;

  function findStory(list) {
    list.some(function(story2) {
      if(story2._id.equals(story._id) || found) {
        found = true;
        return false;
      }
    });
  }

  findStory(this.todo);
  findStory(this.develop);
  findStory(this.test);
  findStory(this.done);

  return found;
});

mongoose.exports = mongoose.model('Sprint', sprintSchema);