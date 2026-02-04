const sendSuccess = (res, statusCode, data, extra = {}) => {
  res.status(statusCode).json({
    status: "success",
    ...extra,
    data,
  });
};

module.exports = { sendSuccess };
