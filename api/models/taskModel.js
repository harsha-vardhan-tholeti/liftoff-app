const mongoose = require("mongoose");

const taskSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
  },
  priority: {
    type: String,
  },
  note: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
  },
});

const Tasks = mongoose.model("Tasks", taskSchema);

module.exports = Tasks;
