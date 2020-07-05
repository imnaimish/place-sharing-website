const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const User = require("../models/users");

const getUsers = async (req, res, next) => {
  let users;
  try{
    users = await User.find({}, '-password');
  }catch(err){
    return next(new HttpError('Fetching users failed. Please try later',500))
  }
  res.json({users : users.map(user => user.toObject({getters : true}))})
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inupts passed, please check your data.", 422)
    );
  }

  const { name, email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Signing up failed. Please try again.", 500));
  }

  if (existingUser) {
    return next(
      new HttpError("User exists already, please login instead", 422)
    );
  }

  const createdUser = new User({
    id: uuidv4(),
    name,
    email,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/1/10/Empire_State_Building_%28aerial_view%29.jpg",
    password,
    places:[],
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError("Signing up failed, please try again", 500));
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Login failed. Please try again.", 500));
  }

  if(!existingUser || existingUser.password !== password){
    return next(new HttpError('Invalid credentials. Cannot log you in', 401))
  }
  res.json({ message: "Logged in" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
