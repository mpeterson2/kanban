
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	username: {type: String, unique: true, required: true},
	password: {type: String, required: true},
	email: {type: String, unique: true, required: true},
	firstName: String,
	lastName: String
});

userSchema.options.toJSON = {
  transform: function(doc, ret, options) {
    delete ret.password;
    return ret;
  }
};

module.exports = mongoose.model('User', userSchema);