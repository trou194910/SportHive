
function errorHandler(err, req, res, next) {
    console.error(err.stack);
    let statusCode = err.status || 500;
    let message = err.message || '服务器内部错误';
    res.status(statusCode).json({
        message: message
    });
}

module.exports = errorHandler;