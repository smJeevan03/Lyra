const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadDir = path.join(__dirname, "../uploads/documents");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, _file, cb) => cb(null, `${Date.now()}-${crypto.randomUUID()}.pdf`),
});

const fileFilter = (_req, file, cb) => {
    if (file.mimetype === "application/pdf" || path.extname(file.originalname).toLowerCase() === ".pdf") {
        return cb(null, true);
    }
    return cb(new Error("Only PDF files are allowed."), false);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = upload;
