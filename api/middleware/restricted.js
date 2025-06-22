const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ message: "token required" });
  }

  jwt.verify(
    token,
    process.env.SECRET || "shh",
    (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "token invalid" });
      }
      req.decoded = decoded;
      next();
    }
  );
};