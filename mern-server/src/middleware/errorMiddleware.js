exports.notFoundHandler = (req, res, next) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};

exports.errorHandler = (err, req, res, next) => {
  // Log standardized error format
  console.error(`[ERROR] ${err.message}`);

  // Retrieve status code from the error object itself (like body-parser's 413)
  let statusCode = err.status || err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

  if (err.name === 'ValidationError' || err.message.includes('missing') || err.message.includes('required')) {
    statusCode = 400;
  }

  // Sanitized JSON response (strictly no stack trace)
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error'
  });
};
