const uuid = require("uuid");
const { validationResult } = require("express-validator");

//Own imports
const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const PlaceModel = require("../models/place");

//Setting up dummy data
let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world",
    //   imageURL:
    //     "https://images.unsplash.com/photo-1428366890462-dd4baecf492b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8ZW1waXJlJTIwc3RhdGUlMjBidWlsZGluZ3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=400&q=60",
    address: "20 W 34th St, New York, NY 10001",
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: "u1",
  },

  {
    id: "p2",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world",
    //   imageURL:
    //     "https://images.unsplash.com/photo-1528291151377-165f5107c82a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8ZW1waXJlJTIwc3RhdGUlMjBidWlsZGluZ3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=400&q=60",
    address: "20 W 34th St, New York, NY 10001",
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: "u2",
  },
];

////////////////////////////// GET REQUESTS //////////////////////////////
// >> Middleware functin to get a single place by placeId
const getPlaceById = async (req, res, next) => {
  //  console.log("GET Request in PLaces");
  const placeId = req.params.pid;

  //Initialising the place variable to store the found place and send it as a response
  let place;

  //Finding  the place according to placeId, using the findById method and we can use the exec() method to make it a real promise
  try {
    place = await PlaceModel.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place for this id.",
      500
    );

    //If we didn't add the next(error), the code execution won't stop despite throwing an error
    return next(error);
  }

  //   //Error handling as a guard clause
  //   if (!place) {
  //     return res
  //       .status(404)
  //       .json({ message: "Could not find plce for the provided ID" });
  //   }

  //Error handling for synchronous code using our own Error Model
  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided id",
      404
    );

    //This will triger the error handling middleware in the app.js
    //throw error; //replcaing throw with next since it's an async function now
    return next(error);
  }

  //Converting the mongoose object to simple JS object and removing the underscore "_" from the auto genertated id, using getters: true
  res.json({ place: place.toObject({ getters: true }) });
};

// >> Middleware function to get all the places created by a single user
const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let places;
  //Finding the user's places from the database using the userId
  try {
    places = await PlaceModel.find({ creator: userId });
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }

  //   //Error handling as a guard clause
  //   if (!places) {
  //     return res
  //       .status(404)
  //       .json({ message: "Could not find plce for the provided user ID" });
  //   }

  //Error handling for synchronous code using our own Error Model
  if (!places || places.length === 0) {
    const error = new HttpError(
      "Could not find a place for the provided id",
      404
    );

    //This will forward the error to the next handling middleware in line
    return next(error);
  }

  //First, iterating/maping through the array returned by find() and then converting the mongoose object to simple JS object and removing the underscore "_" from the auto genertated id, using getters: true
  res.json({
    places: places.map((place) => {
      return place.toObject({ getters: true });
    }),
  });
};

///////////////////////// POST REQUEST //////////////////////////////
//Middleware function for post request at "/api/places"
const createPlace = async (req, res, next) => {
  //This will check if any error returned by the validators used in the reuqest in post-routes file
  const errors = validationResult(req);

  //Throwing an error if the input is empty, replced throw with next because throw doesn't work best with async code
  if (!errors.isEmpty()) {
    next(new HttpError("Invalid inputs passed, please check yout data", 422));
  }

  const { title, description, address, creator } = req.body;

  //Getting are coords
  let coords;

  try {
    coords = await getCoordsForAddress(address);
  } catch (err) {
    return next(err);
  }

  //Creating a place using the place model accroding to the Schema
  const createdPlace = new PlaceModel({
    title,
    description,
    address,
    location: coords,
    image: "https://unsplash.com/photos/l8vKWxhVuts",
    creator,
  });

  //adding the place to the database
  //DUMMY_PLACES.push(createdPlace);
  try {
    await createdPlace.save();
  } catch (err) {
    const error = new HttpError("Creating place failed", 500);
    //If we didn't add the next(error), the code execution won't stop despite throwing an error
    return next(error);
  }

  //returning a response
  res.status(201).json({ place: createdPlace });
};

////////////////////////// PATCH REQUEST //////////////////////////////
//>> Middleware function for patch request at "/api/places/:pid"
const updatePlace = async (req, res, next) => {
  //This will check if any error returned by the validators used in the reuqest in post-routes file
  const errors = validationResult(req);

  //Throwing an error if the input is empty
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please check yout data", 422);
  }

  //getting the place ID from the request
  const placeId = req.params.pid;

  //Getting the user entered data
  const { title, description } = req.body;

  let placeToBeUpdated;

  //Finding  the place according to placeId, using the findById method and we can use the exec() method to make it a real promise
  try {
    placeToBeUpdated = await PlaceModel.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place for this id.",
      500
    );

    //If we didn't add the next(error), the code execution won't stop despite throwing an error
    return next(error);
  }

  //Updating the values
  placeToBeUpdated.title = title;
  placeToBeUpdated.description = description;

  //Saving the updated place, since it's an async task we will use the try catch block
  try {
    await placeToBeUpdated.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update the palce",
      500
    );

    //If we didn't add the next(error), the code execution won't stop despite throwing an error
    return next(error);
  }

  //Converting the mongoose object to simple JS object and removing the underscore "_" from the auto genertated id, using getters: true
  res
    .status(200)
    .json({ updatedPlace: placeToBeUpdated.toObject({ getters: true }) });
};

//////////////////////////// DELETE REQUEST //////////////////////////
//>> Middleware function for patch request at "/api/places/:pid"
const deletePlace = async (req, res, next) => {
  //getting the place ID from the request
  const placeId = req.params.pid;

  let placeToBeDeleted;

  //Finding  the place according to placeId that is to be deleted, using the findById method and we can use the exec() method to make it a real promise
  try {
    placeToBeDeleted = await PlaceModel.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place for this id.",
      500
    );

    //If we didn't add the next(error), the code execution won't stop despite throwing an error
    return next(error);
  }

  //Deleting the place
  try {
    placeToBeDeleted.remove();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete a place",
      500
    );

    //If we didn't add the next(error), the code execution won't stop despite throwing an error
    return next(error);
  }

  //returning a response
  res.status(200).json({ message: "Deleted place" });
};

////////////////////////// EXPORTS /////////////////////////////////////
//Exporting are functions >> this is the syntax used to export multiple functions
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
