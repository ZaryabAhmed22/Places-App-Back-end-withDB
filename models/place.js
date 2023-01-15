const mongoose = require("mongoose");

//Creating the Schema for places
const placeSchema = new mongoose.Schema({
  title: { type: String, requireed: true },
  description: { type: String, requireed: true },
  image: { type: String, requireed: true },
  address: { type: String, requireed: true },
  location: {
    lat: { type: Number, requireed: true },
    lng: { type: Number, requireed: true },
  },
  creator: { type: String, requireed: true },
});

//Creating the model and exporting it >> Place will be converted to "places" as the name of the collection
module.exports = mongoose.model("Place", placeSchema);
