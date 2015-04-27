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

    // If we have 1 sprint, return it
    if(board.sprints.length == 1) {
      cb(board.sprints[0]);
    }

    // Find the sprints that are good, and return one of them.
    else {
      var now = Date.now();

      // A sprint is valid if it starts before now and ends after now, or if it ends before now.
      var validSprints = board.sprints.filter(function(s) {
        var start = s.startDate.getTime();
        var end = 0;
        if(s.endDate)
          end = s.endDate.getTime();

        return true;
      });

      // Return the sprint that is between the date
      if(validSprints.length > 0) {
        for(var i=0; i<validSprints.length; i++) {
          var s = validSprints[i];
          var start = s.startDate.getTime();
          var end = 0;
          if(s.endDate)
            end = s.endDate.getTime();

          // If the date is between the sprint's start and end, return it.
          if(start < now && now < end) {
            cb(s);
            return;
          }
        }

        // We are not in a sprint, so return the last one that starts after the date.
        var retSprint = validSprints[0];
        for(var i=1; i<validSprints.length; i++) {
          var s = validSprints[i];
          var start = s.startDate.getTime();

          if(start > now) {
            break;
          }

          retSprint = s;
        }

        cb(s);
      }

      // Return the last sprint if all sprints are after the current date.
      else {
        cb(board.sprints[board.sprints.length - 1]);
      }
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