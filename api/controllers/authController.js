const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const sendEmail = require("../utils/email");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// this function will create a jwt bearer token and send it.
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// generating
const createSendToken = (user, statusCode, res) => {
  // Gets the token from signToken function.
  const token = signToken(user._id);

  // defining cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // if production -> secure -> true
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  // generating cookie
  res.cookie("jwt", token, cookieOptions);

  // making password undefined
  user.password = undefined;

  // send response ok, when a new token got created.
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// signup user
const signup = catchAsync(async (req, res, next) => {
  // creating new user
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // send response ok, when a new user got created.
  res.status(201).json({
    status: "success",
    data: newUser,
  });
});

// login user
const login = catchAsync(async (req, res, next) => {
  // destructing email and password from request body
  const { email, password } = req.body;

  // if there no email or password in the body, sending error.
  if (!email || !password) {
    return next(AppError("Please Enter your email or password", 400));
  }

  // getting user with email in the user collection and selecting password.
  const user = await User.findOne({ email }).select("+password");

  // if user doesn't exist or password entered is not matching to the password with user document, sending error.
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(AppError("Invalid Email or Password", 401));
  }

  // if user exists and password correct, then create token.
  createSendToken(user, 200, res);
});

// this is a authorization function.
const protect = async (req, res, next) => {
  // defining token variable with no value defined.
  let token;

  // if authorization is available then get jwt token from it and assign it to token variable.
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // no token available, send error
  if (!token) {
    return next(AppError("Invalid User", 401));
  }

  // if token available, then verify the token with promisify
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // getting userId from decoded variable and getting current user
  const currentUser = await User.findById(decoded.id);

  // if no current user, send error
  if (!currentUser) {
    return next(AppError("You're not logged in", 401));
  }

  // if current user changed the password after issued time, send error
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      AppError("User recently changed password! Please log in again", 401)
    );
  }

  // setting user to current user
  req.user = currentUser;

  next();
};

// To restrict a certain user according to their role
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // if there is no role includes in roles then send error
    if (!roles.includes(req.user.role)) {
      return next(
        AppError("You do not have permission to perform this action", 403)
      );
    }

    // otherwise go next
    next();
  };
};

// forgot password function
const forgotPassword = catchAsync(async (req, res, next) => {
  // finding user in the user collection by given email address in the body
  const user = await User.findOne({ email: req.body.email });

  // if no user available in user collection with email address then send error
  if (!user) {
    return next(AppError("There is no user with that email address", 404));
  }

  // otherwise create password reset token
  const resetToken = user.createPasswordResetToken();
  // saving user without validation
  await user.save({ validateBeforeSave: false });

  // reset url template
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  // message
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forgot your password, please ignore this email`;

  try {
    // send email with email address, subject and message
    await sendEmail({
      email: user.email,
      subject: "Your Password Reset Token (Only valid for 10 minutes)",
      message,
    });

    // send success message response
    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (error) {
    // removing values in passwordResetToken & passwordResetExpires
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    // save user without validation
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      error: "There was an error sending the email. Try again later",
    });
  }
});

// reset password
const resetPassword = catchAsync(async (req, res, next) => {
  // hashing the given token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // getting user with same password reset token (hashed) and which is greater than current time
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // if no user, send error
  if (!user) {
    return next(AppError("Token is invalid or has expired"));
  }

  // if user is available, set new password, passwordConfirm to the values given in the request body and also set reset token & reset expires to undefined
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // save the user
  await user.save();

  // creating a token
  createSendToken(user, 200, res);
});

// update password
const updatePassword = catchAsync(async (req, res, next) => {
  console.log(req.user);
  // getting user by id and selecting password of that user
  const user = await User.findById(req.user._id.toString()).select("+password");

  // if the current password provided in the body is not equal to password of the user in user collection, send error
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(AppError("Your current password is incorrect", 401));
  }

  // update password and confirm password in the user collection
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // saving the user
  await user.save();

  // sending successful response
  res.status(200).json({
    status: "success",
    data: user,
  });
});

module.exports = {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
};
