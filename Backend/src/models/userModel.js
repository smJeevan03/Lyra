const mongoose  = require("mongoose")
const bcrypt = require('bcryptjs')


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: [3, "Username must be at least 3 characters long"]
    },

    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "please provide a valid email"]
    },
    password: {
        type: String,
        required: [true , "Please provide a password"],
        minlength: [6, "Password must be at least 6 characters long"],
        select: false
    },
    profileImage :{
        type : String,
        default: null,
    } 
},{
    timestamps:true
})


// hash password before saving
// Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// compare password methods
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword,this.password)
}

const user = mongoose.model("User", userSchema)

module.exports = user
