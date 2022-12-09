const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  if (!req.headers.authorization) {
    return res
      .status(401)
      .json({ message: "Not authorized to access this route" });
  }

  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorized to access this route" });
  } else {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Not authorized to access this route" });
    }
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(401).json({ message: "Not authorized as an admin" });
  }
};

const verify = (req, res, next) => {
  if (req.user && req.user.verified) {
    next();
  } else {
    return res
      .status(401)
      .json({ message: "Not authorized as a verified user" });
  }
};

module.exports = { protect, admin, verify };
