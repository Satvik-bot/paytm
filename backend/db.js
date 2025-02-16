const { Mongoose, default: mongoose, mongo } = require("mongoose");
require('dotenv').config()
mongoose.connect("process.env.MONGO_CRED")

const userSchema = new Mongoose.schema({
    username: {
        type:String,
        required:true,
        unique: true,
        minLength:3,
        trim: true
    },
    password: {
        type:String,
        required:true,
        minLength:6,
    },
    firstName: {
        type:String,
        required:true,
        minLength:30,
        match: [/^[A-Za-z]+$/, 'Only letters are allowed']
    },
    lastName: {
        type:String,
        required:true,
        minLength:30,
        match: [/^[A-Za-z]+$/, 'Only letters are allowed']
    }
})

export const User = mongoose.model("User", userSchema)
