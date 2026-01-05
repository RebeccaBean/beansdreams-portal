module.exports = function adminLogger(action) {
  return (req, res, next) => {
    console.log(
      `[ADMIN ACTION] ${action} by admin ${req.user?.id} at ${new Date().toISOString()}`
    );
    next();
  };
};
