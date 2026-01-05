module.exports = function validate(requiredFields = []) {
  return (req, res, next) => {
    for (const field of requiredFields) {
      if (req.body[field] === undefined) {
        return res.status(400).json({ error: `Missing field: ${field}` });
      }
    }
    next();
  };
};
