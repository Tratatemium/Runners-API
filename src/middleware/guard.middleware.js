// NOTE: currently unused
const checkOwnership = (param = "id") => {
  return (req, res, next) => {
    const resourceId = req.params[param];
    const providedId = req.user.userId;
    if (providedId !== resourceId) {
      return res
        .status(403)
        .json({ error: "You are not allowed to perform this action." });
    }
    next();
  };
};

module.exports = { checkOwnership };