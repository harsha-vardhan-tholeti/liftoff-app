const Tasks = require("../models/taskModel");

const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Tasks.find({ user: req.user._id.toString() });
    res.status(200).json({
      status: "ok",
      results: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await Tasks.findById(req.params.taskId);
    res.status(200).json({
      status: "ok",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const createTask = async (req, res, next) => {
  try {
    const parsedDate = req.body.date ? new Date(req.body.date) : null;

    const newTask = await Tasks.create({
      name: req.body.name,
      date: parsedDate,
      priority: req.body.priority,
      note: req.body.note,
      user: req.user._id.toString(),
    });

    res.status(201).json({
      status: "ok",
      data: newTask,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Tasks.findByIdAndUpdate(
      req.params.taskId,
      req.body.active ? req.body.active : req.body,
      { new: true }
    );
    res.status(200).json({
      status: "ok",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deleteTask = async (req, res, next) => {
  try {
    await Tasks.findByIdAndDelete(req.params.taskId, req.body);
    res.status(204).json({
      status: "ok",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};
