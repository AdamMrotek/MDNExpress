var mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');

var Schema = mongoose.Schema;


var AuthorSchema = new Schema(
  {
    first_name: {type: String, required: true, maxLength: 100},
    family_name: {type: String, required: true, maxLength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
  }
);

// Virtual for author's full name
AuthorSchema
.virtual('name')
.get(function () {
  return this.family_name + ', ' + this.first_name;
});

// Virtual for author's lifespan
AuthorSchema.virtual('lifespan').get(function() {
  var lifetime_string = '';
  if (this.date_of_birth) {
    lifetime_string = this.date_of_birth.toString().slice(4,15).split(" ").join("-")
  }
  lifetime_string += ' - ';
  if (this.date_of_death) {
    lifetime_string += this.date_of_birth.toString().slice(4,15).split(" ").join("-")
  }
  return lifetime_string;
});

// Virtual for author's URL
AuthorSchema
.virtual('url')
.get(function () {
  return '/catalog/author/' + this._id;
});
AuthorSchema
.virtual('date_of_birth_formatted')
.get(function () {
  return this.date_of_birth.toISOString().slice(0, 10)
});

// AuthorSchema
// .virtual('lifespan')
// .get(function () {
//   if(this.date_of_birth||this.date_of_death){
//     return "unknown"
//   }
//   return (new Date(this.date_of_death-this.date_of_birth).getUTCFullYear()-1970)
// })

//Export model
module.exports = mongoose.model('Author', AuthorSchema);
