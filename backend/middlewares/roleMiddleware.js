const hasRole = async (req, res, next) => {
  try {
    if (req.user.is_admin == 1) {
      next();
    } else {
      return res.status(403).json({
        message: "not allowed",
      });
    }
  } catch (error) {
    res.status(401);
    next(error);
  }
};

export default hasRole;
