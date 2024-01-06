const express = require("express");
const taskRouter = require("./routes/taskRoutes");
const userRouter = require("./routes/userRoutes");

// INITIATING EXPRESS
const app = express();

// DEVELOPMENT LOGGING
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// PARSE JSON BODIES
app.use(express.json());

// ROUTERS
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/users", userRouter);

module.exports = app;
