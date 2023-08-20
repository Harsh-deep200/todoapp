const mongoose = require("mongoose");
const user = require("./user");

const dataSchema = new mongoose.Schema({
  task: String,
  photo: String,
});

module.exports = mongoose.model("data", dataSchema);
