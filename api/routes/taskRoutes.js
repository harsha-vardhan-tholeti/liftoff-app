const express = require("express");
const {
  getAllTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const { protect } = require("../controllers/authController");

const router = express.Router();

router.use(protect);

router.route("/").get(getAllTasks).post(createTask);

router.route("/:taskId").get(getTask).patch(updateTask).delete(deleteTask);

module.exports = router;
