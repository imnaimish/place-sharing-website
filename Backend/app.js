const express = require("express");
const bodyParser = require("body-parser");
const HttpError = require("./models/http-error");
const mongoose = require("mongoose");

const usersRoutes = require("./routes/users-routes");
const placesRoutes = require("./routes/places-route");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/places", placesRoutes);

app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  throw new HttpError("Sorry, Could not find this route", 404);
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(404)
    .json({ message: error.message || "An unknown error occured" });
});
mongoose
  .connect(
    "mongodb+srv://naimish:ygyWJPuNfSuORHml@cluster0-vjexa.mongodb.net/mernProject?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(5000);
    console.log("MongoDb connected. Listening to port 5000\n");
  })
  .catch((error) => {
    console.log("MongoDB error => ", error);
  });
