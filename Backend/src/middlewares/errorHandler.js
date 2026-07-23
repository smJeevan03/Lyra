const errorHandler = (err, req, res, _next) => {
    console.error(err);

    if (err.name === "CastError" && err.kind === "ObjectId") {
        return res.status(404).json({ success: false, error: "Resource not found" });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || "field";
        return res.status(409).json({ success: false, error: `${field} already exists` });
    }

    const statusCode = err.statusCode || 500;
    const response = {
        success: false,
        error: statusCode >= 500 && process.env.NODE_ENV === "production"
            ? "Internal Server Error"
            : (err.message || "Internal Server Error"),
    };

    if (process.env.NODE_ENV !== "production") response.stack = err.stack;
    return res.status(statusCode).json(response);
};

module.exports = errorHandler;
