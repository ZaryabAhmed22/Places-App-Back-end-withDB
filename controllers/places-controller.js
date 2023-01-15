const uuid = require("uuid");
const { validationResult } = require("express-validator");

//Own imports
const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");

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

const getPlaceById = (req, res, next) => {
  //  console.log("GET Request in PLaces");
  const placeId = req.params.pid;

  //Finding  the place according to placeId
  const place = DUMMY_PLACES.find((place) => {
    return place.id === placeId;
  });

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
    throw error;
  }

  res.json({ place });
};

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  console.log(userId);

  //Finding the user's places from the data
  const places = DUMMY_PLACES.filter((place) => {
    return place.creator === userId;
  });

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

  res.json({ places });
};

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

  //Creating a place
  const createdPlace = {
    id: uuid.v4(),
    title,
    description,
    location: coords,
    address,
    creator,
  };

  //adding the place to the data
  DUMMY_PLACES.push(createdPlace);

  //returning a response
  res.status(201).json({ place: createdPlace });
};

//>> Middleware function for patch request at "/api/places/:pid"
const updatePlace = (req, res, next) => {
  //This will check if any error returned by the validators used in the reuqest in post-routes file
  const errors = validationResult(req);

  //Throwing an error if the input is empty
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please check yout data", 422);
  }

  //getting the place ID from the request
  const placeId = req.params.pid;

  //Finding  the place according to placeId and creating its copy, because we are avoiding to manuplulate the data directly so we create a copy and then we will update and replace it in the data
  const placeToBeUpdated = {
    ...DUMMY_PLACES.find((place) => {
      return place.id === placeId;
    }),
  };

  //Getting the index of the plcesToBeUpdated so that we can replace the updated place with it
  const placeTBUIndex = DUMMY_PLACES.findIndex((place) => {
    return place.id === placeId;
  });

  //Getting the user entered data
  const { title, description } = req.body;

  //Updating the place object based on user entered data
  placeToBeUpdated.title = title;
  placeToBeUpdated.description = description;

  //Replcaing the place
  DUMMY_PLACES[placeTBUIndex] = placeToBeUpdated;

  //returning a response
  res.status(200).json({ place: placeToBeUpdated });
};

//>> Middleware function for patch request at "/api/places/:pid"
const deletePlace = (req, res, next) => {
  //getting the place ID from the request
  const placeId = req.params.pid;

  //Checking whether the place exists ors not
  placeToBeDeleted = DUMMY_PLACES.find((place) => {
    place.id === placeId;
  });

  if (!placeToBeDeleted) {
    throw new HttpError("Could not find a place for this id", 404);
  }

  //Filtering the data based on the place id >> overwriting the places data with the filtered places
  DUMMY_PLACES = DUMMY_PLACES.filter((place) => {
    return place.id !== placeId;
  });

  //returning a response
  res.status(200).json({ message: "Deleted place" });
};

//Exporting are functions >> this is the syntax used to export multiple functions
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
