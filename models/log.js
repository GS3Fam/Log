let
  mongoose = require('mongoose'),
  schema = mongoose.Schema({
    id: { type : Number },
    name: String,
    date: String,
    time_in: String,
    time_out: String,
    location: String,
    remarks: String
  });

let model = module.exports = mongoose.model("log", schema);
