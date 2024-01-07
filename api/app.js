const express = require("express");
const morgan = require("morgan");
const taskRouter = require("./routes/taskRoutes");
const userRouter = require("./routes/userRoutes");
const globalErrorHandler = require("./controllers/errorController");

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

app.all("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
