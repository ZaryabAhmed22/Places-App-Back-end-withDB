const uuid = require("uuid");
const { validationResult } = require("express-validator");

//Own imports
const HttpError = require("../models/http-error");
const UserModel = require("../models/user");

////////////////////////// GET REQUESTS /////////////////////////////
// >> Creating this middleware function for /api/users/:uid
const getUserById = async (req, res, next) => {
  let users;

  try {
    users = await UserModel.find({}, "-password"); //UserModel.find({}, "name", "email");
  } catch (err) {
    const error = new HttpError(
      "Fetching uers failed, please try again later",
      500
    );

    return next(error);
  }

  res.json({
    users: users.map((user) => {
      return user.toObject({ getters: true });
    }),
  });
};

////////////////////////// POST REQUESTS ///////////////////////////
// >> Creating this middleware function for /api/users/signup
const createUser = async (req, res, next) => {
  //This will check if any error returned by the validators used in the reuqest in post-routes file
  const errors = validationResult(req);

  //Throwing an error if the input is empty
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid inputs passed, please check yout data",
      422
    );

    return next(error);
  }

  //This is the data sent by signup form
  const { name, email, password } = req.body;

  //Checking if the user already exists with the same provided email
  let existingUser;

  try {
    existingUser = await UserModel.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, please try again later",
      500
    );

    return next(error);
  }

  //Sending back an error if the user already exists for the provided email
  if (existingUser) {
    const error = new HttpError("User already exists", 422);

    return next(error);
  }

  //Creating a new User
  const createdUser = new UserModel({
    name,
    email,
    password,
    image: "https://unsplash.com/photos/iEEBWgY_6lA",
    places: [],
  });

  //Adding the created user to the database
  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Signing up failed", 500);
    //If we didn't add the next(error), the code execution won't stop despite throwing an error
    return next(error);
  }

  //returning a response
  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

// >> Creating this middleware to login user
const loginUser = async (req, res, next) => {
  //This is the data sent by signup form
  const { name, email, password } = req.body;

  let existingUser;
  //Returning the matched user
  try {
    existingUser = UserModel.findOne({ email: email, password: password });
  } catch (err) {
    const error = new HttpError("Something went wrong, please try again later");

    return next(error);
  }

  //Validating the email and password
  if (!existingUser) {
    const error = new HttpError("Wrong credentials, could not find user", 401);

    return next(error);
  }

  res.json({ message: `Logged in ${name}` });
};
//Exporting are functions >> this is the syntax used to export multiple functions
exports.getUserById = getUserById;
exports.createUser = createUser;
exports.loginUser = loginUser;
