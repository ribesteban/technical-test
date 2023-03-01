const mongoose = require("mongoose");

const MODELNAME = "ticket";

const Schema = new mongoose.Schema({
  ticketId: { type: String },
  projectId: { type: String },
  title: { type: String },
  description: { type: String },
  deadline: { type: Date },
  status: { type: String, default: "pending" },
  created_at: { type: Date, default: Date.now },
});

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
