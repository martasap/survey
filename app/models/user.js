var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// schemat ankiety (ankietowanego)
var UserSchema = new Schema({
gender: String,
age: String,
fav_beer: String,
how_many: String,
where: String,
with_who: String,
});

module.exports = mongoose.model('User', UserSchema); //eksport schematu, żeby można było go używać w innych plikach JS