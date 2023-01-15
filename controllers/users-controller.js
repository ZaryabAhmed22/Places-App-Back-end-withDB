const uuid = require("uuid");
const { validationResult } = require("express-validator");

//Own imports
const HttpError = require("../models/http-error");

//Setting up dummy data
const DUMMY_USERS = [
  {
    id: "u1",
    name: "Zaryab",
    email: "test@test.com",
    password: "testsss",
  },
  {
    id: "u2",
    name: "Jonas",
    email: "jonas@test.com",
    password: "jonastest",
  },
];

// >> Creating this middleware function for /api/users/:uid
const getUserById = (req, res, next) => {
  res.json({ DUMMY_USERS });
};

// >> Creating this middleware function for /api/users/signup
const createUser = (req, res, next) => {
  //This will check if any error returned by the validators used in the reuqest in post-routes file
  const errors = validationResult(req);

  //Throwing an error if the input is empty
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please check yout data", 422);
  }

  //This is the data sent by signup form
  const { name, email, password } = req.body;

  //Checking if the user already exists with the same provided email
  const hasUser = DUMMY_USERS.find((user) => {
    user.email === email;
  });

  if (hasUser) {
    throw new HttpError("User already exists", 422);
  }

  //Creating a new User
  const createdUser = {
    id: uuid.v4(),
    name,
    email,
    password,
  };

  //Adding the created user to the users data
  DUMMY_USERS.push(createdUser);

  //returning a response
  res.status(201).json({ user: createdUser });
};

// >> Creating this middleware to login user
const loginUser = (req, res, next) => {
  //This is the data sent by signup form
  const { name, email, password } = req.body;

  //Returning the matched user
  const user = DUMMY_USERS.find((user) => {
    return email === user.email && password === user.password;
  });

  //Checking id the user with provided credentials exists
  if (!user) {
    throw new HttpError("Wrong credentials, could not find user", 401);
  }

  res.json({ message: "logged in" });
};
//Exporting are functions >> this is the syntax used to export multiple functions
exports.getUserById = getUserById;
exports.createUser = createUser;
exports.loginUser = loginUser;
