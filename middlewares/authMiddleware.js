const { validateToken } = require("../utils/authUtils");
const { createError } = require("../utils/errorUtils");
const { User } = require("../model/schemas");

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        createError(401, "You are not logged in! Please log in to get access.")
      );
    }

    const tokenValidation = validateToken(token);
    if (!tokenValidation.valid) {
      return next(createError(401, "Invalid token. Please log in again!"));
    }
    req.token = token
    next();
  } catch (error) {
    next(error);
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        createError(403, "You do not have permission to perform this action")
      );
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo,
};
