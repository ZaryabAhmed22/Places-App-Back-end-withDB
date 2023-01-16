const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

//Creating the schema for user
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, //unique fastens the quering for the property by creating an index for that property
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  places: { type: String, required: true },
});

//Using the mongoose-unique-validator to make sure that a user is only created if the email doesn't exist in the database
userSchema.plugin(uniqueValidator);

//Creating the model and exporting it >> User will be converted to "users" as the name of the collection
module.exports = mongoose.model("User", userSchema);
