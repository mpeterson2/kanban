var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate');

var boardSchema = mongoose.Schema({
  name: String,
  description: String,
  members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  sprints: [{type: mongoose.Schema.Types.ObjectId, ref: 'Sprint'}]
});

boardSchema.plugin(deepPopulate)

boardSchema.set('toObject', { getters: true });
boardSchema.set('toJSON', { getters: true });

boardSchema.method('currentSprint', function(cb) {
  this.populate('sprints', function(err, board) {
    var today = Date.now();
    var currSprint = board.sprints.filter(function(s) {
      var stime = s.startDate.getTime();
      var etime;
      if(s.endDate)
        etime = s.endDate.getTime();
      else
        return false;

      return stime < today && today < etime;
    });

    // If no sprints are within the time period
    if(currSprint.length == 0) {

      // return the last sprint if it is later than the last sprint
      var lastSprint = board.sprints[board.sprints.length - 1];
      if(today > lastSprint.startDate.getTime())
        cb(lastSprint);

      // return the first sprint if we are before the last sprint
      else
        cb(board.sprints[0]);
    }

    // return the first matching sprint
    else {
      var sprint = currSprint[0];
      cb(sprint);
    }
  });

});

boardSchema.method('sprintIndex', function(id, cb) {
  id = id.toString();
  var index = 0;

  this.sprints.forEach(function(s, i) {
    var sId = s._id || s;
    sId = sId.toString();
    if(sId == id)
      index = i;
  });

  return index;
});

mongoose.exports = mongoose.model('Board', boardSchema);