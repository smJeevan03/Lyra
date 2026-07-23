require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/db/db");

const PORT = Number(process.env.PORT) || 3000;

const startServer = async () => {
    try {
        await connectDB(); 
        console.log("✅ MongoDB connected successfully!");
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
        });

    } catch (error) {
        console.error("❌ Failed to connect to MongoDB:", error.message);
        process.exit(1); 
    }
};

startServer();