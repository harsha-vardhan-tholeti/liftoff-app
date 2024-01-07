const AppError = (message, statusCode) => {
  const err = new Error();
  err.message = message;
  err.statusCode = statusCode;
  err.isOperational = true;
  return err;
};

module.exports = AppError;
