const Tasks = require("../models/taskModel");
const catchAsync = require("../utils/catchAsync");

// This controller function is to get all tasks of a particular user.
const getAllTasks = catchAsync(async (req, res, next) => {
  // Get all tasks of current user.
  const tasks = await Tasks.find({ user: req.user._id.toString() });

  // send response ok when all tasks of a user was successfully retrieved.
  res.status(200).json({
    status: "ok",
    results: tasks.length,
    data: tasks,
  });
});

// This controller function is to get particular task of a particular user.
const getTask = catchAsync(async (req, res, next) => {
  //Get specific task of current user
  const task = await Tasks.findById({
    user: req.user._id.toString(),
    taskId: req.params.taskId,
  });

  // send response ok when a particular task of a user was successfully retrieved.
  res.status(200).json({
    status: "ok",
    data: task,
  });
});

// This controller function is to create a task by current user (logged in user).
const createTask = catchAsync(async (req, res, next) => {
  // parsing given date string in body into date object.
  const parsedDate = req.body.date ? new Date(req.body.date) : null;

  // This is used to create new task with current user.
  const newTask = await Tasks.create({
    name: req.body.name,
    date: parsedDate,
    priority: req.body.priority,
    note: req.body.note,
    user: req.user._id.toString(),
  });

  // send response ok when a task of a user was successfully created.
  res.status(201).json({
    status: "ok",
    data: newTask,
  });
});

// This controller function is used to update the task of the user.
const updateTask = catchAsync(async (req, res, next) => {
  // updating task of user.
  const task = await Tasks.findByIdAndUpdate(
    req.params.taskId,
    req.body.active ? req.body.active : req.body,
    { new: true }
  );

  // send response ok when a task of a user was successfully updated.
  res.status(200).json({
    status: "ok",
    data: task,
  });
});

// This controller function is used to delete the task of the user.
const deleteTask = catchAsync(async (req, res, next) => {
  await Tasks.findByIdAndDelete(req.params.taskId, req.body);
  res.status(204).json({
    status: "ok",
    data: null,
  });
});

module.exports = {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};
