const responseSuccess = (data, message = 'Success') => ({
  success: true,
  message,
  data
});

const responseError = (message = 'Error', code = 500) => ({
  success: false,
  message,
  code
});

export { responseSuccess, responseError };