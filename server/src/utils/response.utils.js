export const sendSuccess = (
  res,
  statusCode = 200,
  message = "Success",
  data = {},
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res,
  statusCode = 500,
  message = "Server Error",
  data = null,
) => {
  const response = { success: false, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};
