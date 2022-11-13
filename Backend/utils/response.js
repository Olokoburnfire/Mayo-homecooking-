const successMsg = (res, message, data, statusCode = 200, token) => {
  res.header("x-auth-token", token).status(statusCode).json({
    status: true,
    message,
    data,
    token,
  });
};

const errorMsg = (res, message, statusCode = 400, error) => {
  if (error) {
    return res.status(statusCode).json({
      status: false,
      message,
      error,
    });
  }
  return res.status(statusCode).json({
    status: false,
    message,
  });
};

module.exports = { successMsg, errorMsg };
