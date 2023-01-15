const express = require("express");
const bodyParser = require("body-parser");
const { check } = require("express-validator");

//Importing the controller functions
const usersControllers = require("../controllers/users-controller");

//The express. Router() function is used to create a new router object. This function is used when you want to create a new router object in your program to handle requests
const router = express.Router();

//This route will be directed to /api/users as it is being filtered in the app.js >> We will not call the controller functions, only point at the function, the function will be called by express when the request is sent
router.get("/", usersControllers.getUserById);

//This route will be directed to /api/users/signup as it is being filtered in the app.js >> We will not call the controller functions, only point at the function, the function will be called by express when the request is sent
router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersControllers.createUser
);

//This route will be directed to /api/users/signup as it is being filtered in the app.js >> We will not call the controller functions, only point at the function, the function will be called by express when the request is sent
router.post("/login", usersControllers.loginUser);

//exporting a module in node js
module.exports = router;
