const successResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data
});

const errorResponse = (message = 'Error', code = 500) => ({
  success: false,
  message,
  code
});

export { successResponse, errorResponse };