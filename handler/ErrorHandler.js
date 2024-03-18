const ErrorHandler = (error, req, res, next) => {
    const status = error.status || 1000;
    const message = error.message || "Server Error";

    return res.status(status).json({ success: false, message });
}

export default ErrorHandler;