const mongoose = require("mongoose");

module.exports.init = async () => {
  const mongoUrl = process.env.MONGO_URL;
  console.log(mongoUrl);
  await mongoose.connect(mongoUrl);
};
