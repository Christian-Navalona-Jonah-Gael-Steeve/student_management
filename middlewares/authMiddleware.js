const { validateToken } = require("../utils/authUtils");
const { createError } = require("../utils/errorUtils");
const { User } = require("../model/schemas");

const protect = async (req, res, next) => {
  try {
    // 1) Get token and check if it exists
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        createError(401, "You are not logged in! Please log in to get access.")
      );
    }

    // 2) Verify token
    const tokenValidation = validateToken(token);
    if (!tokenValidation.valid) {
      return next(createError(401, "Invalid token. Please log in again!"));
    }

    // 3) Check if user still exists
    const user = await User.findById(tokenValidation.decoded.userId);
    if (!user) {
      return next(
        createError(401, "The user belonging to this token no longer exists.")
      );
    }

    if (!user.isActive) {
      return next(createError(401, "Account is desactivated!"));
    }

    // 4) Check if user changed password after the token was issued
    // TODO: Add passwordChangedAt field to User model if needed

    // Grant access to protected route
    req.user = user;
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
