const mongoose = require("mongoose")

async function connectDB(){
    try {
        const connection = await mongoose.connect(process.env.MONGODB_CONNECTION)
        console.log(`Connected to Database : ${connection.connection.host}`)
    } catch (err) {
        console.log("Database Connection Failed")
        process.exit(1)
    }
}

module.exports = connectDB