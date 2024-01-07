const mongoose = require("mongoose");
const User = require("./userModel");

const taskSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter your task name"],
  },
  date: {
    type: Date,
    validate: {
      validator: function (val) {
        const currentDate = new Date().setHours(0, 0, 0, 0);
        const enteredDate = new Date(val).setHours(0, 0, 0, 0);
        return enteredDate >= currentDate;
      },
      message: "Please enter correct date",
    },
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
  user: {
    type: mongoose.Schema.ObjectId,
    ref: User,
    required: [true, "Task must belong to a user."],
  },
});

const Tasks = mongoose.model("Tasks", taskSchema);

module.exports = Tasks;
