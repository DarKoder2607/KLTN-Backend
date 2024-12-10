const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    key: { type: [String], required: true },  
    priority: { type: Number, default: 0 },  
    responses: { type: [String], required: true },  
    intent: { type: String, default: null },  
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);
