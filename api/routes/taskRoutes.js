const express = require("express");
const {
  getAllTasks,
  createTask,
  getTask,
  deleteTask,
  updateTask,
} = require("../controllers/taskController");

const router = express.Router();

router.route("/").get(getAllTasks).post(createTask);

router.route("/:taskId").get(getTask).patch(updateTask).delete(deleteTask);

module.exports = router;
