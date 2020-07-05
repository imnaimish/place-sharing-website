const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const Place = require("../models/places");
const User = require("../models/users");
const mongoose = require("mongoose");
const { Mongoose } = require("mongoose");

const getPlaceById = async (req, res, next) => {
  let placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(
      new HttpError("Something went wrong. Could not find the place.", 500)
    );
  }
  if (!place) {
    return next(
      new HttpError("Could not find a place for the provided id", 404)
    );
  }
  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  let userId = req.params.uid;
  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (error) {
    return next(new HttpError("Fetching places failed. Please try again"));
  }
  if (places.length === 0) {
    return next(
      new Error("Could not find any places for the provided user id", 404)
    );
  }
  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Invalid inputs passed, please check your data", 422);
  }
  const { title, description, address, creator } = req.body;
  const createdPlace = new Place({
    title,
    description,
    location: {
      lat: 40.7484,
      lng: -73.9857,
    },
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/800px-Empire_State_Building_%28aerial_view%29.jpg",
    address,
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(new HttpError("Creating place failed. Please try again!", 500));
  }

  if (!user) {
    return next(HttpError("Could not find user for provided id", 404));
  }

  console.log(user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Creating place failed. PLease try again!", 500));
  }
  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError("Something went wrong. Could not update place.", 500)
    );
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    return next(
      new HttpError("Something went wrong. Could not update place", 500)
    );
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    return next(new HttpError("Could not delete the place.", 500));
  }

  if (!place) {
    return next(new HttpError("Could not find the place with this id", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Could not delete the place.", 500));
  }
  res.status(200).json({ message: "Deleted place" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
